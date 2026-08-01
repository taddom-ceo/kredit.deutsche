export interface WizardOption {
  id: string;
  title: string;
  description: string;
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
    nachname: string;
    geburtsdatum: string;
    email: string;
    telefon: string;
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
          id: "privatkredit",
          title: "Privatkredit",
          description: "Kredit zur freien Verwendung",
        },
        {
          id: "autokredit",
          title: "Autokredit",
          description: "Neu- oder Gebrauchtwagen",
        },
        {
          id: "umschuldung",
          title: "Umschuldung",
          description: "Bestehende Kredite zusammenfassen",
        },
        {
          id: "baufinanzierung",
          title: "Baufinanzierung",
          description: "Hauskauf oder Neubau",
        },
        {
          id: "kreditkarte",
          title: "Kreditkarte",
          description: "Neue Kreditkarte beantragen",
        },
      ],
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
        { value: "anschaffung", label: "Anschaffung" },
        { value: "umschuldung", label: "Umschuldung / Dispo-Ablöse" },
        { value: "renovierung", label: "Renovierung" },
        { value: "fahrzeug", label: "Fahrzeugkauf" },
        { value: "reise", label: "Reise" },
        { value: "sonstiges", label: "Sonstiges" },
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
      nachname: "Nachname",
      geburtsdatum: "Geburtsdatum",
      email: "E-Mail-Adresse",
      telefon: "Telefonnummer",
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
          id: "privatkredit",
          title: "Personal loan",
          description: "For free use",
        },
        {
          id: "autokredit",
          title: "Car loan",
          description: "New or used vehicle",
        },
        {
          id: "umschuldung",
          title: "Debt consolidation",
          description: "Combine existing loans",
        },
        {
          id: "baufinanzierung",
          title: "Mortgage",
          description: "Buying or building a home",
        },
        {
          id: "kreditkarte",
          title: "Credit card",
          description: "Apply for a new card",
        },
      ],
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
        { value: "anschaffung", label: "Purchase" },
        { value: "umschuldung", label: "Debt consolidation" },
        { value: "renovierung", label: "Renovation" },
        { value: "fahrzeug", label: "Vehicle purchase" },
        { value: "reise", label: "Travel" },
        { value: "sonstiges", label: "Other" },
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
      nachname: "Last name",
      geburtsdatum: "Date of birth",
      email: "Email address",
      telefon: "Phone number",
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
