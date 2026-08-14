"use client";

import { useSyncExternalStore } from "react";
import Fussbereich from "@/components/Fussbereich";
import Header from "@/components/Header";
import StepProgress from "@/components/wizard/StepProgress";
import WiederaufnahmeHinweis from "@/components/wizard/WiederaufnahmeHinweis";
import { WizardProvider, useWizard, TOTAL_STEPS } from "@/lib/wizard-context";
import { liesStand, type GelesenerStand } from "@/lib/wizard-speicher";
import StepArt from "@/components/wizard/StepArt";
import StepDetails from "@/components/wizard/StepDetails";
import StepPersonen from "@/components/wizard/StepPersonen";
import StepDaten from "@/components/wizard/StepDaten";
import StepAdresse from "@/components/wizard/StepAdresse";
import StepBeruf from "@/components/wizard/StepBeruf";
import StepEinkommen from "@/components/wizard/StepEinkommen";
import StepBank from "@/components/wizard/StepBank";
import StepConfirmation from "@/components/wizard/StepConfirmation";

function ActiveStep() {
  const { data } = useWizard();

  switch (data.step) {
    case 1:
      return <StepArt />;
    case 2:
      return <StepDetails />;
    case 3:
      return <StepPersonen />;
    case 4:
      return <StepDaten />;
    case 5:
      return <StepAdresse />;
    case 6:
      return <StepBeruf />;
    case 7:
      return <StepEinkommen />;
    case 8:
      return <StepBank />;
    default:
      return <StepConfirmation />;
  }
}

function AntragShell() {
  const { data } = useWizard();

  return (
    <>
      <Header />
      {/* Steht ueber der Fortschrittsleiste: Sie zeigt schon Schritt 6 an,
          und wer nicht weiss warum, soll die Erklaerung darueber finden und
          nicht darunter. */}
      <WiederaufnahmeHinweis />
      {data.step >= 1 && data.step <= TOTAL_STEPS && (
        <StepProgress current={data.step} />
      )}
      <main className="flex-1">
        <ActiveStep />
      </main>
      {/* Gerade hier gehoert der Weg zur Datenschutzerklaerung hin: Auf
          dieser Strecke werden Einkommen, Arbeitgeber und Bankverbindung
          erhoben. Wer wissen will, was damit geschieht, soll nicht erst zur
          Startseite zurueck muessen. */}
      <Fussbereich />
    </>
  );
}

/**
 * Der gesicherte Stand, genau einmal gelesen.
 *
 * `useSyncExternalStore` und nicht ein Effekt mit `setState`: Auf dem Server
 * gibt es keinen Speicher, und React kennt hier beide Faelle — es baut die
 * Seite mit dem Server-Wert auf und wechselt danach von selbst auf den des
 * Browsers, ohne dass die beiden Fassungen als Widerspruch gelten.
 *
 * Der gelesene Wert wird gemerkt, weil er bei jedem Aufruf derselbe sein muss.
 * Gaebe die Funktion jedes Mal ein neues Objekt zurueck, hielte React das fuer
 * eine Aenderung und rendere endlos.
 */
let gemerkt: GelesenerStand | null | undefined;

function standEinmal(): GelesenerStand | null {
  if (gemerkt === undefined) gemerkt = liesStand();
  return gemerkt;
}

/** Die Ablage aendert sich nicht von aussen — es gibt nichts zu abonnieren. */
function ohneAbo(): () => void {
  return () => {};
}

export default function AntragClient({
  initialAmount,
  initialMonths,
  initialKreditart,
}: {
  initialAmount?: number;
  initialMonths?: number;
  initialKreditart?: string;
}) {
  const gespeichert = useSyncExternalStore(ohneAbo, standEinmal, () => null);

  return (
    /* Der `key` ist der Kunstgriff: Taucht nach dem Laden ein gesicherter
       Stand auf, wird der Anbieter neu aufgebaut und faengt gleich mit den
       richtigen Angaben an. Ohne ihn muesste er sich selbst nachtraeglich
       ueberschreiben — ein zweiter Zustand, der den ersten gleich wieder
       verwirft, und genau dabei gehen Eingaben verloren, die in derselben
       Sekunde getippt wurden. */
    <WizardProvider
      key={gespeichert ? "fortsetzen" : "neu"}
      initialAmount={initialAmount}
      initialMonths={initialMonths}
      initialKreditart={initialKreditart}
      gespeichert={gespeichert}
    >
      <AntragShell />
    </WizardProvider>
  );
}
