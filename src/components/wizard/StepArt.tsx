"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";

export default function StepArt() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext } = useWizard();

  function select(id: string) {
    update({ kreditart: id });
    goNext();
  }

  return (
    <WizardStepLayout
      eyebrow={wt.step1.eyebrow}
      title={wt.step1.title}
      highlight={wt.step1.highlight}
      subtitle={wt.step1.subtitle}
      trust={wt.step1.trust}
      showNav={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {wt.step1.options.map((option) => {
          const active = data.kreditart === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => select(option.id)}
              className={`text-left rounded-[16px] border bg-surface-2 p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                active ? "border-accent ring-1 ring-accent/40" : "border-border"
              }`}
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{option.title}</span>
                <span className="text-xs text-muted">
                  {option.description}
                </span>
              </span>
              <span className="text-accent">→</span>
            </button>
          );
        })}
      </div>
    </WizardStepLayout>
  );
}
