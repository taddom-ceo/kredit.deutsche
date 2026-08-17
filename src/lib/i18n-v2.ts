import type { Language } from "./i18n";

/**
 * Die Texte der zweiten Fassung der Startseite.
 *
 * Eigene Datei und eigene Schluessel, statt die vorhandenen zu aendern: Die
 * beiden Fassungen sollen nebeneinander stehen und sich vergleichen lassen.
 * Waeren die Texte geteilt, aenderte jede Verbesserung an der einen auch die
 * andere — und der Vergleich sagte nichts mehr aus.
 *
 * Was sich gegenueber der ersten Fassung aendert und warum, steht bei den
 * einzelnen Bloecken. Der rote Faden: Der Rechner steht oben statt in der
 * Mitte, es gibt einen Aufruf statt zwei, und alles, was nicht belegbar ist,
 * ist entweder weg oder als Beispiel gekennzeichnet.
 */
export type V2Texte = {
  badge: string;
  titel: string;
  titelHervor: string;
  untertitel: string;
  /** Vier Zusagen unter der Ueberschrift, knapp. */
  zusagen: string[];
  rechnerUeber: string;
  /** Beschriftung des einen Aufrufs der Seite. */
  rechnerCta: string;
  /* --- nur die dritte Fassung: Handy mit mitrechnender Plakette --- */
  /** Was unter der Ersparnis steht. */
  ersparnisLabel: string;
  /** Die Fussnote der Plakette. Nennt den Vergleichszins. */
  ersparnisFuss: string;
  /** Ueberschrift der Zeichnung im Ablaufabschnitt. */
  ablaufBildTitel: string;
  /** Der Weg fuer die, die erst lesen wollen — als Textverweis, nicht als Knopf. */
  ablaufVerweis: string;
  /**
   * Das repraesentative Beispiel nach § 6a PAngV.
   *
   * Steht direkt beim beworbenen Zins und nicht im Fussbereich: Genau das
   * verlangt die Vorschrift, und genau dort sucht es auch, wer nachrechnen
   * will.
   *
   * Die Zahlen stehen als Platzhalter darin und werden aus derselben Formel
   * gefuellt, mit der der Rechner darueber rechnet. Von Hand eingetragen
   * waeren sie beim ersten geaenderten Zinssatz falsch — und ein falsches
   * Pflichtbeispiel ist schlimmer als keines.
   */
  beispielTitel: string;
  beispielText: string;
  vertrauenEyebrow: string;
  vertrauenTitel: string;
  vertrauenText: string;
  vertrauen: { titel: string; text: string }[];
  erlaubnisTitel: string;
  erlaubnisText: string;
  beraterEyebrow: string;
  beraterTitel: string;
  beraterText: string;
  beraterAnrufen: string;
  ablaufEyebrow: string;
  ablaufTitel: string;
  ablaufUnter: string;
  schritte: { titel: string; text: string }[];
  kreditartenEyebrow: string;
  kreditartenTitel: string;
  kreditartenText: string;
  kreditartenAlle: string;
  faqEyebrow: string;
  faqTitel: string;
  faq: { frage: string; antwort: string }[];
  schlussTitel: string;
  schlussText: string;
  schlussCta: string;
  mitlaufCta: string;
  mitlaufNote: string;
};

/**
 * Die Dauer, die ueberall dieselbe sein muss.
 *
 * In der ersten Fassung stand im Aufmacher "in 2 Minuten", in den Kennzahlen
 * "2 Min. bis zum Angebot" — und die Strecke selbst sagte "Ca. 4 Min.
 * verbleibend". Drei Angaben, zwei Zahlen, und der Widerspruch fiel genau in
 * dem Moment auf, in dem sich jemand entscheidet. Hier steht sie einmal.
 */
export const V2_DAUER = { de: "4 Minuten", en: "4 minutes" } as const;

/** Der Fall, den das repraesentative Beispiel rechnet. */
export const V2_BEISPIEL = { betrag: 20000, monate: 72 } as const;

/** Platzhalter im Beispieltext durch die gerechneten Werte ersetzen. */
export function beispielMitZahlen(
  vorlage: string,
  werte: Record<string, string>
): string {
  return vorlage.replace(/\{(\w+)\}/g, (ganz, name) => werte[name] ?? ganz);
}

export const V2_TEXTE: Record<Language, V2Texte> = {
  de: {
    badge: "Kostenlos · Schufa-neutral · Ohne Unterlagen",
    titel: "Was kostet Sie",
    titelHervor: "Ihr Kredit wirklich?",
    untertitel:
      "Stellen Sie Betrag und Laufzeit ein — die Rate rechnet sich sofort mit. Danach vergleichen wir über 20 Banken mit einer einzigen Anfrage.",
    zusagen: [
      "Ohne Wirkung auf Ihren Schufa-Score",
      "Für Sie kostenlos, wir werden von der Bank vergütet",
      "Unterlagen erst, wenn Sie sich für ein Angebot entscheiden",
      "Zugelassener Kreditvermittler nach § 34c GewO",
    ],
    rechnerUeber: "Ihre Rate berechnen",
    rechnerCta: "Angebote vergleichen",
    ersparnisLabel: "weniger Zinsen als beim teuersten Angebot",
    ersparnisFuss:
      "Gesamtkosten im Vergleich zu 8,50 % eff. Jahreszins, bei gleichem Betrag und gleicher Laufzeit.",
    ablaufBildTitel: "So sieht das auf Ihrem Telefon aus",
    ablaufVerweis: "Wie das genau abläuft",
    beispielTitel: "Repräsentatives Beispiel",
    beispielText:
      "2/3-Beispiel nach § 6a PAngV: Nettodarlehensbetrag {betrag}, Laufzeit {monate} Monate, gebundener Sollzins {sollzins} p. a., effektiver Jahreszins {effektiv}, {monate} monatliche Raten à {rate}, Gesamtbetrag {gesamt}. Zwei Drittel der auf dieser Grundlage vermittelten Verträge erhalten diesen effektiven Jahreszins oder einen günstigeren. Ihr persönlicher Zins hängt von Bonität, Laufzeit und Anbieter ab.",
    vertrauenEyebrow: "Warum Sie uns glauben können",
    vertrauenTitel: "Vier Fragen, die Sie zu Recht stellen",
    vertrauenText:
      "Bei Geld ist Misstrauen gesund. Deshalb hier die Antworten, bevor Sie sie suchen müssen.",
    vertrauen: [
      {
        titel: "Was passiert mit meiner Schufa?",
        text: "Wir stellen eine Konditionsanfrage. Die sieht nur die angefragte Bank, sie ist für andere nicht sichtbar und verändert Ihren Score nicht. Eine Kreditanfrage — die einzige Art, die im Score auftaucht — stellen wir erst, wenn Sie ein Angebot annehmen wollen.",
      },
      {
        titel: "Womit verdienen Sie Geld?",
        text: "Die Bank zahlt uns eine Provision, wenn ein Vertrag zustande kommt. Von Ihnen bekommen wir keinen Cent, weder vorher noch nachher, und Ihr Zins wird dadurch nicht höher — Vorkosten sind bei der Kreditvermittlung ohnehin verboten.",
      },
      {
        titel: "Wer ruft mich an, und wie oft?",
        text: "Ein Berater aus unserem Haus, einmal, zu der Zeit, die Sie angeben. Wir verkaufen Ihre Anfrage nicht weiter — Sie bekommen keine Anrufe von fünf Vermittlern, die Sie nie kontaktiert haben.",
      },
      {
        titel: "Wo liegen meine Daten?",
        text: "Auf Servern in der EU, verschlüsselt übertragen und in der Datenbank noch einmal verschlüsselt abgelegt. Sie können jederzeit verlangen, dass wir alles löschen — dafür genügt eine E-Mail, und wir erledigen es innerhalb eines Monats.",
      },
    ],
    erlaubnisTitel: "Erlaubnis nach § 34c GewO",
    erlaubnisText:
      "Die Vermittlung von Darlehen ist in Deutschland erlaubnispflichtig. Unsere Erlaubnis und die zuständige Aufsichtsbehörde stehen im Impressum.",
    beraterEyebrow: "Ihr Ansprechpartner",
    beraterTitel: "Bei uns ruft ein Mensch an, kein Callcenter",
    beraterText:
      "Wer sich meldet, steht hier mit Namen und Durchwahl. Lieber gleich telefonieren als ein Formular ausfüllen? Auch gut.",
    beraterAnrufen: "Anrufen",
    ablaufEyebrow: "So läuft es ab",
    ablaufTitel: "Drei Schritte, keine Warteschleife",
    ablaufUnter: "Kein Termin, keine Unterlagen im Voraus.",
    schritte: [
      {
        titel: "Rate einstellen",
        text: "Betrag und Laufzeit oben eingeben — Sie sehen sofort, was das im Monat bedeutet.",
      },
      {
        titel: "Angebote vergleichen",
        text: "Wir fragen über 20 Banken an. Eine Anfrage, Schufa-neutral, Ihr Score bleibt unberührt.",
      },
      {
        titel: "Auszahlung erhalten",
        text: "Digital unterschreiben statt Postident-Termin. Bei vielen Banken noch am selben Tag.",
      },
    ],
    kreditartenEyebrow: "Kreditarten",
    kreditartenTitel: "Wofür brauchen Sie das Geld?",
    kreditartenText:
      "Der Zweck entscheidet mit über den Zins. Wählen Sie ihn, dann fragen wir gezielt die Banken an, die dafür die besseren Konditionen haben.",
    kreditartenAlle: "Alle 16 Verwendungszwecke ansehen",
    faqEyebrow: "Häufige Fragen",
    faqTitel: "Kurz beantwortet",
    faq: [
      {
        frage: "Kostet mich der Vergleich etwas?",
        antwort:
          "Nein, und zwar in keiner Form. Kein Beitrag, keine Bearbeitungsgebühr, keine Versicherung, die Sie mitkaufen müssen. Wir bekommen unsere Vergütung von der Bank, und nur dann, wenn ein Vertrag zustande kommt.",
      },
      {
        frage: "Schadet die Anfrage meiner Schufa?",
        antwort:
          "Nein. Eine Konditionsanfrage ist für andere Banken nicht sichtbar und fließt nicht in Ihren Score ein. Nur eine echte Kreditanfrage täte das — und die stellen wir erst, wenn Sie ein Angebot annehmen wollen.",
      },
      {
        frage: "Wer ruft mich an, und wann?",
        antwort:
          "Ein Berater aus unserem Haus, zu der Zeit, die Sie angeben. Einmal. Ihre Anfrage wird nicht an andere Vermittler weitergegeben.",
      },
      {
        frage: "Was passiert mit meinen Daten?",
        antwort:
          "Sie liegen verschlüsselt auf Servern in der EU und werden ausschließlich für Ihre Anfrage verwendet. Auf Wunsch löschen wir alles — eine E-Mail genügt. Was wir erheben und wie lange wir es aufbewahren, steht vollständig in der Datenschutzerklärung.",
      },
      {
        frage: "Wie lange dauert es bis zur Auszahlung?",
        antwort:
          "Die Angebote sehen Sie sofort. Nach der digitalen Unterschrift und der Identifizierung zahlen viele Banken innerhalb von ein bis drei Werktagen aus.",
      },
      {
        frage: "Kann ich früher zurückzahlen?",
        antwort:
          "Bei den meisten Angeboten ja, und zwar kostenfrei. Ob Sondertilgung möglich ist, steht bei jedem Angebot dabei, bevor Sie sich entscheiden.",
      },
    ],
    schlussTitel: "Sie sind vier Minuten von Ihrem Angebot entfernt",
    schlussText:
      "Kostenlos, unverbindlich und ohne Wirkung auf Ihre Bonität. Unterlagen erst, wenn Sie sich entschieden haben.",
    schlussCta: "Jetzt Rate berechnen",
    mitlaufCta: "Rate berechnen",
    mitlaufNote: "kostenlos · Schufa-neutral",
  },
  en: {
    badge: "Free · No credit-score impact · No paperwork",
    titel: "What will your loan",
    titelHervor: "actually cost you?",
    untertitel:
      "Set the amount and the term — the monthly rate updates as you type. We then compare more than 20 banks with a single enquiry.",
    zusagen: [
      "No effect on your Schufa score",
      "Free for you — the bank pays our commission",
      "Documents only once you have chosen an offer",
      "Licensed credit broker under § 34c German Trade Regulation Act",
    ],
    rechnerUeber: "Calculate your rate",
    rechnerCta: "Compare offers",
    ersparnisLabel: "less interest than the most expensive offer",
    ersparnisFuss:
      "Total cost compared with an 8.50 % APR, at the same amount and term.",
    ablaufBildTitel: "This is how it looks on your phone",
    ablaufVerweis: "How it works in detail",
    beispielTitel: "Representative example",
    beispielText:
      "Two-thirds example under § 6a PAngV: net loan amount {betrag}, term {monate} months, fixed borrowing rate {sollzins} p. a., annual percentage rate of charge {effektiv}, {monate} monthly instalments of {rate}, total amount {gesamt}. Two thirds of the contracts arranged on this basis receive this APR or a better one. Your personal rate depends on your credit standing, the term and the lender.",
    vertrauenEyebrow: "Why you can trust us",
    vertrauenTitel: "Four questions you are right to ask",
    vertrauenText:
      "When money is involved, scepticism is healthy. So here are the answers before you have to go looking for them.",
    vertrauen: [
      {
        titel: "What happens to my credit score?",
        text: "We submit a conditions enquiry. Only the bank we ask can see it, it is invisible to others and it does not change your score. A credit enquiry — the only kind that shows up in your score — is submitted only once you want to accept an offer.",
      },
      {
        titel: "How do you make money?",
        text: "The bank pays us a commission when a contract is concluded. You pay us nothing, before or after, and your interest rate is not higher because of it — upfront fees are prohibited in credit brokerage anyway.",
      },
      {
        titel: "Who calls me, and how often?",
        text: "One adviser from our own team, once, at the time you tell us. We do not sell your enquiry on — you will not get calls from five brokers you never contacted.",
      },
      {
        titel: "Where is my data kept?",
        text: "On servers inside the EU, transmitted encrypted and stored encrypted again in the database. You can ask us to delete everything at any time — an email is enough, and we act on it within a month.",
      },
    ],
    erlaubnisTitel: "Licence under § 34c GewO",
    erlaubnisText:
      "Arranging loans requires a licence in Germany. Our licence and the competent supervisory authority are stated in the imprint.",
    beraterEyebrow: "Your contact",
    beraterTitel: "A person calls you, not a call centre",
    beraterText:
      "Whoever gets in touch is named here, with a direct line. Prefer to talk right away instead of filling in a form? That works too.",
    beraterAnrufen: "Call",
    ablaufEyebrow: "How it works",
    ablaufTitel: "Three steps, no hold music",
    ablaufUnter: "No appointment, no paperwork up front.",
    schritte: [
      {
        titel: "Set your rate",
        text: "Enter amount and term above — you see straight away what it means per month.",
      },
      {
        titel: "Compare offers",
        text: "We ask more than 20 banks. One enquiry, no score impact.",
      },
      {
        titel: "Get paid out",
        text: "Sign digitally instead of queuing at the post office. With many banks on the same day.",
      },
    ],
    kreditartenEyebrow: "Loan types",
    kreditartenTitel: "What do you need the money for?",
    kreditartenText:
      "The purpose affects the rate. Pick yours and we approach the banks that offer better terms for it.",
    kreditartenAlle: "See all 16 purposes",
    faqEyebrow: "Frequently asked",
    faqTitel: "Answered briefly",
    faq: [
      {
        frage: "Does the comparison cost me anything?",
        antwort:
          "No, in no form at all. No fee, no processing charge, no insurance you have to buy alongside. We are paid by the bank, and only if a contract is concluded.",
      },
      {
        frage: "Will the enquiry hurt my credit score?",
        antwort:
          "No. A conditions enquiry is invisible to other banks and does not feed into your score. Only a genuine credit enquiry would — and we submit that only once you want to accept an offer.",
      },
      {
        frage: "Who calls me, and when?",
        antwort:
          "An adviser from our own team, at the time you tell us. Once. Your enquiry is not passed on to other brokers.",
      },
      {
        frage: "What happens to my data?",
        antwort:
          "It is stored encrypted on servers inside the EU and used only for your enquiry. We delete everything on request — an email is enough. What we collect and how long we keep it is set out in full in the privacy policy.",
      },
      {
        frage: "How long until the money arrives?",
        antwort:
          "You see the offers immediately. After the digital signature and identification, many banks pay out within one to three working days.",
      },
      {
        frage: "Can I repay early?",
        antwort:
          "With most offers yes, and free of charge. Whether early repayment is possible is stated with every offer before you decide.",
      },
    ],
    schlussTitel: "You are four minutes away from your offer",
    schlussText:
      "Free, non-binding and without any effect on your credit standing. Documents only once you have decided.",
    schlussCta: "Calculate my rate",
    mitlaufCta: "Calculate rate",
    mitlaufNote: "free · no score impact",
  },
};
