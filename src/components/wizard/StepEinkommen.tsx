"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField } from "./FormField";

export default function StepEinkommen() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const valid =
    data.nettoeinkommen.trim() !== "" && Number(data.nettoeinkommen) > 0;

  return (
    <WizardStepLayout
      eyebrow={wt.step7.eyebrow}
      title={wt.step7.title}
      highlight={wt.step7.highlight}
      subtitle={wt.step7.subtitle}
      trust={wt.step7.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <FormField
        id="nettoeinkommen"
        type="number"
        min={0}
        step={50}
        inputMode="decimal"
        placeholder="z. B. 2.800"
        label={`${wt.step7.nettoeinkommen} (€)`}
        value={data.nettoeinkommen}
        onChange={(e) => update({ nettoeinkommen: e.target.value })}
      />
      <FormField
        id="ausgaben"
        type="number"
        min={0}
        step={50}
        inputMode="decimal"
        placeholder="z. B. 900"
        label={`${wt.step7.ausgaben} (€)`}
        value={data.ausgaben}
        onChange={(e) => update({ ausgaben: e.target.value })}
      />
      <p className="text-xs text-muted -mt-2">{wt.step7.ausgabenHint}</p>
    </WizardStepLayout>
  );
}
