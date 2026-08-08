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
  const { data, update, goNext, goBack, sendeFertigenAntrag } = useWizard();
  const [touched, setTouched] = useState(false);
  const [sendet, setSendet] = useState(false);
  const [fehler, setFehler] = useState(false);

  const ibanValid = isValidIban(data.iban);
  const valid =
    ibanValid &&
    data.bankname.trim() !== "" &&
    data.kontoinhaber.trim() !== "";

  async function handleSubmit() {
    setTouched(true);
    if (!valid || sendet) return;

    setSendet(true);
    setFehler(false);

    // Der Zusammenbau des Antrags und das Senden liegen im Zustand der
    // Strecke: Von dort ging schon der Zwischenstand hinaus, und beide
    // muessen dieselbe Kennung benutzen, damit im CRM ein Fall steht und
    // nicht zwei.
    const angekommen = await sendeFertigenAntrag();

    if (!angekommen) {
      // Kein Weiterblaettern: Die Bestaetigung waere sonst eine Zusage, die
      // niemand einloesen kann — der Antrag liegt dann nirgends.
      setSendet(false);
      setFehler(true);
      return;
    }

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
      nextLabel={sendet ? wt.step8.sendet : wt.nav.submit}
      nextDisabled={sendet}
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
      {fehler && (
        <p className="text-sm text-red-400 leading-relaxed">
          {wt.step8.sendeFehler}
        </p>
      )}
    </WizardStepLayout>
  );
}
