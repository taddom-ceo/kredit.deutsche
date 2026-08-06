import type { Language } from "./i18n";

/**
 * Die elf Verwendungszwecke als eigene Seiten.
 *
 * Sie sind dieselben, die der Antrag auf Schritt 1 zur Wahl stellt — die
 * Kennung `id` ist deshalb bewusst identisch mit der dortigen Kachel. Wer über
 * eine dieser Seiten in den Antrag geht, hat den Zweck damit schon gewählt und
 * überspringt den Schritt.
 *
 * Die Adresse (`slug`) steht getrennt davon, weil sie nach anderen Regeln
 * gebildet wird: Sie soll das Wort enthalten, nach dem gesucht wird
 * ("autokredit"), nicht die interne Kennung ("fahrzeug"). Einmal
 * veröffentlicht, darf sie sich nicht mehr ändern — jede Adresse ist ein
 * Suchergebnis, das sonst ins Leere liefe.
 */
export type KreditartInhalt = {
  /** Kurzform für Verweise und Listen. */
  name: string;
  /** Erste Zeile der Hauptüberschrift. */
  h1: string;
  /** Zweite, hervorgehobene Zeile der Hauptüberschrift. */
  h1Highlight: string;
  /** Titel im Browsertab und im Suchergebnis. Unter 60 Zeichen bleiben. */
  metaTitel: string;
  /** Text unter dem Suchergebnis. Zwischen 120 und 160 Zeichen. */
  metaBeschreibung: string;
  /** Einleitung unter der Überschrift. */
  intro: string;
  /** Einzeiler für die Kachel auf der Startseite. */
  teaser: string;
  /** Worauf es bei dieser Kreditart ankommt. */
  punkte: { titel: string; text: string }[];
  /** Fragen, die zu dieser Kreditart immer wieder gestellt werden. */
  faq: { frage: string; antwort: string }[];
};

export type Kreditart = {
  id: string;
  slug: string;
  /** Voreinstellung des Rechners — ein für diesen Zweck üblicher Betrag. */
  betrag: number;
  /** Voreinstellung des Rechners in Monaten. */
  monate: number;
  de: KreditartInhalt;
  en: KreditartInhalt;
};

export const KREDITARTEN: Kreditart[] = [
  {
    id: "frei",
    slug: "privatkredit",
    betrag: 20000,
    monate: 72,
    de: {
      name: "Privatkredit",
      h1: "Privatkredit",
      h1Highlight: "ohne festen Zweck.",
      metaTitel: "Privatkredit ohne Verwendungszweck vergleichen",
      metaBeschreibung:
        "Privatkredit zur freien Verwendung: Betrag und Laufzeit einstellen, Rate sofort sehen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Ein Kredit zur freien Verwendung ist an keinen Zweck gebunden. Sie müssen der Bank nicht sagen, wofür das Geld gedacht ist, und keine Rechnungen oder Kaufverträge nachreichen — das macht ihn zur flexibelsten und meist auch schnellsten Form der Finanzierung.",
      teaser: "Ohne Zweckbindung und ohne Nachweise",
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
      h1: "A personal loan",
      h1Highlight: "with no fixed purpose.",
      metaTitel: "Compare personal loans with no fixed purpose",
      metaBeschreibung:
        "A personal loan you can spend freely: set the amount and term, see your instalment straight away and compare 20+ banks with no effect on your credit score.",
      intro:
        "A loan for general use is not tied to a purpose. You do not have to tell the bank what the money is for and you do not submit invoices or purchase contracts — which makes it the most flexible and usually the fastest form of financing.",
      teaser: "No stated purpose, no paperwork",
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
    betrag: 25000,
    monate: 72,
    de: {
      name: "Autokredit",
      h1: "Autokredit",
      h1Highlight: "für Neu- und Gebrauchtwagen.",
      metaTitel: "Autokredit vergleichen: Neu- und Gebrauchtwagen",
      metaBeschreibung:
        "Autokredit statt Händlerfinanzierung: Rate berechnen, über 20 Banken Schufa-neutral vergleichen und beim Händler als Barzahler auftreten. Kostenlos.",
      intro:
        "Mit einem Autokredit finanzieren Sie Neu- oder Gebrauchtwagen unabhängig vom Händler. Weil das Geld auf Ihr Konto geht, treten Sie beim Kauf als Barzahler auf und verhandeln über den Preis statt über die Monatsrate.",
      teaser: "Als Barzahler kaufen statt beim Händler finanzieren",
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
      h1: "A car loan",
      h1Highlight: "for new and used cars.",
      metaTitel: "Compare car loans for new and used cars",
      metaBeschreibung:
        "A car loan instead of dealer financing: calculate your instalment, compare 20+ banks with no effect on your credit score and buy as a cash buyer.",
      intro:
        "A car loan lets you finance a new or used car independently of the dealer. Because the money lands in your account, you buy as a cash buyer and negotiate the price rather than the monthly instalment.",
      teaser: "Buy as a cash buyer instead of financing at the dealer",
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
    betrag: 30000,
    monate: 84,
    de: {
      name: "Umschuldung",
      h1: "Umschuldung:",
      h1Highlight: "mehrere Kredite, eine Rate.",
      metaTitel: "Umschuldung: Kredite ablösen und zusammenfassen",
      metaBeschreibung:
        "Laufende Kredite zu einer Rate zusammenfassen: neue Rate berechnen, über 20 Banken Schufa-neutral vergleichen und die monatliche Belastung senken.",
      intro:
        "Bei einer Umschuldung lösen Sie laufende Kredite mit einem neuen ab. Aus mehreren Raten wird eine, und die Laufzeit lässt sich so wählen, dass die monatliche Belastung sinkt.",
      teaser: "Laufende Verträge bündeln und die Rate senken",
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
      h1: "Consolidation:",
      h1Highlight: "several loans, one instalment.",
      metaTitel: "Debt consolidation: clear and combine loans",
      metaBeschreibung:
        "Combine running loans into a single instalment: calculate the new payment, compare 20+ banks with no effect on your credit score and lower your monthly load.",
      intro:
        "Consolidation means clearing your running loans with a new one. Several instalments become one, and the term can be chosen so that the monthly burden goes down.",
      teaser: "Bundle running contracts and lower the instalment",
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
    betrag: 50000,
    monate: 120,
    de: {
      name: "Modernisierungskredit",
      h1: "Modernisierungskredit",
      h1Highlight: "ohne Grundbucheintrag.",
      metaTitel: "Modernisierungskredit: Umbau und Sanierung",
      metaBeschreibung:
        "Modernisierung ohne Grundbucheintrag finanzieren: Rate berechnen, lange Laufzeiten vergleichen und über 20 Banken Schufa-neutral anfragen.",
      intro:
        "Ein Modernisierungskredit finanziert Umbau, Sanierung und Renovierung, ohne dass die Immobilie als Sicherheit in das Grundbuch eingetragen wird. Das spart Notar- und Grundbuchkosten und mehrere Wochen Bearbeitungszeit.",
      teaser: "Umbau und Sanierung ohne Notartermin",
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
      h1: "A home improvement loan",
      h1Highlight: "with no land charge.",
      metaTitel: "Home improvement loan: renovation and conversion",
      metaBeschreibung:
        "Finance renovation without a land charge: calculate your instalment, compare longer terms across 20+ banks with no effect on your credit score.",
      intro:
        "A home improvement loan finances conversion, renovation and refurbishment without registering the property as security in the land register. That saves notary and registry fees and several weeks of processing.",
      teaser: "Renovate without a notary appointment",
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
    betrag: 8000,
    monate: 48,
    de: {
      name: "Dispo ablösen",
      h1: "Dispo ablösen",
      h1Highlight: "und Zinsen sparen.",
      metaTitel: "Dispo ablösen: Kontoüberziehung umschulden",
      metaBeschreibung:
        "Dispozinsen sind häufig zweistellig. Rate für einen Ratenkredit berechnen, über 20 Banken Schufa-neutral vergleichen und den Dispo in festen Raten zurückführen.",
      intro:
        "Der Dispositionskredit ist der teuerste Weg, dauerhaft im Minus zu stehen. Wer ihn mit einem Ratenkredit ablöst, tauscht einen variablen, hohen Zins gegen einen festen Zins und einen klaren Tilgungsplan.",
      teaser: "Variable Dispozinsen gegen eine feste Rate tauschen",
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
      h1: "Clear your overdraft",
      h1Highlight: "and save on interest.",
      metaTitel: "Clear your overdraft: refinance the balance",
      metaBeschreibung:
        "Overdraft rates are often double digit. Calculate an instalment loan, compare 20+ banks with no effect on your credit score and repay in fixed instalments.",
      intro:
        "An overdraft is the most expensive way to stay in the red. Clearing it with an instalment loan swaps a high, variable rate for a fixed one and a clear repayment plan.",
      teaser: "Swap a variable overdraft rate for a fixed instalment",
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
    betrag: 5000,
    monate: 36,
    de: {
      name: "Ratenkauf ablösen",
      h1: "Ratenkauf ablösen",
      h1Highlight: "und Teilzahlungen bündeln.",
      metaTitel: "Ratenkauf ablösen: Teilzahlungen zusammenfassen",
      metaBeschreibung:
        "Mehrere Ratenkäufe und Teilzahlungen zu einem Kredit zusammenfassen: Rate berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Ratenkäufe im Handel und Teilzahlungen bei Online-Anbietern laufen oft parallel und zu ganz unterschiedlichen Konditionen. Ein Ratenkredit fasst sie zusammen: eine Rate, ein Zinssatz, ein Enddatum.",
      teaser: "Viele kleine Teilzahlungen zu einem Vertrag machen",
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
      h1: "Clear retail instalments",
      h1Highlight: "and bundle the rest.",
      metaTitel: "Clear instalment plans: bundle retail credit",
      metaBeschreibung:
        "Combine several retail instalment plans into one loan: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "Retail instalment plans and buy-now-pay-later arrangements often run in parallel on very different terms. One loan pulls them together: one instalment, one rate, one end date.",
      teaser: "Turn many small plans into a single contract",
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
    id: "ebike",
    slug: "e-bike-finanzierung",
    betrag: 4000,
    monate: 36,
    de: {
      name: "E-Bike-Finanzierung",
      h1: "E-Bike finanzieren",
      h1Highlight: "ohne Händlerbindung.",
      metaTitel: "E-Bike finanzieren: Pedelec-Kredit vergleichen",
      metaBeschreibung:
        "E-Bike oder Pedelec finanzieren, ohne an einen Händler gebunden zu sein: Rate berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Ein gutes Pedelec kostet so viel wie ein gebrauchtes Auto. Mit einem Ratenkredit kaufen Sie es unabhängig vom Händler und sind nicht an dessen Finanzierungspartner gebunden.",
      teaser: "Pedelec und Zubehör unabhängig vom Händler kaufen",
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
      h1: "Finance an e-bike",
      h1Highlight: "without dealer ties.",
      metaTitel: "Finance an e-bike: compare pedelec loans",
      metaBeschreibung:
        "Finance an e-bike or pedelec without being tied to one dealer: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "A good pedelec costs as much as a used car. With an instalment loan you buy it independently of the dealer and are not tied to their financing partner.",
      teaser: "Buy a pedelec and accessories free of the dealer",
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
    id: "kueche",
    slug: "kuechenkredit",
    betrag: 15000,
    monate: 60,
    de: {
      name: "Küchenkredit",
      h1: "Küche finanzieren",
      h1Highlight: "zum Barzahlerpreis.",
      metaTitel: "Küchenkredit: Einbauküche finanzieren",
      metaBeschreibung:
        "Einbauküche unabhängig vom Küchenstudio finanzieren: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Eine Einbauküche wird meist im Studio finanziert — zu Konditionen, die sich am Verkaufstisch schwer vergleichen lassen. Mit einem eigenen Ratenkredit kennen Sie den effektiven Jahreszins, bevor Sie in die Beratung gehen.",
      teaser: "Einbauküche und Geräte im Voraus bezahlen",
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
      h1: "Finance a kitchen",
      h1Highlight: "at the cash price.",
      metaTitel: "Kitchen loan: finance a fitted kitchen",
      metaBeschreibung:
        "Finance a fitted kitchen independently of the showroom: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "A fitted kitchen is usually financed in the showroom — on terms that are hard to compare at the sales desk. With your own loan you know the effective annual rate before the consultation starts.",
      teaser: "Pay for the kitchen and appliances up front",
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
    id: "moebel",
    slug: "moebelkredit",
    betrag: 8000,
    monate: 48,
    de: {
      name: "Möbelkredit",
      h1: "Möbel finanzieren",
      h1Highlight: "ohne Ratenkauf.",
      metaTitel: "Möbelkredit: Einrichtung finanzieren",
      metaBeschreibung:
        "Möbel und Einrichtung mit einem Ratenkredit finanzieren statt mit Ratenkauf im Möbelhaus: Rate berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Wer eine Wohnung komplett einrichtet, kommt schnell auf einen vierstelligen Betrag. Ein Ratenkredit ist dabei in der Regel übersichtlicher und günstiger als mehrere Ratenkäufe bei verschiedenen Händlern.",
      teaser: "Einrichtung über einen Vertrag statt über drei Händler",
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
      h1: "Finance furniture",
      h1Highlight: "without retail credit.",
      metaTitel: "Furniture loan: finance your interior",
      metaBeschreibung:
        "Finance furniture with an instalment loan rather than store credit: calculate the instalment and compare 20+ banks with no effect on your credit score.",
      intro:
        "Furnishing a flat from scratch quickly runs into four figures. An instalment loan is usually clearer and cheaper than several store credit plans across different retailers.",
      teaser: "One contract instead of three retailers",
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
    id: "umzug",
    slug: "umzugskredit",
    betrag: 5000,
    monate: 36,
    de: {
      name: "Umzugskredit",
      h1: "Umzug finanzieren:",
      h1Highlight: "Kaution, Spedition, Nebenkosten.",
      metaTitel: "Umzugskredit: Kaution und Umzugskosten",
      metaBeschreibung:
        "Kaution, Spedition und doppelte Miete überbrücken: Rate für einen Umzugskredit berechnen und über 20 Banken Schufa-neutral vergleichen.",
      intro:
        "Ein Umzug kostet an vielen Stellen gleichzeitig: Kaution, Spedition, Renovierung, häufig eine doppelte Miete und oft auch neue Einrichtung. Ein Ratenkredit verteilt diese Spitze auf feste Monatsraten.",
      teaser: "Die Kostenspitze rund um den Umzug abfedern",
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
      h1: "Finance a move:",
      h1Highlight: "deposit, movers, extras.",
      metaTitel: "Moving loan: deposit and relocation costs",
      metaBeschreibung:
        "Cover the deposit, the movers and a double rent: calculate a moving loan and compare 20+ banks with no effect on your credit score.",
      intro:
        "A move costs in several places at once: deposit, movers, redecorating, often a double rent and frequently new furniture too. An instalment loan spreads that peak across fixed monthly payments.",
      teaser: "Smooth out the cost peak around a move",
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
  {
    id: "reise",
    slug: "reisekredit",
    betrag: 5000,
    monate: 24,
    de: {
      name: "Reisekredit",
      h1: "Reise finanzieren",
      h1Highlight: "in festen Raten.",
      metaTitel: "Reisekredit: Urlaub finanzieren und vergleichen",
      metaBeschreibung:
        "Größere Reise in festen Raten zahlen statt über den Dispo: Rate berechnen und über 20 Banken Schufa-neutral vergleichen. Kostenlos und unverbindlich.",
      intro:
        "Eine größere Reise wird oft Monate im Voraus gebucht und in voller Höhe fällig. Ein Ratenkredit verteilt die Kosten auf feste Raten — planbar und deutlich günstiger als eine dauerhaft überzogene Kreditkarte.",
      teaser: "Frühbucherpreis sichern, in Raten zurückzahlen",
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
      name: "Travel loan",
      h1: "Finance a trip",
      h1Highlight: "in fixed instalments.",
      metaTitel: "Travel loan: finance a holiday and compare",
      metaBeschreibung:
        "Pay for a bigger trip in fixed instalments rather than through an overdraft: calculate the payment and compare 20+ banks, credit-score-neutral.",
      intro:
        "A bigger trip is often booked months ahead and payable in full. An instalment loan spreads the cost across fixed payments — predictable, and far cheaper than a permanently maxed-out credit card.",
      teaser: "Lock in the early-booking price, repay in instalments",
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
];

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
    uebersichtTitel: "Für welchen Zweck",
    uebersichtHighlight: "brauchen Sie das Geld?",
    uebersichtText:
      "Der Verwendungszweck entscheidet über Zinssatz, Laufzeit und darüber, welche Nachweise die Bank verlangt. Wählen Sie den passenden — auf jeder Seite finden Sie einen Rechner und das Wichtigste in Kürze.",
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
    uebersichtTitel: "What do you",
    uebersichtHighlight: "need the money for?",
    uebersichtText:
      "The purpose decides the rate, the term and what proof the bank asks for. Pick the one that fits — every page carries a calculator and the essentials in brief.",
  },
};
