"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField } from "./FormField";

export default function StepDaten() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const valid =
    data.vorname.trim() !== "" &&
    data.nachname.trim() !== "" &&
    data.geburtsdatum.trim() !== "" &&
    data.email.trim() !== "" &&
    data.telefon.trim() !== "";

  return (
    <WizardStepLayout
      eyebrow={wt.step4.eyebrow}
      title={wt.step4.title}
      highlight={wt.step4.highlight}
      subtitle={wt.step4.subtitle}
      trust={wt.step4.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          id="vorname"
          label={wt.step4.vorname}
          value={data.vorname}
          onChange={(e) => update({ vorname: e.target.value })}
        />
        <FormField
          id="nachname"
          label={wt.step4.nachname}
          value={data.nachname}
          onChange={(e) => update({ nachname: e.target.value })}
        />
      </div>
      <FormField
        id="geburtsdatum"
        type="date"
        label={wt.step4.geburtsdatum}
        value={data.geburtsdatum}
        onChange={(e) => update({ geburtsdatum: e.target.value })}
      />
      <FormField
        id="email"
        type="email"
        label={wt.step4.email}
        value={data.email}
        onChange={(e) => update({ email: e.target.value })}
      />
      <FormField
        id="telefon"
        type="tel"
        label={wt.step4.telefon}
        value={data.telefon}
        onChange={(e) => update({ telefon: e.target.value })}
      />
    </WizardStepLayout>
  );
}
