"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_COUNTRY_ISO } from "./country-codes";
import {
  antragNutzlast,
  kontaktVorhanden,
  sendeAntrag,
} from "./antrag-senden";

export interface WizardData {
  step: number;
  // Weitester bereits erreichter Schritt. Erlaubt es, über die
  // Fortschrittsleiste zwischen allen schon besuchten Schritten zu springen,
  // ohne ungesehene Schritte überspringen zu können.
  maxStep: number;
  kreditart: string | null;
  purpose: string;
  amount: number;
  months: number;
  personCount: 1 | 2 | null;
  vorname: string;
  zweiterVorname: string;
  nachname: string;
  // Die drei Teile sind die Eingabe, geburtsdatum bleibt der daraus
  // zusammengesetzte ISO-Wert und damit die Grundlage für Prüfung und Versand.
  geburtstag: string;
  geburtsmonat: string;
  geburtsjahr: string;
  geburtsdatum: string;
  email: string;
  telefonLand: string;
  telefonVorwahl: string;
  telefon: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  beschaeftigungsart: string;
  arbeitgeber: string;
  // Wie beim Geburtsdatum: Monat und Jahr sind die Eingabe,
  // beschaeftigtSeit bleibt der zusammengesetzte Wert im Format JJJJ-MM.
  beschaeftigtSeitMonat: string;
  beschaeftigtSeitJahr: string;
  beschaeftigtSeit: string;
  nettoeinkommen: string;
  /** Die drei zuletzt ausgezahlten Nettoeinkommen, neuestes zuerst. */
  gehaelter: string[];
  // Pflichtangabe im Einkommensschritt. null heisst "noch nicht beantwortet"
  // und haelt den Schritt offen — anders als ein leerer String, der sich von
  // einem bewussten "nein" nicht unterscheiden liesse.
  mieteinnahmen: JaNein;
  mieteinnahmenBetrag: string;
  wohnnebenkosten: string;
  krankenversicherung: string;
  unterhalt: string;
  hatKredite: JaNein;
  kredite: BestehenderKredit[];
  iban: string;
  bankname: string;
  kontoinhaber: string;
  submitted: boolean;
  /**
   * Entwicklermodus: haelt "Weiter" immer offen und gibt alle Schritte in der
   * Fortschrittsleiste frei, damit sich die Strecke ohne Eingaben durchklicken
   * laesst. Steht ausserhalb der Entwicklung nie auf true.
   */
  devModus: boolean;
}

export const TOTAL_STEPS = 8;

/**
 * Ab diesem Schritt wird der Stand gesichert, sobald ein Kontakt dasteht.
 *
 * Vier ist der Schritt mit den persoenlichen Daten. Frueher gibt es nichts zu
 * sichern, was einen Menschen erreichbar machte — nur Betrag, Laufzeit und
 * Verwendungszweck, und damit kann niemand zurueckrufen.
 */
export const SICHERN_AB_SCHRITT = 4;

/**
 * Ob der Entwicklermodus angeboten wird.
 *
 * Bis hierher stand die Konstante auf true, auch auf der veroeffentlichten
 * Seite. Das war vertretbar, solange der Antrag nirgendwohin ging: Wer die
 * Strecke ohne Angaben durchklickte, sah nur eine leere Bestaetigung.
 *
 * Seit der letzte Schritt den Antrag wirklich abschickt, gilt das nicht mehr
 * — durchgeklickte Strecken landeten sonst als halbe Faelle im CRM. Die
 * Bedingung ist die, die an dieser Stelle schon vorgesehen war: in der
 * Entwicklung immer an, auf der Produktivseite nur, wenn
 * NEXT_PUBLIC_DEV_MODUS ausdruecklich auf "1" steht.
 *
 * Der Wert wird beim Bauen eingesetzt, nicht zur Laufzeit gelesen. Nach dem
 * Setzen der Variable bei Vercel gehoert also ein Redeploy dazu.
 */
export const DEV_MODUS_VERFUEGBAR =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DEV_MODUS === "1";

/** Antwort auf eine Pflichtfrage. null heisst "noch nicht beantwortet". */
export type JaNein = "ja" | "nein" | null;

/**
 * Ein bereits laufender Kredit. Der Kunde kann mehrere angeben, deshalb steht
 * jeder Satz Angaben fuer sich statt als einzelnes Feld am Antrag.
 */
export type BestehenderKredit = {
  /** Bleibt ueber das Leben des Eintrags stabil und dient React als Schluessel.
      Der Listenindex taugte dafuer nicht: Beim Entfernen eines Eintrags in der
      Mitte ruecken alle folgenden auf und React ordnete die Eingaben dem
      falschen Kredit zu. */
  id: string;
  art: string;
  /** "Andere" wurde angetippt und hat die weiteren Kreditarten freigegeben. */
  weitereArten: boolean;
  betrag: string;
  rate: string;
  auszahlungMonat: string;
  auszahlungJahr: string;
  /** Aus Monat und Jahr zusammengesetzt, Format JJJJ-MM. */
  auszahlung: string;
  /** Gesamtlaufzeit in Monaten. */
  laufzeit: string;
  /** Effektiver Jahreszins in Prozent — bei uns zusaetzlich moeglich. */
  zins: string;
  restschuld: string;
  bank: string;
  iban: string;
};

let laufendeNummer = 0;

export function leererKredit(): BestehenderKredit {
  laufendeNummer += 1;
  return {
    id: `kredit-${laufendeNummer}`,
    art: "",
    weitereArten: false,
    betrag: "",
    rate: "",
    auszahlungMonat: "",
    auszahlungJahr: "",
    auszahlung: "",
    laufzeit: "",
    zins: "",
    restschuld: "",
    bank: "",
    iban: "DE",
  };
}

const initialData: WizardData = {
  step: 1,
  maxStep: 1,
  kreditart: null,
  purpose: "",
  amount: 20000,
  months: 72,
  personCount: null,
  vorname: "",
  zweiterVorname: "",
  nachname: "",
  geburtstag: "",
  geburtsmonat: "",
  geburtsjahr: "",
  geburtsdatum: "",
  email: "",
  // ISO-Code des Landes; die Vorwahl wird daraus abgeleitet.
  telefonLand: DEFAULT_COUNTRY_ISO,
  telefonVorwahl: "",
  telefon: "",
  strasse: "",
  hausnummer: "",
  plz: "",
  ort: "",
  beschaeftigungsart: "",
  arbeitgeber: "",
  beschaeftigtSeitMonat: "",
  beschaeftigtSeitJahr: "",
  beschaeftigtSeit: "",
  nettoeinkommen: "",
  gehaelter: ["", "", ""],
  mieteinnahmen: null,
  mieteinnahmenBetrag: "",
  wohnnebenkosten: "",
  krankenversicherung: "",
  unterhalt: "",
  hatKredite: null,
  kredite: [],
  iban: "",
  bankname: "",
  kontoinhaber: "",
  submitted: false,
  devModus: false,
};

type WizardContextValue = {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  setDevModus: (an: boolean) => void;
  /** Den fertigen Antrag abschicken. Falsch heisst: nicht angekommen. */
  sendeFertigenAntrag: () => Promise<boolean>;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({
  children,
  initialAmount,
  initialMonths,
  initialKreditart,
}: {
  children: ReactNode;
  initialAmount?: number;
  initialMonths?: number;
  /**
   * Verwendungszweck, der von einer Kreditartseite mitgebracht wird. Ist er
   * gesetzt, ist Schritt 1 bereits beantwortet und der Antrag beginnt beim
   * zweiten. maxStep zieht mit, sonst spränge die Fortschrittsleiste beim
   * Zurückgehen auf einen Schritt, der als nie erreicht gälte.
   */
  initialKreditart?: string;
}) {
  const [data, setData] = useState<WizardData>(() => ({
    ...initialData,
    amount: initialAmount ?? initialData.amount,
    months: initialMonths ?? initialData.months,
    kreditart: initialKreditart ?? initialData.kreditart,
    purpose: initialKreditart ?? initialData.purpose,
    step: initialKreditart ? 2 : initialData.step,
    maxStep: initialKreditart ? 2 : initialData.maxStep,
  }));

  /**
   * Kennung des Falls im CRM, sobald er einmal gesendet wurde. Als Ref und
   * nicht als Zustand: Sie aendert nichts an der Anzeige, und ein zusaetzliches
   * Rendern mitten in der Strecke waere nur Unruhe.
   */
  const antragId = useRef<string | null>(null);

  /**
   * Alle Sendungen haengen an einer Kette.
   *
   * Wer schnell durchklickt, loest mehrere Aufrufe aus, bevor der erste
   * geantwortet hat. Liefen sie nebeneinander, haette keiner die Kennung des
   * anderen und es entstuenden mehrere Faelle fuer denselben Menschen.
   * Nacheinander kennt jeder das Ergebnis seines Vorgaengers.
   */
  const kette = useRef<Promise<void>>(Promise.resolve());

  /**
   * Was zuletzt hinausging. Verhindert, dass derselbe Satz mehrfach gesendet
   * wird — etwa wenn der Zeitgeber und der Klick auf "Weiter" zusammenfallen.
   */
  const zuletztGesendet = useRef<string>("");

  function sichereZwischenstand(stand: WizardData, dringend = false) {
    if (stand.step < SICHERN_AB_SCHRITT) return;
    if (!kontaktVorhanden(stand)) return;

    const nutzlast = JSON.stringify(antragNutzlast(stand));
    if (nutzlast === zuletztGesendet.current) return;
    zuletztGesendet.current = nutzlast;

    kette.current = kette.current
      .then(async () => {
        const ergebnis = await sendeAntrag(
          stand,
          antragId.current,
          false,
          dringend
        );
        if (ergebnis.id) antragId.current = ergebnis.id;
        // Misslungen? Dann das Merkzeichen zuruecknehmen, damit der naechste
        // Anlass es erneut versucht, statt den Stand fuer gesendet zu halten.
        else if (!ergebnis.ok) zuletztGesendet.current = "";
      })
      // Ein misslungener Zwischenstand darf die Strecke nicht stoeren: Der
      // Kunde merkt nichts davon, und der naechste Anlass versucht es neu.
      .catch(() => {
        zuletztGesendet.current = "";
      });
  }

  /**
   * Sichern, waehrend getippt wird — nicht erst beim Weiterblaettern.
   *
   * "Weiter" gibt auf Schritt 4 erst frei, wenn alle Felder stimmen. Wer nur
   * seine E-Mail eintraegt und dann geht, kaeme also nie ueber den Knopf, und
   * genau dieser Mensch soll erreichbar bleiben. Deshalb haengt das Sichern
   * an der Eingabe: eineinhalb Sekunden nach der letzten Aenderung geht der
   * Stand hinaus. Der Zeitgeber wird bei jedem Tastendruck neu gestellt,
   * sonst entstuende bei jedem Zeichen eine Anfrage.
   */
  useEffect(() => {
    if (data.step < SICHERN_AB_SCHRITT || !kontaktVorhanden(data)) return;
    const zeitgeber = setTimeout(() => sichereZwischenstand(data), 1500);
    return () => clearTimeout(zeitgeber);
  }, [data]);

  /**
   * Und beim Verlassen des Fensters sofort, ohne die anderthalb Sekunden
   * abzuwarten: Tab schliessen, wegwischen, Bildschirm sperren. `hidden` ist
   * dafuer der verlaessliche Anlass — "beforeunload" wird auf Handys
   * regelmaessig gar nicht ausgeloest.
   */
  useEffect(() => {
    function beimVerlassen() {
      if (document.visibilityState !== "hidden") return;
      sichereZwischenstand(data, true);
    }
    document.addEventListener("visibilitychange", beimVerlassen);
    return () =>
      document.removeEventListener("visibilitychange", beimVerlassen);
  }, [data]);

  async function sendeFertigenAntrag(): Promise<boolean> {
    // Erst die laufenden Zwischenstaende abwarten. Sonst geht der fertige
    // Antrag ohne Kennung hinaus, weil sie noch unterwegs ist — und im CRM
    // stuenden zwei Faelle.
    await kette.current.catch(() => undefined);
    const ergebnis = await sendeAntrag(data, antragId.current, true);
    if (ergebnis.id) antragId.current = ergebnis.id;
    // Damit der Zeitgeber danach nicht denselben Satz noch einmal als
    // Zwischenstand hinterherschickt.
    if (ergebnis.ok) zuletztGesendet.current = JSON.stringify(antragNutzlast(data));
    return ergebnis.ok;
  }

  function update(patch: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    // Beim Verlassen der Schritte mit Kontaktdaten den Stand sichern. Der
    // letzte Schritt ist ausgenommen: Dort geht ohnehin der fertige Antrag
    // hinaus, ein Zwischenstand davor waere derselbe Satz zweimal.
    if (data.step >= SICHERN_AB_SCHRITT && data.step < TOTAL_STEPS) {
      sichereZwischenstand(data);
    }

    setData((prev) => {
      const step = Math.min(prev.step + 1, TOTAL_STEPS + 1);
      return {
        ...prev,
        step,
        // Im Entwicklermodus zaehlt der Weg nicht mit: maxStep haelt fest,
        // wie weit der Antrag wirklich ausgefuellt wurde. Sonst bliebe der
        // erschlichene Fortschritt nach dem Ausschalten stehen und die
        // Strecke waere weiter frei begehbar.
        maxStep: prev.devModus ? prev.maxStep : Math.max(prev.maxStep, step),
      };
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Zurückgehen verschiebt nur die Ansicht: maxStep und alle Eingaben bleiben
  // unverändert, damit der Weg nach vorne offen bleibt.
  function goBack() {
    setData((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Sprung über die Fortschrittsleiste — nur zu bereits besuchten Schritten.
  function goToStep(step: number) {
    setData((prev) => ({
      ...prev,
      // Im Entwicklermodus zaehlt nur die Zahl der Schritte, nicht wie weit
      // der Antrag schon ausgefuellt ist.
      step: Math.min(
        Math.max(step, 1),
        prev.devModus ? TOTAL_STEPS : prev.maxStep
      ),
      // maxStep bleibt unberuehrt — auch ein Sprung im Entwicklermodus ist
      // kein wirklich erreichter Schritt.
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Entwicklermodus umlegen. Beim Ausschalten geht es zurueck an die Stelle,
   * die ohne ihn erreicht wurde: Wer sich bis zur Bankverbindung
   * durchgeklickt hat, ohne etwas auszufuellen, war dort nie wirklich.
   * Bliebe der Schritt stehen, sperrte zwar der Weiter-Knopf wieder, der
   * Kunde saesse aber mitten in einem Formular, das er nie erreicht hat.
   */
  function setDevModus(an: boolean) {
    setData((prev) => ({
      ...prev,
      devModus: an,
      step: an ? prev.step : Math.min(prev.step, prev.maxStep),
    }));
    if (!an) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <WizardContext.Provider
      value={{
        data,
        update,
        goNext,
        goBack,
        goToStep,
        setDevModus,
        sendeFertigenAntrag,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return ctx;
}
