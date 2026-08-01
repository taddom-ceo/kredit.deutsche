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
  };
  features: { title: string; description: string }[];
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
  },
};
