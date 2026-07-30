"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import { formatIbanInput, isValidIban } from "@/lib/iban";
import WizardStepLayout from "./WizardStepLayout";
import { FormField } from "./FormField";

export default function StepBank() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();
  const [touched, setTouched] = useState(false);

  const ibanValid = isValidIban(data.iban);
  const valid =
    ibanValid &&
    data.bankname.trim() !== "" &&
    data.kontoinhaber.trim() !== "";

  function handleSubmit() {
    setTouched(true);
    if (!valid) return;
    update({ submitted: true });
    goNext();
  }

  return (
    <WizardStepLayout
      eyebrow={wt.step8.eyebrow}
      title={wt.step8.title}
      highlight={wt.step8.highlight}
      subtitle={wt.step8.subtitle}
      trust={wt.step8.trust}
      onBack={goBack}
      onNext={handleSubmit}
      nextLabel={wt.nav.submit}
    >
      <FormField
        id="iban"
        label={wt.step8.iban}
        placeholder="DE89 3704 0044 0532 0130 00"
        value={data.iban}
        onChange={(e) => update({ iban: formatIbanInput(e.target.value) })}
        onBlur={() => setTouched(true)}
        error={touched && data.iban.trim() !== "" && !ibanValid ? wt.step8.ibanError : undefined}
      />
      <FormField
        id="bankname"
        label={wt.step8.bankname}
        value={data.bankname}
        onChange={(e) => update({ bankname: e.target.value })}
      />
      <FormField
        id="kontoinhaber"
        label={wt.step8.kontoinhaber}
        value={data.kontoinhaber}
        onChange={(e) => update({ kontoinhaber: e.target.value })}
      />
    </WizardStepLayout>
  );
}
