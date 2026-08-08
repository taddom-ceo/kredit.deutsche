import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Verschluesselung einzelner Felder — heute die Bankverbindungen.
 *
 * Neon verschluesselt die Festplatte, das schuetzt gegen den Diebstahl eines
 * Datentraegers. Es schuetzt nicht gegen das, was viel haeufiger vorkommt:
 * einen Auszug der Tabelle, der irgendwo landet — im Postfach, in einem
 * Fehlerbericht, in einer Sicherung. Deshalb liegen IBANs zusaetzlich
 * verschluesselt in der Zeile selbst.
 *
 * AES-256-GCM, weil es nicht nur verschluesselt, sondern auch merkt, wenn
 * jemand am Geheimtext dreht: Ohne den Pruefwert liesse sich ein Zeichen
 * kippen, und die Entschluesselung lieferte klaglos Unsinn.
 *
 * Der Schluessel steht in CRM_DATEN_SCHLUESSEL und bewusst nicht in
 * CRM_SESSION_SECRET: Das Sitzungsgeheimnis darf jederzeit gewechselt werden,
 * das kostet nur alle offenen Anmeldungen. Waere es zugleich der
 * Datenschluessel, machte derselbe Wechsel alle gespeicherten IBANs
 * unlesbar — eine Falle, die genau dann zuschnappt, wenn jemand vorbildlich
 * handelt.
 */

/**
 * Kennzeichen am Anfang jedes Geheimtexts. Es unterscheidet verschluesselte
 * Werte von denen, die vorher im Klartext abgelegt wurden, und traegt eine
 * Versionsnummer — bei einem spaeteren Wechsel des Verfahrens bleiben alte
 * Werte dadurch lesbar.
 */
const MARKE = "gcm1:";

/** Was angezeigt wird, wenn der Schluessel nicht zum Geheimtext passt. */
export const UNLESBAR = "(nicht entschlüsselbar)";

function schluessel(): Buffer | null {
  const roh = process.env.CRM_DATEN_SCHLUESSEL?.trim();
  // Ein sehr kurzer Schluessel ist so gut wie keiner. Lieber im Klartext
  // ablegen und das im CRM offen sagen, als Sicherheit vorzutaeuschen.
  if (!roh || roh.length < 16) return null;
  // sha256 bringt jede Eingabe auf die 32 Byte, die AES-256 braucht.
  return createHash("sha256").update(roh).digest();
}

export function schluesselVorhanden(): boolean {
  return schluessel() !== null;
}

/** Klartext zu Geheimtext. Ohne Schluessel bleibt der Wert, wie er ist. */
export function verschluessele(klartext: string): string {
  const k = schluessel();
  if (!k || !klartext) return klartext;

  // Der Zufallswert muss je Verschluesselung neu sein — bei GCM waere seine
  // Wiederverwendung mit demselben Schluessel der eine Fehler, der das
  // Verfahren wirklich bricht.
  const iv = randomBytes(12);
  const werk = createCipheriv("aes-256-gcm", k, iv);
  const daten = Buffer.concat([werk.update(klartext, "utf8"), werk.final()]);
  return (
    MARKE + Buffer.concat([iv, werk.getAuthTag(), daten]).toString("base64url")
  );
}

/**
 * Geheimtext zu Klartext.
 *
 * Werte ohne Kennzeichen kommen unveraendert zurueck: Das sind die Zeilen,
 * die vor der Umstellung entstanden sind. Sie bleiben lesbar, statt als
 * Fehler zu erscheinen.
 */
export function entschluessele(wert: string): string {
  if (!wert || !wert.startsWith(MARKE)) return wert;

  const k = schluessel();
  if (!k) return UNLESBAR;

  try {
    const roh = Buffer.from(wert.slice(MARKE.length), "base64url");
    const werk = createDecipheriv("aes-256-gcm", k, roh.subarray(0, 12));
    werk.setAuthTag(roh.subarray(12, 28));
    return Buffer.concat([
      werk.update(roh.subarray(28)),
      werk.final(),
    ]).toString("utf8");
  } catch {
    // Falscher Schluessel oder veraenderter Geheimtext. Der Fall gehoert
    // sichtbar gemacht und nicht verschwiegen — sonst stuende im CRM eine
    // leere Bankverbindung, und niemand wuesste, dass da einmal eine war.
    return UNLESBAR;
  }
}
