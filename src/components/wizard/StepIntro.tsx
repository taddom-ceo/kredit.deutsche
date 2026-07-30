"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import { formatEuro } from "@/lib/loan-calc";

export default function StepIntro() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, goNext } = useWizard();

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:py-28 flex flex-col items-center text-center gap-6">
      <span className="inline-flex w-fit items-center rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted tracking-wide">
        {wt.intro.eyebrow}
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold leading-[1.08] tracking-[-0.02em]">
        {wt.intro.title}{" "}
        <span className="text-accent">{wt.intro.highlight}</span>
      </h1>
      <p className="text-lg text-muted leading-relaxed max-w-lg">
        {wt.intro.subtitle}
      </p>

      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-2">
        {wt.intro.trust.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-sm text-muted"
          >
            <span className="text-accent">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <div className="w-full rounded-[24px] border border-border bg-surface p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5 flex flex-col gap-6 mt-4">
        {data.amount && (
          <div className="rounded-[16px] bg-surface-2 border border-border p-4 flex items-center justify-between text-left">
            <span className="text-xs text-muted">{wt.intro.prefillLabel}</span>
            <span className="text-sm font-semibold">
              {formatEuro(data.amount)} · {data.months} {wt.step2.monthsUnit}
            </span>
          </div>
        )}

        <ol className="flex flex-col gap-3 text-left">
          {wt.intro.steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-border text-[11px] font-semibold text-muted shrink-0">
                {i + 1}
              </span>
              <span className="text-muted">{label}</span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={goNext}
          className="w-full text-center rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3.5 text-sm shadow-[0_8px_24px_-6px_rgba(52,211,153,0.45)] transition-all duration-200 hover:bg-accent-strong hover:shadow-[0_10px_30px_-6px_rgba(52,211,153,0.55)] hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {wt.intro.cta} →
        </button>
      </div>
    </div>
  );
}
