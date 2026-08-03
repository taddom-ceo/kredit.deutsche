import type { Language } from "./i18n";
import type { Angebot } from "./angebote";

/**
 * Texte und Beispielangebote der Ergebnisliste.
 *
 * Die Banknamen sind dieselben erfundenen wie im Partnerband der Startseite.
 * Das ist Absicht: Mit echten Namen sähe die Liste wie ein verbindliches
 * Angebot dieser Häuser aus, und dafür fehlt jede Grundlage, solange keine
 * Bank angebunden ist.
 */
export type AngeboteTexte = {
  titel: string;
  untertitel: string;
  /** Deutlicher Hinweis, dass hier noch nichts Echtes steht. */
  musterTitel: string;
  musterText: string;

  betragLabel: string;
  betragHinweis: string;
  laufzeitLabel: string;
  laufzeitHinweis: string;
  zweckLabel: string;
  zweckHinweis: string;
  zwecke: string[];
  monate: string;

  trefferEins: string;
  trefferViele: string;
  sortierenLabel: string;
  sortierung: { wert: string; label: string }[];
  filterLabel: string;
  filterSofort: string;
  filterSondertilgung: string;
  filterZuruecksetzen: string;
  keineTreffer: string;

  spalteBank: string;
  spalteMerkmale: string;
  spalteRate: string;
  spalteZins: string;

  proMonat: string;
  sparen: string;
  bis: string;
  effJahreszins: string;
  bewertungen: string;
  auszahlungHeute: string;
  auszahlungTage: string;
  weiter: string;
  schufaNeutral: string;
  empfohlen: string;
  details: string;
  detailsZu: string;
  gesamtbetrag: string;
  laufzeitDetail: string;
  sollzins: string;

  buendelTitel: string;
  buendelText: string;
  buendelSchritte: string[];
  buendelAb: string;

  ladeTitel: string;
  ladeText: string;
  /** Stationen der Abfrage — laufen im Ladezustand nacheinander durch. */
  ladeSchritte: string[];

  suchTitel: string;
  sterneAria: string;
  vonBanken: string;

  beispielTitel: string;
  beispielText: string;
  fussnote: string;
  zurueck: string;

  angebote: Angebot[];
};

const BANKEN_DE: Angebot[] = [
  {
    id: "vertrauensbank",
    bank: "Vertrauensbank",
    zinsAb: 2.89,
    zinsBis: 6.49,
    sterne: 4.6,
    bewertungen: 201,
    auszahlungTage: 1,
    merkmal: "Sofort-Auszahlung",
    merkmalText: "Geld ist am nächsten Werktag auf Ihrem Konto",
    sondertilgung: true,
    plus: ["Kostenlose Sondertilgung", "Kein Postident-Termin nötig"],
    minus: ["Keine kostenlose Gesamttilgung"],
    empfohlen: true,
  },
  {
    id: "banknova",
    bank: "BankNova",
    zinsAb: 3.29,
    zinsBis: 7.19,
    sterne: 4.5,
    bewertungen: 693,
    auszahlungTage: 2,
    merkmal: "Volldigitaler Abschluss",
    merkmalText: "Auszahlung in ein bis zwei Werktagen",
    sondertilgung: true,
    plus: ["Kostenlose Sondertilgung", "Ratenpause zweimal im Jahr"],
    minus: ["Keine kostenlose Gesamttilgung"],
  },
  {
    id: "solidbank",
    bank: "SolidBank",
    zinsAb: 3.79,
    zinsBis: 7.89,
    sterne: 4.4,
    bewertungen: 652,
    auszahlungTage: 2,
    merkmal: "Volldigitaler Abschluss",
    merkmalText: "Auszahlung in ein bis zwei Werktagen",
    sondertilgung: true,
    plus: ["Kostenlose Sondertilgung", "Kostenlose Gesamttilgung"],
    minus: ["Keine Ratenpause möglich"],
  },
  {
    id: "rheinkredit",
    bank: "Rheinkredit",
    zinsAb: 4.49,
    zinsBis: 8.5,
    sterne: 4.3,
    bewertungen: 1204,
    auszahlungTage: 4,
    merkmal: "Auch bei kleinerem Einkommen",
    merkmalText: "Auszahlung in zwei bis vier Werktagen",
    sondertilgung: true,
    plus: ["Kostenlose Sondertilgung", "Zweiter Antragsteller möglich"],
    minus: ["Unterlagen per Post nötig"],
  },
  {
    id: "fairfinanz",
    bank: "FairFinanz",
    zinsAb: 5.49,
    zinsBis: 9.9,
    sterne: 4.1,
    bewertungen: 388,
    auszahlungTage: 5,
    merkmal: "Feste Rate ohne Zinsaufschlag",
    merkmalText: "Auszahlung in drei bis fünf Werktagen",
    sondertilgung: false,
    plus: ["Kostenlose Gesamttilgung"],
    minus: ["Keine Sondertilgung", "Keine Ratenpause"],
  },
];

const BANKEN_EN: Angebot[] = BANKEN_DE.map((a) => ({
  ...a,
  merkmal:
    a.merkmal === "Sofort-Auszahlung"
      ? "Same-day payout"
      : a.merkmal === "Volldigitaler Abschluss"
        ? "Fully digital sign-up"
        : a.merkmal === "Auch bei kleinerem Einkommen"
          ? "Also for lower incomes"
          : "Fixed rate, no surcharge",
  merkmalText:
    a.auszahlungTage <= 1
      ? "Money in your account the next working day"
      : a.auszahlungTage <= 2
        ? "Payout within one to two working days"
        : a.auszahlungTage <= 4
          ? "Payout within two to four working days"
          : "Payout within three to five working days",
  plus: a.plus.map(
    (p) =>
      ({
        "Kostenlose Sondertilgung": "Free overpayments",
        "Kein Postident-Termin nötig": "No post office ID check",
        "Ratenpause zweimal im Jahr": "Two payment breaks a year",
        "Kostenlose Gesamttilgung": "Free early full repayment",
        "Zweiter Antragsteller möglich": "Second applicant possible",
      })[p] ?? p
  ),
  minus: a.minus.map(
    (m) =>
      ({
        "Keine kostenlose Gesamttilgung": "Early full repayment costs a fee",
        "Keine Ratenpause möglich": "No payment breaks",
        "Unterlagen per Post nötig": "Documents by post required",
        "Keine Sondertilgung": "No overpayments",
        "Keine Ratenpause": "No payment breaks",
      })[m] ?? m
  ),
}));

export const angeboteTexte: Record<Language, AngeboteTexte> = {
  de: {
    titel: "Ihre Angebote",
    untertitel: "Ein Antrag, mehrere Banken — sortiert nach dem, was zählt.",
    musterTitel: "Beispielansicht",
    musterText:
      "Hier stehen noch keine echten Bankangebote. Banknamen, Zinssätze und Bewertungen sind Muster; die Raten sind daraus mit der Annuitätenformel gerechnet und passen sich Betrag und Laufzeit an.",

    betragLabel: "Wie viel?",
    betragHinweis: "Nettokreditbetrag",
    laufzeitLabel: "Wie lange?",
    laufzeitHinweis: "Laufzeit",
    zweckLabel: "Wofür?",
    zweckHinweis: "Verwendungszweck",
    zwecke: [
      "Freie Verwendung",
      "Fahrzeugkauf",
      "Umschuldung",
      "Modernisierung",
      "Dispo ausgleichen",
    ],
    monate: "Monate",

    trefferEins: "1 Angebot",
    trefferViele: "{n} Angebote",
    sortierenLabel: "Sortieren",
    sortierung: [
      { wert: "zins", label: "Bester Zins" },
      { wert: "rate", label: "Niedrigste Rate" },
      { wert: "tempo", label: "Schnellste Auszahlung" },
    ],
    filterLabel: "Filtern",
    filterSofort: "Auszahlung in 1–2 Tagen",
    filterSondertilgung: "Kostenlose Sondertilgung",
    filterZuruecksetzen: "Filter zurücksetzen",
    keineTreffer:
      "Kein Angebot passt zu diesen Filtern. Nehmen Sie einen davon zurück.",

    spalteBank: "Bank",
    spalteMerkmale: "Eigenschaften",
    spalteRate: "Monatliche Rate",
    spalteZins: "Effektiver Jahreszins",

    proMonat: "pro Monat",
    sparen: "{n} mtl. günstiger",
    bis: "bis",
    effJahreszins: "eff. Jahreszins",
    bewertungen: "Bewertungen",
    auszahlungHeute: "Auszahlung morgen",
    auszahlungTage: "Auszahlung in {n} Tagen",
    weiter: "Weiter",
    schufaNeutral: "Schufa-neutral",
    empfohlen: "Bester Zins",
    details: "Kreditdetails",
    detailsZu: "Details schließen",
    gesamtbetrag: "Gesamtbetrag",
    laufzeitDetail: "Laufzeit",
    sollzins: "gebundener Sollzins",

    buendelTitel: "Eine Anfrage — alle Topzinsen",
    buendelText:
      "Mit einer Anfrage erhalten Sie Angebote mehrerer Partnerbanken. Kostenlos, unverbindlich und ohne Wirkung auf Ihre Bonität.",
    buendelSchritte: [
      "Antrag ausfüllen",
      "Angebote der Partnerbanken erhalten",
      "Angebot auswählen und abschließen",
    ],
    buendelAb: "ab",

    ladeTitel: "Wir fragen die Banken ab",
    ladeText: "Das dauert einen Moment — Ihre Bonität bleibt unberührt.",
    ladeSchritte: [
      "Angaben geprüft",
      "Partnerbanken angefragt",
      "Konditionen verglichen",
    ],

    suchTitel: "Ihre Angaben",
    sterneAria: "{n} von 5 Sternen",
    vonBanken: "von {n} Partnerbanken",

    beispielTitel: "Repräsentatives Beispiel",
    beispielText:
      "Zwei Drittel der Kundinnen und Kunden erhalten: {zins} % eff. Jahreszins, {sollzins} % gebundener Sollzins p. a., {betrag} Nettodarlehen, {monate} Monate Laufzeit, {rate} monatlich, {gesamt} Gesamtbetrag.",
    fussnote:
      "Beispielrechnung, kein verbindliches Angebot. Ihr individueller effektiver Jahreszins hängt von Bonität und Anbieter ab.",
    zurueck: "Zurück zum Antrag",

    angebote: BANKEN_DE,
  },

  en: {
    titel: "Your offers",
    untertitel: "One application, several banks — sorted by what matters.",
    musterTitel: "Example view",
    musterText:
      "These are not real bank offers yet. Bank names, rates and ratings are samples; the monthly payments are calculated from them with the annuity formula and follow the amount and term you set.",

    betragLabel: "How much?",
    betragHinweis: "Net loan amount",
    laufzeitLabel: "How long?",
    laufzeitHinweis: "Term",
    zweckLabel: "What for?",
    zweckHinweis: "Purpose",
    zwecke: [
      "No fixed purpose",
      "Vehicle purchase",
      "Refinancing",
      "Home improvement",
      "Clearing an overdraft",
    ],
    monate: "months",

    trefferEins: "1 offer",
    trefferViele: "{n} offers",
    sortierenLabel: "Sort",
    sortierung: [
      { wert: "zins", label: "Best rate" },
      { wert: "rate", label: "Lowest payment" },
      { wert: "tempo", label: "Fastest payout" },
    ],
    filterLabel: "Filter",
    filterSofort: "Payout within 1–2 days",
    filterSondertilgung: "Free overpayments",
    filterZuruecksetzen: "Clear filters",
    keineTreffer: "No offer matches these filters. Try removing one.",

    spalteBank: "Bank",
    spalteMerkmale: "Features",
    spalteRate: "Monthly payment",
    spalteZins: "Effective annual rate",

    proMonat: "per month",
    sparen: "{n} less per month",
    bis: "up to",
    effJahreszins: "effective annual rate",
    bewertungen: "ratings",
    auszahlungHeute: "Payout tomorrow",
    auszahlungTage: "Payout in {n} days",
    weiter: "Continue",
    schufaNeutral: "Credit-score-neutral",
    empfohlen: "Best rate",
    details: "Loan details",
    detailsZu: "Close details",
    gesamtbetrag: "Total amount",
    laufzeitDetail: "Term",
    sollzins: "fixed borrowing rate",

    buendelTitel: "One request — all top rates",
    buendelText:
      "A single request gets you offers from several partner banks. Free, non-binding and with no effect on your credit score.",
    buendelSchritte: [
      "Fill in the application",
      "Receive offers from partner banks",
      "Pick an offer and sign",
    ],
    buendelAb: "from",

    ladeTitel: "We are asking the banks",
    ladeText: "This takes a moment — your credit score stays untouched.",
    ladeSchritte: [
      "Details checked",
      "Partner banks asked",
      "Terms compared",
    ],

    suchTitel: "Your details",
    sterneAria: "{n} out of 5 stars",
    vonBanken: "from {n} partner banks",

    beispielTitel: "Representative example",
    beispielText:
      "Two thirds of customers receive: {zins} % effective annual rate, {sollzins} % fixed borrowing rate p.a., {betrag} net loan, {monate} months, {rate} per month, {gesamt} total.",
    fussnote:
      "Example calculation, not a binding offer. Your individual effective annual rate depends on creditworthiness and provider.",
    zurueck: "Back to the application",

    angebote: BANKEN_EN,
  },
};
