import { randomBytes, scrypt, timingSafeEqual } from "crypto";

/**
 * Passwoerter der CRM-Konten.
 *
 * Warum nicht derselbe Weg wie in `site-gate.ts`? Das Seitenpasswort ist ein
 * einzelnes, geteiltes Losungswort, das bewusst herumgereicht wird — dort
 * genuegt ein Vergleich ueber sha256. Ein Benutzerpasswort ist etwas anderes:
 * Es gehoert einer Person, wird erfahrungsgemaess anderswo wiederverwendet und
 * darf deshalb nicht mit einem schnellen, ungesalzenen Verfahren abgelegt
 * werden. sha256 rechnet eine Grafikkarte milliardenfach pro Sekunde durch.
 *
 * scrypt kommt aus `node:crypto`, kostet also kein zusaetzliches Paket, und
 * ist absichtlich langsam und speicherhungrig. Die Parameter unten brauchen
 * rund 16 MB Arbeitsspeicher und etwa eine Zehntelsekunde je Versuch — fuer
 * eine Anmeldung nicht spuerbar, fuer das Durchprobieren einer Wortliste
 * ruinoes.
 */

/** Arbeitsaufwand. N ist der Kostenfaktor, r die Blockgroesse, p die Parallelitaet. */
const KOSTEN = { N: 16384, r: 8, p: 1 } as const;

/** 128 * N * r sind hier 16 MB; mit Luft nach oben, sonst bricht scrypt ab. */
const MAXMEM = 64 * 1024 * 1024;

/** Laenge des abgeleiteten Schluessels in Bytes. */
const LAENGE = 64;

/**
 * Trennzeichen der gespeicherten Form. Bewusst ":" und nicht "$", obwohl "$"
 * das uebliche Format waere: Diese Zeichenkette steht in einer
 * Umgebungsvariable, und Next ersetzt in `.env`-Dateien alles, was wie
 * `$NAME` aussieht, durch den Wert einer anderen Variablen. Ein Hash mit "$"
 * darin kaeme also verstuemmelt an. base64url enthaelt kein ":", die Teilung
 * bleibt dadurch eindeutig.
 */
const TRENNER = ":";

function ableiten(
  passwort: string,
  salz: Buffer,
  laenge: number,
  kosten: { N: number; r: number; p: number }
): Promise<Buffer> {
  return new Promise((erfuellen, ablehnen) => {
    // NFKC: Dasselbe Zeichen kann unterschiedlich kodiert eintreffen — je
    // nach Tastatur und Betriebssystem. Ohne Vereinheitlichung scheitert die
    // Anmeldung mit dem richtigen Passwort, sobald Umlaute im Spiel sind.
    scrypt(
      passwort.normalize("NFKC"),
      salz,
      laenge,
      { ...kosten, maxmem: MAXMEM },
      (fehler, schluessel) => {
        if (fehler) ablehnen(fehler);
        else erfuellen(schluessel);
      }
    );
  });
}

/**
 * Passwort in die Form bringen, die gespeichert wird:
 * `scrypt:N:r:p:salz:hash`. Die Kostenparameter stehen mit drin, damit sich
 * ein spaeter erhoehter Aufwand einfuehren laesst, ohne alte Konten
 * auszusperren.
 */
export async function hashePasswort(passwort: string): Promise<string> {
  const salz = randomBytes(16);
  const hash = await ableiten(passwort, salz, LAENGE, KOSTEN);
  return [
    "scrypt",
    KOSTEN.N,
    KOSTEN.r,
    KOSTEN.p,
    salz.toString("base64url"),
    hash.toString("base64url"),
  ].join(TRENNER);
}

/** Ob das eingegebene Passwort zum gespeicherten Hash gehoert. */
export async function passwortStimmt(
  eingabe: string,
  gespeichert: string
): Promise<boolean> {
  const teile = gespeichert.split(TRENNER);
  if (teile.length !== 6 || teile[0] !== "scrypt") return false;

  const [, n, r, p, salzTeil, hashTeil] = teile;
  const kosten = { N: Number(n), r: Number(r), p: Number(p) };
  if (
    !Number.isInteger(kosten.N) ||
    !Number.isInteger(kosten.r) ||
    !Number.isInteger(kosten.p) ||
    kosten.N < 2 ||
    kosten.r < 1 ||
    kosten.p < 1
  ) {
    return false;
  }

  const salz = Buffer.from(salzTeil, "base64url");
  const erwartet = Buffer.from(hashTeil, "base64url");
  if (salz.length === 0 || erwartet.length === 0) return false;

  try {
    const hash = await ableiten(eingabe, salz, erwartet.length, kosten);
    // Zeitkonstant vergleichen: Ein Vergleich, der beim ersten
    // abweichenden Byte abbricht, verraet ueber die Antwortzeit, wie viele
    // Stellen schon stimmen.
    return timingSafeEqual(hash, erwartet);
  } catch {
    // Unsinnige Kostenparameter in der Umgebungsvariable lassen scrypt
    // werfen. Das ist ein Konfigurationsfehler und keine gueltige Anmeldung.
    return false;
  }
}
