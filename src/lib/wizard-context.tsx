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
import {
  sichereStand,
  verwirfStand,
  type GelesenerStand,
} from "./wizard-speicher";

/**
 * Die Angaben des zweiten Kreditnehmers.
 *
 * Dieselben Felder wie beim ersten, mit zwei Ausnahmen:
 *
 *   · Kontakt und Anschrift nur, wenn sie abweichen. Zwei Kreditnehmer sind in
 *     aller Regel ein Haushalt mit einer Adresse, und oft genug meldet sich
 *     einer von beiden fuer beide. Dieselben Angaben ein zweites Mal
 *     einzutippen waere eine Zumutung fuer den Normalfall zugunsten der
 *     Ausnahme — gefragt wird deshalb erst, ob sie abweichen.
 *   · Keine eigene Bankverbindung. Ausgezahlt wird auf ein Konto.
 */
export type ZweitePerson = {
  vorname: string;
  zweiterVorname: string;
  nachname: string;
  geburtstag: string;
  geburtsmonat: string;
  geburtsjahr: string;
  geburtsdatum: string;
  /**
   * "ja" heisst: eigene E-Mail und eigene Telefonnummer.
   *
   * Die Frage steht vor den Feldern und nicht als Haken hinter ihnen, aus
   * demselben Grund wie bei der Anschrift: `null` heisst "noch nicht
   * beantwortet" und haelt den Schritt offen. Ein Haken kennt diesen Zustand
   * nicht — er stuende von Anfang an irgendwo, und dieses Irgendwo waere eine
   * Antwort, die niemand gegeben hat.
   */
  eigenerKontakt: JaNein;
  email: string;
  telefonLand: string;
  telefonVorwahl: string;
  telefon: string;
  /** "ja" heisst: dieselbe Anschrift wie der erste Kreditnehmer. */
  gleicheAnschrift: JaNein;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  beschaeftigungsart: string;
  arbeitgeber: string;
  beschaeftigtSeitMonat: string;
  beschaeftigtSeitJahr: string;
  beschaeftigtSeit: string;
  nettoeinkommen: string;
  gehaelter: string[];
};

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
  /**
   * Der zweite Kreditnehmer.
   *
   * Steht immer da, gilt aber nur bei `personCount === 2`. Ein eigener
   * Datensatz statt zwanzig Feldern mit Vorsilbe: Die zweite Person hat
   * dieselben Angaben wie die erste, und wenn sie dieselbe Form haben, laesst
   * sich dieselbe Pruefung darauf anwenden — statt sie zweimal zu schreiben
   * und beim naechsten Mal nur eine davon zu aendern.
   *
   * Er wird nicht geleert, wenn jemand auf einen Antragsteller zurueckwechselt:
   * Wer sich verklickt und zurueckwechselt, findet seine Eingaben wieder.
   * Mitgeschickt wird er nur bei zwei Antragstellern (siehe antragNutzlast).
   */
  zweitePerson: ZweitePerson;
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

export function leereZweitePerson(): ZweitePerson {
  return {
    vorname: "",
    zweiterVorname: "",
    nachname: "",
    geburtstag: "",
    geburtsmonat: "",
    geburtsjahr: "",
    geburtsdatum: "",
    eigenerKontakt: null,
    email: "",
    telefonLand: DEFAULT_COUNTRY_ISO,
    telefonVorwahl: "",
    telefon: "",
    // Der Normalfall steht nicht vor: Zwei Kreditnehmer sind meistens ein
    // Haushalt, aber "meistens" ist keine Antwort, die jemand fuer den Kunden
    // geben darf. Die Frage bleibt offen, bis er sie beantwortet.
    gleicheAnschrift: null,
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
  zweitePerson: leereZweitePerson(),
  submitted: false,
  devModus: false,
};

type WizardContextValue = {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  /** Angaben des zweiten Kreditnehmers aendern. */
  updateZweite: (patch: Partial<ZweitePerson>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
  setDevModus: (an: boolean) => void;
  /** Den fertigen Antrag abschicken. Falsch heisst: nicht angekommen. */
  sendeFertigenAntrag: () => Promise<boolean>;
  /**
   * Wann der wiederhergestellte Stand gesichert wurde, oder null. Traegt den
   * Hinweis oben in der Strecke.
   */
  wiederhergestellt: Date | null;
  /** Den wiederhergestellten Stand wegwerfen und von vorn anfangen. */
  verwirfWiederherstellung: () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

/**
 * Der Ausgangszustand: Voreinstellung, darueber der gesicherte Stand, darueber
 * das, was die Adresse ausdruecklich mitbringt.
 *
 * Die Reihenfolge ist die Aussage. Wer auf einer Kreditartseite auf "Autokredit"
 * klickt, will einen Autokredit — auch wenn im Speicher noch die Umschuldung
 * von gestern steht. Seine Anschrift, sein Einkommen und seine Beschaeftigung
 * bleiben trotzdem stehen: Das ist die Arbeit, die er sich gemacht hat, und sie
 * gilt fuer jeden Zweck gleichermassen.
 */
function ausgangslage(
  gespeichert: GelesenerStand | null,
  initialAmount?: number,
  initialMonths?: number,
  initialKreditart?: string
): WizardData {
  const stand: WizardData = {
    ...initialData,
    ...(gespeichert?.stand ?? {}),
    // Der Entwicklermodus wird nie wiederhergestellt: Er ist ein Schalter fuer
    // die Entwicklung und kein Teil des Antrags.
    devModus: false,
  };

  if (initialKreditart) {
    stand.kreditart = initialKreditart;
    stand.purpose = initialKreditart;
  }
  if (initialAmount !== undefined) stand.amount = initialAmount;
  if (initialMonths !== undefined) stand.months = initialMonths;

  // Ohne gesicherten Stand gilt die alte Regel: Mit mitgebrachtem Zweck ist
  // Schritt 1 beantwortet und es geht beim zweiten los. Mit gesichertem Stand
  // zaehlt, wie weit jemand schon war — dorthin zurueckzuspringen ist der
  // ganze Zweck der Uebung.
  if (!gespeichert) {
    stand.step = initialKreditart ? 2 : initialData.step;
    stand.maxStep = initialKreditart ? 2 : initialData.maxStep;
  }

  return stand;
}

export function WizardProvider({
  children,
  initialAmount,
  initialMonths,
  initialKreditart,
  gespeichert = null,
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
  /**
   * Der Stand aus dem Browserspeicher, falls einer da ist.
   *
   * Er kommt als Eigenschaft herein und wird nicht hier gelesen: Auf dem
   * Server gibt es keinen Speicher, und wer waehrend des Rendern hineinsaehe,
   * baute eine Seite, die nach dem Laden anders aussieht als vorher. Der
   * Aufrufer liest ihn nach dem Laden und baut den Anbieter mit einem neuen
   * `key` neu auf — dann faengt dieser Zustand hier gleich richtig an, statt
   * sich nachtraeglich selbst zu ueberschreiben.
   */
  gespeichert?: GelesenerStand | null;
}) {
  const [data, setData] = useState<WizardData>(() =>
    ausgangslage(gespeichert, initialAmount, initialMonths, initialKreditart)
  );

  /** Sichtbar, solange der wiederhergestellte Stand nicht verworfen wurde. */
  const [wiederhergestellt, setWiederhergestellt] = useState<Date | null>(
    gespeichert?.gesichert ?? null
  );

  /**
   * Kennung des Falls im CRM, sobald er einmal gesendet wurde. Als Ref und
   * nicht als Zustand: Sie aendert nichts an der Anzeige, und ein zusaetzliches
   * Rendern mitten in der Strecke waere nur Unruhe.
   *
   * Sie kommt aus dem Speicher mit. Ohne das legte ein Neuladen einen zweiten
   * Fall fuer denselben Menschen an, und im CRM staende er doppelt.
   */
  const antragId = useRef<string | null>(gespeichert?.antragId ?? null);

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

  /**
   * Ob in der Strecke ueberhaupt schon etwas eingegeben wurde.
   *
   * Ein Ref und kein Zustand: Die Anzeige haengt nicht daran, und ein
   * zusaetzliches Rendern beim ersten Tastendruck waere nur Unruhe. Gesetzt
   * wird er ausschliesslich in den Handlern unten, nie beim Rendern.
   */
  const beruehrt = useRef(false);

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

  /**
   * Den Stand im Browser sichern, waehrend getippt wird.
   *
   * Das ist die Ablage, die einen Neustart ueberlebt — anders als der
   * Zwischenstand im CRM, der eine Kontaktangabe voraussetzt und erst ab
   * Schritt 4 hinausgeht. Hier zaehlt jede Eingabe ab dem ersten Schritt.
   *
   * Erst nach der ersten Eingabe, damit nicht jeder, der die Seite nur
   * aufschlaegt, einen Eintrag auf seinem Geraet zurueckbehaelt. Und nicht
   * mehr auf der Bestaetigungsseite: Dort ist der Antrag draussen, und der
   * Stand wird ohnehin gerade geloescht.
   *
   * Eine kurze Verzoegerung fasst die Tastendruecke zusammen. Ohne sie
   * schriebe jedes Zeichen in einem Textfeld in den Speicher — auf einem
   * schwachen Geraet merkt man das beim Tippen.
   */
  useEffect(() => {
    if (!beruehrt.current) return;
    if (data.step > TOTAL_STEPS) return;
    const zeitgeber = setTimeout(
      () => sichereStand(data, antragId.current),
      400
    );
    return () => clearTimeout(zeitgeber);
  }, [data]);

  /**
   * Nachfragen, bevor die Strecke verlassen wird.
   *
   * Der Stand der Strecke liegt im Arbeitsspeicher des Browsers, sonst
   * nirgends: Wer das Fenster schliesst oder neu laedt, faengt beim ersten
   * Schritt wieder an. Ein versehentliches Strg+W nach sieben Schritten kostet
   * damit den ganzen Antrag — und derselbe Mensch tippt ihn kein zweites Mal.
   *
   * Der Text ist Absicht ohne Wirkung: Browser zeigen seit Jahren ihre eigene
   * Formulierung und ignorieren jede eigene, um die Nachfrage nicht als
   * Druckmittel benutzbar zu machen. `preventDefault` ist das, was zaehlt —
   * `returnValue` steht daneben fuer aeltere Browser, die nur darauf hoeren.
   *
   * Zwei Grenzen, damit die Nachfrage nicht dort steht, wo nichts zu verlieren
   * ist:
   *
   *   · Erst nach der ersten Eingabe. Wer die Seite oeffnet und gleich wieder
   *     geht, hat nichts eingegeben, was verloren gehen koennte.
   *   · Nicht mehr auf der Bestaetigungsseite. Dort ist der Antrag abgeschickt
   *     und liegt im CRM; das Fenster zu schliessen ist dann genau richtig.
   */
  useEffect(() => {
    if (data.step > TOTAL_STEPS) return;
    function warnen(ereignis: BeforeUnloadEvent) {
      if (!beruehrt.current) return;
      ereignis.preventDefault();
      ereignis.returnValue =
        "Ihre Angaben gehen verloren und der Antrag muss von vorn begonnen werden.";
    }
    window.addEventListener("beforeunload", warnen);
    return () => window.removeEventListener("beforeunload", warnen);
  }, [data.step]);

  async function sendeFertigenAntrag(): Promise<boolean> {
    // Erst die laufenden Zwischenstaende abwarten. Sonst geht der fertige
    // Antrag ohne Kennung hinaus, weil sie noch unterwegs ist — und im CRM
    // stuenden zwei Faelle.
    await kette.current.catch(() => undefined);
    const ergebnis = await sendeAntrag(data, antragId.current, true);
    if (ergebnis.id) antragId.current = ergebnis.id;
    // Damit der Zeitgeber danach nicht denselben Satz noch einmal als
    // Zwischenstand hinterherschickt.
    if (ergebnis.ok) {
      zuletztGesendet.current = JSON.stringify(antragNutzlast(data));
      // Der Antrag ist angekommen und liegt im CRM. Alles, was danach noch
      // auf dem Geraet liegt, ist eine Kopie personenbezogener Daten, die
      // niemand mehr braucht — und beim naechsten Aufruf boete sie an, einen
      // bereits gestellten Antrag "fortzusetzen".
      verwirfStand();
    }
    return ergebnis.ok;
  }

  /**
   * Von vorn anfangen: den gesicherten Stand wegwerfen und die Strecke auf
   * ihren Anfang zuruecksetzen.
   *
   * Das gehoert zum Hinweis oben dazu. Angaben wiederherzustellen, ohne einen
   * Weg zurueck anzubieten, hiesse, jemandem ein halb ausgefuelltes Formular
   * eines anderen Vorhabens aufzudraengen — und auf einem geteilten Geraet
   * moeglicherweise die Angaben eines anderen Menschen.
   */
  function verwirfWiederherstellung() {
    verwirfStand();
    beruehrt.current = false;
    antragId.current = null;
    zuletztGesendet.current = "";
    setWiederhergestellt(null);
    setData(ausgangslage(null, initialAmount, initialMonths, initialKreditart));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function update(patch: Partial<WizardData>) {
    beruehrt.current = true;
    setData((prev) => ({ ...prev, ...patch }));
  }

  /**
   * Dasselbe fuer den zweiten Kreditnehmer.
   *
   * Ohne diesen Weg stuende in jedem Feld der zweiten Person
   * `update({ zweitePerson: { ...data.zweitePerson, vorname: wert } })` — ein
   * Satz, bei dem man das Ausbreiten genau einmal vergessen muss, um alle
   * uebrigen Angaben zu loeschen.
   */
  function updateZweite(patch: Partial<ZweitePerson>) {
    beruehrt.current = true;
    setData((prev) => ({
      ...prev,
      zweitePerson: { ...prev.zweitePerson, ...patch },
    }));
  }

  function goNext() {
    // Wer weiterblaettert, hat den Schritt hinter sich gebracht — auch wenn er
    // dabei nur eine Auswahl angeklickt hat, die schon vorbelegt war.
    beruehrt.current = true;
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
        updateZweite,
        goNext,
        goBack,
        goToStep,
        setDevModus,
        sendeFertigenAntrag,
        wiederhergestellt,
        verwirfWiederherstellung,
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
