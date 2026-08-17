import {
  niedrigstesGehalt,
  vollerName,
  type Antrag,
  type AntragFilter,
} from "./antraege";
import {
  brettDerStation,
  ERLEDIGT_STATIONEN,
  findeStation,
  rangDerStation,
  type BrettId,
  type StatusId,
} from "./pipeline";
import { bewerte, KLASSEN, type Prioritaetsklasse } from "./priorisierung";
import { findeKreditartNachId } from "../kreditarten";

/**
 * Was die Fallliste gerade zeigt: Filter und Reihenfolge, an einem Ort.
 *
 * Der Grund fuer diese Datei ist, dass es drei Stellen gibt, die dasselbe
 * beantworten muessen — die Liste, das Brett und der Export. Solange jede
 * ihre Suchparameter selbst auslas, konnte der Export eine andere Auswahl
 * liefern als die Liste darueber, aus der man ihn angeklickt hat. Das ist die
 * schlimmste Art von Fehler bei einer Tabelle, die weitergereicht wird: Sie
 * sieht richtig aus.
 *
 * Die Aufteilung in zwei Haelften ist keine Willkuer:
 *
 *   · Was in SQL geht, geht in SQL — Suche, Ordner, Faelligkeit, Kreditsumme,
 *     Zeitspanne. Das ist `AntragFilter`, und danach zaehlt die Datenbank.
 *   · Was nicht in SQL geht, wird hier auf den geladenen Zeilen gerechnet.
 *     Das Einkommen steht als getippte Zeichenkette im JSON und ist erst nach
 *     dem Lesen eine Zahl; die Prioritaet haengt an der Uhr und steht in gar
 *     keiner Spalte. Beides in SQL nachzubauen hiesse, die Regeln ein zweites
 *     Mal zu schreiben — und die zweite Fassung waere irgendwann die falsche.
 */

/** Wonach die Liste sortiert werden kann — jede Spalte, die sie zeigt. */
export const SORTIERSCHLUESSEL = [
  "eingang",
  "nummer",
  "name",
  "verwendung",
  "betrag",
  "laufzeit",
  "prio",
  "wiedervorlage",
  "ordner",
] as const;

export type Sortierschluessel = (typeof SORTIERSCHLUESSEL)[number];

export type Richtung = "auf" | "ab";

/**
 * Die Richtung, in der eine Kennzahl beim ersten Klick sortiert.
 *
 * Nicht ueberall dieselbe, weil "das Wichtigste zuerst" bei jeder Kennzahl
 * etwas anderes heisst: Beim Eingang und beim Betrag ist das der groesste
 * Wert, beim Namen der Buchstabe A, und bei der Prioritaet steht P1 vorn —
 * also der hoechste Punktwert. Wer die Voreinstellung nicht will, klickt ein
 * zweites Mal.
 */
const ERSTE_RICHTUNG: Record<Sortierschluessel, Richtung> = {
  eingang: "ab",
  nummer: "ab",
  name: "auf",
  verwendung: "auf",
  betrag: "ab",
  laufzeit: "ab",
  prio: "ab",
  wiedervorlage: "auf",
  // Der Ordner sortiert den Weg entlang: "Neu" zuerst, der Papierkorb zuletzt.
  ordner: "auf",
};

export function ersteRichtung(schluessel: Sortierschluessel): Richtung {
  return ERSTE_RICHTUNG[schluessel];
}

/**
 * Der gesamte Zustand der Ansicht — alles, was in der Adresse steht.
 *
 * Als ein Objekt und nicht als ein Dutzend Einzelwerte, weil jeder Verweis auf
 * der Seite alle uebrigen mitnehmen muss: Wer nach Betrag sortiert und dann
 * einen Ordner aufschlaegt, will die Sortierung behalten, und wer einen Filter
 * setzt, will ihn beim naechsten Klick nicht verlieren.
 */
export type Ansicht = {
  suche: string;
  station: StatusId | null;
  nurFaellig: boolean;
  betragVon: number | null;
  betragBis: number | null;
  einkommenVon: number | null;
  einkommenBis: number | null;
  /** Prioritaetsklassen als Rang: 1 ist P1. */
  prioVon: number | null;
  prioBis: number | null;
  vonDatum: string | null;
  bisDatum: string | null;
  sortierung: Sortierschluessel;
  richtung: Richtung;
  /**
   * Welcher Reiter oben offen ist — "Pipeline" oder "Erledigt".
   *
   * Er gehoert in die Adresse und nicht in einen Zustand im Browser: Jeder
   * Klick auf einen Ordner ist eine Navigation, und ein Reiter, der dabei
   * zurueckspringt, waere ein Reiter, den man nach jedem Klick neu waehlt.
   */
  brett: BrettId;
};

export const LEERE_ANSICHT: Ansicht = {
  suche: "",
  station: null,
  nurFaellig: false,
  betragVon: null,
  betragBis: null,
  einkommenVon: null,
  einkommenBis: null,
  prioVon: null,
  prioBis: null,
  vonDatum: null,
  bisDatum: null,
  sortierung: "eingang",
  richtung: "ab",
  brett: "pipeline",
};

/* ------------------------------------------------------------------ */
/* Lesen und schreiben                                                 */
/* ------------------------------------------------------------------ */

/** Eine Zahl aus der Adresse. Unsinn wird zu null, nicht zu 0. */
function zahl(wert: string): number | null {
  const sauber = wert.trim().replace(/[.\s]/g, "").replace(",", ".");
  if (!sauber) return null;
  const n = Number(sauber);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Ein Tag aus der Adresse. Alles, was nicht JJJJ-MM-TT ist, faellt weg. */
function tag(wert: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(wert.trim()) ? wert.trim() : null;
}

/** Ein Rang von 1 bis 5. Alles andere faellt weg. */
function rang(wert: string): number | null {
  const n = Number(wert.trim().replace(/^P/i, ""));
  return Number.isInteger(n) && n >= 1 && n <= KLASSEN.length ? n : null;
}

/**
 * Die Ansicht aus den Suchparametern lesen.
 *
 * `lies` statt eines festen Typs, weil die Seite ein Objekt bekommt und der
 * Export-Endpunkt eine `URLSearchParams` — beide koennen einen Namen
 * nachschlagen, und mehr braucht es hier nicht.
 *
 * Jeder Wert wird geprueft und faellt im Zweifel weg. Eine erfundene Adresse
 * soll die vollstaendige Liste zeigen und nicht eine leere, die aussaehe, als
 * gaebe es keine Faelle.
 */
export function leseAnsicht(lies: (name: string) => string): Ansicht {
  const station = lies("station");
  const brett = lies("brett");
  const sortierung = lies("sortierung") as Sortierschluessel;
  const gueltig = SORTIERSCHLUESSEL.includes(sortierung);
  const richtung = lies("richtung");

  // Grenzen, die verkehrt herum stehen, werden getauscht statt verworfen. "Von
  // 50.000 bis 20.000" ist keine Auswahl, die nichts trifft — es ist ein
  // Zahlendreher, und die naheliegende Antwort darauf ist die Spanne dazwischen.
  const [betragVon, betragBis] = geordnet(
    zahl(lies("betrag_von")),
    zahl(lies("betrag_bis"))
  );
  const [einkommenVon, einkommenBis] = geordnet(
    zahl(lies("netto_von")),
    zahl(lies("netto_bis"))
  );
  const [prioVon, prioBis] = geordnet(
    rang(lies("prio_von")),
    rang(lies("prio_bis"))
  );
  const [vonDatum, bisDatum] = geordnet(tag(lies("von")), tag(lies("bis")));

  return {
    suche: lies("q").trim(),
    // Nur Stationen, die es gibt — sonst zeigte eine erfundene Adresse eine
    // leere Liste, als waere wirklich nichts da.
    station: findeStation(station) ? (station as StatusId) : null,
    nurFaellig: lies("faellig") === "1",
    betragVon,
    betragBis,
    einkommenVon,
    einkommenBis,
    prioVon,
    prioBis,
    vonDatum,
    bisDatum,
    sortierung: gueltig ? sortierung : "eingang",
    richtung:
      richtung === "auf" || richtung === "ab"
        ? richtung
        : ersteRichtung(gueltig ? sortierung : "eingang"),
    /**
     * Der aufgeschlagene Ordner bestimmt den Reiter, nicht umgekehrt.
     *
     * Brett und Liste zeigen dieselbe Auswahl; ein Ordner, der unten
     * aufgeschlagen ist, aber oben auf dem anderen Brett liegt, waere ein
     * Widerspruch, den niemand aufloesen kann. Nur wenn kein Ordner gewaehlt
     * ist, entscheidet der Parameter — dann gibt es nichts, dem der Reiter
     * folgen koennte.
     */
    brett: findeStation(station)
      ? brettDerStation(station)
      : brett === "erledigt"
        ? "erledigt"
        : "pipeline",
  };
}

function geordnet<T extends number | string>(
  von: T | null,
  bis: T | null
): [T | null, T | null] {
  if (von !== null && bis !== null && von > bis) return [bis, von];
  return [von, bis];
}

/**
 * Die Ansicht als Adresse, mit einzelnen geaenderten Werten.
 *
 * Alles, was nicht ausdruecklich geaendert wird, bleibt stehen. Das ist der
 * ganze Zweck: Jeder Verweis auf der Seite aendert genau eine Sache und laesst
 * die anderen elf in Ruhe.
 */
export function alsAdresse(
  ansicht: Ansicht,
  aenderung: Partial<Ansicht> = {},
  ziel = "/crm"
): string {
  const a = { ...ansicht, ...aenderung };
  const p = new URLSearchParams();
  if (a.suche) p.set("q", a.suche);
  if (a.station) p.set("station", a.station);
  if (a.nurFaellig) p.set("faellig", "1");
  if (a.betragVon !== null) p.set("betrag_von", String(a.betragVon));
  if (a.betragBis !== null) p.set("betrag_bis", String(a.betragBis));
  if (a.einkommenVon !== null) p.set("netto_von", String(a.einkommenVon));
  if (a.einkommenBis !== null) p.set("netto_bis", String(a.einkommenBis));
  if (a.prioVon !== null) p.set("prio_von", String(a.prioVon));
  if (a.prioBis !== null) p.set("prio_bis", String(a.prioBis));
  if (a.vonDatum) p.set("von", a.vonDatum);
  if (a.bisDatum) p.set("bis", a.bisDatum);
  // Die Voreinstellung steht nicht in der Adresse: Sie ist das, was ohne sie
  // ohnehin gilt, und eine Adresse soll kurz bleiben.
  if (a.sortierung !== "eingang") p.set("sortierung", a.sortierung);
  if (a.richtung !== ersteRichtung(a.sortierung)) p.set("richtung", a.richtung);
  // Nur ohne Ordner: Mit einem steht der Reiter ohnehin fest, und derselbe
  // Zustand zweimal in einer Adresse ist einer zu viel.
  if (!a.station && a.brett !== "pipeline") p.set("brett", a.brett);
  const text = p.toString();
  return text ? `${ziel}?${text}` : ziel;
}

/**
 * Die Haelfte der Ansicht, die die Datenbank uebernimmt.
 *
 * Der Reiter geht mit: Die Liste unten zeigt, was auf dem Brett darueber
 * liegt. Wer auf "Erledigt" wechselt, will die erledigten Faelle sehen und
 * nicht den Eingang — das Brett zeigt sieben Ordner, und die Liste darunter
 * zeigte bisher trotzdem alles.
 *
 * Ist ein einzelner Ordner aufgeschlagen, zaehlt nur der. Die zusaetzliche
 * Einschraenkung waere dann bestenfalls ueberfluessig und schlimmstenfalls
 * widerspruechlich.
 *
 * "Pipeline" wird als Ausschluss formuliert und nicht als Aufzaehlung: So
 * bleiben Faelle sichtbar, die auf einer stillgelegten oder unbekannten
 * Kennung stehen. Waeren beide Bretter Aufzaehlungen, fielen sie aus beiden
 * Listen heraus und niemand zoege sie je wieder hervor.
 */
export function alsFilter(ansicht: Ansicht): AntragFilter {
  const erledigt = ERLEDIGT_STATIONEN.map((s) => s.id);
  return {
    suche: ansicht.suche,
    station: ansicht.station,
    nurStationen:
      !ansicht.station && ansicht.brett === "erledigt" ? erledigt : null,
    ohneStationen:
      !ansicht.station && ansicht.brett === "pipeline" ? erledigt : null,
    nurFaellig: ansicht.nurFaellig,
    betragVon: ansicht.betragVon,
    betragBis: ansicht.betragBis,
    vonDatum: ansicht.vonDatum,
    bisDatum: ansicht.bisDatum,
  };
}

/** Ob ueberhaupt eingeschraenkt wird — fuer "Filter zuruecksetzen". */
export function filterAktiv(ansicht: Ansicht): boolean {
  return (
    Boolean(ansicht.suche) ||
    Boolean(ansicht.station) ||
    ansicht.nurFaellig ||
    ansicht.betragVon !== null ||
    ansicht.betragBis !== null ||
    ansicht.einkommenVon !== null ||
    ansicht.einkommenBis !== null ||
    ansicht.prioVon !== null ||
    ansicht.prioBis !== null ||
    Boolean(ansicht.vonDatum) ||
    Boolean(ansicht.bisDatum)
  );
}

/**
 * Ob nach etwas gefiltert wird, das erst nach dem Laden feststeht.
 *
 * Die Seite braucht das fuer die Zahl neben der Ueberschrift: Solange nur die
 * Datenbank filtert, ist die gezaehlte Zahl die Wahrheit ueber alle Faelle.
 * Sobald hier nachgefiltert wird, gilt sie nicht mehr, und gezaehlt werden
 * muss, was uebrig geblieben ist.
 */
export function feinfilterAktiv(ansicht: Ansicht): boolean {
  return (
    ansicht.einkommenVon !== null ||
    ansicht.einkommenBis !== null ||
    ansicht.prioVon !== null ||
    ansicht.prioBis !== null
  );
}

/** Wie viele Einschraenkungen gesetzt sind — als Zahl an der Filterklappe. */
export function anzahlFilter(ansicht: Ansicht): number {
  const spannen: [unknown, unknown][] = [
    [ansicht.betragVon, ansicht.betragBis],
    [ansicht.einkommenVon, ansicht.einkommenBis],
    [ansicht.prioVon, ansicht.prioBis],
    [ansicht.vonDatum, ansicht.bisDatum],
  ];
  // Eine Spanne zaehlt einmal, auch wenn beide Grenzen gesetzt sind: Gezaehlt
  // wird, wonach gefiltert wird, nicht wie viele Felder ausgefuellt sind.
  return spannen.filter(([von, bis]) => von != null || bis != null).length;
}

/* ------------------------------------------------------------------ */
/* Nachfiltern und sortieren                                           */
/* ------------------------------------------------------------------ */

/** Der Rang einer Klasse: P1 ist 1. */
export function rangDerKlasse(klasse: Prioritaetsklasse): number {
  return KLASSEN.findIndex((k) => k.klasse === klasse) + 1;
}

/**
 * Ob ein Fall den Einschraenkungen entspricht, die erst hier zu pruefen sind.
 *
 * Fehlende Angaben fallen heraus, sobald danach gefiltert wird — aber nur
 * dann. Wer "Einkommen ab 2.000" einstellt, fragt nach Faellen mit bekanntem
 * Einkommen ueber 2.000; ein Abbrecher ohne jede Einkommensangabe gehoert
 * nicht dazu. Ohne den Filter steht er weiter in der Liste: Eine fehlende
 * Angabe ist kein schlechter Kunde, sie ist eine fehlende Angabe.
 */
export function passtFein(
  antrag: Antrag,
  ansicht: Ansicht,
  jetzt: Date
): boolean {
  if (ansicht.einkommenVon !== null || ansicht.einkommenBis !== null) {
    // Der niedrigste der angegebenen Monate — dieselbe Zahl, mit der die
    // Fallakte rechnet. Der Filter darf nicht nach einem anderen Einkommen
    // fragen als das, was daneben angezeigt wird.
    const netto = niedrigstesGehalt(antrag);
    if (netto === null) return false;
    if (ansicht.einkommenVon !== null && netto < ansicht.einkommenVon) {
      return false;
    }
    if (ansicht.einkommenBis !== null && netto > ansicht.einkommenBis) {
      return false;
    }
  }

  if (ansicht.prioVon !== null || ansicht.prioBis !== null) {
    const rang = rangDerKlasse(bewerte(antrag, jetzt).klasse);
    if (ansicht.prioVon !== null && rang < ansicht.prioVon) return false;
    if (ansicht.prioBis !== null && rang > ansicht.prioBis) return false;
  }

  return true;
}

/** Alle Faelle, die auch nach dem Nachfiltern uebrig bleiben. */
export function fein(
  antraege: Antrag[],
  ansicht: Ansicht,
  jetzt: Date
): Antrag[] {
  if (!feinfilterAktiv(ansicht)) return antraege;
  return antraege.filter((a) => passtFein(a, ansicht, jetzt));
}

/**
 * Die Liste in der gewaehlten Reihenfolge.
 *
 * Kopiert, nicht an Ort und Stelle sortiert: Die uebergebene Liste ist das
 * Ergebnis einer Abfrage, und das soll nicht davon abhaengen, was die Anzeige
 * damit vorhat.
 *
 * Bei gleichem Wert entscheidet der Eingang, neueste zuerst. Ohne diesen
 * zweiten Massstab stuenden zwei Faelle mit demselben Betrag mal so und mal
 * so — die Reihenfolge saehe zufaellig aus, weil sie es waere.
 */
export function sortiere(
  antraege: Antrag[],
  ansicht: Ansicht,
  jetzt: Date
): Antrag[] {
  const vorzeichen = ansicht.richtung === "auf" ? 1 : -1;
  return [...antraege].sort((a, b) => {
    // Faelle ohne Wert stehen immer am Ende, in beiden Richtungen — deshalb
    // vor dem Vorzeichen. Eine fehlende Wiedervorlage heisst nicht "spaeter
    // dran als alle anderen", sondern "gar nicht eingeplant"; sie beim
    // Umdrehen nach vorn zu holen schoebe genau die Termine aus dem Bild, um
    // derentwillen man ueberhaupt danach sortiert.
    const fehltA = ohneWert(a, ansicht.sortierung);
    const fehltB = ohneWert(b, ansicht.sortierung);
    if (fehltA !== fehltB) return fehltA ? 1 : -1;

    const unterschied = vergleiche(a, b, ansicht.sortierung, jetzt);
    if (unterschied !== 0) return unterschied * vorzeichen;
    return b.eingang.localeCompare(a.eingang);
  });
}

/**
 * Ob dem Fall die Angabe fehlt, nach der gerade sortiert wird.
 *
 * Wo in der Liste ein Gedankenstrich steht, steht auch hier nichts. Solche
 * Zeilen gehoeren ans Ende, in beiden Richtungen — sonst fuellen sie beim
 * Umdrehen den Anfang und schieben genau das aus dem Bild, wonach gerade
 * sortiert wurde.
 */
function ohneWert(antrag: Antrag, schluessel: Sortierschluessel): boolean {
  if (schluessel === "wiedervorlage") return !antrag.wiedervorlage;
  if (schluessel === "verwendung") return zweckName(antrag) === "";
  return false;
}

/** Der ausgeschriebene Verwendungszweck, wie ihn die Liste zeigt. */
function zweckName(antrag: Antrag): string {
  if (!antrag.kreditart) return "";
  return findeKreditartNachId(antrag.kreditart)?.de.name ?? "";
}

function vergleiche(
  a: Antrag,
  b: Antrag,
  schluessel: Sortierschluessel,
  jetzt: Date
): number {
  switch (schluessel) {
    case "nummer":
      return (a.nummer ?? 0) - (b.nummer ?? 0);
    case "name":
      // Nach Alphabet, mit deutscher Sortierung: Sie stellt Umlaute dorthin,
      // wo man sie sucht — Müller zwischen Muhl und Mundt und nicht hinter Z.
      return vollerName(a).localeCompare(vollerName(b), "de");
    case "verwendung":
      return zweckName(a).localeCompare(zweckName(b), "de");
    case "ordner":
      // Nach dem Platz in der Pipeline, nicht nach dem Namen des Ordners.
      return rangDerStation(a.status) - rangDerStation(b.status);
    case "betrag":
      return a.amount - b.amount;
    case "laufzeit":
      return a.months - b.months;
    case "prio":
      return bewerte(a, jetzt).score - bewerte(b, jetzt).score;
    case "wiedervorlage":
      // Fehlende Termine hat `ohneWert` bereits nach hinten gestellt.
      return (a.wiedervorlage ?? "").localeCompare(b.wiedervorlage ?? "");
    default:
      return a.eingang.localeCompare(b.eingang);
  }
}

/**
 * Nachfiltern und sortieren in einem Zug — der Weg, den beide Aufrufer gehen.
 */
export function angezeigteFaelle(
  antraege: Antrag[],
  ansicht: Ansicht,
  jetzt: Date
): Antrag[] {
  return sortiere(fein(antraege, ansicht, jetzt), ansicht, jetzt);
}
