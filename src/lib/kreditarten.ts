import type { Language } from "./i18n";

/**
 * Die Verwendungszwecke — einmal hinterlegt, an drei Stellen benutzt:
 * als Kacheln auf der Startseite, als eigene Landingpage je Zweck und als
 * erster Schritt der Antragsstrecke.
 *
 * Vorher stand die Liste dreifach da (Landingpages, Schritt 1, Auswahlfeld auf
 * Schritt 2), jeweils zweisprachig. Ein neuer Zweck hätte also an sechs
 * Stellen ergänzt werden müssen, und schon eine vergessene hätte die Strecke
 * still auseinanderlaufen lassen. Jetzt reicht ein Eintrag hier.
 *
 * Die Kennung `id` ist der Wert, der im Antrag gespeichert wird. Die Adresse
 * (`slug`) steht getrennt davon, weil sie nach anderen Regeln gebildet wird:
 * Sie soll das Wort enthalten, nach dem gesucht wird ("autokredit"), nicht die
 * interne Kennung ("fahrzeug"). Einmal veröffentlicht, darf sie sich nicht
 * mehr ändern — jede Adresse ist ein Suchergebnis, das sonst ins Leere liefe.
 */
export type KreditartInhalt = {
  /** Produktname. Trägt das Wort, nach dem gesucht wird. */
  name: string;
  /**
   * Der Wunsch in Kundensprache, in zwei Teilen — und die Teilung ist kein
   * Schmuck, sondern der Kern der Gestaltung.
   *
   * `wunschVor` ist der Anlauf ("Ich möchte ein"). Er steht auf fast jeder
   * Kachel gleich und unterscheidet damit nichts. Früher führte er die Zeile
   * an und drängte das eigentliche Wort an die dritte Stelle — beim
   * Überfliegen las man sechsmal "Ich möchte".
   *
   * `wunschKern` ist das, worum es geht ("Auto kaufen"). Er steht groß und
   * beginnt die Zeile, an der das Auge hängen bleibt.
   *
   * Zwei Felder statt einer Teilzeichenkette: Die Teilung entscheidet über
   * den Aufbau der Kachel, nicht nur über eine Farbe. Sie darf deshalb nicht
   * daran scheitern können, dass eine Suche ins Leere läuft.
   */
  wunschVor: string;
  wunschKern: string;
  /** Nutzenzeile unter dem Wunsch. */
  teaser: string;
  /** Der eine Vorteil, der auf einen Blick hängen bleibt. Ohne Haken — den
      setzt die Kachel selbst. */
  vorteil: string;
  /** Kurzinfo hinter dem ⓘ auf Schritt 1 des Antrags. */
  hinweis?: string;
  /** Erste Zeile der Hauptüberschrift auf der Landingpage. */
  h1: string;
  /** Zweite, hervorgehobene Zeile der Hauptüberschrift. */
  h1Highlight: string;
  /** Titel im Browsertab und im Suchergebnis. Unter 60 Zeichen bleiben. */
  metaTitel: string;
  /** Text unter dem Suchergebnis. Zwischen 120 und 160 Zeichen. */
  metaBeschreibung: string;
  /** Einleitung unter der Überschrift. */
  intro: string;
  /** Worauf es bei dieser Kreditart ankommt. */
  punkte: { titel: string; text: string }[];
  /** Fragen, die zu dieser Kreditart immer wieder gestellt werden. */
  faq: { frage: string; antwort: string }[];
};

export type Kreditart = {
  id: string;
  slug: string;
  /**
   * Farbe des Zeichens auf der Kachel. Sprachunabhängig, deshalb hier und
   * nicht im Inhalt.
   *
   * Sie ist der eigentliche Unterscheider: Sechzehn gleich aussehende Kacheln
   * zwingen zum Lesen. Zeichen und Farbe zusammen sagen die Art schon, bevor
   * der Text an der Reihe ist. Die Werte sind so gewählt, dass benachbarte
   * Kacheln im Dreierraster nie dieselbe Richtung treffen.
   */
  farbe: string;
  /** Voreinstellung des Rechners — ein für diesen Zweck üblicher Betrag. */
  betrag: number;
  /** Voreinstellung des Rechners in Monaten. */
  monate: number;
  de: KreditartInhalt;
  en: KreditartInhalt;
};

/**
 * Reihenfolge nach erwarteter Nachfrage. Sie bestimmt mehr als die Optik:
 * Die ersten vier gelten als häufig gewählt und stehen im Antrag in einer
 * eigenen Gruppe, die ersten fünf stehen dort sofort sichtbar.
 */
export const KREDITARTEN: Kreditart[] = [
  {
    id: "frei",
    slug: "privatkredit",
    farbe: "#34d399",
    betrag: 20000,
    monate: 72,
    de: {
      name: "Privatkredit",
      wunschVor: "Ich möchte Geld",
      wunschKern: "zur freien Verfügung",
      teaser: "Freie Verwendung – für alles, was Ihnen wichtig ist.",
      vorteil: "freie Verwendung",
      hinweis:
        "Sie müssen nicht angeben, wofür das Geld gedacht ist, und keine Belege nachreichen. Das ist der flexibelste Weg — und meist auch der schnellste bis zur Auszahlung.",
      h1: "Privatkredit",
      h1Highlight: "ohne festen Zweck.",
      metaTitel: "Privatkredit ohne Verwendungszweck vergleichen",
      metaBeschreibung:
        "Privatkredit zur freien Verwendung: Betrag und Laufzeit einstellen, Rate sofort sehen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Ein Kredit zur freien Verwendung ist an keinen Zweck gebunden. Sie müssen der Bank nicht sagen, wofür das Geld gedacht ist, und keine Rechnungen oder Kaufverträge nachreichen — das macht ihn zur flexibelsten und meist auch schnellsten Form der Finanzierung.",
      punkte: [
        {
          titel: "Kein Verwendungsnachweis",
          text: "Sie geben im Antrag keinen Zweck an und reichen keine Belege nach. Das verkürzt die Bearbeitung, weil die Bank nichts zusätzlich prüfen muss.",
        },
        {
          titel: "Auszahlung auf Ihr Konto",
          text: "Der Betrag geht als Ganzes auf Ihr Girokonto. Sie entscheiden danach frei, wie Sie ihn einsetzen — auch verteilt auf mehrere Anschaffungen.",
        },
        {
          titel: "Feste Rate über die gesamte Laufzeit",
          text: "Zins und Rate stehen bei Vertragsschluss fest und ändern sich nicht mehr. Sie wissen vom ersten Monat an, was der Kredit insgesamt kostet.",
        },
        {
          titel: "Sondertilgung meist kostenfrei",
          text: "Bei den meisten Angeboten können Sie jederzeit zusätzlich tilgen oder den Kredit ganz ablösen. Ob das möglich ist, steht bei jedem Angebot dabei.",
        },
      ],
      faq: [
        {
          frage: "Muss ich angeben, wofür ich den Kredit brauche?",
          antwort:
            "Nein. Bei der freien Verwendung entfällt die Zweckbindung vollständig. Sie können den Betrag einsetzen, wie Sie möchten.",
        },
        {
          frage: "Welche Beträge und Laufzeiten sind möglich?",
          antwort:
            "Über den Rechner auf dieser Seite von 1.000 € bis 100.000 € bei Laufzeiten zwischen 12 und 240 Monaten. Welcher Rahmen für Sie tatsächlich möglich ist, hängt von Einkommen und Bonität ab.",
        },
        {
          frage: "Wirkt sich die Anfrage auf meine Schufa aus?",
          antwort:
            "Nein. Wir stellen eine Konditionsanfrage. Sie ist für andere Banken nicht sichtbar und verändert Ihren Score nicht — anders als eine echte Kreditanfrage.",
        },
      ],
    },
    en: {
      name: "Personal loan",
      wunschVor: "I want money",
      wunschKern: "to spend freely",
      teaser: "Spend it freely — on whatever matters to you.",
      vorteil: "no restrictions",
      hinweis:
        "You do not have to say what the money is for and you submit no receipts. It is the most flexible route — and usually the fastest to payout.",
      h1: "A personal loan",
      h1Highlight: "with no fixed purpose.",
      metaTitel: "Compare personal loans with no fixed purpose",
      metaBeschreibung:
        "A personal loan you can spend freely: set the amount and term, see your instalment straight away and compare 20+ banks with no effect on your credit score.",
      intro:
        "A loan for general use is not tied to a purpose. You do not have to tell the bank what the money is for and you do not submit invoices or purchase contracts — which makes it the most flexible and usually the fastest form of financing.",
      punkte: [
        {
          titel: "No proof of use",
          text: "You state no purpose in the application and submit no receipts. That shortens processing, because the bank has nothing extra to check.",
        },
        {
          titel: "Paid into your account",
          text: "The full amount goes to your current account. What you spend it on afterwards is up to you — including across several purchases.",
        },
        {
          titel: "A fixed instalment for the whole term",
          text: "The rate and the instalment are fixed when the contract is signed and do not change. You know from month one what the loan costs in total.",
        },
        {
          titel: "Early repayment usually free",
          text: "With most offers you can repay extra at any time or clear the loan entirely. Whether that is possible is stated with every offer.",
        },
      ],
      faq: [
        {
          frage: "Do I have to say what I need the loan for?",
          antwort:
            "No. With a general-purpose loan there is no restriction at all. You can use the money however you like.",
        },
        {
          frage: "What amounts and terms are possible?",
          antwort:
            "The calculator on this page covers €1,000 to €100,000 over 12 to 240 months. What is actually available to you depends on your income and creditworthiness.",
        },
        {
          frage: "Does the enquiry affect my credit score?",
          antwort:
            "No. We make a conditions enquiry. It is not visible to other banks and does not change your score — unlike an actual credit application.",
        },
      ],
    },
  },
  {
    id: "fahrzeug",
    slug: "autokredit",
    farbe: "#38bdf8",
    betrag: 25000,
    monate: 72,
    de: {
      name: "Autokredit",
      wunschVor: "Ich möchte ein",
      wunschKern: "Auto kaufen",
      teaser: "Günstige Finanzierung für Neu- und Gebrauchtwagen.",
      vorteil: "häufig günstigere Zinsen",
      hinweis:
        "Viele Banken verlangen weder einen Verwendungsnachweis noch die Hinterlegung des Kfz-Briefs. Über diesen Verwendungszweck sind häufig besonders günstige Zinsen möglich.",
      h1: "Autokredit",
      h1Highlight: "für Neu- und Gebrauchtwagen.",
      metaTitel: "Autokredit vergleichen: Neu- und Gebrauchtwagen",
      metaBeschreibung:
        "Autokredit statt Händlerfinanzierung: Rate berechnen, über 20 Banken Schufa-neutral vergleichen und beim Händler als Barzahler auftreten. Kostenlos.",
      intro:
        "Mit einem Autokredit finanzieren Sie Neu- oder Gebrauchtwagen unabhängig vom Händler. Weil das Geld auf Ihr Konto geht, treten Sie beim Kauf als Barzahler auf und verhandeln über den Preis statt über die Monatsrate.",
      punkte: [
        {
          titel: "Barzahlerrabatt beim Händler",
          text: "Sie zahlen den Wagen aus eigenem Geld. Der Nachlass, den Händler auf Barzahlung geben, gleicht einen Teil der Zinskosten häufig schon aus.",
        },
        {
          titel: "Der Kfz-Brief bleibt meist bei Ihnen",
          text: "Viele Banken verzichten auf die Sicherungsübereignung. Das Fahrzeug gehört Ihnen vom ersten Tag an und lässt sich jederzeit weiterverkaufen.",
        },
        {
          titel: "Unabhängig von der Händlerfinanzierung",
          text: "Die Finanzierung am Verkaufstresen ist an das Modell und oft an eine Schlussrate gebunden. Ein eigener Kredit ist beides nicht.",
        },
        {
          titel: "Keine Schlussrate",
          text: "Anders als bei einer Ballonfinanzierung ist der Kredit am Ende der Laufzeit vollständig getilgt. Es bleibt kein Restbetrag offen, der neu finanziert werden müsste.",
        },
      ],
      faq: [
        {
          frage: "Brauche ich den Kaufvertrag für den Antrag?",
          antwort:
            "Für die Berechnung nicht. Manche Banken fragen ihn vor der Auszahlung ab, viele verzichten ganz darauf. Was verlangt wird, steht im Angebot.",
        },
        {
          frage: "Macht es einen Unterschied, ob Neu- oder Gebrauchtwagen?",
          antwort:
            "Für den Kredit selbst nicht. Sie erhalten den Betrag auf Ihr Konto und entscheiden, wo und was Sie kaufen — auch von privat.",
        },
        {
          frage: "Kann ich den Wagen während der Laufzeit verkaufen?",
          antwort:
            "Solange der Kfz-Brief bei Ihnen liegt, ja. Die Restschuld können Sie anschließend mit dem Verkaufserlös ablösen.",
        },
      ],
    },
    en: {
      name: "Car loan",
      wunschVor: "I want to",
      wunschKern: "buy a car",
      teaser: "Affordable financing for new and used cars.",
      vorteil: "often better rates",
      hinweis:
        "Many banks ask for neither proof of use nor the registration document as security. This purpose often carries particularly good rates.",
      h1: "A car loan",
      h1Highlight: "for new and used cars.",
      metaTitel: "Compare car loans for new and used cars",
      metaBeschreibung:
        "A car loan instead of dealer financing: calculate your instalment, compare 20+ banks with no effect on your credit score and buy as a cash buyer.",
      intro:
        "A car loan lets you finance a new or used car independently of the dealer. Because the money lands in your account, you buy as a cash buyer and negotiate the price rather than the monthly instalment.",
      punkte: [
        {
          titel: "Cash-buyer discount at the dealer",
          text: "You pay for the car with your own money. The discount dealers give for cash often offsets a good part of the interest.",
        },
        {
          titel: "The registration document usually stays with you",
          text: "Many banks waive the transfer of ownership as security. The car is yours from day one and can be sold at any time.",
        },
        {
          titel: "Independent of dealer financing",
          text: "Financing at the sales desk is tied to the model and often to a balloon payment. Your own loan is tied to neither.",
        },
        {
          titel: "No balloon payment",
          text: "Unlike balloon financing, the loan is fully repaid at the end of the term. No remaining balance is left to refinance.",
        },
      ],
      faq: [
        {
          frage: "Do I need the purchase contract to apply?",
          antwort:
            "Not for the calculation. Some banks ask for it before paying out, many do not ask at all. Whatever is required is stated in the offer.",
        },
        {
          frage: "Does it matter whether the car is new or used?",
          antwort:
            "Not for the loan itself. You receive the money in your account and decide where and what you buy — including privately.",
        },
        {
          frage: "Can I sell the car during the term?",
          antwort:
            "As long as the registration document is with you, yes. You can then clear the remaining balance with the proceeds.",
        },
      ],
    },
  },
  {
    id: "umschuldung",
    slug: "umschuldung",
    farbe: "#a78bfa",
    betrag: 30000,
    monate: 84,
    de: {
      name: "Umschuldung",
      wunschVor: "Ich möchte",
      wunschKern: "Kredite zusammenfassen",
      teaser: "Kredite zusammenfassen und monatliche Rate reduzieren.",
      vorteil: "Rate oft deutlich senken",
      hinweis:
        "Eine Umschuldung fasst laufende Kredite zusammen: Das senkt die monatliche Ratenbelastung und verbessert in der Regel die Bonität.",
      h1: "Umschuldung:",
      h1Highlight: "mehrere Kredite, eine Rate.",
      metaTitel: "Umschuldung: Kredite ablösen und zusammenfassen",
      metaBeschreibung:
        "Laufende Kredite zu einer Rate zusammenfassen: neue Rate berechnen, über 20 Banken Schufa-neutral vergleichen und die monatliche Belastung senken.",
      intro:
        "Bei einer Umschuldung lösen Sie laufende Kredite mit einem neuen ab. Aus mehreren Raten wird eine, und die Laufzeit lässt sich so wählen, dass die monatliche Belastung sinkt.",
      punkte: [
        {
          titel: "Eine Rate statt vieler",
          text: "Alle abgelösten Verträge enden. Es bleibt ein Vertrag mit einem Termin und einem Zinssatz — das ist leichter zu überblicken und schwerer zu vergessen.",
        },
        {
          titel: "Niedrigere Monatsbelastung",
          text: "Über eine längere Laufzeit sinkt die Rate. Dabei können die Gesamtkosten steigen — der Rechner zeigt beides nebeneinander, damit die Entscheidung auf Zahlen steht.",
        },
        {
          titel: "Alte Verträge sind ablösbar",
          text: "Verbraucherdarlehen dürfen jederzeit vorzeitig zurückgezahlt werden. Die Vorfälligkeitsentschädigung ist gesetzlich gedeckelt: höchstens 1 % der Restschuld, bei weniger als zwölf Monaten Restlaufzeit höchstens 0,5 %.",
        },
        {
          titel: "Weniger Verträge, bessere Bewertung",
          text: "Wenige laufende Verpflichtungen wirken sich in der Regel günstig darauf aus, wie Banken Ihre Bonität einschätzen.",
        },
      ],
      faq: [
        {
          frage: "Welche Kredite kann ich umschulden?",
          antwort:
            "Ratenkredite, Autokredite, Ratenkäufe und den Dispo. Im Antrag geben Sie jeden laufenden Vertrag mit Restschuld und Rate an.",
        },
        {
          frage: "Lohnt sich eine Umschuldung immer?",
          antwort:
            "Nein. Sie lohnt sich, wenn der neue effektive Jahreszins unter dem alten liegt oder die Rate spürbar sinken soll. Vergleichen Sie dafür die Gesamtkosten, nicht nur die Monatsrate.",
        },
        {
          frage: "Kostet die Ablösung des alten Kredits etwas?",
          antwort:
            "Bei Verbraucherdarlehen ist die Entschädigung gesetzlich begrenzt: höchstens 1 % der Restschuld, bei einer Restlaufzeit unter zwölf Monaten höchstens 0,5 %.",
        },
      ],
    },
    en: {
      name: "Debt consolidation",
      wunschVor: "I want to",
      wunschKern: "combine my loans",
      teaser: "Combine your loans and reduce the monthly payment.",
      vorteil: "often a much lower instalment",
      hinweis:
        "Consolidation combines running loans into one: it lowers the monthly burden and usually improves how banks assess you.",
      h1: "Consolidation:",
      h1Highlight: "several loans, one instalment.",
      metaTitel: "Debt consolidation: clear and combine loans",
      metaBeschreibung:
        "Combine running loans into a single instalment: calculate the new payment, compare 20+ banks with no effect on your credit score and lower your monthly load.",
      intro:
        "Consolidation means clearing your running loans with a new one. Several instalments become one, and the term can be chosen so that the monthly burden goes down.",
      punkte: [
        {
          titel: "One instalment instead of many",
          text: "Every loan you clear comes to an end. What remains is one contract with one due date and one rate — easier to keep track of and harder to forget.",
        },
        {
          titel: "A lower monthly burden",
          text: "A longer term means a smaller instalment. Total cost can rise in the process — the calculator shows both side by side so the decision rests on figures.",
        },
        {
          titel: "Existing contracts can be cleared",
          text: "Consumer loans may be repaid early at any time. The early repayment fee is capped by law: at most 1 % of the outstanding balance, or 0.5 % with less than twelve months to run.",
        },
        {
          titel: "Fewer contracts, better assessment",
          text: "Few running obligations generally work in your favour when banks assess your creditworthiness.",
        },
      ],
      faq: [
        {
          frage: "Which loans can I consolidate?",
          antwort:
            "Instalment loans, car loans, retail instalment plans and your overdraft. In the application you list each running contract with its balance and instalment.",
        },
        {
          frage: "Is consolidating always worth it?",
          antwort:
            "No. It pays off when the new effective annual rate is below the old one, or when the instalment needs to come down noticeably. Compare total cost, not just the monthly figure.",
        },
        {
          frage: "Does clearing the old loan cost anything?",
          antwort:
            "For consumer loans the fee is capped by law: at most 1 % of the outstanding balance, or 0.5 % if less than twelve months remain.",
        },
      ],
    },
  },
  {
    id: "modernisierung",
    slug: "modernisierungskredit",
    farbe: "#fbbf24",
    betrag: 50000,
    monate: 120,
    de: {
      name: "Modernisierungskredit",
      wunschVor: "Ich möchte",
      wunschKern: "renovieren oder sanieren",
      teaser:
        "Renovieren, modernisieren oder energetisch sanieren – ohne Grundschuldeintrag.",
      vorteil: "ohne Grundschuldeintrag",
      hinweis:
        "Für Umbau und Sanierung ist meist kein Grundbucheintrag nötig — das spart Notarkosten und Wochen an Bearbeitungszeit. Viele Banken vergeben hier längere Laufzeiten und damit niedrigere Monatsraten.",
      h1: "Modernisierungskredit",
      h1Highlight: "ohne Grundbucheintrag.",
      metaTitel: "Modernisierungskredit: Umbau und Sanierung",
      metaBeschreibung:
        "Modernisierung ohne Grundbucheintrag finanzieren: Rate berechnen, lange Laufzeiten vergleichen und über 20 Banken Schufa-neutral anfragen.",
      intro:
        "Ein Modernisierungskredit finanziert Umbau, Sanierung und Renovierung, ohne dass die Immobilie als Sicherheit in das Grundbuch eingetragen wird. Das spart Notar- und Grundbuchkosten und mehrere Wochen Bearbeitungszeit.",
      punkte: [
        {
          titel: "Ohne Grundschuld und Notartermin",
          text: "Es wird keine Sicherheit eingetragen. Damit entfallen Notar- und Grundbuchgebühren, und die Zusage kommt in Tagen statt in Wochen.",
        },
        {
          titel: "Längere Laufzeiten als beim Ratenkredit",
          text: "Weil Modernisierungen den Wert der Immobilie erhalten, vergeben viele Banken hier längere Laufzeiten — und damit niedrigere Monatsraten.",
        },
        {
          titel: "Neben Förderung einsetzbar",
          text: "Zuschüsse und Förderkredite für energetische Sanierung schließen einen Modernisierungskredit nicht aus. Sie können damit den Eigenanteil abdecken.",
        },
        {
          titel: "Handwerker sofort bezahlen",
          text: "Das Geld geht auf Ihr Konto, nicht an das Bauunternehmen. Rechnungen begleichen Sie direkt und können Skonto ziehen.",
        },
      ],
      faq: [
        {
          frage: "Wann brauche ich stattdessen eine Baufinanzierung?",
          antwort:
            "Für den Kauf einer Immobilie führt in der Regel kein Weg an einer grundbuchbesicherten Baufinanzierung vorbei. Für Umbau, Sanierung und Renovierung ist der Modernisierungskredit der schnellere Weg.",
        },
        {
          frage: "Muss ich Rechnungen oder Kostenvoranschläge einreichen?",
          antwort:
            "Viele Banken verzichten darauf. Wenn Nachweise verlangt werden, steht das im Angebot, bevor Sie sich entscheiden.",
        },
        {
          frage: "Geht das auch als Mieter?",
          antwort:
            "Ja. Weil keine Sicherheit an der Immobilie eingetragen wird, ist der Kredit nicht an Eigentum gebunden.",
        },
      ],
    },
    en: {
      name: "Home improvement loan",
      wunschVor: "I want to",
      wunschKern: "renovate my home",
      teaser:
        "Renovate, modernise or improve energy efficiency — with no land charge.",
      vorteil: "no land charge",
      hinweis:
        "Conversion and renovation usually need no land register entry — saving notary fees and weeks of processing. Many banks grant longer terms here, and with them lower instalments.",
      h1: "A home improvement loan",
      h1Highlight: "with no land charge.",
      metaTitel: "Home improvement loan: renovation and conversion",
      metaBeschreibung:
        "Finance renovation without a land charge: calculate your instalment, compare longer terms across 20+ banks with no effect on your credit score.",
      intro:
        "A home improvement loan finances conversion, renovation and refurbishment without registering the property as security in the land register. That saves notary and registry fees and several weeks of processing.",
      punkte: [
        {
          titel: "No land charge, no notary",
          text: "No security is registered. Notary and land registry fees fall away, and approval takes days rather than weeks.",
        },
        {
          titel: "Longer terms than an ordinary loan",
          text: "Because improvements preserve the value of the property, many banks grant longer terms here — and with them lower monthly instalments.",
        },
        {
          titel: "Works alongside public funding",
          text: "Grants and subsidised loans for energy-efficient renovation do not rule out a home improvement loan. You can cover your own share with it.",
        },
        {
          titel: "Pay tradespeople immediately",
          text: "The money goes to your account, not to the construction firm. You settle invoices directly and can take early payment discounts.",
        },
      ],
      faq: [
        {
          frage: "When do I need a mortgage instead?",
          antwort:
            "Buying a property generally requires a mortgage secured against the land register. For conversion, renovation and refurbishment the home improvement loan is the faster route.",
        },
        {
          frage: "Do I have to submit invoices or quotes?",
          antwort:
            "Many banks do not ask for them. If proof is required, that is stated in the offer before you decide.",
        },
        {
          frage: "Does this work as a tenant?",
          antwort:
            "Yes. Because no security is registered against the property, the loan is not tied to ownership.",
        },
      ],
    },
  },
  {
    id: "dispo",
    slug: "dispokredit-abloesen",
    farbe: "#fb7185",
    betrag: 8000,
    monate: 48,
    de: {
      name: "Dispo ablösen",
      wunschVor: "Ich möchte meinen",
      wunschKern: "Dispo ablösen",
      teaser: "Hohe Dispozinsen ablösen und planbar zurückzahlen.",
      vorteil: "hohe Zinsen vermeiden",
      hinweis:
        "Dispozinsen liegen häufig im zweistelligen Bereich, ein Ratenkredit deutlich darunter. Wer den Dispo ablöst, senkt die monatliche Belastung spürbar und hat wieder einen festen Tilgungsplan.",
      h1: "Dispo ablösen",
      h1Highlight: "und Zinsen sparen.",
      metaTitel: "Dispo ablösen: Kontoüberziehung umschulden",
      metaBeschreibung:
        "Dispozinsen sind häufig zweistellig. Rate für einen Ratenkredit berechnen, über 20 Banken Schufa-neutral vergleichen und den Dispo in festen Raten zurückführen.",
      intro:
        "Der Dispositionskredit ist der teuerste Weg, dauerhaft im Minus zu stehen. Wer ihn mit einem Ratenkredit ablöst, tauscht einen variablen, hohen Zins gegen einen festen Zins und einen klaren Tilgungsplan.",
      punkte: [
        {
          titel: "Fester Zins statt variablem Dispozins",
          text: "Der Dispozins kann von der Bank jederzeit geändert werden. Der Zins eines Ratenkredits steht für die gesamte Laufzeit fest.",
        },
        {
          titel: "Ein Ende statt eines Dauerzustands",
          text: "Der Dispo tilgt sich nicht von selbst. Ein Ratenkredit ist am Ende der Laufzeit vollständig zurückgezahlt.",
        },
        {
          titel: "Kreditkartensalden lassen sich einbeziehen",
          text: "Die Teilzahlungsfunktion von Kreditkarten liegt zinslich meist auf Dispo-Niveau. Sie können sie in dieselbe Ablösung aufnehmen.",
        },
        {
          titel: "Das Konto bleibt bestehen",
          text: "Sie lösen nur den Saldo ab. Ob Sie den eingeräumten Rahmen anschließend senken oder als Reserve behalten, entscheiden Sie selbst.",
        },
      ],
      faq: [
        {
          frage: "Wie viel spare ich durch die Ablösung?",
          antwort:
            "Das hängt von Ihrem Dispozins und dem angebotenen effektiven Jahreszins ab. Den Unterschied sehen Sie schwarz auf weiß, sobald Ihre Angebote vorliegen.",
        },
        {
          frage: "Muss ich den Dispo danach kündigen?",
          antwort:
            "Nein. Es ist aber sinnvoll, den Rahmen zu senken, wenn er sonst wieder ausgeschöpft wird — sonst stehen am Ende beide Verpflichtungen nebeneinander.",
        },
        {
          frage: "Geht das auch bei mehreren Konten?",
          antwort:
            "Ja. Geben Sie die Salden im Antrag an, ein Kredit kann sie gemeinsam ablösen.",
        },
      ],
    },
    en: {
      name: "Clear an overdraft",
      wunschVor: "I want to",
      wunschKern: "clear my overdraft",
      teaser: "Replace high overdraft rates with a predictable instalment.",
      vorteil: "avoid high interest",
      hinweis:
        "Overdraft rates are often double digit, an instalment loan well below that. Clearing the overdraft lowers the monthly burden and restores a fixed repayment plan.",
      h1: "Clear your overdraft",
      h1Highlight: "and save on interest.",
      metaTitel: "Clear your overdraft: refinance the balance",
      metaBeschreibung:
        "Overdraft rates are often double digit. Calculate an instalment loan, compare 20+ banks with no effect on your credit score and repay in fixed instalments.",
      intro:
        "An overdraft is the most expensive way to stay in the red. Clearing it with an instalment loan swaps a high, variable rate for a fixed one and a clear repayment plan.",
      punkte: [
        {
          titel: "A fixed rate instead of a variable one",
          text: "The bank can change your overdraft rate at any time. The rate on an instalment loan is fixed for the whole term.",
        },
        {
          titel: "An end date instead of a permanent state",
          text: "An overdraft does not repay itself. An instalment loan is fully repaid when the term ends.",
        },
        {
          titel: "Card balances can be included",
          text: "Credit card instalment plans usually sit at overdraft level. You can fold them into the same repayment.",
        },
        {
          titel: "Your account stays as it is",
          text: "You only clear the balance. Whether you then reduce the overdraft limit or keep it as a reserve is your call.",
        },
      ],
      faq: [
        {
          frage: "How much do I save by clearing it?",
          antwort:
            "That depends on your overdraft rate and the effective annual rate you are offered. You see the difference in black and white once your offers are in.",
        },
        {
          frage: "Do I have to cancel the overdraft afterwards?",
          antwort:
            "No. But reducing the limit makes sense if it would otherwise be used up again — otherwise you end up carrying both.",
        },
        {
          frage: "Does this work across several accounts?",
          antwort:
            "Yes. State the balances in the application and a single loan can clear them together.",
        },
      ],
    },
  },
  {
    id: "ratenkauf",
    slug: "ratenkauf-abloesen",
    farbe: "#2dd4bf",
    betrag: 5000,
    monate: 36,
    de: {
      name: "Ratenkauf ablösen",
      wunschVor: "Ich möchte meine",
      wunschKern: "Ratenkäufe ablösen",
      teaser: "Mehrere Finanzierungen zusammenfassen und den Überblick behalten.",
      vorteil: "alles in einer Rate",
      hinweis:
        "Ratenkäufe weisen ihre Kosten oft als Gebühr aus statt als Zinssatz. Zusammengefasst in einem Ratenkredit steht der effektive Jahreszins im Angebot und wird vergleichbar.",
      h1: "Ratenkauf ablösen",
      h1Highlight: "und Teilzahlungen bündeln.",
      metaTitel: "Ratenkauf ablösen: Teilzahlungen zusammenfassen",
      metaBeschreibung:
        "Mehrere Ratenkäufe und Teilzahlungen zu einem Kredit zusammenfassen: Rate berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Ratenkäufe im Handel und Teilzahlungen bei Online-Anbietern laufen oft parallel und zu ganz unterschiedlichen Konditionen. Ein Ratenkredit fasst sie zusammen: eine Rate, ein Zinssatz, ein Enddatum.",
      punkte: [
        {
          titel: "Alle Teilzahlungen in einem Vertrag",
          text: "Statt vieler kleiner Verträge mit eigenen Terminen bleibt einer. Das senkt das Risiko, eine Rate zu übersehen und Mahngebühren zu zahlen.",
        },
        {
          titel: "Der Zinssatz wird vergleichbar",
          text: "Ratenkäufe weisen die Kosten häufig als Gebühr aus. Beim Ratenkredit steht der effektive Jahreszins im Angebot und lässt sich direkt gegenüberstellen.",
        },
        {
          titel: "Echte Null-Prozent-Angebote behalten",
          text: "Eine Finanzierung ohne jede Gebühr abzulösen lohnt sich nicht. Lassen Sie sie weiterlaufen und fassen Sie nur die verzinsten Verträge zusammen.",
        },
        {
          titel: "Laufzeit selbst bestimmen",
          text: "Sie wählen Laufzeit und damit Rate — nicht der Händler und nicht der Zahlungsdienstleister.",
        },
      ],
      faq: [
        {
          frage: "Was zählt als Ratenkauf?",
          antwort:
            "Finanzierungen im Möbel- und Elektronikhandel, Teilzahlungen bei Online-Händlern und Ratenpläne von Zahlungsdienstleistern.",
        },
        {
          frage: "Lohnt sich das Ablösen einer 0-%-Finanzierung?",
          antwort:
            "In der Regel nicht. Prüfen Sie im Vertrag, ob wirklich keine Gebühren anfallen — und lassen Sie sie dann laufen.",
        },
        {
          frage: "Wie viele Verträge kann ich zusammenfassen?",
          antwort:
            "Es gibt keine feste Grenze. Im Antrag tragen Sie jeden laufenden Vertrag mit Restschuld und Rate ein.",
        },
      ],
    },
    en: {
      name: "Clear instalment plans",
      wunschVor: "I want to",
      wunschKern: "clear instalment plans",
      teaser: "Combine several plans and keep track of what you owe.",
      vorteil: "everything in one instalment",
      hinweis:
        "Retail plans often present their cost as a fee rather than a rate. Combined into one loan, the effective annual rate is stated and becomes comparable.",
      h1: "Clear retail instalments",
      h1Highlight: "and bundle the rest.",
      metaTitel: "Clear instalment plans: bundle retail credit",
      metaBeschreibung:
        "Combine several retail instalment plans into one loan: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "Retail instalment plans and buy-now-pay-later arrangements often run in parallel on very different terms. One loan pulls them together: one instalment, one rate, one end date.",
      punkte: [
        {
          titel: "Every plan in one contract",
          text: "Instead of many small contracts with their own due dates, one remains. That lowers the risk of missing a payment and paying reminder fees.",
        },
        {
          titel: "The rate becomes comparable",
          text: "Retail plans often present the cost as a fee. An instalment loan states the effective annual rate, which can be compared directly.",
        },
        {
          titel: "Keep genuine zero-percent deals",
          text: "Clearing a plan with no fees at all is not worth it. Let it run and bundle only the interest-bearing contracts.",
        },
        {
          titel: "You set the term",
          text: "You choose the term and with it the instalment — not the retailer and not the payment provider.",
        },
      ],
      faq: [
        {
          frage: "What counts as a retail instalment plan?",
          antwort:
            "Financing at furniture and electronics retailers, buy-now-pay-later plans with online shops and instalment plans from payment providers.",
        },
        {
          frage: "Is it worth clearing a zero-percent plan?",
          antwort:
            "Usually not. Check the contract for hidden fees — and if there are none, let it run.",
        },
        {
          frage: "How many contracts can I combine?",
          antwort:
            "There is no fixed limit. In the application you enter each running contract with its balance and instalment.",
        },
      ],
    },
  },
  {
    id: "moebel",
    slug: "moebelkredit",
    farbe: "#c084fc",
    betrag: 8000,
    monate: 48,
    de: {
      name: "Möbelkredit",
      wunschVor: "Ich möchte",
      wunschKern: "Möbel finanzieren",
      teaser: "Einrichtung über einen Vertrag statt über drei Händler.",
      vorteil: "im Möbelhaus Barzahler sein",
      h1: "Möbel finanzieren",
      h1Highlight: "ohne Ratenkauf.",
      metaTitel: "Möbelkredit: Einrichtung finanzieren",
      metaBeschreibung:
        "Möbel und Einrichtung mit einem Ratenkredit finanzieren statt mit Ratenkauf im Möbelhaus: Rate berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Wer eine Wohnung komplett einrichtet, kommt schnell auf einen vierstelligen Betrag. Ein Ratenkredit ist dabei in der Regel übersichtlicher und günstiger als mehrere Ratenkäufe bei verschiedenen Händlern.",
      punkte: [
        {
          titel: "Ein Vertrag für die ganze Einrichtung",
          text: "Sofa, Schrank und Lampen können von drei Händlern kommen und laufen trotzdem über einen einzigen Kredit.",
        },
        {
          titel: "Preis statt Rate verhandeln",
          text: "Im Möbelhaus wird über die Monatsrate gesprochen. Als Barzahler verhandeln Sie über den Preis — und sehen, was der Nachlass wirklich wert ist.",
        },
        {
          titel: "Lieferzeiten einplanen",
          text: "Der Kredit läuft ab Auszahlung, nicht ab Lieferung. Bei langen Lieferzeiten lohnt es sich, den Antrag zeitlich passend zu stellen.",
        },
        {
          titel: "Feste Rate, festes Ende",
          text: "Zins und Laufzeit stehen fest. Sie wissen von Anfang an, wann die Einrichtung bezahlt ist.",
        },
      ],
      faq: [
        {
          frage: "Ist der Ratenkauf im Möbelhaus nicht einfacher?",
          antwort:
            "Schneller ja, günstiger selten. Vergleichen Sie den effektiven Jahreszins und rechnen Sie den entgangenen Barzahlerrabatt mit ein.",
        },
        {
          frage: "Kann ich damit mehrere Händler bezahlen?",
          antwort:
            "Ja. Der Betrag geht auf Ihr Konto, die Aufteilung bestimmen Sie.",
        },
        {
          frage: "Welche Laufzeit ist sinnvoll?",
          antwort:
            "So kurz, wie es die Rate zulässt. Bei Möbeln sind Laufzeiten zwischen 24 und 60 Monaten üblich.",
        },
      ],
    },
    en: {
      name: "Furniture loan",
      wunschVor: "I want to",
      wunschKern: "finance furniture",
      teaser: "One contract for your interior instead of three retailers.",
      vorteil: "be a cash buyer in the showroom",
      h1: "Finance furniture",
      h1Highlight: "without retail credit.",
      metaTitel: "Furniture loan: finance your interior",
      metaBeschreibung:
        "Finance furniture with an instalment loan rather than store credit: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "Furnishing a flat from scratch quickly runs into four figures. An instalment loan is usually clearer and cheaper than several store credit plans across different retailers.",
      punkte: [
        {
          titel: "One contract for the whole interior",
          text: "Sofa, wardrobe and lamps can come from three retailers and still run through a single loan.",
        },
        {
          titel: "Negotiate price, not instalment",
          text: "In the showroom the conversation is about the monthly figure. As a cash buyer you negotiate the price — and see what the discount is really worth.",
        },
        {
          titel: "Plan around delivery times",
          text: "The loan runs from payout, not from delivery. With long delivery times it pays to time the application accordingly.",
        },
        {
          titel: "Fixed instalment, fixed end",
          text: "The rate and the term are fixed. You know from the start when the furniture is paid off.",
        },
      ],
      faq: [
        {
          frage: "Isn't store credit simpler?",
          antwort:
            "Faster, yes; cheaper, rarely. Compare the effective annual rate and factor in the cash discount you give up.",
        },
        {
          frage: "Can I pay several retailers with it?",
          antwort:
            "Yes. The money goes to your account and you decide how to split it.",
        },
        {
          frage: "What term makes sense?",
          antwort:
            "As short as the instalment allows. For furniture, terms between 24 and 60 months are usual.",
        },
      ],
    },
  },
  {
    id: "kueche",
    slug: "kuechenkredit",
    farbe: "#fb923c",
    betrag: 15000,
    monate: 60,
    de: {
      name: "Küchenkredit",
      wunschVor: "Ich möchte eine",
      wunschKern: "neue Küche kaufen",
      teaser: "Einbauküche und Geräte zum Barzahlerpreis finanzieren.",
      vorteil: "Barzahlerpreis sichern",
      h1: "Küche finanzieren",
      h1Highlight: "zum Barzahlerpreis.",
      metaTitel: "Küchenkredit: Einbauküche finanzieren",
      metaBeschreibung:
        "Einbauküche unabhängig vom Küchenstudio finanzieren: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Eine Einbauküche wird meist im Studio finanziert — zu Konditionen, die sich am Verkaufstisch schwer vergleichen lassen. Mit einem eigenen Ratenkredit kennen Sie den effektiven Jahreszins, bevor Sie in die Beratung gehen.",
      punkte: [
        {
          titel: "Als Barzahler verhandeln",
          text: "Küchenstudios geben auf Barzahlung häufig Nachlass. Mit dem Kredit auf dem Konto verhandeln Sie über den Preis statt über die Monatsrate.",
        },
        {
          titel: "Geräte, Montage und Anschlüsse in einem Betrag",
          text: "Elektrogeräte, Aufbau, Elektro- und Wasseranschluss und die Entsorgung der alten Küche lassen sich zusammen finanzieren.",
        },
        {
          titel: "Unabhängig vom Partner des Studios",
          text: "Sie sind an kein vorgelegtes Angebot gebunden und können vor dem Kauf in Ruhe mehrere Banken vergleichen.",
        },
        {
          titel: "Laufzeit passend zur Nutzungsdauer",
          text: "Eine Einbauküche hält viele Jahre. Wählen Sie eine Laufzeit, die dazu passt, statt die Rate auf das Äußerste zu drücken.",
        },
      ],
      faq: [
        {
          frage: "Zählt die Küche als Modernisierung?",
          antwort:
            "Wenn Sie ohnehin umbauen, können Sie beides in einem Modernisierungskredit zusammenfassen. Für die Küche allein genügt ein gewöhnlicher Ratenkredit.",
        },
        {
          frage: "Bekomme ich Nachlass, wenn ich bar zahle?",
          antwort:
            "Häufig ja. Fragen Sie im Studio gezielt nach dem Barzahlerpreis, bevor Sie über eine Finanzierung sprechen.",
        },
        {
          frage: "Was ist mit der Null-Prozent-Finanzierung im Studio?",
          antwort:
            "Rechnen Sie sie gegen den Barzahlerpreis: Entfällt dabei der Nachlass, ist die Finanzierung selten wirklich kostenlos.",
        },
      ],
    },
    en: {
      name: "Kitchen loan",
      wunschVor: "I want to",
      wunschKern: "buy a new kitchen",
      teaser: "Finance a fitted kitchen and appliances at the cash price.",
      vorteil: "secure the cash price",
      h1: "Finance a kitchen",
      h1Highlight: "at the cash price.",
      metaTitel: "Kitchen loan: finance a fitted kitchen",
      metaBeschreibung:
        "Finance a fitted kitchen independently of the showroom: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "A fitted kitchen is usually financed in the showroom — on terms that are hard to compare at the sales desk. With your own loan you know the effective annual rate before the consultation starts.",
      punkte: [
        {
          titel: "Negotiate as a cash buyer",
          text: "Showrooms often discount for cash. With the loan in your account you negotiate the price rather than the monthly instalment.",
        },
        {
          titel: "Appliances, fitting and connections in one amount",
          text: "Appliances, installation, electrical and plumbing work and disposal of the old kitchen can all be financed together.",
        },
        {
          titel: "Independent of the showroom's partner",
          text: "You are not bound to any offer put in front of you and can compare several banks before you buy.",
        },
        {
          titel: "A term that matches the useful life",
          text: "A fitted kitchen lasts many years. Choose a term that matches, rather than squeezing the instalment as low as it will go.",
        },
      ],
      faq: [
        {
          frage: "Does a kitchen count as home improvement?",
          antwort:
            "If you are renovating anyway, both can go into one home improvement loan. For the kitchen alone an ordinary instalment loan is enough.",
        },
        {
          frage: "Will I get a discount for paying cash?",
          antwort:
            "Often, yes. Ask the showroom for the cash price specifically, before financing comes up.",
        },
        {
          frage: "What about the showroom's zero-percent offer?",
          antwort:
            "Weigh it against the cash price: if the discount disappears, the financing is rarely free after all.",
        },
      ],
    },
  },
  {
    id: "wohnmobil",
    slug: "wohnmobil-finanzierung",
    farbe: "#4ade80",
    betrag: 45000,
    monate: 96,
    de: {
      name: "Wohnmobil-Finanzierung",
      wunschVor: "Ich möchte ein",
      wunschKern: "Wohnmobil kaufen",
      teaser: "Reisemobil, Wohnwagen und Ausbau in einem Betrag finanzieren.",
      vorteil: "Fahrzeugbrief bleibt bei Ihnen",
      hinweis:
        "Reisemobile werden häufig über den Händler finanziert, der dafür den Fahrzeugbrief einbehält. Mit einem eigenen Ratenkredit bleibt er bei Ihnen — und das Fahrzeug lässt sich jederzeit verkaufen.",
      h1: "Wohnmobil finanzieren",
      h1Highlight: "und sofort losfahren.",
      metaTitel: "Wohnmobil-Finanzierung: Reisemobil und Wohnwagen",
      metaBeschreibung:
        "Wohnmobil oder Wohnwagen unabhängig vom Händler finanzieren: Rate berechnen, lange Laufzeiten vergleichen und über 20 Banken Schufa-neutral anfragen.",
      intro:
        "Reisemobile und Wohnwagen liegen preislich zwischen Auto und Eigenheim, und beim Händler wartet oft eine Finanzierung mit Schlussrate. Ein eigener Ratenkredit macht Sie zum Barzahler — bei Neufahrzeugen wie beim Kauf von privat.",
      punkte: [
        {
          titel: "Auch für den Kauf von privat",
          text: "Ein großer Teil des Marktes läuft privat. Weil das Geld auf Ihrem Konto liegt, spielt es keine Rolle, ob Sie beim Händler oder von privat kaufen.",
        },
        {
          titel: "Der Fahrzeugbrief bleibt bei Ihnen",
          text: "Händlerfinanzierungen behalten die Zulassungsbescheinigung Teil II häufig als Sicherheit ein. Beim Ratenkredit verzichten viele Banken darauf.",
        },
        {
          titel: "Ausbau und Zubehör mitfinanziert",
          text: "Markise, Solaranlage, Fahrradträger oder ein nachträglicher Ausbau lassen sich in denselben Betrag einrechnen.",
        },
        {
          titel: "Längere Laufzeiten als beim Auto",
          text: "Reisemobile werden lange gefahren und verlieren langsamer an Wert. Entsprechend lassen sich hier längere Laufzeiten und damit niedrigere Raten wählen.",
        },
      ],
      faq: [
        {
          frage: "Wohnmobil oder Wohnwagen — macht das einen Unterschied?",
          antwort:
            "Für den Kredit nicht. Sie erhalten den Betrag auf Ihr Konto und entscheiden, was Sie kaufen.",
        },
        {
          frage: "Kann ich auch einen Ausbau finanzieren?",
          antwort:
            "Ja. Ob Kastenwagen mit anschließendem Selbstausbau oder ein fertiges Reisemobil — der Kredit ist an keinen Kaufgegenstand gebunden.",
        },
        {
          frage: "Was ist mit der Saisonzulassung?",
          antwort:
            "Sie ändert an der Finanzierung nichts. Die Rate läuft ganzjährig, unabhängig davon, wie viele Monate das Fahrzeug zugelassen ist.",
        },
      ],
    },
    en: {
      name: "Motorhome financing",
      wunschVor: "I want to",
      wunschKern: "buy a motorhome",
      teaser: "Finance a motorhome, caravan and conversion in one amount.",
      vorteil: "keep the vehicle documents",
      hinweis:
        "Motorhomes are often financed through the dealer, who keeps the vehicle registration document as security. With your own loan it stays with you — and the vehicle can be sold at any time.",
      h1: "Finance a motorhome",
      h1Highlight: "and set off right away.",
      metaTitel: "Motorhome financing: campers and caravans",
      metaBeschreibung:
        "Finance a motorhome or caravan independently of the dealer: calculate the instalment, compare longer terms across 20+ banks, credit-score-neutral.",
      intro:
        "Motorhomes and caravans sit between a car and a home in price, and the dealer usually offers financing with a balloon payment. Your own instalment loan makes you a cash buyer — new or privately bought.",
      punkte: [
        {
          titel: "Private purchases too",
          text: "A large part of this market is private. Because the money is in your account, it makes no difference whether you buy from a dealer or privately.",
        },
        {
          titel: "The vehicle documents stay with you",
          text: "Dealer financing often keeps the registration document as security. With an instalment loan, many banks waive that.",
        },
        {
          titel: "Conversion and accessories included",
          text: "An awning, solar panels, a bike rack or a later conversion can all go into the same amount.",
        },
        {
          titel: "Longer terms than for a car",
          text: "Motorhomes are kept for many years and lose value more slowly. Longer terms — and with them lower instalments — are correspondingly available.",
        },
      ],
      faq: [
        {
          frage: "Motorhome or caravan — does it matter?",
          antwort:
            "Not for the loan. You receive the money in your account and decide what to buy.",
        },
        {
          frage: "Can I finance a conversion as well?",
          antwort:
            "Yes. Whether a panel van you convert yourself or a finished motorhome — the loan is not tied to any particular purchase.",
        },
        {
          frage: "What about seasonal registration?",
          antwort:
            "It makes no difference to the financing. The instalment runs all year, regardless of how many months the vehicle is registered.",
        },
      ],
    },
  },
  {
    id: "motorrad",
    slug: "motorradkredit",
    farbe: "#60a5fa",
    betrag: 12000,
    monate: 48,
    de: {
      name: "Motorradkredit",
      wunschVor: "Ich möchte ein",
      wunschKern: "Motorrad kaufen",
      teaser: "Maschine, Ausrüstung und Zulassung in einem Betrag.",
      vorteil: "unabhängig vom Händler",
      h1: "Motorrad finanzieren",
      h1Highlight: "unabhängig vom Händler.",
      metaTitel: "Motorradkredit: Maschine finanzieren und vergleichen",
      metaBeschreibung:
        "Motorrad oder Roller unabhängig vom Händler finanzieren: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Ob neue Maschine, gebrauchtes Schmuckstück oder Roller: Mit einem Ratenkredit kaufen Sie dort, wo das Angebot stimmt — und nicht dort, wo gerade eine Aktionsfinanzierung läuft.",
      punkte: [
        {
          titel: "Ausrüstung gehört dazu",
          text: "Helm, Kombi, Handschuhe und Stiefel kosten schnell einen vierstelligen Betrag. Sie lassen sich in denselben Kredit einrechnen wie die Maschine.",
        },
        {
          titel: "Gute Zeitpunkte nutzen",
          text: "Gebrauchte Maschinen sind im Herbst und Winter oft günstiger zu haben. Mit dem Geld auf dem Konto sind Sie nicht auf den Frühling angewiesen.",
        },
        {
          titel: "Auch von privat kaufen",
          text: "Ein großer Teil des Gebrauchtmarktes läuft privat, wo keine Händlerfinanzierung zur Verfügung steht. Als Barzahler ist das kein Hindernis.",
        },
        {
          titel: "Saisonkennzeichen ändert nichts",
          text: "Die Rate läuft das ganze Jahr, unabhängig davon, wie viele Monate die Maschine zugelassen ist. Das ist bei der Laufzeit einzuplanen.",
        },
      ],
      faq: [
        {
          frage: "Gilt das auch für Roller und Leichtkrafträder?",
          antwort:
            "Ja. Der Kredit ist an keinen Fahrzeugtyp gebunden — Sie erhalten den Betrag auf Ihr Konto.",
        },
        {
          frage: "Wird die Maschine als Sicherheit hinterlegt?",
          antwort:
            "Bei einem gewöhnlichen Ratenkredit in der Regel nicht. Der Fahrzeugbrief bleibt bei Ihnen, ein späterer Verkauf ist jederzeit möglich.",
        },
        {
          frage: "Welche Laufzeit ist sinnvoll?",
          antwort:
            "Kürzer als beim Auto, weil die Beträge kleiner sind. Zwischen 24 und 60 Monaten ist hier üblich.",
        },
      ],
    },
    en: {
      name: "Motorbike loan",
      wunschVor: "I want to",
      wunschKern: "buy a motorbike",
      teaser: "The bike, the gear and the registration in one amount.",
      vorteil: "independent of the dealer",
      h1: "Finance a motorbike",
      h1Highlight: "independently of the dealer.",
      metaTitel: "Motorbike loan: finance a bike and compare",
      metaBeschreibung:
        "Finance a motorbike or scooter independently of the dealer: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "A new machine, a used gem or a scooter: with an instalment loan you buy where the offer is right — not where a promotional finance deal happens to be running.",
      punkte: [
        {
          titel: "The gear counts too",
          text: "Helmet, leathers, gloves and boots quickly reach four figures. They can go into the same loan as the bike.",
        },
        {
          titel: "Buy at the right moment",
          text: "Used bikes are often cheaper in autumn and winter. With the money in your account you do not have to wait for spring.",
        },
        {
          titel: "Private sales too",
          text: "Much of the used market is private, where no dealer financing exists. As a cash buyer that is no obstacle.",
        },
        {
          titel: "Seasonal plates change nothing",
          text: "The instalment runs all year, regardless of how many months the bike is registered. Worth bearing in mind when choosing the term.",
        },
      ],
      faq: [
        {
          frage: "Does this cover scooters and light motorcycles?",
          antwort:
            "Yes. The loan is not tied to any vehicle type — you receive the money in your account.",
        },
        {
          frage: "Is the bike held as security?",
          antwort:
            "With an ordinary instalment loan, generally not. The documents stay with you and a later sale is possible at any time.",
        },
        {
          frage: "What term makes sense?",
          antwort:
            "Shorter than for a car, because the amounts are smaller. Between 24 and 60 months is usual here.",
        },
      ],
    },
  },
  {
    id: "ebike",
    slug: "e-bike-finanzierung",
    farbe: "#a3e635",
    betrag: 4000,
    monate: 36,
    de: {
      name: "E-Bike-Finanzierung",
      wunschVor: "Ich möchte ein",
      wunschKern: "E-Bike kaufen",
      teaser: "Pedelec und Zubehör kaufen, ohne an einen Händler gebunden zu sein.",
      vorteil: "kein Leasingvertrag nötig",
      h1: "E-Bike finanzieren",
      h1Highlight: "ohne Händlerbindung.",
      metaTitel: "E-Bike finanzieren: Pedelec-Kredit vergleichen",
      metaBeschreibung:
        "E-Bike oder Pedelec finanzieren, ohne an einen Händler gebunden zu sein: Rate berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Ein gutes Pedelec kostet so viel wie ein gebrauchtes Auto. Mit einem Ratenkredit kaufen Sie es unabhängig vom Händler und sind nicht an dessen Finanzierungspartner gebunden.",
      punkte: [
        {
          titel: "Freie Händlerwahl",
          text: "Weil das Geld auf Ihrem Konto liegt, kaufen Sie dort, wo Modell und Preis stimmen — im Fachhandel wie online.",
        },
        {
          titel: "Zubehör und Versicherung mitfinanziert",
          text: "Zweitakku, Schloss, Anhänger oder eine Vollkaskoversicherung lassen sich in denselben Betrag einrechnen.",
        },
        {
          titel: "Alternative zum Leasing",
          text: "Beim Leasing gehört das Rad am Ende nicht Ihnen. Bietet Ihr Arbeitgeber ein Dienstrad per Gehaltsumwandlung an, kann das dennoch günstiger sein — rechnen Sie beides durch.",
        },
        {
          titel: "Kurze Laufzeiten sind üblich",
          text: "In dieser Größenordnung sind kurze Laufzeiten die Regel. Je kürzer die Laufzeit, desto weniger Zinsen zahlen Sie insgesamt.",
        },
      ],
      faq: [
        {
          frage: "Wird das Rad als Sicherheit hinterlegt?",
          antwort:
            "Nein. Es handelt sich um einen gewöhnlichen Ratenkredit ohne Sicherungsübereignung — das Rad gehört Ihnen sofort.",
        },
        {
          frage: "Kredit oder Leasing — was ist günstiger?",
          antwort:
            "Ohne Dienstrad-Angebot des Arbeitgebers meist der Kredit, weil das Rad Ihnen am Ende gehört. Mit Gehaltsumwandlung kann das Leasing die Nase vorn haben.",
        },
        {
          frage: "Kann ich Zubehör mitfinanzieren?",
          antwort:
            "Ja. Sie geben einen Gesamtbetrag an; wie er sich zusammensetzt, spielt für die Bank keine Rolle.",
        },
      ],
    },
    en: {
      name: "E-bike financing",
      wunschVor: "I want to",
      wunschKern: "buy an e-bike",
      teaser: "Buy a pedelec and accessories without being tied to a dealer.",
      vorteil: "no leasing contract needed",
      h1: "Finance an e-bike",
      h1Highlight: "without dealer ties.",
      metaTitel: "Finance an e-bike: compare pedelec loans",
      metaBeschreibung:
        "Finance an e-bike or pedelec without being tied to one dealer: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "A good pedelec costs as much as a used car. With an instalment loan you buy it independently of the dealer and are not tied to their financing partner.",
      punkte: [
        {
          titel: "Any dealer you like",
          text: "Because the money is in your account, you buy where the model and the price are right — in a shop or online.",
        },
        {
          titel: "Accessories and insurance included",
          text: "A second battery, a lock, a trailer or fully comprehensive insurance can all go into the same amount.",
        },
        {
          titel: "An alternative to leasing",
          text: "With leasing the bike is not yours at the end. If your employer offers a company bike via salary sacrifice, leasing can still work out cheaper — run both numbers.",
        },
        {
          titel: "Short terms are the norm",
          text: "At this size short terms are usual. The shorter the term, the less interest you pay in total.",
        },
      ],
      faq: [
        {
          frage: "Is the bike held as security?",
          antwort:
            "No. This is an ordinary instalment loan with no transfer of ownership — the bike is yours immediately.",
        },
        {
          frage: "Loan or leasing — which is cheaper?",
          antwort:
            "Without a company-bike scheme, usually the loan, because the bike ends up yours. With salary sacrifice, leasing can come out ahead.",
        },
        {
          frage: "Can I finance accessories too?",
          antwort:
            "Yes. You state a total amount; how it breaks down is of no concern to the bank.",
        },
      ],
    },
  },
  {
    id: "reise",
    slug: "reisekredit",
    farbe: "#22d3ee",
    betrag: 5000,
    monate: 24,
    de: {
      name: "Urlaubs- und Reisekredit",
      wunschVor: "Ich möchte eine",
      wunschKern: "Reise finanzieren",
      teaser: "Frühbucherpreis sichern und in festen Raten zurückzahlen.",
      vorteil: "günstiger als die Kreditkarte",
      h1: "Reise finanzieren",
      h1Highlight: "in festen Raten.",
      metaTitel: "Reisekredit: Urlaub finanzieren und vergleichen",
      metaBeschreibung:
        "Größere Reise in festen Raten zahlen statt über den Dispo: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Eine größere Reise wird oft Monate im Voraus gebucht und in voller Höhe fällig. Ein Ratenkredit verteilt die Kosten auf feste Raten — planbar und deutlich günstiger als eine dauerhaft überzogene Kreditkarte.",
      punkte: [
        {
          titel: "Frühbucherpreis sichern",
          text: "Wer früh und vollständig zahlt, bekommt häufig den besseren Preis. Der Kredit stellt den Betrag zum Buchungszeitpunkt bereit.",
        },
        {
          titel: "Günstiger als Kreditkarte und Dispo",
          text: "Teilzahlung auf der Kreditkarte und die Kontoüberziehung liegen zinslich meist deutlich über einem Ratenkredit.",
        },
        {
          titel: "Rate an das Budget koppeln",
          text: "Wählen Sie die Laufzeit so, dass der Kredit vor der nächsten größeren Ausgabe getilgt ist. Der Rechner zeigt Rate und Gesamtkosten nebeneinander.",
        },
        {
          titel: "Ehrlich gerechnet",
          text: "Eine Reise ist Konsum und kein Vermögenswert. Finanzieren Sie nur, was sich aus dem laufenden Einkommen sicher zurückzahlen lässt.",
        },
      ],
      faq: [
        {
          frage: "Ist ein Kredit für den Urlaub sinnvoll?",
          antwort:
            "Das hängt von Ihrer Lage ab. Sinnvoll ist er, wenn die Rate dauerhaft ins Budget passt und die Alternative ein teurer Dispo wäre. Von einer Finanzierung, die das Budget ausreizt, raten wir ab.",
        },
        {
          frage: "Wie schnell ist das Geld verfügbar?",
          antwort:
            "Nach Zusage und digitaler Unterschrift zahlen viele Banken innerhalb weniger Werktage aus.",
        },
        {
          frage: "Kann ich früher zurückzahlen?",
          antwort:
            "Bei den meisten Angeboten kostenfrei. Ob Sondertilgung möglich ist, steht bei jedem Angebot dabei, bevor Sie sich entscheiden.",
        },
      ],
    },
    en: {
      name: "Holiday and travel loan",
      wunschVor: "I want to",
      wunschKern: "finance a trip",
      teaser: "Lock in the early-booking price and repay in fixed instalments.",
      vorteil: "cheaper than a credit card",
      h1: "Finance a trip",
      h1Highlight: "in fixed instalments.",
      metaTitel: "Travel loan: finance a holiday and compare",
      metaBeschreibung:
        "Pay for a bigger trip in fixed instalments rather than through an overdraft: calculate the payment and compare 20+ banks, credit-score-neutral.",
      intro:
        "A bigger trip is often booked months ahead and payable in full. An instalment loan spreads the cost across fixed payments — predictable, and far cheaper than a permanently maxed-out credit card.",
      punkte: [
        {
          titel: "Lock in the early-booking price",
          text: "Booking early and paying in full often secures the better price. The loan provides the money at the moment you book.",
        },
        {
          titel: "Cheaper than card or overdraft",
          text: "Credit card instalment plans and overdrafts usually sit well above the rate on an instalment loan.",
        },
        {
          titel: "Tie the instalment to your budget",
          text: "Choose a term so the loan is repaid before the next large expense. The calculator shows the instalment and the total side by side.",
        },
        {
          titel: "An honest calculation",
          text: "A holiday is consumption, not an asset. Finance only what your regular income can comfortably repay.",
        },
      ],
      faq: [
        {
          frage: "Does a loan for a holiday make sense?",
          antwort:
            "That depends on your situation. It makes sense when the instalment fits your budget for the long run and the alternative would be an expensive overdraft. We advise against financing that stretches the budget.",
        },
        {
          frage: "How quickly is the money available?",
          antwort:
            "After approval and a digital signature, many banks pay out within a few working days.",
        },
        {
          frage: "Can I repay early?",
          antwort:
            "With most offers free of charge. Whether early repayment is possible is stated with every offer, before you decide.",
        },
      ],
    },
  },
  {
    id: "hochzeit",
    slug: "hochzeitskredit",
    farbe: "#f472b6",
    betrag: 10000,
    monate: 48,
    de: {
      name: "Hochzeitskredit",
      wunschVor: "Ich möchte unsere",
      wunschKern: "Hochzeit finanzieren",
      teaser: "Feier, Ringe und Flitterwochen ohne Druck auf das Ersparte.",
      vorteil: "planbar statt Dispo",
      h1: "Hochzeit finanzieren",
      h1Highlight: "und den Tag genießen.",
      metaTitel: "Hochzeitskredit: Feier und Flitterwochen finanzieren",
      metaBeschreibung:
        "Hochzeit in festen Raten finanzieren statt über den Dispo: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Eine Hochzeit kostet an vielen Stellen gleichzeitig, und die größten Posten sind lange vor dem Tag fällig: Location, Catering, Ringe, Fotograf. Ein Ratenkredit verteilt das auf feste Monatsraten, statt das Ersparte in einem Zug aufzubrauchen.",
      punkte: [
        {
          titel: "Anzahlungen kommen früh",
          text: "Location und Catering verlangen häufig Monate im Voraus eine Anzahlung. Der Kredit stellt das Geld bereit, wenn es gebraucht wird.",
        },
        {
          titel: "Alles in einem Vertrag",
          text: "Ringe, Kleid, Fotograf, Musik und Flitterwochen kommen von verschiedenen Anbietern und laufen trotzdem über eine einzige Rate.",
        },
        {
          titel: "Rücklage bleibt Rücklage",
          text: "Wer die Feier vollständig aus dem Ersparten zahlt, steht danach ohne Puffer da. Eine Aufteilung hält die Rücklage für Unvorhergesehenes frei.",
        },
        {
          titel: "Geldgeschenke einplanen",
          text: "Geldgeschenke treffen erst nach der Feier ein. Mit kostenfreier Sondertilgung können Sie den Kredit damit vorzeitig verkleinern.",
        },
      ],
      faq: [
        {
          frage: "Können wir den Kredit gemeinsam aufnehmen?",
          antwort:
            "Ja. Ein Antrag zu zweit ist üblich und verbessert oft die Konditionen, weil zwei Einkommen in die Prüfung eingehen. Die Personenzahl geben Sie im Antrag an.",
        },
        {
          frage: "Wie viel sollte eine Hochzeit kosten?",
          antwort:
            "Dafür gibt es keine richtige Zahl. Sinnvoll ist die Frage andersherum: Welche Monatsrate passt dauerhaft ins gemeinsame Budget? Der Rechner rechnet von der Rate zurück auf den Betrag.",
        },
        {
          frage: "Können wir nach den Geldgeschenken vorzeitig tilgen?",
          antwort:
            "Bei den meisten Angeboten kostenfrei. Ob Sondertilgung möglich ist, steht bei jedem Angebot dabei, bevor Sie sich entscheiden.",
        },
      ],
    },
    en: {
      name: "Wedding loan",
      wunschVor: "I want to",
      wunschKern: "finance our wedding",
      teaser: "The party, the rings and the honeymoon without draining savings.",
      vorteil: "predictable, not an overdraft",
      h1: "Finance a wedding",
      h1Highlight: "and enjoy the day.",
      metaTitel: "Wedding loan: finance the celebration and honeymoon",
      metaBeschreibung:
        "Finance a wedding in fixed instalments rather than through an overdraft: calculate the payment and compare 20+ banks, credit-score-neutral.",
      intro:
        "A wedding costs in many places at once, and the largest items fall due long before the day: venue, catering, rings, photographer. An instalment loan spreads that across fixed monthly payments instead of consuming your savings in one go.",
      punkte: [
        {
          titel: "Deposits come early",
          text: "Venues and caterers often want a deposit months ahead. The loan provides the money when it is needed.",
        },
        {
          titel: "Everything in one contract",
          text: "Rings, dress, photographer, music and honeymoon come from different suppliers and still run through a single instalment.",
        },
        {
          titel: "Savings stay savings",
          text: "Paying for the whole celebration out of savings leaves no buffer afterwards. Splitting it keeps your reserve free for the unexpected.",
        },
        {
          titel: "Plan for cash gifts",
          text: "Cash gifts arrive after the celebration. With free early repayment you can use them to shrink the loan ahead of schedule.",
        },
      ],
      faq: [
        {
          frage: "Can we take out the loan together?",
          antwort:
            "Yes. A joint application is common and often improves the terms, because two incomes are assessed. You state the number of applicants in the form.",
        },
        {
          frage: "How much should a wedding cost?",
          antwort:
            "There is no right figure. The better question is the other way round: which monthly instalment fits your joint budget for the long run? The calculator works back from the instalment to the amount.",
        },
        {
          frage: "Can we repay early once the cash gifts arrive?",
          antwort:
            "With most offers free of charge. Whether early repayment is possible is stated with every offer, before you decide.",
        },
      ],
    },
  },
  {
    id: "medizin",
    slug: "zahnbehandlung-finanzieren",
    farbe: "#7dd3fc",
    betrag: 6000,
    monate: 36,
    de: {
      name: "Zahnbehandlung & Medizin",
      wunschVor: "Ich möchte eine",
      wunschKern: "Behandlung finanzieren",
      teaser: "Zahnersatz, Implantate und Eigenanteile in festen Raten zahlen.",
      vorteil: "feste Rate statt Dispo",
      hinweis:
        "Zahnersatz und Implantate werden von der gesetzlichen Kasse nur bezuschusst; der Eigenanteil geht schnell in den vierstelligen Bereich. Ein Ratenkredit ist dabei meist günstiger als die Teilzahlung über den Abrechnungsdienstleister der Praxis.",
      h1: "Behandlung finanzieren",
      h1Highlight: "ohne Wartezeit.",
      metaTitel: "Zahnbehandlung finanzieren: Eigenanteil in Raten",
      metaBeschreibung:
        "Zahnersatz, Implantate oder andere Eigenanteile finanzieren: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Zahnersatz, Implantate und viele andere Behandlungen werden von der gesetzlichen Krankenkasse nur bezuschusst. Der Eigenanteil erreicht schnell einen vierstelligen Betrag — und ist auf einmal fällig. Ein Ratenkredit verteilt ihn auf feste Monatsraten.",
      punkte: [
        {
          titel: "Der Eigenanteil ist planbar",
          text: "Der Heil- und Kostenplan Ihrer Praxis nennt den Betrag vorab. Damit lässt sich die Finanzierung rechnen, bevor die Behandlung beginnt.",
        },
        {
          titel: "Meist günstiger als die Praxisteilzahlung",
          text: "Abrechnungsdienstleister bieten eigene Ratenzahlungen an, oft mit Gebühren statt eines ausgewiesenen Zinssatzes. Vergleichen Sie beides über den effektiven Jahreszins.",
        },
        {
          titel: "Freie Wahl von Praxis und Labor",
          text: "Das Geld liegt auf Ihrem Konto. Sie sind an keine Praxis gebunden, die eine bestimmte Finanzierung anbietet.",
        },
        {
          titel: "Erst die Kasse, dann der Kredit",
          text: "Bewilligung, Härtefallregelung und eine bestehende Zahnzusatzversicherung senken den Eigenanteil. Finanzieren Sie erst, was danach übrig bleibt.",
        },
      ],
      faq: [
        {
          frage: "Gilt das nur für Zahnbehandlungen?",
          antwort:
            "Nein. Der Kredit ist an keinen Zweck gebunden und deckt ebenso Sehhilfen, Hörgeräte, Kieferorthopädie oder andere Eigenanteile ab.",
        },
        {
          frage: "Muss ich den Heil- und Kostenplan einreichen?",
          antwort:
            "Für die Berechnung nicht. Sie beantragen einen gewöhnlichen Ratenkredit; Nachweise zur Behandlung verlangen die Banken in der Regel nicht.",
        },
        {
          frage: "Was ist mit der Ratenzahlung über die Praxis?",
          antwort:
            "Die ist bequem, weist die Kosten aber häufig als Gebühr aus. Lassen Sie sich den effektiven Jahreszins nennen und stellen Sie ihn dem Kreditangebot gegenüber.",
        },
      ],
    },
    en: {
      name: "Dental and medical",
      wunschVor: "I want to",
      wunschKern: "finance treatment",
      teaser: "Pay for dentures, implants and co-payments in fixed instalments.",
      vorteil: "a fixed instalment, not an overdraft",
      hinweis:
        "Statutory health insurance only subsidises dentures and implants; the co-payment quickly reaches four figures. An instalment loan is usually cheaper than the practice's own payment plan.",
      h1: "Finance treatment",
      h1Highlight: "without the wait.",
      metaTitel: "Finance dental treatment: co-payment in instalments",
      metaBeschreibung:
        "Finance dentures, implants or other co-payments: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "Statutory health insurance only subsidises dentures, implants and many other treatments. The co-payment quickly reaches four figures — and falls due all at once. An instalment loan spreads it across fixed monthly payments.",
      punkte: [
        {
          titel: "The co-payment is predictable",
          text: "Your practice's treatment and cost plan states the amount in advance. That lets you work out the financing before treatment starts.",
        },
        {
          titel: "Usually cheaper than the practice plan",
          text: "Billing providers offer their own instalment plans, often with fees rather than a stated rate. Compare both using the effective annual rate.",
        },
        {
          titel: "Free choice of practice and laboratory",
          text: "The money is in your account. You are not tied to a practice that happens to offer a particular financing option.",
        },
        {
          titel: "Insurance first, loan second",
          text: "Approvals, hardship provisions and any supplementary dental insurance reduce the co-payment. Finance only what remains after that.",
        },
      ],
      faq: [
        {
          frage: "Is this only for dental treatment?",
          antwort:
            "No. The loan is not tied to a purpose and equally covers glasses, hearing aids, orthodontics or other co-payments.",
        },
        {
          frage: "Do I have to submit the treatment plan?",
          antwort:
            "Not for the calculation. You apply for an ordinary instalment loan; banks generally do not ask for treatment documentation.",
        },
        {
          frage: "What about paying in instalments via the practice?",
          antwort:
            "It is convenient, but the cost is often presented as a fee. Ask for the effective annual rate and set it against the loan offer.",
        },
      ],
    },
  },
  {
    id: "ausbildung",
    slug: "ausbildungskredit",
    farbe: "#facc15",
    betrag: 15000,
    monate: 84,
    de: {
      name: "Ausbildung & Studium",
      wunschVor: "Ich möchte meine",
      wunschKern: "Ausbildung finanzieren",
      teaser: "Weiterbildung, Meisterkurs oder Studium ohne Nebenjob-Zwang.",
      vorteil: "lange Laufzeiten möglich",
      hinweis:
        "Prüfen Sie zuerst BAföG, Aufstiegs-BAföG, Stipendien und geförderte Studienkredite — diese sind in der Regel günstiger. Ein Ratenkredit ist der Weg für alles, was dort nicht abgedeckt ist.",
      h1: "Ausbildung finanzieren",
      h1Highlight: "und Zeit zum Lernen behalten.",
      metaTitel: "Ausbildungskredit: Weiterbildung und Studium",
      metaBeschreibung:
        "Weiterbildung, Meisterkurs oder Studium finanzieren: Rate berechnen, lange Laufzeiten vergleichen und über 20 Banken Schufa-neutral anfragen.",
      intro:
        "Meisterkurs, Fachweiterbildung, Umschulung oder ein Studium neben dem Beruf: Die Gebühren sind oft im Voraus fällig, der Ertrag stellt sich erst später ein. Ein Ratenkredit überbrückt diese Lücke mit einer festen Rate.",
      punkte: [
        {
          titel: "Erst Förderung, dann Kredit",
          text: "BAföG, Aufstiegs-BAföG, Bildungsgutscheine und Stipendien sind günstiger als jeder Kredit. Finanzieren Sie damit zuerst und nur den Rest über einen Ratenkredit.",
        },
        {
          titel: "Gebühren, Material und Lebenshaltung",
          text: "Kursgebühren, Prüfungsgebühren, Fachliteratur und ausgefallene Arbeitsstunden lassen sich in einem Betrag zusammenfassen.",
        },
        {
          titel: "Längere Laufzeiten senken die Rate",
          text: "Weil sich eine Qualifikation über Jahre auszahlt, ist eine längere Laufzeit hier vertretbar. Die Rate sinkt, die Gesamtkosten steigen — der Rechner zeigt beides.",
        },
        {
          titel: "Kosten steuerlich prüfen",
          text: "Aufwendungen für Fortbildung im ausgeübten Beruf sind häufig als Werbungskosten absetzbar. Das ändert nichts an der Rate, aber am Ergebnis. Fragen Sie im Zweifel eine Steuerberatung.",
        },
      ],
      faq: [
        {
          frage: "Ist das dasselbe wie ein Studienkredit?",
          antwort:
            "Nein. Geförderte Studienkredite werden monatlich ausgezahlt und haben eigene Bedingungen. Hier geht es um einen gewöhnlichen Ratenkredit, der in einer Summe ausgezahlt wird — sinnvoll vor allem für Weiterbildung und Umschulung.",
        },
        {
          frage: "Bekomme ich als Studierende oder Studierender einen Kredit?",
          antwort:
            "Banken prüfen ein regelmäßiges Einkommen. Ohne eigenes Einkommen ist ein Ratenkredit meist nicht möglich — dann führen Förderprogramme oder ein Antrag zu zweit weiter.",
        },
        {
          frage: "Kann ich nach dem Abschluss schneller zurückzahlen?",
          antwort:
            "Bei den meisten Angeboten kostenfrei. Ob Sondertilgung möglich ist, steht bei jedem Angebot dabei.",
        },
      ],
    },
    en: {
      name: "Education and training",
      wunschVor: "I want to",
      wunschKern: "finance my studies",
      teaser: "Training, qualification or study without relying on a side job.",
      vorteil: "longer terms available",
      hinweis:
        "Check public funding, grants and subsidised student loans first — they are usually cheaper. An instalment loan is the route for whatever they do not cover.",
      h1: "Finance your training",
      h1Highlight: "and keep time to study.",
      metaTitel: "Education loan: training and study",
      metaBeschreibung:
        "Finance training, a professional qualification or study: calculate the instalment, compare longer terms across 20+ banks, credit-score-neutral.",
      intro:
        "A professional qualification, further training, retraining or study alongside work: the fees usually fall due up front while the return arrives later. An instalment loan bridges that gap with a fixed payment.",
      punkte: [
        {
          titel: "Funding first, loan second",
          text: "Public funding, training vouchers and scholarships are cheaper than any loan. Use those first and finance only the remainder.",
        },
        {
          titel: "Fees, materials and living costs",
          text: "Course fees, examination fees, textbooks and lost working hours can be combined into a single amount.",
        },
        {
          titel: "Longer terms lower the instalment",
          text: "Because a qualification pays off over years, a longer term is defensible here. The instalment falls, the total rises — the calculator shows both.",
        },
        {
          titel: "Check the tax treatment",
          text: "Training costs related to your current occupation are often deductible. That does not change the instalment, but it changes the outcome. Ask a tax adviser if in doubt.",
        },
      ],
      faq: [
        {
          frage: "Is this the same as a student loan?",
          antwort:
            "No. Subsidised student loans pay out monthly and have their own conditions. This is an ordinary instalment loan paid out in one sum — most useful for further training and retraining.",
        },
        {
          frage: "Can I get a loan as a student?",
          antwort:
            "Banks assess regular income. Without your own income an instalment loan is usually not possible — funding schemes or a joint application are the way forward.",
        },
        {
          frage: "Can I repay faster after graduating?",
          antwort:
            "With most offers free of charge. Whether early repayment is possible is stated with every offer.",
        },
      ],
    },
  },
  {
    id: "umzug",
    slug: "umzugskredit",
    farbe: "#94a3b8",
    betrag: 5000,
    monate: 36,
    de: {
      name: "Umzugskredit",
      wunschVor: "Ich möchte meinen",
      wunschKern: "Umzug finanzieren",
      teaser: "Kaution, Spedition und doppelte Miete auf einmal abdecken.",
      vorteil: "Kaution sofort verfügbar",
      h1: "Umzug finanzieren:",
      h1Highlight: "Kaution, Spedition, Nebenkosten.",
      metaTitel: "Umzugskredit: Kaution und Umzugskosten",
      metaBeschreibung:
        "Kaution, Spedition und doppelte Miete überbrücken: Rate für einen Umzugskredit berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Ein Umzug kostet an vielen Stellen gleichzeitig: Kaution, Spedition, Renovierung, häufig eine doppelte Miete und oft auch neue Einrichtung. Ein Ratenkredit verteilt diese Spitze auf feste Monatsraten.",
      punkte: [
        {
          titel: "Kaution ohne Bürgschaft",
          text: "Bei Wohnraum sind bis zu drei Nettokaltmieten Kaution zulässig. Mit dem Kredit zahlen Sie sie direkt, statt eine Kautionsbürgschaft dauerhaft mitzufinanzieren.",
        },
        {
          titel: "Doppelte Miete überbrücken",
          text: "Zwischen Übergabe und Auszug fallen häufig zwei Mieten an. Der Kredit fängt diesen Monat ab, ohne dass das Konto ins Minus rutscht.",
        },
        {
          titel: "Spedition statt Freundschaftsdienst",
          text: "Wer den Umzug vergibt, spart Urlaubstage — und ist bei Transportschäden abgesichert.",
        },
        {
          titel: "Alles in einem Betrag",
          text: "Kaution, Umzugsunternehmen, Renovierung und Ummeldungen lassen sich zusammen finanzieren, statt einzeln über den Dispo zu laufen.",
        },
      ],
      faq: [
        {
          frage: "Wie hoch darf die Kaution sein?",
          antwort:
            "Bei Wohnraum höchstens drei Nettokaltmieten. Der Vermieter muss sie getrennt von seinem eigenen Vermögen anlegen.",
        },
        {
          frage: "Bekomme ich die Kaution zurück?",
          antwort:
            "Nach dem Auszug ja, sofern keine berechtigten Ansprüche offen sind. Mit dem Rückfluss können Sie den Kredit ganz oder teilweise ablösen.",
        },
        {
          frage: "Lohnt sich das gegenüber dem Dispo?",
          antwort:
            "In der Regel ja, weil der Dispozins deutlich über dem eines Ratenkredits liegt und sich der Saldo nicht von selbst zurückführt.",
        },
      ],
    },
    en: {
      name: "Moving loan",
      wunschVor: "I want to",
      wunschKern: "finance my move",
      teaser: "Cover the deposit, the movers and a double rent at once.",
      vorteil: "deposit available immediately",
      h1: "Finance a move:",
      h1Highlight: "deposit, movers, extras.",
      metaTitel: "Moving loan: deposit and relocation costs",
      metaBeschreibung:
        "Cover the deposit, the movers and a double rent: calculate a moving loan and compare 20+ banks with no effect on your credit score.",
      intro:
        "A move costs in several places at once: deposit, movers, redecorating, often a double rent and frequently new furniture too. An instalment loan spreads that peak across fixed monthly payments.",
      punkte: [
        {
          titel: "A deposit without a guarantee product",
          text: "For residential lets the deposit may be up to three months' base rent. With the loan you pay it directly instead of paying for a deposit guarantee indefinitely.",
        },
        {
          titel: "Bridge a double rent",
          text: "Between handover and moving out, two rents often fall due. The loan absorbs that month without pushing the account into the red.",
        },
        {
          titel: "Movers instead of favours",
          text: "Hiring a firm saves holiday days — and covers you if something is damaged in transit.",
        },
        {
          titel: "Everything in one amount",
          text: "Deposit, movers, redecorating and registrations can be financed together instead of running separately through an overdraft.",
        },
      ],
      faq: [
        {
          frage: "How large can the deposit be?",
          antwort:
            "For residential lets, at most three months' base rent. The landlord must hold it separately from their own assets.",
        },
        {
          frage: "Do I get the deposit back?",
          antwort:
            "After moving out, yes, provided no legitimate claims remain. You can use the refund to repay the loan in part or in full.",
        },
        {
          frage: "Is this better than an overdraft?",
          antwort:
            "Usually yes, because overdraft rates sit well above instalment loan rates and the balance does not repay itself.",
        },
      ],
    },
  },
];

/**
 * So viele Zwecke gelten als häufig gewählt. Sie stehen im Antrag in einer
 * eigenen Gruppe und tragen auf Schritt 1 einen Akzentrand.
 */
export const HAEUFIG_ANZAHL = 4;

/**
 * So viele Zwecke stehen im Antrag sofort da. Der Rest liegt hinter
 * "Sonstige", damit die Auswahl auf den ersten Blick überschaubar bleibt —
 * bei sechzehn Kacheln wäre sie es sonst nicht mehr.
 */
export const SICHTBAR_ANZAHL = 5;

/**
 * Der ganze Wunschsatz am Stück — für Vorlesehilfen und Beschriftungen, wo
 * die Gestaltung keine Rolle spielt und nur der Sinn zählt.
 */
export function ganzerWunsch(inhalt: KreditartInhalt): string {
  return `${inhalt.wunschVor} ${inhalt.wunschKern}`;
}

/** Schnellzugriff über die Adresse. */
export function findeKreditart(slug: string): Kreditart | undefined {
  return KREDITARTEN.find((a) => a.slug === slug);
}

/**
 * Ob eine Kennung zu einer der Kreditarten gehört.
 *
 * Nötig, weil der Zweck über die Adresszeile in den Antrag kommt: Ohne diese
 * Prüfung ließe sich dort jeder beliebige Wert hineinschreiben und stünde
 * anschließend als gewählte Kreditart im Antrag.
 */
export function istKreditartId(id: string | undefined): id is string {
  return !!id && KREDITARTEN.some((a) => a.id === id);
}

/** Die Kreditart zu einer Kennung — für Verweise aus dem Antrag heraus. */
export function findeKreditartNachId(id: string): Kreditart | undefined {
  return KREDITARTEN.find((a) => a.id === id);
}

/** Pfad zur Seite einer Kreditart. */
export function kreditartPfad(art: Kreditart): string {
  return `/kredit/${art.slug}`;
}

/**
 * Die weiteren Kreditarten, für die Querverweise am Seitenende.
 *
 * Gesucht wird über die Adresse, nicht über die Objektgleichheit: Eine
 * Kreditart, die über die Grenze zwischen Server und Browser gereicht wurde,
 * ist dort eine Kopie und in dieser Liste nicht mehr wiederzufinden. indexOf
 * lieferte dann -1, und der erste Verweis zeigte auf die Seite, auf der man
 * ohnehin schon steht.
 */
export function andereKreditarten(art: Kreditart, anzahl = 4): Kreditart[] {
  const start = KREDITARTEN.findIndex((a) => a.slug === art.slug);
  return Array.from({ length: anzahl }, (_, i) => {
    return KREDITARTEN[(start + 1 + i) % KREDITARTEN.length];
  });
}

/**
 * Beschriftungen, die auf allen Kreditartseiten gleich sind. Der eigentliche
 * Inhalt steht je Kreditart oben; hier steht nur, wie die Abschnitte heißen.
 */
export type KreditartTexte = {
  brotkrumeStart: string;
  brotkrumeKredite: string;
  rechnerEyebrow: string;
  rechnerTitel: string;
  rechnerText: string;
  punkteEyebrow: string;
  punkteTitel: string;
  ablaufEyebrow: string;
  ablaufTitel: string;
  faqEyebrow: string;
  faqTitel: string;
  andereEyebrow: string;
  andereTitel: string;
  andereText: string;
  schlussTitel: string;
  schlussText: string;
  schlussCta: string;
  zurStartseite: string;
  /** Überschriften der Übersichtsseite und des Blocks auf der Startseite. */
  uebersichtEyebrow: string;
  uebersichtTitel: string;
  uebersichtHighlight: string;
  uebersichtText: string;
  /** Verweis von der Startseite auf die vollständige Übersicht. */
  alleAnsehen: string;
};

export const KREDITART_TEXTE: Record<Language, KreditartTexte> = {
  de: {
    brotkrumeStart: "Startseite",
    brotkrumeKredite: "Kreditarten",
    rechnerEyebrow: "Rate berechnen",
    rechnerTitel: "Was kostet Sie das im Monat?",
    rechnerText:
      "Betrag und Laufzeit einstellen — die Rate rechnet sich sofort mit. Die Werte sind für diesen Verwendungszweck vorbelegt und lassen sich frei ändern.",
    punkteEyebrow: "Worauf es ankommt",
    punkteTitel: "Das sollten Sie wissen",
    ablaufEyebrow: "So läuft es ab",
    ablaufTitel: "Drei Schritte bis zum Angebot",
    faqEyebrow: "Häufige Fragen",
    faqTitel: "Kurz beantwortet",
    andereEyebrow: "Weitere Kreditarten",
    andereTitel: "Passt etwas anderes besser?",
    andereText:
      "Jeder Verwendungszweck hat eigene Regeln. Hier geht es zu den übrigen.",
    schlussTitel: "Sehen Sie in zwei Minuten, was möglich ist",
    schlussText:
      "Unverbindlich, kostenlos und ohne Wirkung auf Ihre Bonität.",
    schlussCta: "Jetzt vergleichen",
    zurStartseite: "Zur Startseite",
    uebersichtEyebrow: "Kreditarten",
    uebersichtTitel: "Was möchten Sie",
    uebersichtHighlight: "finanzieren?",
    uebersichtText:
      "Wählen Sie den passenden Finanzierungszweck. So finden wir die besten Kreditangebote für Ihre Situation.",
    // {n} wird durch die Zahl der Zwecke ersetzt.
    alleAnsehen: "Alle {n} Verwendungszwecke ansehen",
  },
  en: {
    brotkrumeStart: "Home",
    brotkrumeKredite: "Loan types",
    rechnerEyebrow: "Calculate your instalment",
    rechnerTitel: "What does it cost you per month?",
    rechnerText:
      "Set the amount and the term — the instalment updates as you go. The values are pre-filled for this purpose and can be changed freely.",
    punkteEyebrow: "What matters",
    punkteTitel: "What you should know",
    ablaufEyebrow: "How it works",
    ablaufTitel: "Three steps to your offer",
    faqEyebrow: "Frequent questions",
    faqTitel: "Answered briefly",
    andereEyebrow: "Other loan types",
    andereTitel: "Would something else fit better?",
    andereText:
      "Every purpose has its own rules. Here are the remaining ones.",
    schlussTitel: "See in two minutes what is possible",
    schlussText: "Non-binding, free, and with no effect on your credit score.",
    schlussCta: "Compare now",
    zurStartseite: "Back to the homepage",
    uebersichtEyebrow: "Loan types",
    uebersichtTitel: "What would you like",
    uebersichtHighlight: "to finance?",
    uebersichtText:
      "Choose the purpose that fits. That is how we find the best loan offers for your situation.",
    alleAnsehen: "See all {n} loan purposes",
  },
};
