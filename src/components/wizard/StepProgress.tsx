"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { TOTAL_STEPS } from "@/lib/wizard-context";

export default function StepProgress({ current }: { current: number }) {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {wt.progress.stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const done = stepNum < current;
            const active = stepNum === current;
            return (
              <div key={label} className="flex items-center gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 ${
                    active
                      ? "text-foreground"
                      : done
                        ? "text-accent"
                        : "text-muted"
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
                  <span className="text-[11px] font-medium hidden sm:inline">
                    {label}
                  </span>
                </div>
                {stepNum < TOTAL_STEPS && (
                  <span className="w-4 sm:w-8 h-px bg-border shrink-0" />
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
