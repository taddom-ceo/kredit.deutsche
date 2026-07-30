"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export interface WizardData {
  step: number;
  kreditart: string | null;
  purpose: string;
  amount: number;
  months: number;
  personCount: 1 | 2 | null;
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  email: string;
  telefon: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  beschaeftigungsart: string;
  arbeitgeber: string;
  beschaeftigtSeit: string;
  nettoeinkommen: string;
  ausgaben: string;
  iban: string;
  bankname: string;
  kontoinhaber: string;
  submitted: boolean;
}

export const TOTAL_STEPS = 8;

const initialData: WizardData = {
  step: 1,
  kreditart: null,
  purpose: "",
  amount: 20000,
  months: 72,
  personCount: null,
  vorname: "",
  nachname: "",
  geburtsdatum: "",
  email: "",
  telefon: "",
  strasse: "",
  hausnummer: "",
  plz: "",
  ort: "",
  beschaeftigungsart: "",
  arbeitgeber: "",
  beschaeftigtSeit: "",
  nettoeinkommen: "",
  ausgaben: "",
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
    setData((prev) => ({
      ...prev,
      step: Math.min(prev.step + 1, TOTAL_STEPS + 1),
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setData((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToStep(step: number) {
    setData((prev) => ({ ...prev, step }));
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
