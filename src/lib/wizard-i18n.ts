export interface WizardTranslations {
  progress: {
    stepLabels: string[];
    timeRemaining: string;
    stepAriaPrefix: string;
    // "Schritt 3 von 8" — {n} und {gesamt} werden ersetzt.
    stepCounter: string;
    saved: string;
  };
  nav: {
    back: string;
    next: string;
    submit: string;
  };
  step1: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    haeufigLabel: string;
    weitereLabel: string;
    hinweisOeffnen: string;
    hinweisSchliessen: string;
    sonstigeLabel: string;
    sonstigeAnzahl: string;
    trust: string[];
  };
  step2: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    previewLabel: string;
    previewNote: string;
    purposeLabel: string;
    purposePlaceholder: string;
    amountLabel: string;
    editAmount: string;
    editPayment: string;
    durationLabel: string;
    monthsUnit: string;
    totalLabel: string;
    trustBadge: string;
    socialProof: string;
  };
  step3: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    recommendedTitle: string;
    recommendedPerks: string[];
    option1Title: string;
    option1Subtitle: string;
    option2Title: string;
    option2Subtitle: string;
    recommendedTag: string;
  };
  step4: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    vorname: string;
    zweiterVorname: string;
    optionalHint: string;
    nachname: string;
    geburtsdatum: string;
    geburtstag: string;
    geburtsmonat: string;
    geburtsjahr: string;
    auswahlPlatzhalter: string;
    email: string;
    nameInvalid: string;
    emailInvalid: string;
    telefon: string;
    telefonLand: string;
    telefonNummer: string;
    telefonVorwahl: string;
    telefonVorwahlTooShort: string;
    geburtsdatumTooYoung: string;
    geburtsdatumImplausible: string;
  };
  step5: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    strasse: string;
    hausnummer: string;
    plz: string;
    ort: string;
    ortPlaceholder: string;
    ortAwaitingPlz: string;
    plzChecking: string;
    plzUnknown: string;
    plzLookupFailed: string;
    plzVerified: string;
    strasseInvalid: string;
    strasseUnknown: string;
    strasseNoData: string;
    strasseVerified: string;
    hausnummerInvalid: string;
    addressNote: string;
  };
  step6: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    beschaeftigungsart: string;
    beschaeftigungsartPlaceholder: string;
    beschaeftigungsartOptions: string[];
    arbeitgeber: string;
    beschaeftigtSeit: string;
    monat: string;
    jahr: string;
    auswahlPlatzhalter: string;
  };
  step7: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    einnahmenTitel: string;
    einnahmenText: string;
    nettoeinkommen: string;
    mieteinnahmenFrage: string;
    mieteinnahmenBetrag: string;
    ausgabenTitel: string;
    ausgabenText: string;
    wohnnebenkosten: string;
    wohnnebenkostenHinweis: string;
    weitereAusgabenFrage: string;
    krankenversicherung: string;
    unterhalt: string;
    krediteTitel: string;
    kreditFrage: string;
    kreditartTitel: string;
    kreditarten: string[];
    kreditartAndere: string;
    kreditartenWeitere: string[];
    kreditNummer: string;
    kreditBetrag: string;
    kreditRate: string;
    kreditAuszahlung: string;
    monat: string;
    jahr: string;
    auswahlPlatzhalter: string;
    kreditLaufzeit: string;
    laufzeitHinweis: string;
    jahre: string;
    monate: string;
    kreditZins: string;
    kreditZinsHinweis: string;
    kreditRestschuld: string;
    schaetzung: string;
    uebernehmen: string;
    schaetzungFehlt: string;
    zinsWarnung: string;
    abbezahlt: string;
    bank: string;
    iban: string;
    optional: string;
    ja: string;
    nein: string;
    kreditEntfernen: string;
    kreditHinzufuegen: string;
  };
  step8: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    trust: string[];
    iban: string;
    ibanError: string;
    bankname: string;
    kontoinhaber: string;
    /** Der Antrag liess sich nicht uebermitteln — Netz weg oder Server hakt. */
    sendeFehler: string;
    /** Beschriftung des Knopfes, solange der Antrag unterwegs ist. */
    sendet: string;
  };
  confirmation: {
    title: string;
    highlight: string;
    subtitle: string;
    summaryLabel: string;
    summaryKreditart: string;
    summaryPersonen: string;
    summaryName: string;
    disclaimerTitle: string;
    disclaimer: string;
    ctaHome: string;
  };
}

export const wizardTranslations: Record<"de" | "en", WizardTranslations> = {
  de: {
    progress: {
      stepLabels: [
        "Art",
        "Details",
        "Personen",
        "Daten",
        "Adresse",
        "Beruf",
        "Einkommen",
        "Bank",
      ],
      timeRemaining: "Ca. 4 Min. verbleibend",
      stepAriaPrefix: "Schritt",
      stepCounter: "Schritt {n} von {gesamt}",
      saved: "Gespeichert",
    },
    nav: {
      back: "Zurück",
      next: "Weiter",
      submit: "Antrag absenden",
    },
    step1: {
      eyebrow: "1/8 · Kreditart",
      title: "Was möchten Sie",
      highlight: "finanzieren?",
      subtitle:
        "Wählen Sie den passenden Finanzierungszweck. So finden wir die besten Kreditangebote für Ihre Situation.",
      haeufigLabel: "Häufig gewählt",
      weitereLabel: "Weitere Zwecke",
      hinweisOeffnen: "Hinweis anzeigen",
      hinweisSchliessen: "Hinweis schließen",
      sonstigeLabel: "Sonstige",
      sonstigeAnzahl: "weitere Zwecke",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "Vergleich von 20+ Banken",
        "Kostenlos und unverbindlich",
      ],
    },
    step2: {
      eyebrow: "2/8 · Details",
      title: "Kredit-",
      highlight: "Details.",
      subtitle:
        "Betrag, Laufzeit und Verwendungszweck festlegen — Angebot in Sekunden.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "Vergleich von 20+ Banken",
        "Kostenlos und unverbindlich",
      ],
      previewLabel: "GESCHÄTZTE MONATSRATE",
      previewNote: "Richtwert · genauer Zins nach Prüfung",
      purposeLabel: "VERWENDUNGSZWECK",
      purposePlaceholder: "Bitte wählen",
      amountLabel: "KREDITBETRAG",
      editAmount: "Kreditbetrag eingeben",
      editPayment: "Monatliche Rate eingeben",
      durationLabel: "LAUFZEIT",
      monthsUnit: "Mon.",
      totalLabel: "Gesamt",
      trustBadge:
        "SCHUFA-neutral. Die Anfrage beeinflusst Ihre Bonität nicht · Kostenlos · Unverbindlich",
      socialProof:
        "Diesen Monat haben tausende Familien über kredit.deutsche einen Antrag gestellt.",
    },
    step3: {
      eyebrow: "3/8 · Anzahl Personen",
      title: "Wie viele Personen",
      highlight: "beantragen?",
      subtitle:
        "Bei Anträgen zu zweit ist die Zusagewahrscheinlichkeit meist höher.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "Vergleich von 20+ Banken",
        "Kostenlos und unverbindlich",
      ],
      recommendedTitle:
        "Beantragen Sie zu zweit — Ihre Zusagechance ist deutlich höher, und Ihr Zinssatz ist deutlich günstiger.",
      recommendedPerks: [
        "Niedrigerer Zins",
        "Höhere Zusagechance",
        "Höherer Kreditrahmen",
      ],
      option1Title: "1 Person",
      option1Subtitle: "Allein-Antragsteller",
      option2Title: "2 Personen",
      option2Subtitle: "Mit Ehe-/Lebenspartner",
      recommendedTag: "Empfohlen",
    },
    step4: {
      eyebrow: "4/8 · Persönliche Daten",
      title: "Wer stellt den",
      highlight: "Antrag?",
      subtitle: "Ihre persönlichen Angaben für das Angebot.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "SSL-verschlüsselte Übertragung",
        "Kostenlos und unverbindlich",
      ],
      vorname: "Vorname",
      zweiterVorname: "Zweiter Vorname",
      optionalHint: "optional",
      nachname: "Nachname",
      geburtsdatum: "Geburtsdatum",
      geburtstag: "Tag",
      geburtsmonat: "Monat",
      geburtsjahr: "Jahr",
      auswahlPlatzhalter: "–",
      email: "E-Mail-Adresse",
      nameInvalid: "Bitte einen Namen ohne Ziffern eingeben.",
      emailInvalid:
        "Bitte eine vollständige E-Mail-Adresse eingeben, z. B. name@anbieter.de.",
      telefon: "Telefonnummer",
      telefonLand: "Land",
      telefonNummer: "Rufnummer",
      telefonVorwahl: "Vorwahl",
      telefonVorwahlTooShort: "Mindestens zwei Ziffern.",
      geburtsdatumTooYoung:
        "Für einen Kreditantrag müssen Sie mindestens 18 Jahre alt sein.",
      geburtsdatumImplausible: "Bitte prüfen Sie das Geburtsdatum.",
    },
    step5: {
      eyebrow: "5/8 · Adresse",
      title: "Wo wohnen",
      highlight: "Sie?",
      subtitle: "Ihre aktuelle Meldeadresse.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "SSL-verschlüsselte Übertragung",
        "Kostenlos und unverbindlich",
      ],
      strasse: "Straße",
      hausnummer: "Hausnummer",
      plz: "Postleitzahl",
      ort: "Ort",
      ortPlaceholder: "Bitte Ort wählen",
      ortAwaitingPlz: "Erst Postleitzahl eingeben",
      plzChecking: "Postleitzahl wird geprüft …",
      plzUnknown: "Diese Postleitzahl gibt es in Deutschland nicht.",
      plzLookupFailed:
        "Prüfung derzeit nicht möglich. Bitte später erneut versuchen.",
      plzVerified: "Postleitzahl bestätigt",
      strasseInvalid: "Bitte einen gültigen Straßennamen eingeben.",
      strasseUnknown:
        "Diese Straße kennen wir zu dieser Postleitzahl nicht. Bitte Schreibweise prüfen oder aus der Liste wählen.",
      strasseNoData:
        "Für diese Postleitzahl liegt uns kein Straßenverzeichnis vor.",
      strasseVerified: "Adresse bestätigt",
      hausnummerInvalid: "Bitte eine gültige Hausnummer eingeben, z. B. 12a.",
      addressNote:
        "Postleitzahl und Ort werden gegen das amtliche Verzeichnis geprüft.",
    },
    step6: {
      eyebrow: "6/8 · Beruf",
      title: "Ihre berufliche",
      highlight: "Situation.",
      subtitle: "Angaben zu Ihrer Beschäftigung.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "SSL-verschlüsselte Übertragung",
        "Kostenlos und unverbindlich",
      ],
      beschaeftigungsart: "Beschäftigungsart",
      beschaeftigungsartPlaceholder: "Bitte wählen",
      beschaeftigungsartOptions: [
        "Angestellt",
        "Beamter/-in",
        "Selbstständig",
        "Rentner/-in",
        "Auszubildende/-r",
        "Sonstiges",
      ],
      arbeitgeber: "Arbeitgeber",
      beschaeftigtSeit: "Beschäftigt seit",
      monat: "Monat",
      jahr: "Jahr",
      auswahlPlatzhalter: "–",
    },
    step7: {
      eyebrow: "7/8 · Einkommen",
      title: "Ihr monatliches",
      highlight: "Einkommen.",
      subtitle: "Angaben zu Einnahmen, Ausgaben und laufenden Krediten.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "SSL-verschlüsselte Übertragung",
        "Kostenlos und unverbindlich",
      ],
      einnahmenTitel: "Monatliche Einnahmen",
      einnahmenText:
        "Die monatlichen Einnahmen werden für Ihre Haushaltsrechnung benötigt. Diese wird von den Banken durchgeführt, um Ihr Kreditangebot zu ermitteln.",
      nettoeinkommen: "Ihr Nettoeinkommen",
      mieteinnahmenFrage: "Haben Sie Mieteinnahmen?",
      mieteinnahmenBetrag: "Monatliche warme Mieteinnahmen",
      ausgabenTitel: "Monatliche Ausgaben",
      ausgabenText:
        "Die monatlichen Ausgaben werden ebenfalls für Ihre Haushaltsrechnung benötigt.",
      wohnnebenkosten: "Wohnnebenkosten",
      wohnnebenkostenHinweis:
        "Nebenkosten wie Wasser, Heizung, Müll und Stellplatz. Stromkosten gehören nicht dazu.",
      weitereAusgabenFrage: "Haben Sie sonstige Ausgaben?",
      krankenversicherung: "Priv. Krankenversicherung",
      unterhalt: "Unterhaltsverpflichtungen",
      krediteTitel: "Bestehende Kredite",
      kreditFrage: "Haben Sie bestehende Kredite?",
      kreditartTitel: "Kreditart",
      kreditarten: [
        "Konsumentenkredit",
        "Autokredit",
        "Leasing",
        "Dispokredit",
        "Kreditkarte",
        "Rahmenkredit",
        "Ratenkauf (z. B. Klarna, PayPal)",
      ],
      kreditartAndere: "Andere",
      kreditartenWeitere: ["Kredit mit Schlussrate"],
      kreditNummer: "Bestehender Kredit",
      kreditBetrag: "Kreditbetrag",
      kreditRate: "Monatliche Rate",
      kreditAuszahlung: "Auszahlungsdatum",
      monat: "Monat",
      jahr: "Jahr",
      auswahlPlatzhalter: "Bitte wählen",
      kreditLaufzeit: "Laufzeit (gesamt)",
      laufzeitHinweis: "In Monaten eingeben",
      jahre: "Jahre",
      monate: "Monate",
      kreditZins: "Effektiver Jahreszins",
      kreditZinsHinweis:
        "Wenn Sie ihn kennen, wird die Restschuld genauer. Sonst ergibt er sich aus Betrag, Rate und Laufzeit.",
      kreditRestschuld: "Restschuld",
      schaetzung: "geschätzte Restschuld bei {zins} % p. a.:",
      uebernehmen: "übernehmen",
      schaetzungFehlt:
        "Für eine Schätzung fehlen noch Betrag, Rate, Auszahlungsdatum und Laufzeit oder Zinssatz.",
      zinsWarnung:
        "Aus Ihren Angaben ergibt sich rechnerisch ein Zinssatz von mehr als {grenze} % p. a. — bitte prüfen. Gerechnet wird mit {grenze} %.",
      abbezahlt: "Nach diesen Angaben ist der Kredit bereits zurückgeführt.",
      bank: "Bank, bei der Sie Ihren Kredit haben",
      iban: "IBAN Ihres bestehenden Kredits",
      optional: "optional",
      ja: "ja",
      nein: "nein",
      kreditEntfernen: "diesen Kredit entfernen",
      kreditHinzufuegen: "bestehenden Kredit hinzufügen",
    },
    step8: {
      eyebrow: "8/8 · Bankverbindung",
      title: "Ihre Bank-",
      highlight: "verbindung.",
      subtitle: "Für die Auszahlung nach Genehmigung.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "SSL-verschlüsselte Übertragung",
        "Kostenlos und unverbindlich",
      ],
      iban: "IBAN",
      ibanError: "Bitte eine gültige IBAN eingeben.",
      bankname: "Name der Bank",
      kontoinhaber: "Kontoinhaber",
      sendeFehler:
        "Der Antrag konnte nicht übermittelt werden. Bitte noch einmal versuchen.",
      sendet: "Wird gesendet",
    },
    confirmation: {
      title: "Antrag",
      highlight: "erhalten.",
      subtitle:
        "Vielen Dank. Ihre Angaben wurden zusammengefasst — ein Berater meldet sich in der Regel innerhalb eines Werktages.",
      summaryLabel: "Ihre Angaben im Überblick",
      summaryKreditart: "Kreditart",
      summaryPersonen: "Antragsteller",
      summaryName: "Name",
      disclaimerTitle: "Hinweis zu dieser Demo",
      disclaimer:
        "Dies ist eine Demo-Oberfläche ohne angebundenes Backend. Es wurden keine Daten gespeichert oder an eine Bank übermittelt.",
      ctaHome: "Zurück zur Startseite",
    },
  },
  en: {
    progress: {
      stepLabels: [
        "Type",
        "Details",
        "Applicants",
        "Personal",
        "Address",
        "Employment",
        "Income",
        "Bank",
      ],
      timeRemaining: "Approx. 4 min. remaining",
      stepAriaPrefix: "Step",
      stepCounter: "Step {n} of {gesamt}",
      saved: "Saved",
    },
    nav: {
      back: "Back",
      next: "Next",
      submit: "Submit application",
    },
    step1: {
      eyebrow: "1/8 · Loan type",
      title: "What would you like",
      highlight: "to finance?",
      subtitle:
        "Choose the purpose that fits. That is how we find the best loan offers for your situation.",
      haeufigLabel: "Frequently chosen",
      weitereLabel: "Other purposes",
      hinweisOeffnen: "Show details",
      hinweisSchliessen: "Close details",
      sonstigeLabel: "Other",
      sonstigeAnzahl: "more purposes",
      trust: [
        "Credit-score-neutral request",
        "Compare 20+ banks",
        "Free and non-binding",
      ],
    },
    step2: {
      eyebrow: "2/8 · Details",
      title: "Loan",
      highlight: "details.",
      subtitle:
        "Set the amount, duration, and purpose — get an offer in seconds.",
      trust: [
        "Credit-score-neutral request",
        "Compare 20+ banks",
        "Free and non-binding",
      ],
      previewLabel: "ESTIMATED MONTHLY RATE",
      previewNote: "Guide value · exact rate after review",
      purposeLabel: "PURPOSE",
      purposePlaceholder: "Please choose",
      amountLabel: "LOAN AMOUNT",
      editAmount: "Enter loan amount",
      editPayment: "Enter monthly rate",
      durationLabel: "DURATION",
      monthsUnit: "mo.",
      totalLabel: "Total",
      trustBadge:
        "Credit-score-neutral. This request has no effect on your credit score · Free · Non-binding",
      socialProof:
        "This month, thousands of families applied via kredit.deutsche.",
    },
    step3: {
      eyebrow: "3/8 · Number of applicants",
      title: "How many people are",
      highlight: "applying?",
      subtitle:
        "Joint applications usually have a higher approval likelihood.",
      trust: [
        "Credit-score-neutral request",
        "Compare 20+ banks",
        "Free and non-binding",
      ],
      recommendedTitle:
        "Apply jointly — your approval chance is significantly higher, and your rate is significantly better.",
      recommendedPerks: [
        "Lower interest rate",
        "Higher approval chance",
        "Higher credit limit",
      ],
      option1Title: "1 person",
      option1Subtitle: "Sole applicant",
      option2Title: "2 people",
      option2Subtitle: "With spouse/partner",
      recommendedTag: "Recommended",
    },
    step4: {
      eyebrow: "4/8 · Personal details",
      title: "Who is",
      highlight: "applying?",
      subtitle: "Your personal details for the offer.",
      trust: [
        "Credit-score-neutral request",
        "SSL-encrypted transmission",
        "Free and non-binding",
      ],
      vorname: "First name",
      zweiterVorname: "Middle name",
      optionalHint: "optional",
      nachname: "Last name",
      geburtsdatum: "Date of birth",
      geburtstag: "Day",
      geburtsmonat: "Month",
      geburtsjahr: "Year",
      auswahlPlatzhalter: "–",
      email: "Email address",
      nameInvalid: "Please enter a name without digits.",
      emailInvalid:
        "Please enter a complete email address, e.g. name@provider.com.",
      telefon: "Phone number",
      telefonLand: "Country",
      telefonNummer: "Number",
      telefonVorwahl: "Area code",
      telefonVorwahlTooShort: "At least two digits.",
      geburtsdatumTooYoung:
        "You must be at least 18 years old to apply for a loan.",
      geburtsdatumImplausible: "Please check the date of birth.",
    },
    step5: {
      eyebrow: "5/8 · Address",
      title: "Where do you",
      highlight: "live?",
      subtitle: "Your current registered address.",
      trust: [
        "Credit-score-neutral request",
        "SSL-encrypted transmission",
        "Free and non-binding",
      ],
      strasse: "Street",
      hausnummer: "House number",
      plz: "Postal code",
      ort: "City",
      ortPlaceholder: "Please select a city",
      ortAwaitingPlz: "Enter a postal code first",
      plzChecking: "Checking postal code …",
      plzUnknown: "This postal code does not exist in Germany.",
      plzLookupFailed: "Check currently unavailable. Please try again later.",
      plzVerified: "Postal code confirmed",
      strasseInvalid: "Please enter a valid street name.",
      strasseUnknown:
        "We do not know this street for that postal code. Please check the spelling or pick one from the list.",
      strasseNoData: "No street directory is available for this postal code.",
      strasseVerified: "Address confirmed",
      hausnummerInvalid: "Please enter a valid house number, e.g. 12a.",
      addressNote:
        "Postal code and city are checked against the official directory.",
    },
    step6: {
      eyebrow: "6/8 · Employment",
      title: "Your employment",
      highlight: "situation.",
      subtitle: "Details about your employment.",
      trust: [
        "Credit-score-neutral request",
        "SSL-encrypted transmission",
        "Free and non-binding",
      ],
      beschaeftigungsart: "Employment type",
      beschaeftigungsartPlaceholder: "Please choose",
      beschaeftigungsartOptions: [
        "Employed",
        "Civil servant",
        "Self-employed",
        "Retired",
        "Apprentice",
        "Other",
      ],
      arbeitgeber: "Employer",
      beschaeftigtSeit: "Employed since",
      monat: "Month",
      jahr: "Year",
      auswahlPlatzhalter: "–",
    },
    step7: {
      eyebrow: "7/8 · Income",
      title: "Your monthly",
      highlight: "income.",
      subtitle: "Income, expenses and any loans you already have.",
      trust: [
        "Credit-score-neutral request",
        "SSL-encrypted transmission",
        "Free and non-binding",
      ],
      einnahmenTitel: "Monthly income",
      einnahmenText:
        "Banks need your monthly income for the affordability check they run to work out your offer.",
      nettoeinkommen: "Your net income",
      mieteinnahmenFrage: "Do you have rental income?",
      mieteinnahmenBetrag: "Monthly gross rental income",
      ausgabenTitel: "Monthly expenses",
      ausgabenText: "Your expenses are part of the same affordability check.",
      wohnnebenkosten: "Housing running costs",
      wohnnebenkostenHinweis:
        "Costs such as water, heating, waste collection and parking. Electricity does not belong here.",
      weitereAusgabenFrage: "Do you have any other expenses?",
      krankenversicherung: "Private health insurance",
      unterhalt: "Maintenance payments",
      krediteTitel: "Existing loans",
      kreditFrage: "Do you have any existing loans?",
      kreditartTitel: "Type of loan",
      kreditarten: [
        "Personal loan",
        "Car loan",
        "Leasing",
        "Overdraft",
        "Credit card",
        "Credit line",
        "Instalments (e.g. Klarna, PayPal)",
      ],
      kreditartAndere: "Other",
      kreditartenWeitere: ["Loan with balloon payment"],
      kreditNummer: "Existing loan",
      kreditBetrag: "Loan amount",
      kreditRate: "Monthly payment",
      kreditAuszahlung: "Date of payout",
      monat: "Month",
      jahr: "Year",
      auswahlPlatzhalter: "Please select",
      kreditLaufzeit: "Total term",
      laufzeitHinweis: "Enter in months",
      jahre: "years",
      monate: "months",
      kreditZins: "Effective annual rate",
      kreditZinsHinweis:
        "If you know it, the balance gets more precise. Otherwise it follows from amount, payment and term.",
      kreditRestschuld: "Balance outstanding",
      schaetzung: "estimated balance at {zins} % p.a.:",
      uebernehmen: "use this",
      schaetzungFehlt:
        "An estimate still needs the amount, payment, payout date and either the term or the rate.",
      zinsWarnung:
        "Your figures imply an interest rate above {grenze} % p.a. — please check. The estimate uses {grenze} %.",
      abbezahlt: "According to these figures the loan is already repaid.",
      bank: "Bank holding the loan",
      iban: "IBAN of the existing loan",
      optional: "optional",
      ja: "yes",
      nein: "no",
      kreditEntfernen: "remove this loan",
      kreditHinzufuegen: "add an existing loan",
    },
    step8: {
      eyebrow: "8/8 · Bank details",
      title: "Your bank",
      highlight: "details.",
      subtitle: "For payout after approval.",
      trust: [
        "Credit-score-neutral request",
        "SSL-encrypted transmission",
        "Free and non-binding",
      ],
      iban: "IBAN",
      ibanError: "Please enter a valid IBAN.",
      bankname: "Bank name",
      kontoinhaber: "Account holder",
      sendeFehler: "The application could not be submitted. Please try again.",
      sendet: "Sending",
    },
    confirmation: {
      title: "Application",
      highlight: "received.",
      subtitle:
        "Thank you. Your details have been summarized — an advisor typically reaches out within one business day.",
      summaryLabel: "Your details at a glance",
      summaryKreditart: "Loan type",
      summaryPersonen: "Applicants",
      summaryName: "Name",
      disclaimerTitle: "About this demo",
      disclaimer:
        "This is a demo interface with no connected backend. No data was stored or transmitted to any bank.",
      ctaHome: "Back to homepage",
    },
  },
};
