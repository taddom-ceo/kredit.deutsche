import test from "node:test";
import assert from "node:assert/strict";
import type { Antrag } from "./antraege";
import {
  ABSICHT_SIGNALE,
  absichtScore,
  betragScore,
  bewerte,
  bewertungsProtokoll,
  GEWICHTE,
  gewichteterWert,
  ibanScore,
  klasseZu,
  konvertiert,
  passungScore,
  recencyScore,
} from "./priorisierung";

/**
 * Tests der Priorisierung.
 *
 * Ohne Testwerkzeug im Projekt: `node --test` bringt einen Laeufer mit, und
 * `--experimental-strip-types` liest TypeScript direkt. Damit kommt kein
 * weiteres Paket ins Projekt, nur um zu pruefen, ob eine Formel rechnet.
 *
 *   npm test
 *
 * Gerechnet wird gegen feste Zahlen, nicht gegen die Funktion selbst: Die
 * Erwartungswerte unten stammen aus der Vorgabe beziehungsweise sind von Hand
 * ausgerechnet. Ein Test, der dieselbe Formel noch einmal hinschreibt, prueft
 * nichts.
 */

/** Ein Fall mit brauchbaren Standardwerten; einzelne Felder ueberschreibbar. */
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

/** Zeitpunkt, der zu `JETZT` das gewuenschte Alter in Stunden ergibt. */
function vorStunden(stunden: number): string {
  return new Date(JETZT.getTime() - stunden * 3_600_000).toISOString();
}

/* ------------------------------------------------------------------ */
/* Aktualitaet                                                         */
/* ------------------------------------------------------------------ */

test("Aktualität: die Werte aus der Vorgabe", () => {
  const erwartet: [number, number][] = [
    [0, 100],
    [1, 91.7],
    [3, 77.1],
    [6, 59.5],
    [8, 50],
    [12, 35.4],
    [24, 12.5],
    [48, 1.5625],
  ];
  for (const [stunden, wert] of erwartet) {
    const gerechnet = recencyScore(vorStunden(stunden), JETZT);
    assert.ok(gerechnet !== null);
    assert.ok(
      Math.abs(gerechnet - wert) < 0.1,
      `${stunden} h: ${gerechnet} statt ${wert}`
    );
  }
});

test("Aktualität: halbiert sich alle acht Stunden", () => {
  const a = recencyScore(vorStunden(8), JETZT)!;
  const b = recencyScore(vorStunden(16), JETZT)!;
  assert.ok(Math.abs(a / b - 2) < 1e-9);
});

test("Aktualität: ein Eingang in der Zukunft gibt höchstens 100", () => {
  assert.equal(recencyScore(vorStunden(-48), JETZT), 100);
});

test("Aktualität: sehr alt bleibt bei null und wird nicht negativ", () => {
  const wert = recencyScore(vorStunden(24 * 365), JETZT)!;
  assert.ok(wert >= 0 && wert < 0.001);
});

test("Aktualität: ohne oder mit unbrauchbarem Zeitpunkt kein Wert", () => {
  assert.equal(recencyScore(null, JETZT), null);
  assert.equal(recencyScore("", JETZT), null);
  assert.equal(recencyScore("kein Datum", JETZT), null);
  assert.equal(recencyScore(undefined, JETZT), null);
});

/* ------------------------------------------------------------------ */
/* Kreditsumme                                                         */
/* ------------------------------------------------------------------ */

test("Kreditsumme: der Referenzbetrag ergibt 100", () => {
  assert.equal(betragScore(100_000), 100);
});

test("Kreditsumme: darüber wird begrenzt", () => {
  assert.equal(betragScore(1_000_000), 100);
  assert.equal(betragScore(Number.MAX_SAFE_INTEGER), 100);
});

test("Kreditsumme: logarithmisch, nicht linear", () => {
  const zehn = betragScore(10_000)!;
  const zwanzig = betragScore(20_000)!;
  // Verdoppelt sich die Summe, steigt der Wert um weniger als ein Zehntel —
  // und keinesfalls auf das Doppelte.
  assert.ok(zwanzig > zehn);
  assert.ok(zwanzig < zehn * 1.1, `${zwanzig} gegenüber ${zehn}`);
  // Von Hand: 100 * ln(10001) / ln(100001) = 79.99...
  assert.ok(Math.abs(zehn - 80.0) < 0.1, String(zehn));
});

test("Kreditsumme: steigt durchgehend", () => {
  let vorher = 0;
  for (const betrag of [1000, 5000, 12000, 30000, 65000, 99000]) {
    const wert = betragScore(betrag)!;
    assert.ok(wert > vorher, `${betrag}: ${wert} nicht größer als ${vorher}`);
    vorher = wert;
  }
});

test("Kreditsumme: unbrauchbare Werte geben keinen Wert", () => {
  assert.equal(betragScore(0), null);
  assert.equal(betragScore(-5000), null);
  assert.equal(betragScore(Number.NaN), null);
  assert.equal(betragScore(Number.POSITIVE_INFINITY), null);
  assert.equal(betragScore(null), null);
  assert.equal(betragScore(undefined), null);
});

/* ------------------------------------------------------------------ */
/* Passung                                                             */
/* ------------------------------------------------------------------ */

test("Passung: die Stützstellen aus der Vorgabe", () => {
  // Jahreseinkommen 60.000 bei 5.000 im Monat.
  const einkommen = 5000;
  const erwartet: [number, number][] = [
    [0.25, 100],
    [0.5, 95],
    [1, 85],
    [2, 65],
    [3, 40],
    [4, 20],
  ];
  for (const [verhaeltnis, wert] of erwartet) {
    const betrag = verhaeltnis * einkommen * 12;
    assert.equal(passungScore(betrag, einkommen), wert, `${verhaeltnis}`);
  }
});

test("Passung: dazwischen wird interpoliert", () => {
  // Verhältnis 1,5 liegt genau zwischen 85 und 65.
  assert.equal(passungScore(1.5 * 60_000, 5000), 75);
  // Verhältnis 0,375 liegt genau zwischen 100 und 95.
  assert.equal(passungScore(0.375 * 60_000, 5000), 97.5);
});

test("Passung: unterhalb und oberhalb bleibt es beim Randwert", () => {
  assert.equal(passungScore(1000, 5000), 100);
  assert.equal(passungScore(600_000, 5000), 20);
});

test("Passung: ohne brauchbares Einkommen kein Wert — keine Null", () => {
  assert.equal(passungScore(20_000, null), null);
  assert.equal(passungScore(20_000, 0), null);
  assert.equal(passungScore(20_000, -100), null);
  assert.equal(passungScore(20_000, Number.NaN), null);
  assert.equal(passungScore(null, 3000), null);
});

/* ------------------------------------------------------------------ */
/* Datenlage                                                           */
/* ------------------------------------------------------------------ */

test("Datenlage: ein vollständiger Fall erreicht 100", () => {
  assert.equal(absichtScore(fall()).wert, 100);
});

test("Datenlage: nicht erhobene Signale ziehen niemanden herunter", () => {
  const ergebnis = absichtScore(fall());
  assert.deepEqual(ergebnis.nichtErhoben, [
    "Angebote angesehen",
    "Prozess erneut begonnen",
  ]);
  assert.equal(ergebnis.offen.length, 0);
});

test("Datenlage: ein Abbrecher ohne Angaben liegt bei null", () => {
  const abbrecher = fall({
    beschaeftigungsart: "",
    kreditart: null,
    nettoeinkommen: "",
    gehaelter: [],
    iban: "",
    amount: 0,
    months: 0,
  });
  assert.equal(absichtScore(abbrecher).wert, 0);
});

test("Datenlage: fehlende Einzelangaben schlagen anteilig durch", () => {
  // Erreichbar sind 80 Punkte — die beiden nicht erhobenen Signale zählen
  // weder mit noch dagegen. Ohne Verwendungszweck fehlen davon 10.
  const ohneZweck = absichtScore(fall({ kreditart: null }));
  assert.ok(Math.abs(ohneZweck.wert - (100 * 70) / 80) < 1e-9, String(ohneZweck.wert));
  assert.deepEqual(ohneZweck.offen, ["Verwendungszweck angegeben"]);
});

test("Datenlage: ein Signal, das sich verschluckt, gilt als nicht erfüllt", () => {
  const kaputt = fall();
  // Ein Datensatz, dem ein Feld ganz fehlt — so etwas kommt aus alten Zeilen.
  delete (kaputt as unknown as Record<string, unknown>).beschaeftigungsart;
  const ergebnis = absichtScore(kaputt);
  assert.ok(ergebnis.wert < 100);
  assert.ok(ergebnis.offen.includes("Beschäftigung angegeben"));
});

test("Datenlage: die Gewichte der Signale ergeben zusammen 100", () => {
  const summe = ABSICHT_SIGNALE.reduce((s, x) => s + x.gewicht, 0);
  assert.equal(summe, 100);
});

/* ------------------------------------------------------------------ */
/* IBAN                                                                */
/* ------------------------------------------------------------------ */

test("IBAN: gültig gibt 100, alles andere 0", () => {
  assert.equal(ibanScore(true), 100);
  assert.equal(ibanScore(false), 0);
});

test("IBAN: nur eine gültige Prüfsumme zählt", () => {
  assert.equal(bewerte(fall(), JETZT).merkmale.iban, 100);
  // Eine Stelle geändert — die Prüfsumme stimmt nicht mehr.
  assert.equal(
    bewerte(fall({ iban: "DE89 3704 0044 0532 0130 01" }), JETZT).merkmale.iban,
    0
  );
  assert.equal(bewerte(fall({ iban: "" }), JETZT).merkmale.iban, 0);
  assert.equal(bewerte(fall({ iban: "DE" }), JETZT).merkmale.iban, 0);
});

test("IBAN: das Protokoll enthält die Nummer nicht", () => {
  const antrag = fall();
  const protokoll = bewertungsProtokoll(antrag, bewerte(antrag, JETZT), JETZT);
  const alsText = JSON.stringify(protokoll);
  assert.ok(!alsText.includes("3704"));
  assert.ok(!alsText.includes("DE89"));
  assert.equal(protokoll.iban_score, 100);
});

/* ------------------------------------------------------------------ */
/* Gesamtwert                                                          */
/* ------------------------------------------------------------------ */

test("Gesamtwert: die Gewichte ergeben zusammen 1", () => {
  const summe = Object.values(GEWICHTE).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(summe - 1) < 1e-12);
});

test("Gesamtwert: gerechnet wie in der Vorgabe", () => {
  const merkmale = {
    recency: 90,
    betrag: 80,
    passung: 70,
    absicht: 60,
    iban: 100,
  };
  // 0,3*90 + 0,2*80 + 0,2*70 + 0,2*60 + 0,1*100 = 27 + 16 + 14 + 12 + 10 = 79
  assert.ok(Math.abs(gewichteterWert(merkmale) - 79) < 1e-9);
});

test("Gesamtwert: ein fehlendes Merkmal wird nicht als Null gezählt", () => {
  const ohnePassung = {
    recency: 100,
    betrag: 100,
    passung: null,
    absicht: 100,
    iban: 100,
  };
  // Alle vorhandenen Merkmale stehen auf 100 — also 100, nicht 80.
  assert.equal(gewichteterWert(ohnePassung), 100);
});

test("Gesamtwert: ohne jedes rechenbare Merkmal null", () => {
  assert.equal(
    gewichteterWert({
      recency: null,
      betrag: null,
      passung: null,
      absicht: 0,
      iban: 0,
    }),
    0
  );
});

test("Gesamtwert: bleibt zwischen 0 und 100", () => {
  const hoch = bewerte(fall({ amount: 100_000 }), JETZT).score;
  const tief = bewerte(
    fall({
      eingang: vorStunden(24 * 30),
      amount: 0,
      months: 0,
      kreditart: null,
      beschaeftigungsart: "",
      nettoeinkommen: "",
      gehaelter: [],
      iban: "",
    }),
    JETZT
  ).score;
  assert.ok(hoch <= 100 && hoch >= 0);
  assert.ok(tief <= 100 && tief >= 0);
  assert.ok(hoch > tief);
});

/* ------------------------------------------------------------------ */
/* Klassen                                                             */
/* ------------------------------------------------------------------ */

test("Klassen: die Grenzen liegen richtig", () => {
  const erwartet: [number, string][] = [
    [100, "P1"],
    [85, "P1"],
    [84.99, "P2"],
    [70, "P2"],
    [69.99, "P3"],
    [50, "P3"],
    [49.99, "P4"],
    [30, "P4"],
    [29.99, "P5"],
    [0, "P5"],
  ];
  for (const [wert, klasse] of erwartet) {
    assert.equal(klasseZu(wert).klasse, klasse, String(wert));
  }
});

/* ------------------------------------------------------------------ */
/* Randfaelle                                                          */
/* ------------------------------------------------------------------ */

test("Randfälle: ein fast leerer Fall wirft nicht", () => {
  const leer = {
    id: "x",
    eingang: "",
    status: "neu",
    amount: 0,
    months: 0,
    kreditart: null,
    beschaeftigungsart: "",
    nettoeinkommen: "",
    gehaelter: [],
    iban: "",
    pruefung: {},
  } as unknown as Antrag;
  const bewertung = bewerte(leer, JETZT);
  assert.ok(Number.isFinite(bewertung.score));
  assert.equal(bewertung.klasse, "P5");
  assert.deepEqual(bewertung.ohneWert.sort(), ["betrag", "passung", "recency"]);
});

test("Randfälle: unsinnig hohe Angaben bleiben im Rahmen", () => {
  const bewertung = bewerte(
    fall({
      amount: 999_999_999,
      nettoeinkommen: "99999999",
      gehaelter: ["99999999", "99999999", "99999999"],
    }),
    JETZT
  );
  assert.equal(bewertung.merkmale.betrag, 100);
  // Eine Milliarde bei acht Millionen im Monat ist ein Verhältnis von 0,83 —
  // rechnerisch eine gute Passung. Sie bleibt trotzdem im Rahmen.
  const passung = bewertung.merkmale.passung!;
  assert.ok(passung >= 0 && passung <= 100, String(passung));
  assert.ok(bewertung.score <= 100 && bewertung.score >= 0);
});

test("Randfälle: ein Wunsch weit über dem Einkommen gibt den Randwert", () => {
  // 90.000 Euro bei 1.200 im Monat: Verhältnis über 6, also die Untergrenze.
  const bewertung = bewerte(
    fall({
      amount: 90_000,
      nettoeinkommen: "1200",
      gehaelter: ["1200", "1200", "1200"],
    }),
    JETZT
  );
  assert.equal(bewertung.merkmale.passung, 20);
});

test("Randfälle: negatives Einkommen zählt nicht als Passung", () => {
  const bewertung = bewerte(
    fall({ nettoeinkommen: "-3000", gehaelter: ["-3000", "-3000", "-3000"] }),
    JETZT
  );
  assert.equal(bewertung.merkmale.passung, null);
  // Die Angabe ist trotzdem da — die Datenlage merkt das an, die Passung
  // nicht.
  assert.ok(bewertung.merkmale.absicht > 0);
});

test("Randfälle: leere Zeichenketten sind wie fehlende Angaben", () => {
  const bewertung = bewerte(
    fall({ nettoeinkommen: "   ", gehaelter: ["", "", ""] }),
    JETZT
  );
  assert.equal(bewertung.merkmale.passung, null);
});

/* ------------------------------------------------------------------ */
/* Zielgroesse                                                         */
/* ------------------------------------------------------------------ */

test("Abschluss: nur die Auszahlung zählt", () => {
  assert.equal(konvertiert(fall({ status: "ausgezahlt" })), true);
  assert.equal(konvertiert(fall({ status: "erledigt" })), false);
  assert.equal(konvertiert(fall({ status: "neu" })), false);
  assert.equal(konvertiert(fall({ status: "after_sale" })), false);
});

test("Protokoll: trägt alle Merkmale einzeln", () => {
  const antrag = fall();
  const bewertung = bewerte(antrag, JETZT);
  const p = bewertungsProtokoll(antrag, bewertung, JETZT);
  assert.equal(p.lead_id, antrag.id);
  assert.equal(p.score_timestamp, JETZT.toISOString());
  assert.equal(p.base_priority_score, bewertung.score);
  assert.equal(p.priority_class, bewertung.klasse);
  assert.equal(p.recency_score, bewertung.merkmale.recency);
  assert.equal(p.amount_score, bewertung.merkmale.betrag);
  assert.equal(p.financial_fit_score, bewertung.merkmale.passung);
  assert.equal(p.intent_score, bewertung.merkmale.absicht);
  assert.equal(p.converted, false);
});
