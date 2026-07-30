export type Language = "de" | "en";

export const translations = {
  de: {
    nav: {
      kontakt: "Kontakt",
    },
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
      totalLabel: "Gesamtbetrag",
      rateLabel: "eff. Jahreszins",
      cta: "Unverbindliches Angebot anfragen",
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
    contact: {
      heading: "Kontakt aufnehmen",
      name: "Name",
      email: "E-Mail",
      message: "Nachricht",
      submit: "Absenden",
      submitting: "Wird gesendet…",
      success: "Danke! Wir melden uns in Kürze bei dir.",
      genericError: "Etwas ist schiefgelaufen.",
      validationError: "Bitte alle Felder ausfüllen.",
    },
  },
  en: {
    nav: {
      kontakt: "Contact",
    },
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
      totalLabel: "Total amount",
      rateLabel: "effective annual rate",
      cta: "Request a non-binding offer",
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
    contact: {
      heading: "Get in touch",
      name: "Name",
      email: "Email",
      message: "Message",
      submit: "Submit",
      submitting: "Sending…",
      success: "Thanks! We'll get back to you shortly.",
      genericError: "Something went wrong.",
      validationError: "Please fill in all fields.",
    },
  },
} as const;

export type Translations = (typeof translations)["de"];
