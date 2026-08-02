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
  ausgaben: string;
  // Pflichtangabe im Einkommensschritt. null heisst "noch nicht beantwortet"
  // und haelt den Schritt offen — anders als ein leerer String, der sich von
  // einem bewussten "nein" nicht unterscheiden liesse.
  mieteinnahmen: "ja" | "nein" | null;
  mieteinnahmenBetrag: string;
  // Mehrfachauswahl der laufenden Kredite. Der Wert KEINE_KREDITE steht darin
  // allein und schliesst die uebrigen aus.
  kreditarten: string[];
  // Angaben zum groessten laufenden Kredit. Wie beim Geburtsdatum sind Monat
  // und Jahr die Eingabe, kreditAuszahlung bleibt der zusammengesetzte Wert
  // im Format JJJJ-MM.
  kreditSumme: string;
  kreditAuszahlungMonat: string;
  kreditAuszahlungJahr: string;
  kreditAuszahlung: string;
  kreditRate: string;
  kreditZins: string;
  /** Gesamtlaufzeit des Kredits in Monaten. */
  kreditLaufzeit: string;
  // Vom Kunden selbst gesetzte Restschuld. Leer heisst: Es gilt die
  // Schaetzung aus den Angaben darueber.
  kreditRestschuld: string;
  iban: string;
  bankname: string;
  kontoinhaber: string;
  submitted: boolean;
}

export const TOTAL_STEPS = 8;

/** Kennung der Antwort "keine laufenden Kredite" in kreditarten. */
export const KEINE_KREDITE = "keine";

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
  ausgaben: "",
  mieteinnahmen: null,
  mieteinnahmenBetrag: "",
  kreditarten: [],
  kreditSumme: "",
  kreditAuszahlungMonat: "",
  kreditAuszahlungJahr: "",
  kreditAuszahlung: "",
  kreditRate: "",
  kreditZins: "",
  kreditLaufzeit: "",
  kreditRestschuld: "",
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
