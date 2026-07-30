"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField } from "./FormField";

export default function StepAdresse() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const valid =
    data.strasse.trim() !== "" &&
    data.hausnummer.trim() !== "" &&
    data.plz.trim() !== "" &&
    data.ort.trim() !== "";

  return (
    <WizardStepLayout
      eyebrow={wt.step5.eyebrow}
      title={wt.step5.title}
      highlight={wt.step5.highlight}
      subtitle={wt.step5.subtitle}
      trust={wt.step5.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
        <FormField
          id="strasse"
          label={wt.step5.strasse}
          value={data.strasse}
          onChange={(e) => update({ strasse: e.target.value })}
        />
        <FormField
          id="hausnummer"
          label={wt.step5.hausnummer}
          value={data.hausnummer}
          onChange={(e) => update({ hausnummer: e.target.value })}
          className="sm:w-28"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4">
        <FormField
          id="plz"
          label={wt.step5.plz}
          value={data.plz}
          onChange={(e) => update({ plz: e.target.value })}
          className="sm:w-28"
        />
        <FormField
          id="ort"
          label={wt.step5.ort}
          value={data.ort}
          onChange={(e) => update({ ort: e.target.value })}
        />
      </div>
    </WizardStepLayout>
  );
}
