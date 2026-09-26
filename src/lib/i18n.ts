import type { HeroSzenen } from "@/components/illustrations/Illustrations";

export type Language = "de" | "en";

export interface Translations {
  hero: {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  calculator: {
    amountLabel: string;
    durationLabel: string;
    months: string;
    year: string;
    years: string;
    paymentLabel: string;
    editAmount: string;
    editPayment: string;
    totalLabel: string;
    rateLabel: string;
    cta: string;
    disclaimer: string;
    /**
     * Was Vorlesehilfen ansagen, wenn sich die Rate geaendert hat.
     * {rate}, {betrag} und {monate} werden ersetzt.
     */
    ansage: string;
  };
  features: { title: string; description: string }[];
  landing: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    ctaNote: string;
    // Beispielangebote im Aufmacher. Die Raten sind mit derselben Formel
    // gerechnet wie im Rechner: 20.000 € über 72 Monate.
    heroAngebote: { rate: string; zins: string }[];
    heroProMonat: string;
    heroErsparnis: string;
    // Beschriftungen der drei Szenen, die das Handy im Aufmacher durchspielt.
    heroSzenen: HeroSzenen;
    // Ein einziger Hinweis, zeilenweise. SVG bricht Text nicht selbst um,
    // deshalb bestimmt jede Sprache ihre Umbrueche selbst.
    heroBeispielHinweis: string[];
    /**
     * Beschriftung des Aufklappers mit dem vollstaendigen Hinweis.
     *
     * Er steht unter der Zeichnung an der Stelle, an der frueher die Zahlen
     * selbst standen — "Beispiel: 20.000 € über 72 Monate". Das war mehr Zahl
     * als Erklaerung; wer wissen will, wie die Ersparnis zustande kommt,
     * bekommt jetzt den ganzen Satz statt eines Ausschnitts.
     */
    heroBeispielMehr: string;
    /** Abkuerzung vom Aufmacher zum Rechner weiter unten (Fassung 2). */
    heroDirektRechnen: string;
    trustBadges: string[];
    partnerLabel: string;
    /** Hinweis darauf, dass die Namen darunter Beispiele sind. */
    partnerHinweis: string;
    /** Dasselbe fuer die Kundenstimmen. */
    stimmenHinweis: string;
    kennzahlen: { wert: string; label: string }[];
    ablaufEyebrow: string;
    ablaufTitle: string;
    ablaufSubtitle: string;
    schritte: { titel: string; text: string }[];
    vergleichEyebrow: string;
    vergleichTitle: string;
    vergleichText: string;
    vergleichPunkte: string[];
    vergleichOhne: string;
    vergleichMit: string;
    stimmenEyebrow: string;
    stimmenTitle: string;
    stimmen: { text: string; name: string; ort: string }[];
    faqEyebrow: string;
    faqTitle: string;
    faq: { frage: string; antwort: string }[];
    // Abschnitt mit dem Rechner unter den Kreditarten.
    rechnerEyebrow: string;
    rechnerTitle: string;
    rechnerText: string;
    rechnerPunkte: string[];
    // Aufruf, der beim Scrollen mitläuft, sobald der obere aus dem Bild ist.
    mitlaufCta: string;
    mitlaufNote: string;
    schlussTitle: string;
    schlussText: string;
    schlussCta: string;
  };
  /**
   * Kopfzeile, Hauptmenue und die feste Leiste unten auf dem Handy.
   *
   * Beides zusammen an einer Stelle, weil es dieselben vier Wege sind: Wer
   * einen davon umbenennt, benennt ihn sonst nur in der Kopfzeile um und
   * wundert sich spaeter ueber die abweichende Beschriftung unten.
   */
  navigation: {
    kredite: string;
    kreditrechner: string;
    ratgeber: string;
    ueberUns: string;
    /** Die Schaltflaeche rechts in der Kopfzeile. */
    cta: string;
    /** Letzter Eintrag im Klappmenue "Kredite". */
    alleKreditarten: string;
    menueOeffnen: string;
    menueSchliessen: string;
    hauptmenue: string;
    /** Feste Leiste unten auf dem Handy. */
    anrufen: string;
    anfrageStarten: string;
    schnellzugriff: string;
  };
  ratgeber: {
    eyebrow: string;
    titel: string;
    titelHighlight: string;
    intro: string;
    grundlagenTitel: string;
    grundlagenText: string;
    zweckeTitel: string;
    zweckeText: string;
    alleAnsehen: string;
    rechnerTitel: string;
    rechnerText: string;
    rechnerCta: string;
  };
  ueberUns: {
    eyebrow: string;
    titel: string;
    titelHighlight: string;
    intro: string;
    /** Die vier Punkte, die erklaeren, wie das hier funktioniert. */
    punkte: { titel: string; text: string }[];
    geldTitel: string;
    geldText: string;
    anbieterTitel: string;
    anbieterText: string;
    ctaTitel: string;
    ctaText: string;
    cta: string;
  };
  /**
   * Die Vertrauensleiste unter der Kopfzeile.
   *
   * Die Zahlen selbst stehen nicht hier, sondern in `src/lib/vertrauen.ts` —
   * sie sind in beiden Sprachen dieselben, und eine Bewertung, die sich
   * zwischen zwei Uebersetzungen unterscheidet, waere ein Fehler, den niemand
   * bemerkt.
   */
  vertrauen: {
    aria: string;
    ihkTitel: string;
    /** Steht unter "IHK", solange in anbieter.ts keine Kammer eingetragen ist. */
    ihkOhneKammer: string;
    bewertungTitel: string;
    /** "{anzahl}" wird ersetzt. */
    bewertungUnter: string;
    /** Solange die Zahlen nicht belegt sind. */
    hinweis: string;
  };
  // Der Fussbereich steht auf jeder Seite. Impressum und Datenschutz gibt es
  // nur auf Deutsch — das Recht, dem sie folgen, gibt es auch nur dort —,
  // aber der Weg dorthin soll in beiden Sprachen beschriftet sein.
  fuss: {
    rechtliches: string;
    startseite: string;
    kreditarten: string;
    impressum: string;
    datenschutz: string;
    hinweis: string;
  };
}

export const translations: Record<Language, Translations> = {
  de: {
    hero: {
      titleLine1: "Dein Kredit.",
      titleLine2: "Fair. Transparent. Digital.",
      subtitle:
        "Berechne in Sekunden deine monatliche Rate und erhalte ein unverbindliches, Schufa-neutrales Angebot – ganz ohne Papierkram.",
    },
    calculator: {
      amountLabel: "Kreditbetrag",
      durationLabel: "Laufzeit",
      months: "Monate",
      year: "Jahr",
      years: "Jahre",
      paymentLabel: "Monatliche Rate ab",
      editAmount: "Kreditbetrag eingeben",
      editPayment: "Monatliche Rate eingeben",
      totalLabel: "Gesamtbetrag",
      rateLabel: "eff. Jahreszins",
      cta: "Mit anderen Angeboten vergleichen",
      ansage: "Monatliche Rate {rate} bei {betrag} über {monate} Monaten.",
      disclaimer:
        "Beispielrechnung, kein verbindliches Angebot. Individueller effektiver Jahreszins abhängig von Bonität und Anbieter.",
    },
    features: [
      {
        title: "100 % transparent",
        description:
          "Keine versteckten Kosten. Jede Rate, jeder Zins ist von Anfang an klar.",
      },
      {
        title: "Schufa-neutrale Anfrage",
        description:
          "Ein unverbindliches Angebot anzufragen wirkt sich nicht auf deine Bonität aus.",
      },
      {
        title: "Made in Germany",
        description:
          "Entwickelt und gehostet nach deutschen und europäischen Datenschutzstandards.",
      },
    ],
    landing: {
      badge: "Kostenlos · Schufa-neutral · In 4 Minuten",
      titleLine1: "Günstiger finanzieren",
      titleHighlight: "mit weniger Aufwand.",
      subtitle:
        "Ein Antrag, über 20 Banken im Vergleich. Sie sehen sofort, welches Angebot Sie am wenigsten kostet — ohne Wirkung auf Ihre Bonität.",
      ctaPrimary: "Kostenlos vergleichen",
      ctaSecondary: "So funktioniert es",
      ctaNote: "Keine Kosten, keine Verpflichtung, kein Papierkram.",
      heroAngebote: [
        { rate: "303 €", zins: "2,89 %" },
        { rate: "325 €", zins: "5,49 %" },
        { rate: "352 €", zins: "8,50 %" },
      ],
      heroProMonat: "pro Monat",
      heroErsparnis: "3.595 € gespart",
      heroSzenen: {
        eingabeTitel: "Daten eingeben",
        eingabeUnter: "4 Minuten, ohne Unterlagen",
        betragLabel: "Wunschbetrag",
        betragWert: "20.000 €",
        laufzeitLabel: "Laufzeit",
        laufzeitWert: "72 Monate",
        eingabeKnopf: "Angebote anzeigen",
        angeboteTitel: "Angebote erhalten",
        angeboteUnter: "20+ Banken verglichen",
        ersparnisTitel: "Zinsen gespart",
        ersparnisUnter: "gegenüber dem teuersten Angebot",
        ersparnisWert: "3.595 €",
        ersparnisFuss: "weniger Zinskosten insgesamt",
      },
      heroBeispielHinweis: [
        "Beispielrechnung: 20.000 € Nettodarlehen, 72 Monate Laufzeit.",
        "Ersparnis = Differenz der Gesamtkosten gegenüber 8,50 % eff.",
        "Jahreszins. Kein verbindliches Angebot. Ihr effektiver Jahreszins",
        "hängt von Bonität und Anbieter ab.",
      ],
      heroBeispielMehr: "Wie diese Zahlen zustande kommen",
      heroDirektRechnen: "Oder gleich selbst rechnen",
      trustBadges: [
        "Schufa-neutral",
        "Kostenlos",
        "Unverbindlich",
        "DSGVO-konform",
      ],
      partnerLabel: "Unsere Partnerbanken",
      partnerHinweis:
        "Beispielhafte Darstellung — die Namen stehen fest, sobald die Anbindung der Partnerbanken abgeschlossen ist.",
      stimmenHinweis:
        "Beispielhafte Darstellung. Echte Bewertungen zeigen wir, sobald die ersten Kunden ihre Auszahlung erhalten haben.",
      kennzahlen: [
        { wert: "20+", label: "Banken im Vergleich" },
        { wert: "2,89 %", label: "eff. Jahreszins ab" },
        { wert: "4 Min.", label: "bis zum Angebot" },
        { wert: "0 €", label: "Kosten für Sie" },
      ],
      ablaufEyebrow: "So läuft es ab",
      ablaufTitle: "Drei Schritte, keine Warteschleife",
      ablaufSubtitle:
        "Kein Termin und keine Unterlagen im Voraus.",
      schritte: [
        {
          titel: "Wunsch eingeben",
          text: "Betrag und Laufzeit einstellen — die Rate rechnet sich sofort mit.",
        },
        {
          titel: "Angebote vergleichen",
          text: "Wir fragen über 20 Banken ab. Schufa-neutral, Ihr Score bleibt unberührt.",
        },
        {
          titel: "Auszahlung erhalten",
          text: "Digital unterschreiben statt Postident-Termin. Bei vielen Banken noch am selben Tag.",
        },
      ],
      vergleichEyebrow: "Warum vergleichen",
      vergleichTitle: "Der erste Zins ist selten der beste",
      vergleichText:
        "Zwischen dem teuersten und dem günstigsten Angebot für dieselbe Bonität liegen oft mehrere Prozentpunkte. Bei 20.000 € über 72 Monate sind das schnell vierstellige Beträge.",
      vergleichPunkte: [
        "Ein Antrag statt einer Anfrage pro Bank",
        "Ohne Wirkung auf Ihren Schufa-Score",
        "Sondertilgung bei den meisten Angeboten kostenfrei",
      ],
      vergleichOhne: "Hausbank, erstes Angebot",
      vergleichMit: "Nach dem Vergleich",
      stimmenEyebrow: "Kundenstimmen",
      stimmenTitle: "Was andere sagen",
      stimmen: [
        {
          text: "Ich hatte mit Wochen gerechnet. Am Ende waren es zwei Tage bis zur Zusage — und ein halber Prozentpunkt weniger als bei meiner Hausbank.",
          name: "Michael K.",
          ort: "Dortmund",
        },
        {
          text: "Endlich mal ohne Anrufe von fünf verschiedenen Beratern. Angebot angesehen, entschieden, fertig.",
          name: "Sandra B.",
          ort: "Leipzig",
        },
        {
          text: "Den Dispo abgelöst und dabei über 80 € im Monat gespart. Hätte ich mal früher gemacht.",
          name: "Tobias R.",
          ort: "Augsburg",
        },
      ],
      faqEyebrow: "Häufige Fragen",
      faqTitle: "Kurz beantwortet",
      faq: [
        {
          frage: "Kostet mich der Vergleich etwas?",
          antwort:
            "Nein. Der Vergleich ist für Sie kostenlos und unverbindlich. Wir werden von der Bank vergütet, wenn ein Vertrag zustande kommt — auf Ihre Konditionen wirkt sich das nicht aus.",
        },
        {
          frage: "Schadet die Anfrage meiner Schufa?",
          antwort:
            "Nein. Wir stellen eine Konditionsanfrage. Die ist für andere Banken nicht sichtbar und beeinflusst Ihren Score nicht — anders als eine echte Kreditanfrage.",
        },
        {
          frage: "Wie lange dauert es bis zur Auszahlung?",
          antwort:
            "Das Angebot sehen Sie sofort. Nach der digitalen Unterschrift und der Identifizierung zahlen viele Banken innerhalb von ein bis drei Werktagen aus.",
        },
        {
          frage: "Kann ich früher zurückzahlen?",
          antwort:
            "Bei den meisten Angeboten ja, und zwar kostenfrei. Ob Sondertilgung möglich ist, steht bei jedem Angebot dabei, bevor Sie sich entscheiden.",
        },
        {
          frage: "Was brauche ich für den Antrag?",
          antwort:
            "Für die Berechnung nichts. Für den Antrag Ihre persönlichen Daten, Angaben zum Beruf und zum Einkommen — Unterlagen erst dann, wenn Sie sich für ein Angebot entschieden haben.",
        },
      ],
      rechnerEyebrow: "Kreditrechner",
      rechnerTitle: "Was kostet Sie das im Monat?",
      rechnerText:
        "Betrag und Laufzeit einstellen — die Rate rechnet sich sofort mit. Unverbindlich und ohne Wirkung auf Ihre Bonität.",
      rechnerPunkte: [
        "Von 1.000 € bis 100.000 €",
        "Laufzeiten von 12 bis 240 Monaten",
        "Rate oder Betrag anpassen — beides geht",
      ],
      mitlaufCta: "Kostenlos vergleichen",
      mitlaufNote: "4 Minuten · Schufa-neutral",
      schlussTitle: "Sehen Sie in vier Minuten, was möglich ist",
      schlussText:
        "Unverbindlich, kostenlos und ohne Wirkung auf Ihre Bonität.",
      schlussCta: "Jetzt Rate berechnen",
    },
    navigation: {
      kredite: "Kredite",
      kreditrechner: "Kreditrechner",
      ratgeber: "Ratgeber",
      ueberUns: "Über uns",
      cta: "Konditionen prüfen",
      alleKreditarten: "Alle Kreditarten ansehen",
      menueOeffnen: "Menü öffnen",
      menueSchliessen: "Menü schließen",
      hauptmenue: "Hauptmenü",
      anrufen: "Anrufen",
      anfrageStarten: "Anfrage starten",
      schnellzugriff: "Schnellzugriff",
    },
    ratgeber: {
      eyebrow: "Ratgeber",
      titel: "Was Sie vorher",
      titelHighlight: "wissen sollten.",
      intro:
        "Ein Kredit ist eine Entscheidung über Jahre. Hier stehen die Fragen, die vor dem Abschluss wirklich zählen — kurz beantwortet und ohne Werbesprache.",
      grundlagenTitel: "Die Grundlagen",
      grundlagenText:
        "Fünf Fragen, die uns am häufigsten gestellt werden. Sie klären, was der Vergleich kostet, was er mit Ihrer Schufa macht und was Sie dafür brauchen.",
      zweckeTitel: "Nach Verwendungszweck",
      zweckeText:
        "Wofür das Geld gedacht ist, ändert die Konditionen. Zu jedem Zweck steht auf einer eigenen Seite, worauf es dabei ankommt — mit Rechner und den häufigen Fragen dazu.",
      alleAnsehen: "Alle Kreditarten ansehen",
      rechnerTitel: "Zahlen statt Text",
      rechnerText:
        "Am schnellsten beantwortet sich die Frage nach der Rate, indem Sie sie einstellen. Der Rechner ist unverbindlich und wirkt sich nicht auf Ihre Bonität aus.",
      rechnerCta: "Zum Kreditrechner",
    },
    ueberUns: {
      eyebrow: "Über uns",
      titel: "Wir vergleichen.",
      titelHighlight: "Geliehen wird bei der Bank.",
      intro:
        "cresolu.de ist ein Kreditvermittler. Wir vergeben selbst keine Darlehen, sondern holen für eine Anfrage die Konditionen mehrerer Banken ein und stellen sie nebeneinander. Der Vertrag kommt am Ende mit der Bank zustande, nicht mit uns.",
      punkte: [
        {
          titel: "Eine Anfrage, mehrere Banken",
          text: "Sie geben Ihre Angaben einmal ein. Statt bei jeder Bank einzeln zu fragen, geht die Anfrage an über 20 Häuser gleichzeitig.",
        },
        {
          titel: "Schufa-neutral",
          text: "Wir stellen eine Konditionsanfrage und keine Kreditanfrage. Sie ist für andere Banken nicht sichtbar und verändert Ihren Score nicht.",
        },
        {
          titel: "Kostenlos und unverbindlich",
          text: "Für Sie entstehen keine Kosten, und aus einer Anfrage folgt keine Verpflichtung. Sie entscheiden erst, wenn die Angebote vor Ihnen liegen.",
        },
        {
          titel: "Keine Unterlagen vorab",
          text: "Gehaltsnachweise und Ausweis braucht erst die Bank, für die Sie sich entschieden haben. Bis dahin genügen Ihre Angaben.",
        },
      ],
      geldTitel: "Womit wir Geld verdienen",
      geldText:
        "Wir werden von der Bank vergütet, wenn über uns ein Vertrag zustande kommt. Auf Ihre Konditionen wirkt sich das nicht aus — Sie zahlen denselben Zins wie bei der Bank direkt. Kommt kein Vertrag zustande, verdienen wir nichts.",
      anbieterTitel: "Wer dahintersteht",
      anbieterText:
        "Die vollständige Anbieterkennzeichnung mit Registereintrag, Erlaubnis nach § 34c GewO und Aufsichtsbehörde steht im Impressum.",
      ctaTitel: "Sehen, was möglich ist",
      ctaText:
        "Unverbindlich, kostenlos und ohne Wirkung auf Ihre Bonität.",
      cta: "Konditionen prüfen",
    },
    vertrauen: {
      aria: "Nachweise",
      ihkTitel: "IHK",
      ihkOhneKammer: "Zuständige Kammer",
      bewertungTitel: "von",
      bewertungUnter: "über {anzahl} Bewertungen",
      hinweis:
        "Beispielhafte Darstellung — Kammer und Bewertungen stehen fest, sobald die Angaben vorliegen.",
    },
    fuss: {
      rechtliches: "Rechtliches",
      startseite: "Startseite",
      kreditarten: "Kreditarten",
      impressum: "Impressum",
      datenschutz: "Datenschutz",
      hinweis:
        "cresolu.de vermittelt Kredite und vergibt selbst keine Darlehen. Die Anfrage ist kostenlos und unverbindlich; ein Vertrag kommt erst mit der finanzierenden Bank zustande.",
    },
  },
  en: {
    hero: {
      titleLine1: "Your loan.",
      titleLine2: "Fair. Transparent. Digital.",
      subtitle:
        "Calculate your monthly rate in seconds and get a non-binding, credit-score-neutral offer – no paperwork required.",
    },
    calculator: {
      amountLabel: "Loan amount",
      durationLabel: "Duration",
      months: "months",
      year: "year",
      years: "years",
      paymentLabel: "Monthly rate from",
      editAmount: "Enter loan amount",
      editPayment: "Enter monthly rate",
      totalLabel: "Total amount",
      rateLabel: "effective annual rate",
      cta: "Compare with other offers",
      ansage: "Monthly rate {rate} for {betrag} over {monate} months.",
      disclaimer:
        "Example calculation, not a binding offer. Individual effective annual rate depends on creditworthiness and provider.",
    },
    features: [
      {
        title: "100% transparent",
        description:
          "No hidden costs. Every rate, every fee is clear from the start.",
      },
      {
        title: "Credit-score-neutral request",
        description:
          "Requesting a non-binding offer has no effect on your credit score.",
      },
      {
        title: "Made in Germany",
        description:
          "Built and hosted according to German and European data protection standards.",
      },
    ],
    landing: {
      badge: "Free · Credit-score-neutral · In 4 minutes",
      titleLine1: "Finance smarter",
      titleHighlight: "with less effort.",
      subtitle:
        "One application, more than 20 banks compared. You see straight away which offer costs you the least — with no effect on your credit score.",
      ctaPrimary: "Compare for free",
      ctaSecondary: "How it works",
      ctaNote: "No cost, no obligation, no paperwork.",
      heroAngebote: [
        { rate: "€303", zins: "2.89%" },
        { rate: "€325", zins: "5.49%" },
        { rate: "€352", zins: "8.50%" },
      ],
      heroProMonat: "per month",
      heroErsparnis: "€3,595 saved",
      heroSzenen: {
        eingabeTitel: "Enter your details",
        eingabeUnter: "4 minutes, no paperwork",
        betragLabel: "Desired amount",
        betragWert: "€20,000",
        laufzeitLabel: "Term",
        laufzeitWert: "72 months",
        eingabeKnopf: "Show offers",
        angeboteTitel: "Offers received",
        angeboteUnter: "20+ banks compared",
        ersparnisTitel: "Interest saved",
        ersparnisUnter: "vs. the most expensive offer",
        ersparnisWert: "€3,595",
        ersparnisFuss: "less interest paid in total",
      },
      heroBeispielHinweis: [
        "Example calculation: €20,000 net loan, 72-month term.",
        "Saving = difference in total cost vs. 8.50% effective annual",
        "rate. Not a binding offer. Your effective annual rate depends on",
        "creditworthiness and provider.",
      ],
      heroBeispielMehr: "How these figures are calculated",
      heroDirektRechnen: "Or do the maths yourself",
      trustBadges: [
        "Credit-score-neutral",
        "Free of charge",
        "Non-binding",
        "GDPR-compliant",
      ],
      partnerLabel: "Our partner banks",
      partnerHinweis:
        "Illustrative only — the names will be final once the partner banks are connected.",
      stimmenHinweis:
        "Illustrative only. We will show real reviews once the first customers have received their payout.",
      kennzahlen: [
        { wert: "20+", label: "banks compared" },
        { wert: "2.89%", label: "effective annual rate" },
        { wert: "4 min", label: "for your offer" },
        { wert: "€0", label: "cost for you" },
      ],
      ablaufEyebrow: "How it works",
      ablaufTitle: "Three easy steps, no call center",
      ablaufSubtitle:
        "No appointment and no documents up front.",
      schritte: [
        {
          titel: "Enter what you need",
          text: "Set the amount and the terms — the instalment updates as you go.",
        },
        {
          titel: "Compare offers",
          text: "We query more than 20 banks. Credit-score-neutral, your score stays untouched.",
        },
        {
          titel: "Get your payout",
          text: "Sign digitally instead of queuing at the post office. More banks, same day.",
        },
      ],
      vergleichEyebrow: "Why compare",
      vergleichTitle: "The first rate is rarely the best one",
      vergleichText:
        "For the same creditworthiness, several percentage points often separate the most expensive offer from the cheapest. On €20,000 over 72 months that quickly adds up to four figures.",
      vergleichPunkte: [
        "One application instead of one enquiry per bank",
        "No effect on your credit score",
        "Early repayment free of charge with most offers",
      ],
      vergleichOhne: "Own bank, first offer",
      vergleichMit: "After comparing",
      stimmenEyebrow: "Customer voices",
      stimmenTitle: "What others say",
      stimmen: [
        {
          text: "I had expected weeks. In the end it took two days to approval — and half a percentage point less than my own bank offered.",
          name: "Michael K.",
          ort: "Dortmund",
        },
        {
          text: "Finally without calls from five different advisers. Looked at the offer, decided, done.",
          name: "Sandra B.",
          ort: "Leipzig",
        },
        {
          text: "Cleared the overdraft and saved more than €80 a month doing it. Should have done it sooner.",
          name: "Tobias R.",
          ort: "Augsburg",
        },
      ],
      faqEyebrow: "Frequent questions",
      faqTitle: "Answered briefly",
      faq: [
        {
          frage: "Does comparing cost me anything?",
          antwort:
            "No. Comparing is free and non-binding for you. We are paid by the bank if a contract comes about — that does not affect your terms.",
        },
        {
          frage: "Does the enquiry hurt my credit score?",
          antwort:
            "No. We make a conditions enquiry. It is not visible to other banks and does not affect your score — unlike an actual credit application.",
        },
        {
          frage: "How long until the money arrives?",
          antwort:
            "You see the offer immediately. After signing digitally and identifying yourself, many banks pay out within one to three working days.",
        },
        {
          frage: "Can I repay early?",
          antwort:
            "With most offers yes, and free of charge. Whether early repayment is possible is stated with every offer, before you decide.",
        },
        {
          frage: "What do I need for the application?",
          antwort:
            "Nothing for the calculation. For the application your personal details, employment and income — documents only once you have picked an offer.",
        },
      ],
      rechnerEyebrow: "Loan calculator",
      rechnerTitle: "What does it cost you per month?",
      rechnerText:
        "Set the amount and the term — the instalment updates as you go. Non-binding and with no effect on your credit score.",
      rechnerPunkte: [
        "From €1,000 to €100,000",
        "Terms from 12 to 240 months",
        "Adjust the instalment or the amount — either works",
      ],
      mitlaufCta: "Compare for free",
      mitlaufNote: "4 minutes · credit-score-neutral",
      schlussTitle: "See in four minutes what is possible",
      schlussText: "Non-binding, free, and with no effect on your credit score.",
      schlussCta: "Calculate my instalment",
    },
    navigation: {
      kredite: "Loans",
      kreditrechner: "Loan calculator",
      ratgeber: "Guide",
      ueberUns: "About us",
      cta: "Check conditions",
      alleKreditarten: "See all loan types",
      menueOeffnen: "Open menu",
      menueSchliessen: "Close menu",
      hauptmenue: "Main menu",
      anrufen: "Call us",
      anfrageStarten: "Start enquiry",
      schnellzugriff: "Quick actions",
    },
    ratgeber: {
      eyebrow: "Guide",
      titel: "What to know",
      titelHighlight: "before you sign.",
      intro:
        "A loan is a decision that lasts for years. These are the questions that actually matter beforehand — answered briefly and without sales talk.",
      grundlagenTitel: "The basics",
      grundlagenText:
        "The five questions we are asked most often. They cover what the comparison costs, what it does to your credit score and what you need for it.",
      zweckeTitel: "By loan purpose",
      zweckeText:
        "What the money is for changes the conditions. Each purpose has its own page explaining what matters — with a calculator and the common questions.",
      alleAnsehen: "See all loan types",
      rechnerTitel: "Numbers instead of text",
      rechnerText:
        "The fastest answer to the question of the instalment is to set it yourself. The calculator is non-binding and has no effect on your credit score.",
      rechnerCta: "To the loan calculator",
    },
    ueberUns: {
      eyebrow: "About us",
      titel: "We compare.",
      titelHighlight: "The bank does the lending.",
      intro:
        "cresolu.de is a loan broker. We do not lend money ourselves — we collect the conditions of several banks for a single enquiry and put them side by side. The contract is concluded with the bank, not with us.",
      punkte: [
        {
          titel: "One enquiry, several banks",
          text: "You enter your details once. Instead of asking each bank separately, the enquiry goes to more than 20 of them at the same time.",
        },
        {
          titel: "Credit-score-neutral",
          text: "We make a conditions enquiry, not a loan application. It is invisible to other banks and does not change your score.",
        },
        {
          titel: "Free and non-binding",
          text: "There are no costs for you, and an enquiry commits you to nothing. You decide once the offers are in front of you.",
        },
        {
          titel: "No paperwork up front",
          text: "Payslips and ID are needed only by the bank you chose. Until then your details are enough.",
        },
      ],
      geldTitel: "How we earn money",
      geldText:
        "We are paid by the bank when a contract is concluded through us. This does not affect your conditions — you pay the same rate as you would directly with the bank. If no contract is concluded, we earn nothing.",
      anbieterTitel: "Who is behind this",
      anbieterText:
        "The full provider details, including the commercial register entry, the § 34c GewO licence and the supervisory authority, are in the German legal notice.",
      ctaTitel: "See what is possible",
      ctaText: "Non-binding, free, and with no effect on your credit score.",
      cta: "Check conditions",
    },
    vertrauen: {
      aria: "Credentials",
      ihkTitel: "IHK",
      ihkOhneKammer: "Supervising chamber",
      bewertungTitel: "out of",
      bewertungUnter: "from over {anzahl} reviews",
      hinweis:
        "Illustrative — chamber and reviews will be final once the details are available.",
    },
    fuss: {
      rechtliches: "Legal",
      startseite: "Home",
      kreditarten: "Loan types",
      // Beide Seiten sind auf Deutsch, weil sie deutschem Recht folgen. Der
      // Zusatz sagt das vorher, statt den Leser darauf auflaufen zu lassen.
      impressum: "Legal notice (German)",
      datenschutz: "Privacy policy (German)",
      hinweis:
        "cresolu.de brokers loans and does not lend money itself. Enquiries are free and non-binding; a contract is only concluded with the financing bank.",
    },
  },
};
