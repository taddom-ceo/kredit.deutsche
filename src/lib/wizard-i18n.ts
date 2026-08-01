export interface WizardOption {
  id: string;
  title: string;
  description: string;
  // Optionaler Hinweis, der als Kurzinfo an der Karte eingeblendet wird.
  hinweis?: string;
}

export interface WizardTranslations {
  progress: {
    stepLabels: string[];
    timeRemaining: string;
    stepAriaPrefix: string;
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
    options: WizardOption[];
    haeufigLabel: string;
    weitereLabel: string;
    hinweisOeffnen: string;
    hinweisSchliessen: string;
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
    purposeOptions: { value: string; label: string }[];
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
    nettoeinkommen: string;
    ausgaben: string;
    ausgabenHint: string;
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
      saved: "Gespeichert",
    },
    nav: {
      back: "Zurück",
      next: "Weiter",
      submit: "Antrag absenden",
    },
    step1: {
      eyebrow: "1/8 · Kreditart",
      title: "Welche Art Kredit",
      highlight: "suchen Sie?",
      subtitle:
        "Wählen Sie das Produkt, das Ihrem Bedarf am nächsten kommt, damit wir das passende Angebot finden.",
      options: [
        {
          id: "frei",
          title: "Freie Verwendung",
          description: "Ohne festgelegten Zweck",
        },
        {
          id: "fahrzeug",
          title: "Fahrzeugkauf",
          description: "Neu- oder Gebrauchtwagen",
          hinweis:
            "Viele Banken verlangen weder einen Verwendungsnachweis noch die Hinterlegung des Kfz-Briefs. Über diesen Verwendungszweck sind aktuell die besten Zinsen möglich.",
        },
        {
          id: "umschuldung",
          title: "Umschuldung/Kredit ablösen",
          description: "Bestehende Kredite zusammenfassen",
          hinweis:
            "Eine Umschuldung fasst laufende Kredite zusammen: Das senkt die monatliche Ratenbelastung und verbessert in der Regel die Bonität.",
        },
        {
          id: "modernisierung",
          title: "Modernisierung/Baufinanzierung",
          description: "Umbau, Sanierung oder Hauskauf",
        },
        {
          id: "dispo",
          title: "Dispo/Kreditkarten Ausgleich",
          description: "Teure Kontoüberziehung ausgleichen",
        },
        {
          id: "ratenkauf",
          title: "Tilgung Ratenkauf",
          description: "Laufende Ratenkäufe ablösen",
        },
        {
          id: "ebike",
          title: "E-Bike",
          description: "Pedelec oder E-Bike",
        },
        {
          id: "kueche",
          title: "Küche",
          description: "Einbauküche oder Geräte",
        },
        {
          id: "moebel",
          title: "Möbel",
          description: "Einrichtung und Möbel",
        },
        {
          id: "umzug",
          title: "Umzug",
          description: "Umzug und Nebenkosten",
        },
        {
          id: "reise",
          title: "Reise",
          description: "Urlaub oder größere Reise",
        },
      ],
      haeufigLabel: "Häufig gewählt",
      weitereLabel: "Weitere Zwecke",
      hinweisOeffnen: "Hinweis anzeigen",
      hinweisSchliessen: "Hinweis schließen",
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
      purposeOptions: [
        { value: "frei", label: "Freie Verwendung" },
        { value: "fahrzeug", label: "Fahrzeugkauf" },
        { value: "umschuldung", label: "Umschuldung/Kredit ablösen" },
        { value: "modernisierung", label: "Modernisierung/Baufinanzierung" },
        { value: "dispo", label: "Dispo/Kreditkarten Ausgleich" },
        { value: "ratenkauf", label: "Tilgung Ratenkauf" },
        { value: "ebike", label: "E-Bike" },
        { value: "kueche", label: "Küche" },
        { value: "moebel", label: "Möbel" },
        { value: "umzug", label: "Umzug" },
        { value: "reise", label: "Reise" },
      ],
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
      subtitle: "Angaben zu Einnahmen und laufenden Ausgaben.",
      trust: [
        "SCHUFA-neutrale Anfrage",
        "SSL-verschlüsselte Übertragung",
        "Kostenlos und unverbindlich",
      ],
      nettoeinkommen: "Monatliches Nettoeinkommen",
      ausgaben: "Monatliche Ausgaben (Miete, Kredite, ...)",
      ausgabenHint: "Ohne Lebenshaltungskosten",
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
      saved: "Saved",
    },
    nav: {
      back: "Back",
      next: "Next",
      submit: "Submit application",
    },
    step1: {
      eyebrow: "1/8 · Loan type",
      title: "What kind of loan",
      highlight: "are you looking for?",
      subtitle:
        "Choose the product that fits your needs so we can find the right offer.",
      options: [
        {
          id: "frei",
          title: "General purpose",
          description: "No specific purpose",
        },
        {
          id: "fahrzeug",
          title: "Vehicle purchase",
          description: "New or used car",
          hinweis:
            "Many banks require neither proof of use nor the vehicle registration document as security. This purpose currently offers the best rates.",
        },
        {
          id: "umschuldung",
          title: "Debt consolidation/loan repayment",
          description: "Combine existing loans",
          hinweis:
            "Consolidating existing loans lowers your monthly instalment burden and usually improves your credit rating.",
        },
        {
          id: "modernisierung",
          title: "Modernisation/mortgage",
          description: "Renovation, refurbishment or home purchase",
        },
        {
          id: "dispo",
          title: "Overdraft/credit card settlement",
          description: "Settle an expensive overdraft",
        },
        {
          id: "ratenkauf",
          title: "Instalment purchase repayment",
          description: "Pay off running instalment plans",
        },
        {
          id: "ebike",
          title: "E-bike",
          description: "Pedelec or e-bike",
        },
        {
          id: "kueche",
          title: "Kitchen",
          description: "Fitted kitchen or appliances",
        },
        {
          id: "moebel",
          title: "Furniture",
          description: "Furnishings and furniture",
        },
        {
          id: "umzug",
          title: "Moving",
          description: "Relocation and related costs",
        },
        {
          id: "reise",
          title: "Travel",
          description: "Holiday or longer trip",
        },
      ],
      haeufigLabel: "Frequently chosen",
      weitereLabel: "Other purposes",
      hinweisOeffnen: "Show details",
      hinweisSchliessen: "Close details",
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
      purposeOptions: [
        { value: "frei", label: "General purpose" },
        { value: "fahrzeug", label: "Vehicle purchase" },
        { value: "umschuldung", label: "Debt consolidation/loan repayment" },
        { value: "modernisierung", label: "Modernisation/mortgage" },
        { value: "dispo", label: "Overdraft/credit card settlement" },
        { value: "ratenkauf", label: "Instalment purchase repayment" },
        { value: "ebike", label: "E-bike" },
        { value: "kueche", label: "Kitchen" },
        { value: "moebel", label: "Furniture" },
        { value: "umzug", label: "Moving" },
        { value: "reise", label: "Travel" },
      ],
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
      subtitle: "Details about your income and ongoing expenses.",
      trust: [
        "Credit-score-neutral request",
        "SSL-encrypted transmission",
        "Free and non-binding",
      ],
      nettoeinkommen: "Monthly net income",
      ausgaben: "Monthly expenses (rent, loans, ...)",
      ausgabenHint: "Excluding cost of living",
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
