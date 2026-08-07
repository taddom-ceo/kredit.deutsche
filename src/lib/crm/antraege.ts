import { randomUUID } from "crypto";
import { abfrage, datenbankVorhanden, stelleSchemaSicher } from "./db";
import type { StatusId } from "./pipeline";

/**
 * Die Ablage der eingegangenen Antraege.
 *
 * Diese Datei ist die Wechselstelle. Heute liegen die Antraege in einer Liste
 * im Arbeitsspeicher des Servers; spaeter kommt Postgres darunter. Alles
 * andere — Endpunkt, Liste, Detailseite — spricht nur ueber die vier
 * Funktionen am Ende und merkt vom Wechsel nichts.
 *
 * Was der Arbeitsspeicher nicht kann, und das ist kein Detail: Auf Vercel
 * beantwortet nicht immer dieselbe Instanz die naechste Anfrage, und eine
 * Instanz wird nach kurzer Ruhe weggeraeumt. Ein Antrag, der eben noch in der
 * Liste stand, kann beim naechsten Aufruf fehlen. Zum Anschauen des Ablaufs
 * taugt das; fuer echte Kunden nicht. Deshalb sagt die CRM-Seite das auch
 * offen, statt eine Vollstaendigkeit vorzutaeuschen, die es nicht gibt.
 */

/** Ein bereits laufender Kredit, wie ihn Schritt 7 erhebt. */
export type BestehenderKreditEingang = {
  art: string;
  betrag: string;
  rate: string;
  auszahlung: string;
  laufzeit: string;
  zins: string;
  restschuld: string;
  bank: string;
  iban: string;
};

/** Die Angaben aus der Antragsstrecke, so wie sie hereinkommen. */
export type AntragEingang = {
  kreditart: string | null;
  amount: number;
  months: number;
  personCount: 1 | 2 | null;
  vorname: string;
  zweiterVorname: string;
  nachname: string;
  geburtsdatum: string;
  email: string;
  telefonVorwahl: string;
  telefon: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  beschaeftigungsart: string;
  arbeitgeber: string;
  beschaeftigtSeit: string;
  nettoeinkommen: string;
  mieteinnahmen: string;
  mieteinnahmenBetrag: string;
  wohnnebenkosten: string;
  krankenversicherung: string;
  unterhalt: string;
  hatKredite: string;
  kredite: BestehenderKreditEingang[];
  iban: string;
  bankname: string;
  kontoinhaber: string;
};

/** Ein Antrag, wie er im CRM steht. */
export type Antrag = AntragEingang & {
  id: string;
  /** Zeitpunkt des Eingangs als ISO-Zeichenkette. */
  eingang: string;
  status: StatusId;
};

/* ------------------------------------------------------------------ */
/* Pruefung                                                            */
/* ------------------------------------------------------------------ */

function text(wert: unknown, hoechstens = 200): string {
  if (typeof wert !== "string") return "";
  // Kuerzen statt ablehnen: Ein zu langes Feld ist kein Grund, dem Kunden
  // den ganzen Antrag zu verweigern. Die Grenze verhindert nur, dass jemand
  // die Ablage mit Megabytes volllaeuft.
  return wert.trim().slice(0, hoechstens);
}

function zahl(wert: unknown): number {
  const n = typeof wert === "number" ? wert : Number(wert);
  return Number.isFinite(n) ? n : 0;
}

function kredite(wert: unknown): BestehenderKreditEingang[] {
  if (!Array.isArray(wert)) return [];
  // Hoechstens zehn — mehr laufende Kredite gibt niemand ernsthaft an.
  return wert.slice(0, 10).map((eintrag) => {
    const k = (eintrag ?? {}) as Record<string, unknown>;
    return {
      art: text(k.art, 60),
      betrag: text(k.betrag, 30),
      rate: text(k.rate, 30),
      auszahlung: text(k.auszahlung, 10),
      laufzeit: text(k.laufzeit, 10),
      zins: text(k.zins, 10),
      restschuld: text(k.restschuld, 30),
      bank: text(k.bank, 80),
      iban: text(k.iban, 40),
    };
  });
}

/** Grenzen, die auch die Rechner auf der Seite einhalten. */
const BETRAG_MIN = 1000;
const BETRAG_MAX = 100000;
const LAUFZEIT_MIN = 6;
const LAUFZEIT_MAX = 120;

export type Pruefergebnis =
  | { ok: true; antrag: AntragEingang }
  | { ok: false; fehlend: string[] };

/**
 * Eingehende Daten pruefen.
 *
 * Die Strecke prueft schon im Browser, aber darauf ist kein Verlass: Der
 * Endpunkt ist offen, und was dort ankommt, muss unabhaengig davon Hand und
 * Fuss haben. Geprueft wird nur, was einen Fall unbrauchbar machen wuerde —
 * ohne Namen, Kontakt oder Betrag kann niemand zurueckrufen.
 */
export function pruefeAntrag(roh: unknown): Pruefergebnis {
  const d = (roh ?? {}) as Record<string, unknown>;

  const antrag: AntragEingang = {
    kreditart: typeof d.kreditart === "string" ? text(d.kreditart, 60) : null,
    amount: zahl(d.amount),
    months: zahl(d.months),
    personCount: d.personCount === 2 ? 2 : d.personCount === 1 ? 1 : null,
    vorname: text(d.vorname, 80),
    zweiterVorname: text(d.zweiterVorname, 80),
    nachname: text(d.nachname, 80),
    geburtsdatum: text(d.geburtsdatum, 10),
    email: text(d.email, 120),
    telefonVorwahl: text(d.telefonVorwahl, 10),
    telefon: text(d.telefon, 30),
    strasse: text(d.strasse, 120),
    hausnummer: text(d.hausnummer, 20),
    plz: text(d.plz, 5),
    ort: text(d.ort, 80),
    beschaeftigungsart: text(d.beschaeftigungsart, 60),
    arbeitgeber: text(d.arbeitgeber, 120),
    beschaeftigtSeit: text(d.beschaeftigtSeit, 7),
    nettoeinkommen: text(d.nettoeinkommen, 30),
    mieteinnahmen: text(d.mieteinnahmen, 10),
    mieteinnahmenBetrag: text(d.mieteinnahmenBetrag, 30),
    wohnnebenkosten: text(d.wohnnebenkosten, 30),
    krankenversicherung: text(d.krankenversicherung, 60),
    unterhalt: text(d.unterhalt, 30),
    hatKredite: text(d.hatKredite, 10),
    kredite: kredite(d.kredite),
    iban: text(d.iban, 40),
    bankname: text(d.bankname, 120),
    kontoinhaber: text(d.kontoinhaber, 120),
  };

  const fehlend: string[] = [];
  if (!antrag.vorname) fehlend.push("vorname");
  if (!antrag.nachname) fehlend.push("nachname");
  // Bewusst grob: Eine Adresse mit @ und einem Punkt dahinter. Strengere
  // Muster weisen regelmaessig gueltige Adressen ab, und ob die Adresse
  // wirklich jemandem gehoert, sagt ohnehin erst die erste Mail.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(antrag.email)) fehlend.push("email");
  if (antrag.amount < BETRAG_MIN || antrag.amount > BETRAG_MAX) {
    fehlend.push("amount");
  }
  if (antrag.months < LAUFZEIT_MIN || antrag.months > LAUFZEIT_MAX) {
    fehlend.push("months");
  }

  if (fehlend.length > 0) return { ok: false, fehlend };
  return { ok: true, antrag };
}

/* ------------------------------------------------------------------ */
/* Ablage                                                              */
/* ------------------------------------------------------------------ */

/**
 * Wo die Antraege liegen.
 *
 * Steht eine Verbindungsadresse in der Umgebung, ist es Postgres. Fehlt sie —
 * beim Arbeiten an der Seite ohne eigene Datenbank —, bleibt es bei der Liste
 * im Arbeitsspeicher. Der Notbehelf ist absichtlich geblieben: Ohne ihn
 * liesse sich die Antragsstrecke lokal nicht mehr durchklicken, und ein
 * fehlender Eintrag in den Projekteinstellungen legte die Seite lahm, statt
 * sie nur um das CRM zu erleichtern. Welcher Weg gerade gilt, sagt das CRM
 * offen an, damit niemand eine Vollstaendigkeit annimmt, die es nicht gibt.
 */
export type Ablageart = "postgres" | "speicher";

export function ablageart(): Ablageart {
  return datenbankVorhanden() ? "postgres" : "speicher";
}

/**
 * Obergrenze der Liste im Arbeitsspeicher. Ohne sie waechst der Speicher der
 * Instanz unbegrenzt; mit ihr faellt im Zweifel der aelteste Eintrag heraus.
 */
const HOECHSTENS = 200;

/**
 * Die Liste haengt an globalThis statt an einer Modulvariablen: Next laedt
 * Module in der Entwicklung bei jeder Aenderung neu, und eine Modulvariable
 * waere danach leer. So ueberlebt die Ablage wenigstens das Neuladen
 * waehrend der Arbeit.
 */
const ablage = globalThis as unknown as { __crmAntraege?: Antrag[] };
ablage.__crmAntraege ??= [];

/** Eine Zeile aus der Tabelle `antrag`. */
type AntragZeile = {
  id: string;
  eingang: Date | string;
  status: string;
  rohdaten: AntragEingang;
};

/**
 * Aus der Zeile wird der Antrag: Die Angaben kommen aus `rohdaten`, Kennung,
 * Eingang und Status aus den eigenen Spalten. Die uebrigen Spalten sind
 * Kopien fuer Sortierung und Suche und werden hier bewusst nicht gelesen —
 * so gibt es nur eine Quelle fuer den Inhalt.
 */
function ausZeile(zeile: AntragZeile): Antrag {
  return {
    ...zeile.rohdaten,
    id: zeile.id,
    eingang:
      zeile.eingang instanceof Date
        ? zeile.eingang.toISOString()
        : new Date(zeile.eingang).toISOString(),
    status: zeile.status as StatusId,
  };
}

/** Antrag aufnehmen. Neueste stehen vorn. */
export async function nimmAntragAn(eingang: AntragEingang): Promise<Antrag> {
  const antrag: Antrag = {
    ...eingang,
    id: randomUUID(),
    eingang: new Date().toISOString(),
    status: "neu",
  };

  if (ablageart() === "speicher") {
    ablage.__crmAntraege!.unshift(antrag);
    ablage.__crmAntraege!.splice(HOECHSTENS);
    return antrag;
  }

  await stelleSchemaSicher();
  await abfrage(
    `INSERT INTO antrag
       (id, eingang, status, kreditart, betrag, laufzeit,
        vorname, nachname, email, ort, iban, rohdaten)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      antrag.id,
      antrag.eingang,
      antrag.status,
      antrag.kreditart,
      Math.round(antrag.amount),
      Math.round(antrag.months),
      antrag.vorname,
      antrag.nachname,
      antrag.email,
      antrag.ort,
      antrag.iban,
      JSON.stringify(eingang),
    ]
  );
  return antrag;
}

export async function alleAntraege(): Promise<Antrag[]> {
  if (ablageart() === "speicher") return ablage.__crmAntraege ?? [];

  await stelleSchemaSicher();
  const zeilen = await abfrage<AntragZeile>(
    `SELECT id, eingang, status, rohdaten
       FROM antrag
      ORDER BY eingang DESC
      LIMIT 500`
  );
  return zeilen.map(ausZeile);
}

export async function findeAntrag(id: string): Promise<Antrag | undefined> {
  if (ablageart() === "speicher") {
    return (ablage.__crmAntraege ?? []).find((a) => a.id === id);
  }

  // Eine erfundene Kennung ist keine gueltige UUID, und Postgres wirft dann
  // statt einer leeren Antwort einen Fehler. Deshalb vorher pruefen: Ein
  // Tippfehler in der Adresse soll eine 404 ergeben, keine Fehlerseite.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return undefined;
  }

  await stelleSchemaSicher();
  const zeilen = await abfrage<AntragZeile>(
    `SELECT id, eingang, status, rohdaten FROM antrag WHERE id = $1`,
    [id]
  );
  return zeilen[0] ? ausZeile(zeilen[0]) : undefined;
}

/** Wie viele Faelle je Station stehen — fuer die Spalten der Pipeline. */
export async function zaehleNachStatus(): Promise<Record<string, number>> {
  if (ablageart() === "speicher") {
    const zaehler: Record<string, number> = {};
    for (const antrag of ablage.__crmAntraege ?? []) {
      zaehler[antrag.status] = (zaehler[antrag.status] ?? 0) + 1;
    }
    return zaehler;
  }

  await stelleSchemaSicher();
  // Gezaehlt wird in der Datenbank, nicht ueber die geladene Liste: Sonst
  // stimmten die Zahlen nur fuer die ersten 500 Faelle.
  const zeilen = await abfrage<{ status: string; anzahl: string }>(
    `SELECT status, count(*)::text AS anzahl FROM antrag GROUP BY status`
  );
  const zaehler: Record<string, number> = {};
  for (const zeile of zeilen) zaehler[zeile.status] = Number(zeile.anzahl);
  return zaehler;
}

/** Zahl aller Faelle — unabhaengig von der Grenze der geladenen Liste. */
export async function zaehleAntraege(): Promise<number> {
  if (ablageart() === "speicher") return (ablage.__crmAntraege ?? []).length;
  await stelleSchemaSicher();
  const zeilen = await abfrage<{ anzahl: string }>(
    `SELECT count(*)::text AS anzahl FROM antrag`
  );
  return Number(zeilen[0]?.anzahl ?? 0);
}

/* ------------------------------------------------------------------ */
/* Darstellung                                                         */
/* ------------------------------------------------------------------ */

/**
 * IBAN fuer Listen: nur die letzten vier Stellen. In einer Uebersicht, die
 * offen auf dem Bildschirm steht, hat eine vollstaendige Bankverbindung
 * nichts zu suchen — gebraucht wird sie erst im einzelnen Fall.
 */
export function ibanVerkuerzt(iban: string): string {
  const sauber = iban.replace(/\s+/g, "");
  if (sauber.length < 4) return "—";
  return `••••${sauber.slice(-4)}`;
}

export function vollerName(antrag: Antrag): string {
  return [antrag.vorname, antrag.nachname].filter(Boolean).join(" ") || "—";
}
