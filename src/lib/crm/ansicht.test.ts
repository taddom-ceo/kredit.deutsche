import test from "node:test";
import assert from "node:assert/strict";
import type { Antrag } from "./antraege";
import {
  alsAdresse,
  alsFilter,
  anzahlFilter,
  ersteRichtung,
  fein,
  feinfilterAktiv,
  filterAktiv,
  LEERE_ANSICHT,
  leseAnsicht,
  passtFein,
  rangDerKlasse,
  sortiere,
  type Ansicht,
} from "./ansicht";
import { bewerte } from "./priorisierung";

/**
 * Tests der Ansicht: was aus der Adresse gelesen wird, was gefiltert und wie
 * sortiert wird.
 *
 * Der Grund, das zu pruefen: Diese Datei entscheidet, welche Faelle jemand
 * sieht — und, ueber den Export, welche Faelle in einer Tabelle landen, die
 * weitergereicht wird. Ein Filter, der still zu viel wegnimmt, faellt niemandem
 * auf; die Liste sieht ja aus wie eine Liste.
 *
 *   npm test
 */

function fall(aenderung: Partial<Antrag> = {}): Antrag {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    eingang: new Date("2026-08-10T12:00:00Z").toISOString(),
    status: "neu",
    wiedervorlage: null,
    nummer: 1001,
    pruefung: {},
    kreditart: "frei",
    amount: 20000,
    months: 72,
    personCount: 1,
    vorname: "Anna",
    zweiterVorname: "",
    nachname: "Muster",
    geburtsdatum: "1988-06-14",
    email: "anna@example.de",
    telefonVorwahl: "0151",
    telefon: "20001000",
    strasse: "Invalidenstraße",
    hausnummer: "112",
    plz: "10115",
    ort: "Berlin",
    beschaeftigungsart: "Angestellt",
    arbeitgeber: "Musterfirma GmbH",
    beschaeftigtSeit: "2019-03",
    nettoeinkommen: "2850",
    gehaelter: ["2850", "2630", "2940"],
    mieteinnahmen: "nein",
    mieteinnahmenBetrag: "",
    wohnnebenkosten: "420",
    krankenversicherung: "",
    unterhalt: "0",
    hatKredite: "nein",
    kredite: [],
    iban: "DE89 3704 0044 0532 0130 00",
    bankname: "Commerzbank",
    kontoinhaber: "Anna Muster",
    zweitePerson: null,
    ...aenderung,
  } as Antrag;
}

const JETZT = new Date("2026-08-10T12:00:00Z");

/** Eine Ansicht aus einer Adresse — so, wie die Seite sie liest. */
function ausAdresse(abfrage: string): Ansicht {
  const p = new URLSearchParams(abfrage);
  return leseAnsicht((name) => p.get(name) ?? "");
}

/* ------------------------------------------------------------------ */
/* Lesen                                                               */
/* ------------------------------------------------------------------ */

test("ohne Parameter steht die leere Ansicht da", () => {
  assert.deepEqual(ausAdresse(""), LEERE_ANSICHT);
});

test("Spannen werden als Zahlen gelesen", () => {
  const a = ausAdresse("betrag_von=20000&betrag_bis=50000&netto_von=2000");
  assert.equal(a.betragVon, 20000);
  assert.equal(a.betragBis, 50000);
  assert.equal(a.einkommenVon, 2000);
  assert.equal(a.einkommenBis, null);
});

test("verdrehte Grenzen werden getauscht, nicht verworfen", () => {
  const a = ausAdresse("betrag_von=50000&betrag_bis=20000");
  assert.equal(a.betragVon, 20000);
  assert.equal(a.betragBis, 50000);

  const b = ausAdresse("von=2026-08-31&bis=2026-08-01");
  assert.equal(b.vonDatum, "2026-08-01");
  assert.equal(b.bisDatum, "2026-08-31");
});

test("Unsinn faellt weg, statt alles wegzufiltern", () => {
  const a = ausAdresse(
    "betrag_von=viel&von=31.08.2026&prio_von=P9&station=erfunden&sortierung=farbe"
  );
  assert.equal(a.betragVon, null);
  assert.equal(a.vonDatum, null);
  assert.equal(a.prioVon, null);
  assert.equal(a.station, null);
  assert.equal(a.sortierung, "eingang");
});

test("Prioritäten werden mit und ohne P gelesen", () => {
  assert.equal(ausAdresse("prio_von=2").prioVon, 2);
  assert.equal(ausAdresse("prio_von=P2").prioVon, 2);
});

test("die Richtung folgt der Kennzahl, wenn keine dasteht", () => {
  assert.equal(ausAdresse("sortierung=name").richtung, "auf");
  assert.equal(ausAdresse("sortierung=betrag").richtung, "ab");
  assert.equal(ausAdresse("sortierung=betrag&richtung=auf").richtung, "auf");
});

/* ------------------------------------------------------------------ */
/* Schreiben                                                           */
/* ------------------------------------------------------------------ */

test("die Adresse überlebt den Weg hin und zurück", () => {
  const abfrage =
    "q=M%C3%BCller&station=tag2&faellig=1&betrag_von=10000&betrag_bis=60000" +
    "&netto_von=1500&netto_bis=8000&prio_von=1&prio_bis=3" +
    "&von=2026-07-01&bis=2026-07-31&sortierung=betrag&richtung=auf";
  const einmal = ausAdresse(abfrage);
  const zweimal = ausAdresse(alsAdresse(einmal).split("?")[1] ?? "");
  assert.deepEqual(zweimal, einmal);
});

test("Voreinstellungen stehen nicht in der Adresse", () => {
  assert.equal(alsAdresse(LEERE_ANSICHT), "/crm");
  // "Eingang, absteigend" ist die Voreinstellung und braucht keinen Parameter.
  assert.equal(
    alsAdresse(LEERE_ANSICHT, { sortierung: "eingang", richtung: "ab" }),
    "/crm"
  );
});

test("eine Änderung lässt die übrigen Werte stehen", () => {
  const a = ausAdresse("q=Meier&betrag_von=30000&sortierung=prio");
  const adresse = alsAdresse(a, { station: "tag2" });
  assert.match(adresse, /q=Meier/);
  assert.match(adresse, /betrag_von=30000/);
  assert.match(adresse, /sortierung=prio/);
  assert.match(adresse, /station=tag2/);
});

test("der Export bekommt dieselbe Auswahl unter anderer Adresse", () => {
  const a = ausAdresse("q=Meier&betrag_von=30000");
  assert.equal(
    alsAdresse(a, {}, "/api/crm-export"),
    "/api/crm-export?q=Meier&betrag_von=30000"
  );
});

test("die Datenbank bekommt nur, was sie beantworten kann", () => {
  const a = ausAdresse("betrag_von=1000&netto_von=2000&prio_von=1");
  const f = alsFilter(a);
  assert.equal(f.betragVon, 1000);
  assert.equal("einkommenVon" in f, false);
  assert.equal("prioVon" in f, false);
});

/* ------------------------------------------------------------------ */
/* Zählen und melden                                                   */
/* ------------------------------------------------------------------ */

test("eine Spanne zählt einmal, auch mit beiden Grenzen", () => {
  assert.equal(anzahlFilter(ausAdresse("betrag_von=1&betrag_bis=2")), 1);
  assert.equal(anzahlFilter(ausAdresse("betrag_von=1&netto_bis=2")), 2);
  assert.equal(anzahlFilter(ausAdresse("q=Meier")), 0);
});

test("Suche und Ordner zählen als Filter, aber nicht als Feinfilter", () => {
  assert.equal(filterAktiv(ausAdresse("q=Meier")), true);
  assert.equal(feinfilterAktiv(ausAdresse("q=Meier")), false);
  assert.equal(feinfilterAktiv(ausAdresse("netto_von=2000")), true);
  assert.equal(feinfilterAktiv(ausAdresse("prio_bis=3")), true);
});

/* ------------------------------------------------------------------ */
/* Nachfiltern                                                         */
/* ------------------------------------------------------------------ */

test("das Einkommen wird am niedrigsten Monat gemessen", () => {
  // Niedrigster Monat: 2630. Der Durchschnitt laege bei 2807 — wer nach "ab
  // 2700" filtert, bekommt diesen Fall deshalb nicht.
  const a = fall();
  assert.equal(passtFein(a, ausAdresse("netto_von=2600"), JETZT), true);
  assert.equal(passtFein(a, ausAdresse("netto_von=2700"), JETZT), false);
  assert.equal(passtFein(a, ausAdresse("netto_bis=2630"), JETZT), true);
  assert.equal(passtFein(a, ausAdresse("netto_bis=2000"), JETZT), false);
});

test("ohne Einkommensangabe bleibt ein Fall drin, solange nicht danach gefiltert wird", () => {
  const ohne = fall({ nettoeinkommen: "", gehaelter: [] });
  assert.equal(passtFein(ohne, ausAdresse(""), JETZT), true);
  assert.equal(passtFein(ohne, ausAdresse("netto_von=1"), JETZT), false);
});

test("die Rangfolge der Klassen: P1 ist eins", () => {
  assert.equal(rangDerKlasse("P1"), 1);
  assert.equal(rangDerKlasse("P5"), 5);
});

test("die Prioritätsspanne meint die Klassen einschließlich der Grenzen", () => {
  // Frisch eingegangen, mit IBAN und Einkommen: der bestbewertete Fall, den
  // dieser Datensatz hergibt. Welche Klasse dabei herauskommt, rechnet der
  // Test nicht nach — er fragt die Bewertung und legt die Spanne darum.
  const antrag = fall({ eingang: JETZT.toISOString() });
  const rang = rangDerKlasse(bewerte(antrag, JETZT).klasse);

  assert.equal(
    passtFein(antrag, ausAdresse(`prio_von=${rang}&prio_bis=${rang}`), JETZT),
    true
  );
  // Eine offene Grenze schliesst alles darunter beziehungsweise darueber ein.
  assert.equal(passtFein(antrag, ausAdresse(`prio_bis=5`), JETZT), true);
  if (rang > 1) {
    assert.equal(
      passtFein(antrag, ausAdresse(`prio_bis=${rang - 1}`), JETZT),
      false
    );
  }
  if (rang < 5) {
    assert.equal(
      passtFein(antrag, ausAdresse(`prio_von=${rang + 1}`), JETZT),
      false
    );
  }
});

test("ein alter Fall fällt aus der Spanne der guten Klassen", () => {
  // Ein halbes Jahr alt: Die Aktualitaet ist dahin, und damit die Klasse.
  const alt = fall({ eingang: "2026-02-01T12:00:00.000Z" });
  const frisch = fall({ id: "neu", eingang: JETZT.toISOString() });
  const uebrig = fein([alt, frisch], ausAdresse("prio_von=1&prio_bis=2"), JETZT);
  assert.deepEqual(
    uebrig.map((a) => a.id),
    ["neu"]
  );
});

test("ohne Feinfilter wird die Liste unverändert durchgereicht", () => {
  const liste = [fall({ id: "a" }), fall({ id: "b" })];
  assert.equal(fein(liste, LEERE_ANSICHT, JETZT), liste);
});

/* ------------------------------------------------------------------ */
/* Sortieren                                                           */
/* ------------------------------------------------------------------ */

const A = fall({
  id: "a",
  nummer: 1001,
  amount: 10000,
  months: 24,
  nachname: "Albers",
  eingang: "2026-08-01T09:00:00.000Z",
  wiedervorlage: "2026-08-20",
});
const B = fall({
  id: "b",
  nummer: 1002,
  amount: 50000,
  months: 96,
  nachname: "Zimmer",
  eingang: "2026-08-05T09:00:00.000Z",
  wiedervorlage: null,
});
const C = fall({
  id: "c",
  nummer: 1003,
  amount: 30000,
  months: 60,
  nachname: "Meier",
  eingang: "2026-08-03T09:00:00.000Z",
  wiedervorlage: "2026-08-11",
});

function reihe(abfrage: string): string[] {
  return sortiere([A, B, C], ausAdresse(abfrage), JETZT).map((a) => a.id);
}

test("Betrag auf- und absteigend", () => {
  assert.deepEqual(reihe("sortierung=betrag&richtung=auf"), ["a", "c", "b"]);
  assert.deepEqual(reihe("sortierung=betrag&richtung=ab"), ["b", "c", "a"]);
});

test("die Voreinstellung ist der Eingang, neueste zuerst", () => {
  assert.deepEqual(reihe(""), ["b", "c", "a"]);
  assert.deepEqual(reihe("sortierung=eingang&richtung=auf"), ["a", "c", "b"]);
});

test("der Name geht nach Alphabet, mit Umlauten an der richtigen Stelle", () => {
  const namen = ["Muster", "Müller", "Maier", "Mundt"].map((n) =>
    fall({ id: n, nachname: n, vorname: "Anna" })
  );
  const reihe = sortiere(
    namen,
    ausAdresse("sortierung=name&richtung=auf"),
    JETZT
  ).map((a) => a.id);
  // Müller steht zwischen Maier und Mundt — dort, wo man es sucht. Nach der
  // Zeichenreihenfolge des Rechners stuende es hinter allen anderen.
  assert.deepEqual(reihe, ["Maier", "Müller", "Mundt", "Muster"]);
});

/* ------------------------------------------------------------------ */
/* Der Reiter                                                          */
/* ------------------------------------------------------------------ */

test("ohne Ordner entscheidet der Parameter über den Reiter", () => {
  assert.equal(ausAdresse("").brett, "pipeline");
  assert.equal(ausAdresse("brett=erledigt").brett, "erledigt");
  assert.equal(ausAdresse("brett=quatsch").brett, "pipeline");
});

test("mit Ordner entscheidet der Ordner, nicht der Parameter", () => {
  // Ein Ordner, der unten aufgeschlagen ist, aber oben auf dem anderen Brett
  // laege, waere ein Widerspruch, den niemand aufloesen kann.
  assert.equal(ausAdresse("station=ausgezahlt").brett, "erledigt");
  assert.equal(ausAdresse("station=in_pruefung").brett, "erledigt");
  assert.equal(ausAdresse("station=neu").brett, "pipeline");
  assert.equal(ausAdresse("station=neu&brett=erledigt").brett, "pipeline");
  assert.equal(ausAdresse("station=provision&brett=pipeline").brett, "erledigt");
});

test("der Reiter steht nur in der Adresse, wenn er nicht aus dem Ordner folgt", () => {
  assert.match(alsAdresse(ausAdresse("brett=erledigt")), /brett=erledigt/);
  // Mit Ordner ist er ueberfluessig — derselbe Zustand zweimal.
  assert.equal(
    alsAdresse(ausAdresse("station=ausgezahlt")).includes("brett="),
    false
  );
  assert.equal(alsAdresse(ausAdresse("")).includes("brett="), false);
});

test("der Ordner sortiert den Weg der Pipeline entlang, nicht nach Namen", () => {
  const neu = fall({ id: "neu", status: "neu" });
  const abbrecher = fall({ id: "abbrecher", status: "abbrecher" });
  const papierkorb = fall({ id: "papierkorb", status: "papierkorb" });
  const reihe = sortiere(
    [papierkorb, abbrecher, neu],
    ausAdresse("sortierung=ordner&richtung=auf"),
    JETZT
  ).map((a) => a.id);
  // "Neu" ist der erste Ordner der Pipeline, der Papierkorb der letzte.
  // Alphabetisch stuende "Abgebrochen" vorn — das waere keine Auskunft.
  assert.equal(reihe[0], "neu");
  assert.equal(reihe[2], "papierkorb");
});

test("Fälle ohne Verwendung stehen hinten", () => {
  const ohne = fall({ id: "ohne", kreditart: null });
  const mit = fall({ id: "mit", kreditart: "fahrzeug" });
  for (const richtung of ["auf", "ab"]) {
    const reihe = sortiere(
      [ohne, mit],
      ausAdresse(`sortierung=verwendung&richtung=${richtung}`),
      JETZT
    ).map((a) => a.id);
    assert.deepEqual(reihe, ["mit", "ohne"]);
  }
});

test("Name, Nummer und Laufzeit", () => {
  assert.deepEqual(reihe("sortierung=name&richtung=auf"), ["a", "c", "b"]);
  assert.deepEqual(reihe("sortierung=nummer&richtung=auf"), ["a", "b", "c"]);
  assert.deepEqual(reihe("sortierung=laufzeit&richtung=ab"), ["b", "c", "a"]);
});

test("Fälle ohne Wiedervorlage stehen in beiden Richtungen hinten", () => {
  assert.deepEqual(reihe("sortierung=wiedervorlage&richtung=auf"), [
    "c",
    "a",
    "b",
  ]);
  assert.deepEqual(reihe("sortierung=wiedervorlage&richtung=ab"), [
    "a",
    "c",
    "b",
  ]);
});

test("sortiert wird auf einer Kopie", () => {
  const liste = [A, B, C];
  sortiere(liste, ausAdresse("sortierung=betrag&richtung=auf"), JETZT);
  assert.deepEqual(
    liste.map((a) => a.id),
    ["a", "b", "c"]
  );
});

test("erste Richtung: das Naheliegende je Kennzahl", () => {
  assert.equal(ersteRichtung("betrag"), "ab");
  assert.equal(ersteRichtung("prio"), "ab");
  assert.equal(ersteRichtung("name"), "auf");
  assert.equal(ersteRichtung("wiedervorlage"), "auf");
});
