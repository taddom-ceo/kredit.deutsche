import { randomUUID } from "crypto";
import { abfrage, datenbankVorhanden, stapel, stelleSchemaSicher } from "./db";
import { imPapierkorb, type StatusId } from "./pipeline";
import { entschluessele, verschluessele } from "./verschluesselung";

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
  /**
   * Das zuletzt ausgezahlte Nettoeinkommen.
   *
   * Bleibt als eigenes Feld bestehen, obwohl `gehaelter` es enthaelt: Liste,
   * Export und alle Faelle von vor dieser Aenderung lesen es. Fuer neue
   * Antraege ist es derselbe Wert wie `gehaelter[0]`.
   */
  nettoeinkommen: string;
  /**
   * Die drei zuletzt ausgezahlten Nettoeinkommen, neuestes zuerst.
   *
   * Drei statt einem, weil ein einzelner Monat wenig aussagt: Urlaubsgeld,
   * eine Sonderzahlung oder ein Monat mit Kurzarbeit verschieben das Bild in
   * beide Richtungen. Banken rechnen deshalb mit mehreren Monaten, und der
   * niedrigste davon ist die Zahl, die traegt.
   *
   * Leer bei Faellen, die vor dieser Aenderung eingegangen sind — dort steht
   * nur `nettoeinkommen`.
   */
  gehaelter: string[];
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
  /**
   * Der zweite Kreditnehmer, oder null bei einem einzelnen Antragsteller.
   *
   * Null und nicht ein leerer Satz Felder: "Es gibt keinen zweiten
   * Kreditnehmer" und "es gibt einen, von dem nichts bekannt ist" sind zwei
   * verschiedene Auskuenfte, und die Fallakte muss sie auseinanderhalten
   * koennen. Faelle von vor dieser Aenderung haben ebenfalls null.
   */
  zweitePerson: ZweitePersonEingang | null;
  /**
   * Der weiteste Schritt der Strecke, den dieser Mensch erreicht hat.
   *
   * Ohne ihn weiss das CRM, dass jemand abgebrochen hat, aber nicht wo. Das
   * ist der Unterschied zwischen "wir verlieren Leute" und "wir verlieren sie
   * beim Einkommen" — und nur die zweite Auskunft laesst sich beantworten.
   *
   * Er kommt aus der Strecke selbst und ist keine Messung ueber den Kunden:
   * gezaehlt wird ein Schritt, nicht ein Verhalten. Faelle von vor dieser
   * Aenderung haben null, und null heisst "unbekannt" und nicht "Schritt 1".
   */
  erreichterSchritt: number | null;
};

/** Die acht Schritte der Strecke, so wie die Fortschrittsleiste sie nennt. */
export const SCHRITTE = [
  "Kreditart",
  "Details",
  "Personen",
  "Persönliche Daten",
  "Adresse",
  "Beruf",
  "Einkommen",
  "Bankverbindung",
] as const;

/**
 * "Schritt 6 — Beruf", oder null, wenn die Zahl nichts hergibt.
 *
 * Faelle von vor der Aenderung haben keinen Schritt. Dort steht dann weiter
 * der allgemeine Hinweis; eine erfundene Zahl waere schlimmer als keine.
 */
export function schrittName(schritt: number | null): string | null {
  if (schritt === null || schritt < 1 || schritt > SCHRITTE.length) return null;
  // Klammern und kein Gedankenstrich: Der Name steht mitten in einem Satz, in
  // dem schon ein Gedankenstrich vorkommt, und zwei davon in einer Zeile
  // lassen nicht mehr erkennen, was zu was gehoert.
  return `Schritt ${schritt} (${SCHRITTE[schritt - 1]})`;
}

export type Absprungzahl = { schritt: number | null; anzahl: number };

/**
 * Wie viele Faelle bei welchem Schritt liegengeblieben sind.
 *
 * Die eine Zahl, wegen der der erreichte Schritt ueberhaupt mitgeschickt
 * wird. Sie beantwortet nicht "wie viele brechen ab" — das sagt schon die
 * Zahl am Ordner —, sondern "wo". Das ist der Unterschied zwischen einer
 * Beobachtung und einer Aufgabe.
 *
 * Faelle ohne Angabe kommen als eigener Eintrag ans Ende und werden nicht
 * unter die anderen gemischt. Sie stammen aus der Zeit vor dieser Aenderung,
 * und sie unter "Schritt 1" zu fuehren hiesse, eine Auswertung mit einer
 * erfundenen Spitze am Anfang zu beginnen.
 */
export function absprungVerteilung(antraege: Antrag[]): Absprungzahl[] {
  const gezaehlt = new Map<number | null, number>();
  for (const antrag of antraege) {
    const schritt = antrag.erreichterSchritt;
    gezaehlt.set(schritt, (gezaehlt.get(schritt) ?? 0) + 1);
  }
  return [...gezaehlt.entries()]
    .map(([schritt, anzahl]) => ({ schritt, anzahl }))
    .sort((a, b) => {
      if (a.schritt === null) return 1;
      if (b.schritt === null) return -1;
      return a.schritt - b.schritt;
    });
}

/**
 * Die Angaben des zweiten Kreditnehmers.
 *
 * Kontakt und Anschrift stehen nur da, wenn sie von denen des ersten
 * abweichen: Bei `eigenerKontakt: "nein"` sind E-Mail und Telefon leer und es
 * gelten die oben, bei `gleicheAnschrift: "ja"` ebenso die vier Adressfelder.
 * Eine eigene Bankverbindung gibt es nicht — ausgezahlt wird auf ein Konto.
 */
export type ZweitePersonEingang = {
  vorname: string;
  zweiterVorname: string;
  nachname: string;
  geburtsdatum: string;
  /** "ja" heisst: eigene E-Mail und Telefonnummer, sonst die des ersten. */
  eigenerKontakt: string;
  email: string;
  telefonVorwahl: string;
  telefon: string;
  gleicheAnschrift: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  beschaeftigungsart: string;
  arbeitgeber: string;
  beschaeftigtSeit: string;
  nettoeinkommen: string;
  gehaelter: string[];
};

/**
 * Was am Telefon geprueft wurde, je Feld.
 *
 * `wert` ist die Richtigstellung — was der Kunde tatsaechlich gesagt hat,
 * wenn seine urspruengliche Angabe nicht stimmte. `ok` heisst: vorgelesen und
 * bestaetigt. Beides ist unabhaengig voneinander: Man kann bestaetigen, ohne
 * zu aendern, und aendern, ohne schon bestaetigt zu haben.
 */
export type Pruefeintrag = { wert?: string; ok?: boolean };
export type Pruefstand = Record<string, Pruefeintrag>;

/** Ein Antrag, wie er im CRM steht. */
export type Antrag = AntragEingang & {
  id: string;
  /** Zeitpunkt des Eingangs als ISO-Zeichenkette. */
  eingang: string;
  status: StatusId;
  /** Tag der Wiedervorlage als JJJJ-MM-TT, oder null. */
  wiedervorlage: string | null;
  /**
   * Die Kundennummer, fortlaufend ab 1001.
   *
   * Sie kommt aus der Datenbank und nicht von hier: Zwei Antraege, die im
   * selben Moment eingehen, bekaemen sonst dieselbe. `null` steht fuer den
   * Fall, dass ohne Datenbank gearbeitet wird — dann gibt es keine Reihe, in
   * der sich fortlaufen liesse.
   */
  nummer: number | null;
  /**
   * Die Pruefung am Telefon. Steht neben den Angaben des Kunden, nicht
   * anstelle von ihnen — beides bleibt nebeneinander lesbar.
   */
  pruefung: Pruefstand;
};

/** Was im Verlauf eines Falls steht. */
export type AktivitaetArt =
  | "status"
  | "notiz"
  | "wiedervorlage"
  /** Die Bankverbindung wurde kopiert und hat damit das CRM verlassen. */
  | "einsicht";

export type Aktivitaet = {
  id: string;
  zeit: string;
  /** Anzeigename dessen, der es getan hat. */
  benutzer: string;
  art: AktivitaetArt;
  vonStatus: StatusId | null;
  nachStatus: StatusId | null;
  text: string | null;
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

/**
 * Der erreichte Schritt: eine ganze Zahl von 1 bis 8, sonst null.
 *
 * Null und nicht 1, wenn nichts ankommt: "Der Browser hat es nicht
 * mitgeschickt" und "der Kunde ist bei Schritt 1 stehengeblieben" sind zwei
 * verschiedene Auskuenfte, und eine Auswertung, die sie vermischt, zaehlt
 * jeden alten Fall als Absprung am Anfang.
 */
function schrittZahl(wert: unknown): number | null {
  const n = typeof wert === "number" ? wert : Number(wert);
  if (!Number.isInteger(n) || n < 1 || n > SCHRITTE.length) return null;
  return n;
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

/**
 * Die drei Gehaelter, sauber gemacht.
 *
 * Hoechstens drei, jedes hoechstens dreissig Zeichen. Leere Felder bleiben
 * leer und werden nicht weggeworfen: Die Stelle in der Liste sagt, welcher
 * Monat gemeint ist — wer den mittleren nicht angibt, hat nicht zwei Monate
 * angegeben, sondern den mittleren ausgelassen.
 */
function gehaelter(wert: unknown): string[] {
  if (!Array.isArray(wert)) return [];
  return wert.slice(0, 3).map((e) => text(e, 30));
}

/**
 * Der zweite Kreditnehmer, sauber gemacht.
 *
 * Alles laeuft durch dieselben Begrenzer wie beim ersten. Kommt nichts oder
 * etwas anderes als ein Objekt herein, ist das Ergebnis null — die Strecke
 * schickt das Feld nur bei zwei Antragstellern mit, und ein Fall von vor
 * dieser Aenderung kennt es gar nicht.
 */
function zweitePerson(wert: unknown): ZweitePersonEingang | null {
  if (!wert || typeof wert !== "object" || Array.isArray(wert)) return null;
  const p = wert as Record<string, unknown>;
  return {
    vorname: text(p.vorname, 80),
    zweiterVorname: text(p.zweiterVorname, 80),
    nachname: text(p.nachname, 80),
    geburtsdatum: text(p.geburtsdatum, 10),
    eigenerKontakt: text(p.eigenerKontakt, 10),
    email: text(p.email, 200),
    telefonVorwahl: text(p.telefonVorwahl, 10),
    telefon: text(p.telefon, 20),
    gleicheAnschrift: text(p.gleicheAnschrift, 10),
    strasse: text(p.strasse, 120),
    hausnummer: text(p.hausnummer, 20),
    plz: text(p.plz, 10),
    ort: text(p.ort, 120),
    beschaeftigungsart: text(p.beschaeftigungsart, 60),
    arbeitgeber: text(p.arbeitgeber, 120),
    beschaeftigtSeit: text(p.beschaeftigtSeit, 7),
    nettoeinkommen: text(p.nettoeinkommen, 30),
    gehaelter: gehaelter(p.gehaelter),
  };
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
 *
 * `abgeschlossen` unterscheidet die beiden Wege in die Ablage. Ein wirklich
 * abgeschickter Antrag muss vollstaendig sein. Ein Zwischenstand — jemand hat
 * die persoenlichen Daten ausgefuellt und die Strecke danach verlassen —
 * braucht nur eines: einen Weg, ihn zu erreichen. Alles andere darf fehlen,
 * sonst faellt genau der Fall durch das Raster, den man zurueckholen wollte.
 */
export function pruefeAntrag(
  roh: unknown,
  abgeschlossen = true
): Pruefergebnis {
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
    gehaelter: gehaelter(d.gehaelter),
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
    zweitePerson: zweitePerson(d.zweitePerson),
    erreichterSchritt: schrittZahl(d.erreichterSchritt),
  };

  // Bewusst grob: Eine Adresse mit @ und einem Punkt dahinter. Strengere
  // Muster weisen regelmaessig gueltige Adressen ab, und ob die Adresse
  // wirklich jemandem gehoert, sagt ohnehin erst die erste Mail.
  const emailBrauchbar = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(antrag.email);
  // Vier Ziffern sind noch keine Rufnummer, aber alles darueber koennte eine
  // sein. Genauer zu pruefen lohnt nicht: Ob jemand rangeht, sagt erst der
  // Anruf.
  const telefonBrauchbar =
    antrag.telefon.replace(/\D/g, "").length >= 5;

  const fehlend: string[] = [];

  if (!abgeschlossen) {
    // Zwischenstand: Es genuegt ein Weg, den Menschen zu erreichen.
    if (!emailBrauchbar && !telefonBrauchbar) fehlend.push("kontakt");
    if (fehlend.length > 0) return { ok: false, fehlend };
    return { ok: true, antrag };
  }

  if (!antrag.vorname) fehlend.push("vorname");
  if (!antrag.nachname) fehlend.push("nachname");
  if (!emailBrauchbar) fehlend.push("email");
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
const ablage = globalThis as unknown as {
  __crmAntraege?: Antrag[];
  /** Ersatz fuer die Sequenz der Datenbank, wenn ohne sie gearbeitet wird. */
  __crmNummer?: number;
};
ablage.__crmAntraege ??= [];

/** Eine Zeile aus der Tabelle `antrag`. */
type AntragZeile = {
  id: string;
  eingang: Date | string;
  status: string;
  wiedervorlage: Date | string | null;
  // Postgres liefert bigint als Zeichenkette, damit nichts an der Grenze von
  // JavaScripts Zahlen verlorengeht.
  nummer: string | number | null;
  pruefung: Pruefstand | null;
  rohdaten: AntragEingang;
};

/** Ein Tag als JJJJ-MM-TT, egal ob er als Datum oder als Text ankommt. */
function alsTag(wert: Date | string | null): string | null {
  if (!wert) return null;
  const text = wert instanceof Date ? wert.toISOString() : String(wert);
  return text.slice(0, 10);
}

/**
 * Bankverbindungen verschluesseln beziehungsweise wieder lesbar machen —
 * die des Antrags und die der laufenden Kredite.
 *
 * Nur auf dem Weg in die Datenbank und zurueck. Im Arbeitsspeicher brauchte
 * es das nicht: Dort liegt der Schluessel im selben Prozess wie die Daten,
 * die Verschluesselung schuetzte also vor niemandem.
 */
function mitBankverbindung(
  daten: AntragEingang,
  wandle: (wert: string) => string
): AntragEingang {
  return {
    ...daten,
    iban: wandle(daten.iban),
    kredite: daten.kredite.map((k) => ({ ...k, iban: wandle(k.iban) })),
  };
}

/**
 * Aus der Zeile wird der Antrag: Die Angaben kommen aus `rohdaten`, Kennung,
 * Eingang, Status und Wiedervorlage aus den eigenen Spalten. Die uebrigen
 * Spalten sind Kopien fuer Sortierung und Suche und werden hier bewusst nicht
 * gelesen — so gibt es nur eine Quelle fuer den Inhalt.
 */
function ausZeile(zeile: AntragZeile): Antrag {
  return {
    ...mitBankverbindung(zeile.rohdaten, entschluessele),
    // Faelle von vor dem zweiten Kreditnehmer haben das Feld nicht. Aus
    // `undefined` wird hier `null`, damit die Anzeige nur einen Fall fuer
    // "gibt es nicht" kennt und nicht zwei.
    zweitePerson: zeile.rohdaten.zweitePerson ?? null,
    // Ebenso: Wer vor dieser Aenderung eingegangen ist, hat keinen erreichten
    // Schritt. Aus `undefined` wird null — "unbekannt", nicht "Schritt 1".
    erreichterSchritt: zeile.rohdaten.erreichterSchritt ?? null,
    id: zeile.id,
    eingang:
      zeile.eingang instanceof Date
        ? zeile.eingang.toISOString()
        : new Date(zeile.eingang).toISOString(),
    status: zeile.status as StatusId,
    wiedervorlage: alsTag(zeile.wiedervorlage),
    nummer: zeile.nummer === null ? null : Number(zeile.nummer),
    pruefung: zeile.pruefung ?? {},
  };
}

const SPALTEN = `id, eingang, status, wiedervorlage, nummer, pruefung, rohdaten`;

/** Antrag aufnehmen. Neueste stehen vorn. */
export async function nimmAntragAn(
  eingang: AntragEingang,
  status: StatusId = "neu"
): Promise<Antrag> {
  const antrag: Antrag = {
    ...eingang,
    id: randomUUID(),
    eingang: new Date().toISOString(),
    status,
    wiedervorlage: null,
    nummer: null,
    pruefung: {},
  };

  if (ablageart() === "speicher") {
    // Ohne Datenbank gibt es keine Sequenz. Der Zaehler hier ist ein Ersatz,
    // der nur so lange haelt wie die Instanz — genau wie die Faelle selbst.
    ablage.__crmNummer = (ablage.__crmNummer ?? 1000) + 1;
    antrag.nummer = ablage.__crmNummer;
    ablage.__crmAntraege!.unshift(antrag);
    ablage.__crmAntraege!.splice(HOECHSTENS);
    return antrag;
  }

  const abgelegt = mitBankverbindung(eingang, verschluessele);

  await stelleSchemaSicher();
  await abfrage(
    `INSERT INTO antrag
       (id, eingang, status, kreditart, betrag, laufzeit,
        vorname, nachname, email, ort, iban, rohdaten)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING nummer`,
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
      abgelegt.iban,
      JSON.stringify(abgelegt),
    ]
  ).then((zeilen) => {
    // Die Nummer vergibt die Vorgabe der Spalte. Sie zurueckzulesen kostet
    // nichts und erspart eine zweite Abfrage, sobald sie jemand gleich nach
    // dem Anlegen anzeigen will.
    const neu = (zeilen[0] as { nummer?: string | number } | undefined)?.nummer;
    if (neu !== undefined && neu !== null) antrag.nummer = Number(neu);
  });
  // Zurueck geht der Klartext: Der Endpunkt antwortet damit dem Kunden, der
  // seine eigene Bankverbindung gerade selbst eingetippt hat.
  return antrag;
}

/**
 * Einen bereits angelegten Fall mit neueren Angaben ueberschreiben.
 *
 * Der Weg dahin: Wer die Strecke bei den persoenlichen Daten verlaesst, steht
 * als Abbrecher im CRM. Kommt er zurueck und macht weiter, soll daraus
 * derselbe Fall werden und kein zweiter — deshalb bringt der Browser die
 * Kennung mit und wir schreiben darauf.
 *
 * Der Status folgt einer Regel, die den Vorrang des Teams sichert: Von
 * "Abbrecher" auf "Neu" wird gehoben, sobald der Antrag wirklich abgeschickt
 * ist. Hat aber schon jemand den Fall angefasst und weitergeschoben, bleibt
 * seine Station stehen — die spaete Nachreichung des Kunden darf die Arbeit
 * des Beraters nicht zurueckdrehen.
 *
 * Gibt es die Kennung nicht, kommt null zurueck; der Aufrufer legt dann neu
 * an, statt die Angaben zu verlieren.
 */
export async function aktualisiereAntrag(
  id: string,
  eingang: AntragEingang,
  abgeschlossen: boolean
): Promise<Antrag | null> {
  const vorher = await findeAntrag(id);
  if (!vorher) return null;

  const warAbbrecher = vorher.status === "abbrecher";
  const status: StatusId =
    abgeschlossen && warAbbrecher ? "neu" : vorher.status;

  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    if (treffer) Object.assign(treffer, eingang, { status });
  } else {
    const abgelegt = mitBankverbindung(eingang, verschluessele);
    await abfrage(
      `UPDATE antrag
          SET status = $2, kreditart = $3, betrag = $4, laufzeit = $5,
              vorname = $6, nachname = $7, email = $8, ort = $9,
              iban = $10, rohdaten = $11
        WHERE id = $1`,
      [
        id,
        status,
        eingang.kreditart,
        Math.round(eingang.amount),
        Math.round(eingang.months),
        eingang.vorname,
        eingang.nachname,
        eingang.email,
        eingang.ort,
        abgelegt.iban,
        JSON.stringify(abgelegt),
      ]
    );
  }

  // Der Uebergang gehoert in den Verlauf: Sonst stuende ein Fall auf "Neu",
  // und niemand wuesste mehr, dass er als Abbrecher angefangen hat.
  if (abgeschlossen && warAbbrecher) {
    await haltFest(id, {
      benutzer: "Antragsstrecke",
      art: "status",
      vonStatus: "abbrecher",
      nachStatus: "neu",
      text: null,
    });
  }

  return { ...vorher, ...eingang, status };
}

/**
 * Wonach der Eingang eingeschraenkt wird.
 *
 * Ohne das ist die Liste ab dem ersten ernsthaften Betrieb unbenutzbar: Wer
 * einen Kunden am Telefon hat, sucht ihn und will nicht scrollen, und wer den
 * Tag beginnt, will die faelligen Wiedervorlagen sehen und sonst nichts.
 */
export type AntragFilter = {
  /** Freitext ueber Name, E-Mail, Telefon und Ort. */
  suche?: string;
  /** Nur diese Station. */
  station?: StatusId | null;
  /**
   * Nur beziehungsweise gerade nicht diese Stationen — das Brett, das oben
   * offen ist.
   *
   * Der Reiter ist keine Auswahl eines Ordners, sondern eine ganzer Gruppe:
   * "Erledigt" meint die sieben Ordner darunter, "Pipeline" alles andere.
   * Zwei Felder statt einer Liste mit Vorzeichen, weil beide Faelle
   * verschieden sind: Beim einen ist die Liste vollstaendig, beim anderen
   * ist alles gemeint, was nicht darin steht — auch Kennungen, die niemand
   * mehr kennt. Waeren sie nirgends aufgezaehlt, verschwaenden die Faelle
   * darauf aus beiden Listen.
   */
  nurStationen?: StatusId[] | null;
  ohneStationen?: StatusId[] | null;
  /** Nur Faelle, deren Wiedervorlage heute oder frueher faellig ist. */
  nurFaellig?: boolean;
  /**
   * Die Kreditsumme von … bis, in Euro. Je Grenze einzeln: "ab 20.000" ist
   * eine ebenso gewoehnliche Frage wie "zwischen 20.000 und 50.000".
   */
  betragVon?: number | null;
  betragBis?: number | null;
  /**
   * Die Zeitspanne des Eingangs, als Tag in der Form JJJJ-MM-TT. Beide Tage
   * zaehlen mit — wer "bis 31.03." waehlt, meint den 31. einschliesslich.
   */
  vonDatum?: string | null;
  bisDatum?: string | null;
  /**
   * Den Papierkorb mitnehmen, obwohl nicht nach ihm gefiltert wird.
   *
   * Genau eine Ansicht braucht das: das Brett. Es zeigt alle Ordner
   * nebeneinander, und der Papierkorb ist einer davon — ohne seine Karten
   * liesse sich nichts wieder herausziehen. Liste, Zaehlung und Export
   * lassen die Kennzeichnung weg und sehen den Papierkorb damit gar nicht.
   */
  mitPapierkorb?: boolean;
};

/**
 * Sonderzeichen im Suchbegriff entschaerfen. Ohne das waere ein eingetipptes
 * "%" ein Platzhalter fuer alles und "_" fuer ein beliebiges Zeichen — die
 * Suche faende dann Dinge, nach denen niemand gefragt hat.
 */
function fuerLike(suche: string): string {
  return suche.replace(/[\\%_]/g, (zeichen) => `\\${zeichen}`);
}

function passtImSpeicher(antrag: Antrag, filter: AntragFilter): boolean {
  // Der Papierkorb bleibt draussen, solange niemand ausdruecklich hineinsieht.
  // Ohne diese Zeile stuenden zum Loeschen vorgemerkte Faelle weiter in der
  // Liste, in der Gesamtzahl und im Export — und "geloescht" waere nur ein
  // anderes Wort fuer "woanders einsortiert".
  if (
    imPapierkorb(antrag.status) &&
    !imPapierkorb(filter.station ?? "") &&
    filter.mitPapierkorb !== true
  ) {
    return false;
  }
  if (filter.station && antrag.status !== filter.station) return false;
  if (filter.nurStationen && !filter.nurStationen.includes(antrag.status)) {
    return false;
  }
  if (filter.ohneStationen?.includes(antrag.status)) return false;
  if (filter.nurFaellig) {
    const heute = new Date().toISOString().slice(0, 10);
    if (!antrag.wiedervorlage || antrag.wiedervorlage > heute) return false;
  }
  if (filter.betragVon != null && antrag.amount < filter.betragVon) return false;
  if (filter.betragBis != null && antrag.amount > filter.betragBis) return false;
  // Der Eingang ist eine ISO-Zeichenkette, die mit dem Tag beginnt. Ein
  // Vergleich der ersten zehn Zeichen ist deshalb ein Vergleich der Tage —
  // und der Notbehelf antwortet damit auf dieselbe Frage wie die Datenbank.
  const tag = antrag.eingang.slice(0, 10);
  if (filter.vonDatum && tag < filter.vonDatum) return false;
  if (filter.bisDatum && tag > filter.bisDatum) return false;
  const suche = filter.suche?.trim().toLowerCase();
  if (suche) {
    const heuhaufen = [
      antrag.vorname,
      antrag.nachname,
      antrag.email,
      antrag.telefon,
      antrag.ort,
    ]
      .join(" ")
      .toLowerCase();
    if (!heuhaufen.includes(suche)) return false;
  }
  return true;
}

export async function alleAntraege(
  filter: AntragFilter = {}
): Promise<Antrag[]> {
  if (ablageart() === "speicher") {
    return (ablage.__crmAntraege ?? []).filter((a) =>
      passtImSpeicher(a, filter)
    );
  }

  await stelleSchemaSicher();
  const zeilen = await abfrage<AntragZeile>(
    `SELECT ${SPALTEN}
       FROM antrag
      WHERE ${WO}
      ORDER BY eingang DESC
      LIMIT 500`,
    filterWerte(filter)
  );
  return zeilen.map(ausZeile);
}

/**
 * Die Bedingung, die Suche, Station und Faelligkeit zusammen ergeben.
 *
 * Als eine Zeichenkette mit drei Platzhaltern statt zusammengesetzt: So
 * benutzen Liste, Zaehlung und Export dieselbe Bedingung, und keine kann
 * abweichen. Ein nicht gesetzter Filter kommt als NULL an und faellt damit
 * von selbst weg.
 */
const WO = `
  ($1::text IS NULL OR (
     vorname ILIKE '%' || $1 || '%' ESCAPE '\\' OR
     nachname ILIKE '%' || $1 || '%' ESCAPE '\\' OR
     email ILIKE '%' || $1 || '%' ESCAPE '\\' OR
     coalesce(ort, '') ILIKE '%' || $1 || '%' ESCAPE '\\' OR
     coalesce(rohdaten->>'telefon', '') ILIKE '%' || $1 || '%' ESCAPE '\\'
   ))
  AND ($2::text IS NULL OR status = $2)
  AND ($3::boolean IS NOT TRUE OR
       (wiedervorlage IS NOT NULL AND wiedervorlage <= CURRENT_DATE))
  -- Der Papierkorb bleibt draussen, solange niemand ausdruecklich
  -- hineinsieht. Die Bedingung steht hier und nicht in den drei Aufrufern,
  -- weil Liste, Zaehlung und Export dieselbe Zeichenkette benutzen: So kann
  -- keiner von ihnen den Papierkorb versehentlich doch mitzaehlen.
  AND (status <> 'papierkorb' OR $2 = 'papierkorb' OR $4::boolean IS TRUE)
  AND ($5::integer IS NULL OR betrag >= $5)
  AND ($6::integer IS NULL OR betrag <= $6)
  AND ($7::date IS NULL OR eingang >= $7::date)
  -- Der Bis-Tag zaehlt ganz mit. Ohne das eine hinzugezaehlte Tag vergliche
  -- man gegen dessen Mitternacht und liesse den gewaehlten Tag selbst weg —
  -- wer "bis 31.03." einstellt, faende dann nichts vom 31. Maerz.
  AND ($8::date IS NULL OR eingang < $8::date + 1)
  -- Das offene Brett. Leere Listen kommen als NULL an und fallen damit weg.
  AND ($9::text[] IS NULL OR status = ANY($9::text[]))
  AND ($10::text[] IS NULL OR status <> ALL($10::text[]))
`;

function filterWerte(filter: AntragFilter): unknown[] {
  const suche = filter.suche?.trim();
  return [
    suche ? fuerLike(suche) : null,
    filter.station ?? null,
    filter.nurFaellig === true,
    filter.mitPapierkorb === true,
    filter.betragVon ?? null,
    filter.betragBis ?? null,
    filter.vonDatum || null,
    filter.bisDatum || null,
    // Eine leere Liste hiesse in SQL "nichts trifft zu" und leerte die Liste.
    // Gemeint ist aber "keine Einschraenkung" — also NULL.
    filter.nurStationen?.length ? filter.nurStationen : null,
    filter.ohneStationen?.length ? filter.ohneStationen : null,
  ];
}

export async function findeAntrag(id: string): Promise<Antrag | undefined> {
  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    // Ein Abbild, nicht der Eintrag selbst. Sonst zeigt der Rueckgabewert auf
    // dasselbe Objekt wie die Liste, und wer ihn liest, waehrend nebenan
    // geschrieben wird, sieht den neuen Stand statt des alten. Aus der
    // Datenbank kommt ohnehin jedes Mal ein frisches Objekt — der Notbehelf
    // muss sich genauso verhalten, sonst haengt das Verhalten davon ab, wo
    // die Daten gerade liegen.
    return treffer ? { ...treffer } : undefined;
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
    `SELECT ${SPALTEN} FROM antrag WHERE id = $1`,
    [id]
  );
  return zeilen[0] ? ausZeile(zeilen[0]) : undefined;
}

/**
 * Alle Zahlen der Uebersicht auf einmal.
 *
 * Vorher waren das drei Abfragen: Gesamtzahl, faellige Wiedervorlagen, Zahl
 * je Ordner. Alle drei zaehlen dieselbe Tabelle, nur anders gruppiert — das
 * kann Postgres in einem Durchgang, und der HTTP-Treiber spart sich zwei
 * Anfragen ans Netz.
 *
 * Der Papierkorb faellt aus Gesamtzahl und Faelligkeiten heraus, steht aber
 * in `jeOrdner`: Seine Spalte im Brett zeigt ja an, wie viel darin liegt.
 */
export async function zaehleUebersicht(): Promise<{
  gesamt: number;
  faellig: number;
  jeOrdner: Record<string, number>;
}> {
  if (ablageart() === "speicher") {
    const heute = new Date().toISOString().slice(0, 10);
    const jeOrdner: Record<string, number> = {};
    let gesamt = 0;
    let faellig = 0;
    for (const a of ablage.__crmAntraege ?? []) {
      jeOrdner[a.status] = (jeOrdner[a.status] ?? 0) + 1;
      if (imPapierkorb(a.status)) continue;
      gesamt++;
      if (a.wiedervorlage && a.wiedervorlage <= heute) faellig++;
    }
    return { gesamt, faellig, jeOrdner };
  }

  await stelleSchemaSicher();
  const zeilen = await abfrage<{
    status: string;
    anzahl: string;
    faellig: string;
  }>(
    `SELECT status,
            count(*)::text AS anzahl,
            count(*) FILTER (
              WHERE wiedervorlage IS NOT NULL AND wiedervorlage <= CURRENT_DATE
            )::text AS faellig
       FROM antrag
      GROUP BY status`
  );

  const jeOrdner: Record<string, number> = {};
  let gesamt = 0;
  let faellig = 0;
  for (const zeile of zeilen) {
    const anzahl = Number(zeile.anzahl);
    jeOrdner[zeile.status] = anzahl;
    if (imPapierkorb(zeile.status)) continue;
    gesamt += anzahl;
    faellig += Number(zeile.faellig);
  }
  return { gesamt, faellig, jeOrdner };
}

/**
 * Zahl der Faelle, die dem Filter entsprechen — unabhaengig von der Grenze
 * der geladenen Liste.
 */
export async function zaehleAntraege(
  filter: AntragFilter = {}
): Promise<number> {
  if (ablageart() === "speicher") {
    return (ablage.__crmAntraege ?? []).filter((a) =>
      passtImSpeicher(a, filter)
    ).length;
  }
  await stelleSchemaSicher();
  const zeilen = await abfrage<{ anzahl: string }>(
    `SELECT count(*)::text AS anzahl FROM antrag WHERE ${WO}`,
    filterWerte(filter)
  );
  return Number(zeilen[0]?.anzahl ?? 0);
}


/**
 * Einen Fall samt Verlauf loeschen.
 *
 * Ohne diese Moeglichkeit liesse sich ein Loeschbegehren nach Art. 17 DSGVO
 * nur ueber die Datenbank erfuellen — und bei Abbrechern, die nie etwas
 * abgeschickt haben, ist ein Widerspruch der Normalfall und nicht die
 * Ausnahme. Der Verlauf verschwindet mit: Er haengt am Fall und traegt
 * dessen Notizen.
 */
export async function loescheAntrag(id: string): Promise<boolean> {
  const vorhanden = await findeAntrag(id);
  if (!vorhanden) return false;

  if (ablageart() === "speicher") {
    const liste = ablage.__crmAntraege ?? [];
    const stelle = liste.findIndex((a) => a.id === id);
    if (stelle >= 0) liste.splice(stelle, 1);
    verlauf.__crmAktivitaeten = (verlauf.__crmAktivitaeten ?? []).filter(
      (a) => a.antragId !== id
    );
    return true;
  }

  // Der Verlauf haengt per ON DELETE CASCADE am Fall und geht mit.
  await abfrage(`DELETE FROM antrag WHERE id = $1`, [id]);
  return true;
}

/* ------------------------------------------------------------------ */
/* Bearbeitung                                                         */
/* ------------------------------------------------------------------ */

/**
 * Der Verlauf im Arbeitsspeicher — dasselbe wie die Tabelle `aktivitaet`,
 * nur fluechtig. Ohne ihn liesse sich die Bearbeitung ohne Datenbank gar
 * nicht ausprobieren.
 */
const verlauf = globalThis as unknown as {
  __crmAktivitaeten?: (Aktivitaet & { antragId: string })[];
};
verlauf.__crmAktivitaeten ??= [];

type AktivitaetZeile = {
  id: string | number;
  zeit: Date | string;
  benutzer: string;
  art: string;
  von_status: string | null;
  nach_status: string | null;
  text: string | null;
};

async function haltFest(
  antragId: string,
  eintrag: Omit<Aktivitaet, "id" | "zeit">
): Promise<void> {
  if (ablageart() === "speicher") {
    verlauf.__crmAktivitaeten!.unshift({
      ...eintrag,
      antragId,
      id: randomUUID(),
      zeit: new Date().toISOString(),
    });
    return;
  }
  await abfrage(
    `INSERT INTO aktivitaet (antrag_id, benutzer, art, von_status, nach_status, text)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      antragId,
      eintrag.benutzer,
      eintrag.art,
      eintrag.vonStatus,
      eintrag.nachStatus,
      eintrag.text,
    ]
  );
}

/** Der Verlauf eines Falls, neueste zuerst. */
export async function aktivitaeten(antragId: string): Promise<Aktivitaet[]> {
  if (ablageart() === "speicher") {
    return (verlauf.__crmAktivitaeten ?? []).filter(
      (a) => a.antragId === antragId
    );
  }

  await stelleSchemaSicher();
  const zeilen = await abfrage<AktivitaetZeile>(
    `SELECT id, zeit, benutzer, art, von_status, nach_status, text
       FROM aktivitaet
      WHERE antrag_id = $1
      ORDER BY zeit DESC, id DESC
      LIMIT 200`,
    [antragId]
  );
  return zeilen.map((z) => ({
    id: String(z.id),
    zeit: z.zeit instanceof Date ? z.zeit.toISOString() : String(z.zeit),
    benutzer: z.benutzer,
    art: z.art as AktivitaetArt,
    vonStatus: (z.von_status as StatusId | null) ?? null,
    nachStatus: (z.nach_status as StatusId | null) ?? null,
    text: z.text,
  }));
}

/**
 * Lesen, schreiben und vermerken in einer einzigen Anweisung.
 *
 * Vorher waren das drei: den Fall holen, den Status setzen, den Verlauf
 * schreiben. Der HTTP-Treiber macht aus jeder ein eigenes Hin und Her, und
 * weil sie aufeinander aufbauen, laufen sie nacheinander — beim Schieben
 * einer Karte war das die spuerbare Wartezeit. Als eine Anweisung ist es
 * eine Runde statt dreien.
 *
 * Datenaendernde CTEs sehen in Postgres alle denselben Stand von vor der
 * Anweisung. `alt` liest den Status deshalb so, wie er vor dem UPDATE war,
 * obwohl beide zur selben Anweisung gehoeren — genau das braucht der
 * Verlaufseintrag.
 *
 * `AND status <> $2` haelt den Fall ab, in dem sich nichts aendert: Dann
 * liefert `geaendert` keine Zeile, und der INSERT traegt nichts ein. Ein
 * Verlauf voller "Neu → Neu" waere schlimmer als keiner.
 */
const STATUS_SQL = `WITH alt AS (
       SELECT status FROM antrag WHERE id = $1
     ), geaendert AS (
       UPDATE antrag SET status = $2
        WHERE id = $1 AND status <> $2
       RETURNING id
     )
     INSERT INTO aktivitaet (antrag_id, benutzer, art, von_status, nach_status)
     SELECT $1, $3, 'status', alt.status, $2
       FROM alt, geaendert`;

/**
 * Status setzen und den Wechsel festhalten.
 *
 * Steht der Fall schon auf dem gewuenschten Status, passiert nichts — sonst
 * fuellte ein versehentlich zweimal abgeschicktes Formular den Verlauf mit
 * Wechseln, bei denen sich nichts geaendert hat.
 */
export async function setzeStatus(
  id: string,
  status: StatusId,
  benutzer: string
): Promise<void> {
  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    if (!treffer || treffer.status === status) return;
    const vonStatus = treffer.status;
    treffer.status = status;
    await haltFest(id, {
      benutzer,
      art: "status",
      vonStatus,
      nachStatus: status,
      text: null,
    });
    return;
  }

  await abfrage(STATUS_SQL, [id, status, benutzer]);
}

/**
 * Dasselbe fuer mehrere Faelle auf einmal.
 *
 * Auf dem Brett lassen sich Karten markieren und gemeinsam ziehen; dann
 * wechseln zwanzig Faelle mit einer Geste den Ordner. Zwanzig einzelne
 * Aufrufe waeren zwanzig Runden uebers Netz — spuerbar lang, und mittendrin
 * abgebrochen bliebe die Haelfte liegen.
 *
 * Deshalb geht dieselbe, schon bewaehrte Anweisung einmal je Fall in einen
 * Stapel und der Stapel als eine Transaktion hinaus. Eine eigene Anweisung
 * mit `= ANY($1)` waere kuerzer, muesste aber neu geschrieben und neu
 * geprueft werden — fuer denselben einen Weg ueber das Netz.
 */
export async function setzeStatusMehrere(
  ids: string[],
  status: StatusId,
  benutzer: string
): Promise<void> {
  const eindeutig = [...new Set(ids.filter(Boolean))];
  if (eindeutig.length === 0) return;
  if (eindeutig.length === 1) {
    await setzeStatus(eindeutig[0], status, benutzer);
    return;
  }

  if (ablageart() === "speicher") {
    for (const id of eindeutig) await setzeStatus(id, status, benutzer);
    return;
  }

  await stapel(
    eindeutig.map((id) => ({ text: STATUS_SQL, werte: [id, status, benutzer] }))
  );
}

/**
 * Ein Feld richtigstellen oder bestaetigen.
 *
 * Geschrieben wird in `pruefung`, nie in `rohdaten`: Dort steht, was der Kunde
 * selbst abgeschickt hat, und das bleibt, wie es war. Wer spaeter fragt, ob
 * eine Telefonnummer von Anfang an so lautete, findet beides nebeneinander.
 *
 * `wert` und `ok` werden getrennt uebergeben und getrennt geschrieben:
 * `undefined` heisst "nicht angefasst", nicht "leeren". Sonst loeschte ein
 * Haken die Richtigstellung, die kurz davor jemand eingetippt hat.
 *
 * Eine Richtigstellung, die dem Original entspricht, wird wieder entfernt.
 * Sonst stuende im Datensatz eine Korrektur, die nichts korrigiert, und die
 * Anzeige zeigte eine Aenderung an, wo keine ist.
 */
export async function setzePruefung(
  id: string,
  schluessel: string,
  aenderung: { wert?: string; ok?: boolean },
  original: string
): Promise<void> {
  // Nur die Pruefspalte holen, nicht den ganzen Fall. `findeAntrag` laedt
  // `rohdaten` mit und entschluesselt die Bankverbindung — beides fuer einen
  // Haken an einer Telefonnummer umsonst.
  const stand = await lesePruefung(id);
  if (stand === null) return;

  const alt = stand[schluessel] ?? {};
  const neu: Pruefeintrag = { ...alt };

  if (aenderung.wert !== undefined) {
    const sauber = aenderung.wert.trim().slice(0, 200);
    if (!sauber || sauber === original.trim()) delete neu.wert;
    else neu.wert = sauber;
  }
  if (aenderung.ok !== undefined) {
    if (aenderung.ok) neu.ok = true;
    else delete neu.ok;
  }

  const naechster: Pruefstand = { ...stand };
  // Ein Feld ohne Richtigstellung und ohne Haken gehoert nicht in die Ablage.
  // Sonst waechst `pruefung` mit jedem Klick, der nichts hinterlaesst.
  if (neu.wert === undefined && neu.ok === undefined) delete naechster[schluessel];
  else naechster[schluessel] = neu;

  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    if (treffer) treffer.pruefung = naechster;
    return;
  }

  await abfrage(`UPDATE antrag SET pruefung = $2 WHERE id = $1`, [
    id,
    JSON.stringify(naechster),
  ]);
}

/** Nur der Pruefstand eines Falls. Gibt null zurueck, wenn es ihn nicht gibt. */
async function lesePruefung(id: string): Promise<Pruefstand | null> {
  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    return treffer ? { ...treffer.pruefung } : null;
  }
  await stelleSchemaSicher();
  const zeilen = await abfrage<{ pruefung: Pruefstand | null }>(
    `SELECT pruefung FROM antrag WHERE id = $1`,
    [id]
  );
  if (zeilen.length === 0) return null;
  return zeilen[0].pruefung ?? {};
}

/**
 * Vermerkt, dass die Bankverbindung kopiert wurde.
 *
 * Kein Text, kein Statuswechsel — nur der Umstand, wer wann. Mehr braucht es
 * nicht: Was kopiert wurde, steht ohnehin im Fall.
 */
export async function haltEinsichtFest(
  id: string,
  benutzer: string
): Promise<void> {
  const vorhanden = await findeAntrag(id);
  if (!vorhanden) return;
  await haltFest(id, {
    benutzer,
    art: "einsicht",
    vonStatus: null,
    nachStatus: null,
    text: null,
  });
}

/** Notiz an den Fall schreiben. Leere Notizen werden verworfen. */
export async function schreibeNotiz(
  id: string,
  text: string,
  benutzer: string
): Promise<void> {
  const sauber = text.trim().slice(0, 2000);
  if (!sauber) return;
  const vorhanden = await findeAntrag(id);
  if (!vorhanden) return;

  await haltFest(id, {
    benutzer,
    art: "notiz",
    vonStatus: null,
    nachStatus: null,
    text: sauber,
  });
}

/**
 * Wiedervorlage setzen oder abraeumen. `null` loescht sie.
 *
 * Auch das Abraeumen steht im Verlauf: Eine verschwundene Wiedervorlage ohne
 * Spur waere genau die Art Aenderung, die spaeter niemand mehr erklaeren kann.
 */
export async function setzeWiedervorlage(
  id: string,
  tag: string | null,
  benutzer: string
): Promise<void> {
  if (tag !== null && !/^\d{4}-\d{2}-\d{2}$/.test(tag)) return;
  const vorhanden = await findeAntrag(id);
  if (!vorhanden || vorhanden.wiedervorlage === tag) return;

  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    if (treffer) treffer.wiedervorlage = tag;
  } else {
    await abfrage(`UPDATE antrag SET wiedervorlage = $1 WHERE id = $2`, [
      tag,
      id,
    ]);
  }

  await haltFest(id, {
    benutzer,
    art: "wiedervorlage",
    vonStatus: null,
    nachStatus: null,
    text: tag,
  });
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

/**
 * Alles, was Gehaelter hat: der Antrag selbst und der zweite Kreditnehmer.
 *
 * Die drei Funktionen darunter rechnen nur mit diesen beiden Feldern. Sie an
 * den ganzen Antrag zu binden hiesse, sie fuer den zweiten Kreditnehmer ein
 * zweites Mal zu schreiben.
 */
export type MitGehalt = { gehaelter: string[]; nettoeinkommen: string };

/**
 * Die Gehaelter eines Falls, immer als Liste.
 *
 * Faelle von vor der Umstellung haben nur `nettoeinkommen`. Sie kommen hier
 * als einelementige Liste heraus, damit die Anzeige nicht zwei Wege kennen
 * muss.
 *
 * Nur am Ende wird gekuerzt, nicht in der Mitte: Die Stelle in der Liste sagt,
 * welcher Monat gemeint ist. Wer den mittleren auslaesst, hat nicht zwei
 * Monate angegeben — ruecken die hinteren nach, stuende der vorletzte Monat
 * unter "Vormonat" und die Akte behauptete etwas, das nie jemand angegeben
 * hat.
 */
export function gehaltsliste(antrag: MitGehalt): string[] {
  const liste = [...(antrag.gehaelter ?? [])];
  while (liste.length > 0 && liste[liste.length - 1].trim() === "") liste.pop();
  if (liste.length > 0) return liste.map((g) => g.trim());
  return antrag.nettoeinkommen.trim() ? [antrag.nettoeinkommen] : [];
}

/**
 * Der niedrigste der angegebenen Monate — die Zahl, mit der gerechnet wird.
 *
 * Ein einzelner Monat sagt wenig: Urlaubsgeld hebt ihn, Kurzarbeit senkt ihn.
 * Was traegt, ist der schlechteste der drei. Gibt es nur einen Monat, ist er
 * es zwangslaeufig; gibt es keinen, kommt null zurueck.
 */
export function niedrigstesGehalt(antrag: MitGehalt): number | null {
  const zahlen = gehaltszahlen(antrag).filter((n) => n !== null);
  return zahlen.length > 0 ? Math.min(...(zahlen as number[])) : null;
}

/**
 * Welcher der Monate der niedrigste ist — als Platz in `gehaltsliste`.
 *
 * Das Datenblatt braucht die Stelle, nicht den Betrag: Es markiert eine Zeile.
 * Bei nur einem Monat gibt es nichts zu vergleichen, dann kommt -1 zurueck —
 * eine einzelne Zahl als "die niedrigste" auszuzeichnen sagt nichts. Sind zwei
 * Monate gleich niedrig, gewinnt der erste; zwei Markierungen mit derselben
 * Begruendung wuerden nur fragen lassen, welche denn nun gilt.
 */
export function niedrigsterGehaltIndex(antrag: MitGehalt): number {
  const zahlen = gehaltszahlen(antrag);
  if (zahlen.filter((n) => n !== null).length < 2) return -1;
  let platz = -1;
  for (let i = 0; i < zahlen.length; i++) {
    const n = zahlen[i];
    if (n === null) continue;
    if (platz === -1 || n < (zahlen[platz] as number)) platz = i;
  }
  return platz;
}

/** Die Monate als Zahl, Stelle fuer Stelle — unlesbares wird zu null. */
function gehaltszahlen(antrag: MitGehalt): (number | null)[] {
  return gehaltsliste(antrag).map((g) => {
    const n = Number(g.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  });
}

export function vollerName(antrag: Antrag): string {
  return [antrag.vorname, antrag.nachname].filter(Boolean).join(" ") || "—";
}

/**
 * Die Kundennummer, wie sie gelesen und vorgelesen wird.
 *
 * Das Praefix ist kein Schmuck: "K-1042" ist am Telefon eindeutig eine
 * Kundennummer, "1042" koennte alles sein — ein Betrag, eine Hausnummer, eine
 * Vorwahl. Fehlt die Nummer, steht ein Gedankenstrich da statt einer
 * erfundenen.
 */
export function kundennummer(antrag: Antrag): string {
  return antrag.nummer === null ? "—" : `K-${antrag.nummer}`;
}

/**
 * Ein Geldbetrag aus der Antragsstrecke, lesbar gemacht.
 *
 * Die Strecke legt diese Angaben als Zeichenketten ab, so wie der Kunde sie
 * getippt hat — "5100", manchmal "5.100", manchmal "5100,50". In der Fallakte
 * standen sie deshalb roh da: Der Kreditwunsch als "41.000 €", das
 * Nettoeinkommen daneben als "5100". Zwei Betraege untereinander, zwei
 * Schreibweisen.
 *
 * Was sich nicht als Zahl lesen laesst, kommt unveraendert zurueck statt als
 * "0 €". Steht dort etwas, das niemand vorhergesehen hat, soll man es sehen
 * und nicht eine Null, die es nie gab.
 */
export function geldbetrag(wert: string): string {
  const sauber = wert.trim();
  if (!sauber) return "—";

  // Punkte als Tausendertrenner weg, Komma zum Dezimalpunkt — die deutsche
  // Schreibweise, in der die Strecke die Angaben entgegennimmt.
  const zahl = Number(sauber.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(zahl)) return sauber;

  return zahl.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(zahl) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Ob der Fall die Antragsstrecke nie zu Ende gegangen ist.
 *
 * Frueher hing dieser Hinweis am Status: Wer auf "Abbrecher" stand, hatte
 * abgebrochen. Seit "Abgebrochen" ein Ordner ist, in den sich jede Karte
 * ziehen laesst, traegt der Status diese Auskunft nicht mehr — ein
 * vollstaendiger Antrag, den jemand dorthin schiebt, stuende sonst mit dem
 * Vermerk da, seine Angaben fehlten.
 *
 * Gefragt wird deshalb die einzige Stelle, die es wirklich weiss: die Daten.
 * Beschaeftigung und Bankverbindung kommen erst nach den persoenlichen Daten;
 * fehlt beides, ist die Strecke dort geendet. Beides zusammen und nicht eines
 * davon, weil eine einzelne Luecke auch schlicht eine Luecke sein kann.
 */
export function unvollstaendig(antrag: Antrag): boolean {
  return !antrag.iban.trim() && !antrag.nettoeinkommen.trim();
}
