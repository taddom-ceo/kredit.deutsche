"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";

export default function StepBeruf() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const valid =
    data.beschaeftigungsart.trim() !== "" &&
    data.arbeitgeber.trim() !== "" &&
    data.beschaeftigtSeit.trim() !== "";

  return (
    <WizardStepLayout
      eyebrow={wt.step6.eyebrow}
      title={wt.step6.title}
      highlight={wt.step6.highlight}
      subtitle={wt.step6.subtitle}
      trust={wt.step6.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <FormSelect
        id="beschaeftigungsart"
        label={wt.step6.beschaeftigungsart}
        value={data.beschaeftigungsart}
        onChange={(e) => update({ beschaeftigungsart: e.target.value })}
      >
        <option value="">{wt.step6.beschaeftigungsartPlaceholder}</option>
        {wt.step6.beschaeftigungsartOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FormSelect>
      <FormField
        id="arbeitgeber"
        label={wt.step6.arbeitgeber}
        value={data.arbeitgeber}
        onChange={(e) => update({ arbeitgeber: e.target.value })}
      />
      <FormField
        id="beschaeftigtSeit"
        type="month"
        label={wt.step6.beschaeftigtSeit}
        value={data.beschaeftigtSeit}
        onChange={(e) => update({ beschaeftigtSeit: e.target.value })}
      />
    </WizardStepLayout>
  );
}
