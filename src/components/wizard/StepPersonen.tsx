"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";

export default function StepPersonen() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  return (
    <WizardStepLayout
      eyebrow={wt.step3.eyebrow}
      title={wt.step3.title}
      highlight={wt.step3.highlight}
      subtitle={wt.step3.subtitle}
      trust={wt.step3.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={data.personCount === null}
    >
      <div className="rounded-[14px] bg-surface-2 border border-border p-4 flex flex-col gap-2">
        <p className="text-sm leading-relaxed">
          <span className="text-accent">✓</span> {wt.step3.recommendedTitle}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {wt.step3.recommendedPerks.map((perk) => (
            <span key={perk} className="text-xs text-muted">
              · {perk}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => update({ personCount: 1 })}
          className={`text-left rounded-[16px] border bg-surface-2 p-4 flex flex-col gap-1 transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
            data.personCount === 1
              ? "border-accent ring-1 ring-accent/40"
              : "border-border"
          }`}
        >
          <span className="text-sm font-semibold">
            {wt.step3.option1Title}
          </span>
          <span className="text-xs text-muted">{wt.step3.option1Subtitle}</span>
        </button>

        <button
          type="button"
          onClick={() => update({ personCount: 2 })}
          className={`relative text-left rounded-[16px] border bg-surface-2 p-4 flex flex-col gap-1 transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
            data.personCount === 2
              ? "border-accent ring-1 ring-accent/40"
              : "border-border"
          }`}
        >
          <span className="absolute -top-2 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
            {wt.step3.recommendedTag}
          </span>
          <span className="text-sm font-semibold">
            {wt.step3.option2Title}
          </span>
          <span className="text-xs text-muted">{wt.step3.option2Subtitle}</span>
        </button>
      </div>
    </WizardStepLayout>
  );
}
