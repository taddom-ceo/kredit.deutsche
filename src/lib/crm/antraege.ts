import { randomUUID } from "crypto";
import { abfrage, datenbankVorhanden, stelleSchemaSicher } from "./db";
import type { StatusId } from "./pipeline";
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
  /** Tag der Wiedervorlage als JJJJ-MM-TT, oder null. */
  wiedervorlage: string | null;
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
const ablage = globalThis as unknown as { __crmAntraege?: Antrag[] };
ablage.__crmAntraege ??= [];

/** Eine Zeile aus der Tabelle `antrag`. */
type AntragZeile = {
  id: string;
  eingang: Date | string;
  status: string;
  wiedervorlage: Date | string | null;
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
    id: zeile.id,
    eingang:
      zeile.eingang instanceof Date
        ? zeile.eingang.toISOString()
        : new Date(zeile.eingang).toISOString(),
    status: zeile.status as StatusId,
    wiedervorlage: alsTag(zeile.wiedervorlage),
  };
}

const SPALTEN = `id, eingang, status, wiedervorlage, rohdaten`;

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
  };

  if (ablageart() === "speicher") {
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
      abgelegt.iban,
      JSON.stringify(abgelegt),
    ]
  );
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
  /** Nur Faelle, deren Wiedervorlage heute oder frueher faellig ist. */
  nurFaellig?: boolean;
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
  if (filter.station && antrag.status !== filter.station) return false;
  if (filter.nurFaellig) {
    const heute = new Date().toISOString().slice(0, 10);
    if (!antrag.wiedervorlage || antrag.wiedervorlage > heute) return false;
  }
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
`;

function filterWerte(filter: AntragFilter): unknown[] {
  const suche = filter.suche?.trim();
  return [
    suche ? fuerLike(suche) : null,
    filter.station ?? null,
    filter.nurFaellig === true,
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

/** Wie viele Wiedervorlagen heute oder frueher faellig sind. */
export async function zaehleFaellige(): Promise<number> {
  return zaehleAntraege({ nurFaellig: true });
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
  const vorher = await findeAntrag(id);
  if (!vorher || vorher.status === status) return;

  // Den alten Stand festhalten, bevor geschrieben wird — nicht erst danach
  // aus `vorher` lesen. Sonst haengt der Verlauf daran, ob der gelesene Satz
  // zufaellig dasselbe Objekt ist wie der gespeicherte.
  const vonStatus = vorher.status;

  if (ablageart() === "speicher") {
    const treffer = (ablage.__crmAntraege ?? []).find((a) => a.id === id);
    if (treffer) treffer.status = status;
  } else {
    await abfrage(`UPDATE antrag SET status = $1 WHERE id = $2`, [status, id]);
  }

  await haltFest(id, {
    benutzer,
    art: "status",
    vonStatus,
    nachStatus: status,
    text: null,
  });
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

export function vollerName(antrag: Antrag): string {
  return [antrag.vorname, antrag.nachname].filter(Boolean).join(" ") || "—";
}
