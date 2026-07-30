"use client";

import Header from "@/components/Header";
import StepProgress from "@/components/wizard/StepProgress";
import { WizardProvider, useWizard, TOTAL_STEPS } from "@/lib/wizard-context";
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
      {data.step <= TOTAL_STEPS && <StepProgress current={data.step} />}
      <main className="flex-1">
        <ActiveStep />
      </main>
    </>
  );
}

export default function AntragClient({
  initialAmount,
  initialMonths,
}: {
  initialAmount?: number;
  initialMonths?: number;
}) {
  return (
    <WizardProvider initialAmount={initialAmount} initialMonths={initialMonths}>
      <AntragShell />
    </WizardProvider>
  );
}
