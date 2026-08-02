"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_COUNTRY_ISO } from "./country-codes";

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
}

export const TOTAL_STEPS = 8;

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
};

type WizardContextValue = {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
  goNext: () => void;
  goBack: () => void;
  goToStep: (step: number) => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({
  children,
  initialAmount,
  initialMonths,
}: {
  children: ReactNode;
  initialAmount?: number;
  initialMonths?: number;
}) {
  const [data, setData] = useState<WizardData>(() => ({
    ...initialData,
    amount: initialAmount ?? initialData.amount,
    months: initialMonths ?? initialData.months,
  }));

  function update(patch: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    setData((prev) => {
      const step = Math.min(prev.step + 1, TOTAL_STEPS + 1);
      return { ...prev, step, maxStep: Math.max(prev.maxStep, step) };
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
      step: Math.min(Math.max(step, 1), prev.maxStep),
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <WizardContext.Provider value={{ data, update, goNext, goBack, goToStep }}>
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
