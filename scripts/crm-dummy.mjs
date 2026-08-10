#!/usr/bin/env node
/**
 * Testfaelle ins CRM legen.
 *
 * Alle tragen den Nachnamen "Dummy". Das ist der ganze Trick an der Sache:
 * Damit sind sie in der Liste auf einen Blick zu erkennen, ueber die Suche in
 * einem Zug zu finden und mit einer einzigen Zeile SQL wieder wegzuraeumen —
 * ohne dass jemand sechzehn Kennungen mitschreiben muss.
 *
 *   DELETE FROM antrag WHERE nachname = 'Dummy';
 *
 * Aufruf:
 *   npm run crm:dummy -- --adresse https://cresolu.de --passwort GEHEIM
 *   npm run crm:dummy -- --anzahl 5
 *
 * Ohne --adresse geht es an http://localhost:3000, ohne --passwort wird
 * SITE_PASSWORD aus der Umgebung oder aus .env.local gelesen. Das Passwort
 * gehoert nicht in diese Datei und nicht in die Versionsverwaltung.
 *
 * ------------------------------------------------------------------
 * Geschickt wird an /api/antraege — genau dorthin, wohin auch die
 * Antragsstrecke schickt, wenn jemand auf "Antrag absenden" drueckt. Nicht
 * per SQL an der Anwendung vorbei. Das ist keine Bequemlichkeit, sondern der
 * Punkt: Ein Testfall, der anders entsteht als ein echter, kann anders
 * aussehen, und dann prueft man am Ende die Testdaten statt der Anwendung.
 * So laeuft jeder Fall durch dieselbe Pruefung, bekommt dieselbe Form und,
 * sobald CRM_DATEN_SCHLUESSEL gesetzt ist, dieselbe Verschluesselung der
 * Bankverbindung.
 *
 * Die Werte unten sind nicht ausgedacht, sondern nachgefahren: Dieselben
 * sechzehn Datensaetze sind einmal von Hand durch alle acht Schritte der
 * Strecke gelaufen — Zweck, Regler, Personen, Daten, Adresse, Beruf,
 * Einkommen, Bank — und alle sechzehn kamen im CRM an. Was das Formular nicht
 * angenommen haette, steht hier deshalb auch nicht drin:
 *
 *   · Betraege nur in Schritten von 500 (der Regler kennt keine anderen)
 *   · Laufzeiten nur aus DURATIONS in src/lib/loan-calc.ts
 *   · IBANs mit gueltiger Pruefsumme (isValidIban in src/lib/iban.ts) — oder
 *     gar keine, seit das Feld freiwillig ist; ein Fall laesst sie weg
 *   · Strassen, die im Verzeichnis unter public/streets wirklich stehen
 *   · Kreditarten aus der Liste in wizard-i18n (kreditarten)
 *
 * Wo die Faelle landen, entscheidet die Anwendung und nicht dieses Skript:
 * abgeschickte Antraege in "Neu", abgebrochene in "Abgebrochen". Genau so
 * kommen echte Faelle herein. Zum Ausprobieren des Bretts zieht man sie von
 * dort weiter.
 */

import { readFileSync } from "fs";

/* ------------------------------------------------------------------ */
/* Aufrufparameter                                                     */
/* ------------------------------------------------------------------ */

function argument(name, ersatz = null) {
  const stelle = process.argv.indexOf(`--${name}`);
  if (stelle === -1 || stelle === process.argv.length - 1) return ersatz;
  return process.argv[stelle + 1];
}

/**
 * Das Seitenpasswort aus .env.local lesen, wenn keins mitgegeben wurde.
 *
 * Bewusst nur diese eine Datei und bewusst ohne Bibliothek: Sie ist die, in
 * der beim Arbeiten an der Seite ohnehin alles steht, und sie liegt
 * ausserhalb des Repositories.
 */
function passwortAusDatei() {
  try {
    const inhalt = readFileSync(
      new URL("../.env.local", import.meta.url),
      "utf8"
    );
    const treffer = inhalt.match(/^SITE_PASSWORD=(.*)$/m);
    return treffer ? treffer[1].trim() : null;
  } catch {
    return null;
  }
}

const adresse = (argument("adresse") ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);
const passwort =
  argument("passwort") ?? process.env.SITE_PASSWORD ?? passwortAusDatei();
const anzahl = Number(argument("anzahl", "16"));

if (!passwort) {
  console.error(
    "Kein Seitenpasswort gefunden. Entweder --passwort mitgeben, SITE_PASSWORD\n" +
      "setzen oder eine .env.local mit SITE_PASSWORD anlegen."
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Die Faelle                                                          */
/* ------------------------------------------------------------------ */

/**
 * Sechzehn Faelle, die sich in jeder Hinsicht unterscheiden, die im CRM eine
 * Spalte hat.
 *
 * Nicht sechzehnmal dasselbe mit anderem Vornamen: Betraege von 2.000 bis
 * 92.000, Laufzeiten von 12 bis 120 Monaten, alle Beschaeftigungsarten vom
 * Azubi bis zum Rentner, mit und ohne Mieteinnahmen, mit und ohne laufende
 * Kredite, allein und zu zweit, kurze und sehr lange Namen und Orte.
 * Testdaten, die alle gleich aussehen, zeigen eine Ansicht, die es so nie
 * gibt — und lassen genau die Faelle durchrutschen, an denen eine Spalte zu
 * schmal oder eine Zeile zu lang wird.
 *
 * `abbruch: true` heisst: Die Strecke wurde nach der Adresse verlassen.
 * Solche Faelle haben absichtlich keine Bankverbindung und keine Angaben zum
 * Einkommen — als Abbrecher im CRM sind sie trotzdem etwas wert, weil man
 * zurueckrufen kann.
 */
const FAELLE = [
  // Der einzige Fall mit zweitem Vornamen — das Feld gibt es, also soll es
  // auch in den Testdaten vorkommen. Mit dem zweiten Kreditnehmer hat es
  // nichts zu tun: Es ist der Mittelname derselben Person.
  { v: "Annika", zweck: "frei", betrag: 12000, monate: 48, personen: 1,
    zweiter: "Maria", geb: "14.06.1988", plz: "10115", ort: "Berlin", str: "Invalidenstraße", nr: "112",
    beruf: "Angestellt", ag: "Contoso Deutschland GmbH", seit: "2019-03",
    netto: "2850", nk: "420", unterhalt: "0",
    iban: "DE54120300001000000000", bank: "Deutsche Kreditbank" },

  { v: "Bernd", zweck: "fahrzeug", betrag: 28500, monate: 72, personen: 2,
    geb: "02.11.1975", plz: "80331", ort: "München", str: "Sendlinger Straße", nr: "7a",
    beruf: "Beamter/-in", ag: "Freistaat Bayern", seit: "2011-09",
    netto: "3940", miete: "620", nk: "690", unterhalt: "0",
    partner: { v: "Claudia", n: "Dummy", geb: "17.04.1978", zusammen: true,
      beruf: "Angestellt", ag: "Klinikum München Süd", seit: "2014-02", netto: "2610" },
    iban: "DE42100500001000000137", bank: "Landesbank Berlin" },

  { v: "Cem", zweck: "umschuldung", betrag: 41000, monate: 96, personen: 1,
    geb: "27.03.1982", plz: "50667", ort: "Köln", str: "Hohe Straße", nr: "45",
    beruf: "Selbstständig", ag: "Eigenes Gewerbe", seit: "2016-01",
    netto: "5100", nk: "810", unterhalt: "340",
    kredite: [
      { art: "Konsumentenkredit", betrag: "18000", rate: "310", auszahlung: "2021-05",
        laufzeit: "72", zins: "6,9", restschuld: "9400", bank: "Santander",
        iban: "DE14300209001000000274" },
      { art: "Kreditkarte", betrag: "4000", rate: "95", auszahlung: "2023-02",
        laufzeit: "36", zins: "14,9", restschuld: "2650", bank: "Barclays", iban: "" },
    ],
    iban: "DE04200505501000000411", bank: "ING" },

  { v: "Doreen", zweck: "modernisierung", betrag: 65000, monate: 120, personen: 2,
    geb: "09.08.1970", plz: "01067", ort: "Dresden", str: "Wilsdruffer Straße", nr: "3",
    beruf: "Angestellt", ag: "Sächsische Aufbaubank", seit: "2008-07",
    netto: "4200", nk: "480", unterhalt: "0",
    // Zwei Kreditnehmer, die nicht zusammen wohnen — den Fall gibt es, und
    // die Fallakte muss ihn anders anzeigen als den Normalfall.
    partner: { v: "Marek", n: "Dummy", geb: "30.01.1969", zusammen: false, tel: "30001001",
      str: "Prager Straße", nr: "12", plz: "01069", ort: "Dresden",
      beruf: "Selbstständig", ag: "Eigenes Gewerbe", seit: "2015-10", netto: "3180" },
    iban: "DE04701500001000000548", bank: "Hamburger Sparkasse" },

  { v: "Erkan", zweck: "dispo", betrag: 4500, monate: 24, personen: 1,
    geb: "18.01.1996", plz: "44135", ort: "Dortmund", str: "Ostenhellweg", nr: "21",
    beruf: "Angestellt", ag: "Stadtwerke Dortmund", seit: "2022-11",
    netto: "2190", nk: "390", unterhalt: "0",
    // Ohne IBAN abgeschickt. Seit sie in der Strecke freiwillig ist, gibt es
    // diesen Fall wirklich, und im CRM soll er nachstellbar sein.
    iban: "", bank: "Sparkasse Dortmund" },

  { v: "Franziska", zweck: "moebel", betrag: 9000, monate: 36, personen: 1,
    geb: "05.05.2003", plz: "20095", ort: "Hamburg", str: "Mönckebergstraße", nr: "17",
    abbruch: true },

  { v: "Gerhard", zweck: "kueche", betrag: 17500, monate: 60, personen: 2,
    geb: "23.02.1957", plz: "90402", ort: "Nürnberg", str: "Karolinenstraße", nr: "8",
    beruf: "Rentner/-in", ag: "Deutsche Rentenversicherung", seit: "1979-04",
    netto: "1960", nk: "350", unterhalt: "0", pkv: "210",
    partner: { v: "Ingrid", n: "Dummy", geb: "05.12.1959", zusammen: true,
      beruf: "Rentner/-in", ag: "Deutsche Rentenversicherung", seit: "1981-08", netto: "1420" },
    iban: "DE98500105171000000822", bank: "Commerzbank" },

  { v: "Hanne-Lore", zweck: "wohnmobil", betrag: 52000, monate: 108, personen: 1,
    geb: "30.09.1979", plz: "24103", ort: "Kiel", str: "Holstenstraße", nr: "66",
    beruf: "Selbstständig", ag: "Praxis für Physiotherapie", seit: "2013-06",
    netto: "4750", miete: "1150", nk: "720", unterhalt: "0",
    iban: "DE24100100101000000959", bank: "Postbank" },

  { v: "Ismail", zweck: "motorrad", betrag: 10000, monate: 36, personen: 1,
    geb: "11.07.1991", plz: "70173", ort: "Stuttgart", str: "Königstraße", nr: "1b",
    beruf: "Angestellt", ag: "Robert Bosch GmbH", seit: "2020-02",
    netto: "3320", nk: "510", unterhalt: "0",
    iban: "DE41370502991000001096", bank: "DKB" },

  { v: "Jördis", zweck: "ebike", betrag: 2000, monate: 12, personen: 1,
    geb: "08.12.1999", plz: "18055", ort: "Rostock", str: "Kröpeliner Straße", nr: "54",
    abbruch: true },

  { v: "Konstantin", zweck: "reise", betrag: 6000, monate: 24, personen: 1,
    geb: "16.04.1986", plz: "04109", ort: "Leipzig", str: "Grimmaische Straße", nr: "12",
    beruf: "Angestellt", ag: "Deutsche Bahn AG", seit: "2018-10",
    netto: "2640", nk: "430", unterhalt: "180",
    iban: "DE36660501011000001233", bank: "Sparkasse KölnBonn" },

  { v: "Ludmila", zweck: "hochzeit", betrag: 14500, monate: 60, personen: 2,
    geb: "21.05.1993", plz: "76133", ort: "Karlsruhe", str: "Kaiserstraße", nr: "142",
    beruf: "Angestellt", ag: "dm-drogerie markt", seit: "2021-06",
    netto: "2480", nk: "460", unterhalt: "0",
    partner: { v: "Tobias", n: "Dummy", geb: "08.09.1990", zusammen: true, tel: "30001002",
      beruf: "Auszubildende/-r", ag: "Stadtwerke Karlsruhe", seit: "2023-09", netto: "1180" },
    iban: "DE40360501051000001370", bank: "Sparkasse Karlsruhe" },

  { v: "Mohammed", zweck: "medizin", betrag: 7500, monate: 36, personen: 1,
    geb: "03.10.1984", plz: "45127", ort: "Essen", str: "Kettwiger Straße", nr: "36",
    beruf: "Angestellt", ag: "Universitätsklinikum Essen", seit: "2017-01",
    netto: "3050", nk: "470", unterhalt: "0",
    kredite: [
      { art: "Autokredit", betrag: "22000", rate: "295", auszahlung: "2022-09",
        laufzeit: "84", zins: "4,2", restschuld: "15800", bank: "VW Bank",
        iban: "DE47 4005 0150 1000 0015 07" },
    ],
    iban: "DE39820500001000001644", bank: "Sparkasse Essen" },

  { v: "Nele", zweck: "ausbildung", betrag: 11000, monate: 84, personen: 1,
    geb: "29.11.2004", plz: "48143", ort: "Münster", str: "Prinzipalmarkt", nr: "9",
    beruf: "Auszubildende/-r", ag: "Kreishandwerkerschaft", seit: "2025-09",
    netto: "1020", nk: "300", unterhalt: "0",
    iban: "DE11545201941000001781", bank: "Sparkasse Münsterland Ost" },

  { v: "Ottokar", zweck: "umzug", betrag: 3500, monate: 24, personen: 1,
    geb: "07.02.1990", plz: "99084", ort: "Erfurt", str: "Anger", nr: "62",
    abbruch: true },

  // Der lange Name mit dem langen Ort und dem groessten Betrag: Er steht hier,
  // damit jede Ansicht einmal zeigt, was sie mit einer Zeile macht, die nicht
  // passt.
  { v: "Philippa-Charlotte", zweck: "ratenkauf", betrag: 92000, monate: 120, personen: 2,
    geb: "12.03.1968",
    plz: "67059", ort: "Ludwigshafen am Rhein", str: "Bismarckstraße", nr: "104",
    beruf: "Selbstständig", ag: "Steuerberatungskanzlei Weinheimer & Partner", seit: "2009-05",
    netto: "7900", miete: "2350", nk: "1180", unterhalt: "0",
    kredite: [
      { art: "Dispokredit", betrag: "310000", rate: "1240", auszahlung: "2015-03",
        laufzeit: "300", zins: "1,9", restschuld: "218000",
        bank: "Sparkasse Vorderpfalz", iban: "DE38 2802 0100 1000 0019 18" },
      { art: "Ratenkauf (z. B. Klarna, PayPal)", betrag: "25000", rate: "420",
        auszahlung: "2023-11", laufzeit: "60", zins: "7,4", restschuld: "19600",
        bank: "TARGOBANK", iban: "" },
    ],
    partner: { v: "Maximilian-Alexander", n: "Dummy", geb: "24.06.1965", zusammen: true,
      beruf: "Angestellt", ag: "BASF SE", seit: "1998-04", netto: "6350" },
    iban: "DE75500502011000002055", bank: "Sparkasse Vorderpfalz" },
];

/**
 * IBAN in Vierergruppen, so wie sie das Formular ablegt.
 *
 * Das Eingabefeld der Strecke setzt die Leerzeichen beim Tippen (siehe
 * `formatIbanInput` in src/lib/iban.ts), und genau diese Form landet dann in
 * der Datenbank. Ohne diesen Schritt saehe ein Testfall aus dem Skript an
 * genau einer Stelle anders aus als einer aus dem Formular — und ausgerechnet
 * bei der Bankverbindung.
 */
function ibanFormatiert(iban) {
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Aus einem Nettoeinkommen werden drei Monate.
 *
 * Die Strecke fragt drei Gehaltseingaenge ab, und im CRM wird der niedrigste
 * markiert. Testdaten, in denen immer der letzte Monat der niedrigste ist,
 * pruefen diese Markierung nicht — sie saehe auch dann richtig aus, wenn sie
 * schlicht die letzte Zeile faerbte. Deshalb wandert der niedrigste Monat
 * reihum: mal der erste, mal der mittlere, mal der letzte.
 */
function gehaelterFuer(netto, nummer) {
  const grund = Number(netto);
  const muster = [
    [0, 180, -140], // niedrigster: der letzte
    [0, -220, 90], // niedrigster: der mittlere
    [0, 60, 240], // niedrigster: der erste
  ][nummer % 3];
  return muster.map((abweichung) => String(grund + abweichung));
}

/** Aus "17.04.1978" wird "1978-04-17" — die Form, in der die Strecke sendet. */
function isoDatum(deutsch) {
  const [tag, monat, jahr] = deutsch.split(".");
  return `${jahr}-${monat}-${tag}`;
}

/** Aus einem Eintrag oben wird der Satz, den die Antragsstrecke schicken wuerde. */
function bauFall(f, nummer) {
  const gemeinsam = {
    kreditart: f.zweck,
    amount: f.betrag,
    months: f.monate,
    personCount: f.personen,
    vorname: f.v,
    zweiterVorname: f.zweiter ?? "",
    nachname: "Dummy",
    geburtsdatum: f.geb,
    // Eindeutig je Fall und auf einer Domain, die zum Testen vorgesehen ist:
    // example.de kann niemandem gehoeren, eine Mail dorthin trifft niemanden.
    email: `${f.v.toLowerCase().replace(/[^a-zäöüß]/g, "")}.dummy${nummer}@example.de`,
    telefonVorwahl: "0151",
    telefon: `2000${1000 + nummer}`,
    strasse: f.str,
    hausnummer: f.nr,
    plz: f.plz,
    ort: f.ort,
  };

  // Der Abbrecher hat die Strecke nach der Adresse verlassen. Alles Weitere
  // fehlt deshalb wirklich und wird nicht mit Platzhaltern aufgefuellt —
  // sonst saehe im CRM ein Abbruch aus wie ein fertiger Antrag.
  if (f.abbruch) return { ...gemeinsam, abgeschlossen: false };

  const kredite = f.kredite ?? [];
  return {
    ...gemeinsam,
    beschaeftigungsart: f.beruf,
    arbeitgeber: f.ag,
    beschaeftigtSeit: f.seit,
    nettoeinkommen: f.netto,
    gehaelter: gehaelterFuer(f.netto, nummer),
    mieteinnahmen: f.miete ? "ja" : "nein",
    mieteinnahmenBetrag: f.miete ?? "",
    wohnnebenkosten: f.nk,
    krankenversicherung: f.pkv ?? "",
    unterhalt: f.unterhalt,
    hatKredite: kredite.length > 0 ? "ja" : "nein",
    kredite,
    // Der zweite Kreditnehmer, wenn der Fall zwei hat. Dieselbe Form wie in
    // der Strecke: Gehaelter als Dreierliste, Anschrift nur bei abweichender.
    zweitePerson: f.partner
      ? {
          vorname: f.partner.v,
          zweiterVorname: "",
          nachname: f.partner.n,
          geburtstag: f.partner.geb.slice(0, 2),
          geburtsmonat: String(Number(f.partner.geb.slice(3, 5))),
          geburtsjahr: f.partner.geb.slice(6),
          geburtsdatum: isoDatum(f.partner.geb),
          eigenerKontakt: f.partner.tel ? "ja" : "nein",
          email: f.partner.tel
            ? `${f.partner.v.toLowerCase().replace(/[^a-zäöüß]/g, "")}.dummy${nummer}@example.de`
            : "",
          telefonLand: "DE",
          telefonVorwahl: f.partner.tel ? "0160" : "",
          telefon: f.partner.tel ?? "",
          gleicheAnschrift: f.partner.zusammen ? "ja" : "nein",
          strasse: f.partner.str ?? "",
          hausnummer: f.partner.nr ?? "",
          plz: f.partner.plz ?? "",
          ort: f.partner.ort ?? "",
          beschaeftigungsart: f.partner.beruf,
          arbeitgeber: f.partner.ag,
          beschaeftigtSeitMonat: String(Number(f.partner.seit.slice(5))),
          beschaeftigtSeitJahr: f.partner.seit.slice(0, 4),
          beschaeftigtSeit: f.partner.seit,
          nettoeinkommen: f.partner.netto,
          gehaelter: gehaelterFuer(f.partner.netto, nummer + 1),
        }
      : null,
    iban: f.iban ? ibanFormatiert(f.iban) : "",
    bankname: f.bank,
    kontoinhaber: `${f.v} Dummy`,
    abgeschlossen: true,
  };
}

/* ------------------------------------------------------------------ */
/* Ab damit                                                            */
/* ------------------------------------------------------------------ */

console.log(`Ziel: ${adresse}`);
console.log("");

const anmeldung = await fetch(`${adresse}/api/site-login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ password: passwort }),
});

if (!anmeldung.ok) {
  console.error(
    `Das Seitenpasswort wird nicht angenommen (HTTP ${anmeldung.status}).`
  );
  process.exit(1);
}

// Der Zaun sitzt vor der ganzen Seite und prueft ein Cookie. Ohne das kommt
// auch /api/antraege nicht durch.
const kekse = (anmeldung.headers.getSetCookie?.() ?? [])
  .map((k) => k.split(";")[0])
  .join("; ");

let gelungen = 0;
const gescheitert = [];

for (const [i, eintrag] of FAELLE.slice(0, anzahl).entries()) {
  const fall = bauFall(eintrag, i + 1);
  const antwort = await fetch(`${adresse}/api/antraege`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: kekse },
    body: JSON.stringify(fall),
  });
  const ergebnis = await antwort.json().catch(() => ({}));

  if (antwort.ok && ergebnis.ok) {
    gelungen++;
    console.log(
      `  ${String(i + 1).padStart(2)}. ${fall.vorname} Dummy — ` +
        `${fall.amount.toLocaleString("de-DE")} € / ${fall.months} Mon. → ` +
        `${fall.abgeschlossen ? "Neu" : "Abgebrochen"}`
    );
  } else {
    gescheitert.push(
      `${fall.vorname}: HTTP ${antwort.status} ${JSON.stringify(ergebnis)}`
    );
    console.log(`  ${String(i + 1).padStart(2)}. ${fall.vorname} Dummy — abgewiesen`);
  }
}

console.log("");
console.log(`${gelungen} von ${Math.min(anzahl, FAELLE.length)} angelegt.`);

if (gescheitert.length > 0) {
  console.log("");
  console.log("Nicht angenommen:");
  for (const zeile of gescheitert) console.log(`  ${zeile}`);
}

console.log("");
console.log("Wieder wegräumen — eine Zeile in der Datenbankkonsole:");
console.log("");
console.log("  DELETE FROM antrag WHERE nachname = 'Dummy';");
console.log("");
console.log(
  "Der Verlauf der Fälle geht dabei mit weg; dafür sorgt ON DELETE CASCADE\n" +
    "an der Tabelle aktivitaet. Echte Fälle bleiben unberührt, solange niemand\n" +
    "wirklich Dummy heißt."
);

if (gescheitert.length > 0) process.exit(1);
