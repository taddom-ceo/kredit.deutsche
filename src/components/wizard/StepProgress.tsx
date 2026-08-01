"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { TOTAL_STEPS, useWizard } from "@/lib/wizard-context";

export default function StepProgress({ current }: { current: number }) {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, goToStep } = useWizard();

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {wt.progress.stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const done = stepNum < current;
            const active = stepNum === current;
            // Bereits besuchte Schritte bleiben anspringbar — auch vorwärts,
            // wenn man zwischendurch zurückgegangen ist.
            const reachable = stepNum <= data.maxStep && !active;
            return (
              <div key={label} className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => goToStep(stepNum)}
                  disabled={!reachable}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${wt.progress.stepAriaPrefix} ${stepNum}: ${label}`}
                  className={`flex items-center gap-1.5 rounded-full px-1 -mx-1 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    active
                      ? "text-foreground"
                      : done
                        ? "text-accent"
                        : "text-muted"
                  } ${
                    reachable
                      ? "cursor-pointer hover:text-foreground"
                      : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-semibold border transition-colors duration-200 ${
                      active
                        ? "border-accent bg-accent text-accent-foreground"
                        : done
                          ? "border-accent/60 text-accent"
                          : "border-border text-muted"
                    }`}
                  >
                    {done ? "✓" : stepNum}
                  </span>
                  <span className="text-[11px] font-medium hidden lg:inline">
                    {label}
                  </span>
                </button>
                {stepNum < TOTAL_STEPS && (
                  <span className="w-4 lg:w-8 h-px bg-border shrink-0" />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[11px] text-muted">
          {wt.progress.timeRemaining}
        </span>
      </div>
    </div>
  );
}
