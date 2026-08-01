"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import { formatEuro, monthlyPayment } from "@/lib/loan-calc";

export default function StepConfirmation() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data } = useWizard();

  const payment = useMemo(
    () => monthlyPayment(data.amount, data.months),
    [data.amount, data.months]
  );

  const kreditartLabel = wt.step1.options.find(
    (o) => o.id === data.kreditart
  )?.title;

  const rows: [string, string][] = [
    [wt.confirmation.summaryKreditart, kreditartLabel ?? "—"],
    [wt.step2.amountLabel, formatEuro(data.amount)],
    [wt.step2.durationLabel, `${data.months} ${wt.step2.monthsUnit}`],
    [wt.step2.previewLabel, formatEuro(payment)],
    [
      wt.confirmation.summaryPersonen,
      data.personCount === 2 ? wt.step3.option2Title : wt.step3.option1Title,
    ],
    [wt.confirmation.summaryName, `${data.vorname} ${data.nachname}`],
    [wt.step4.email, data.email],
  ];

  return (
    <div className="mx-auto max-w-xl px-6 py-20 flex flex-col items-center text-center gap-6">
      <span className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-accent-foreground text-2xl font-bold shadow-[0_8px_24px_-6px_rgba(52,211,153,0.45)]">
        ✓
      </span>
      <h1 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
        {wt.confirmation.title}{" "}
        <span className="text-accent">{wt.confirmation.highlight}</span>
      </h1>
      <p className="text-muted leading-relaxed max-w-md">
        {wt.confirmation.subtitle}
      </p>

      <div className="w-full rounded-[24px] border border-border bg-surface p-6 lg:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5 flex flex-col gap-4 text-left">
        <span className="text-[11px] font-semibold text-muted tracking-wide">
          {wt.confirmation.summaryLabel}
        </span>
        <dl className="flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-sm font-semibold text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="w-full rounded-[16px] border border-border bg-surface-2 p-4 text-left flex flex-col gap-1">
        <span className="text-xs font-semibold">
          {wt.confirmation.disclaimerTitle}
        </span>
        <span className="text-xs text-muted leading-relaxed">
          {wt.confirmation.disclaimer}
        </span>
      </div>

      <Link
        href="/"
        className="rounded-[16px] border border-border px-5 py-3 text-sm font-medium transition-all duration-200 hover:border-border-strong hover:text-accent"
      >
        {wt.confirmation.ctaHome}
      </Link>
    </div>
  );
}
