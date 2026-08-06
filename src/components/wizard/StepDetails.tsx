"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  DURATIONS,
  clampAmount,
  formatEuro,
  monthlyPayment,
  principalFromPayment,
} from "@/lib/loan-calc";
import EditableValue from "@/components/EditableValue";
import WizardStepLayout from "./WizardStepLayout";
import { KREDITARTEN, HAEUFIG_ANZAHL } from "@/lib/kreditarten";

export default function StepDetails() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const payment = useMemo(
    () => monthlyPayment(data.amount, data.months),
    [data.amount, data.months]
  );
  const total = payment * data.months;

  const displayedPayment = useAnimatedNumber(payment);
  const displayedTotal = useAnimatedNumber(total);

  return (
    <WizardStepLayout
      eyebrow={wt.step2.eyebrow}
      title={wt.step2.title}
      highlight={wt.step2.highlight}
      subtitle={wt.step2.subtitle}
      trust={wt.step2.trust}
      onBack={goBack}
      onNext={goNext}
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="purpose"
          className="text-[11px] font-semibold text-muted tracking-wide"
        >
          {wt.step2.purposeLabel}
        </label>
        <select
          id="purpose"
          value={data.purpose}
          onChange={(e) => update({ purpose: e.target.value })}
          className="rounded-[16px] border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <option value="">{wt.step2.purposePlaceholder}</option>
          {/* Dieselben vier wie auf Schritt 1 hervorgehoben. Ein natives
              Auswahlfeld lässt einzelne Einträge nicht zuverlässig gestalten —
              eine Gruppe mit Überschrift ist der Weg, den es dafür vorsieht.
              Hier steht der Produktname und nicht der Wunschsatz: In einer
              Auswahlliste wird überflogen, und "Autokredit" ist dabei schneller
              erfasst als "Ich möchte ein Auto kaufen". */}
          <optgroup label={wt.step1.haeufigLabel}>
            {KREDITARTEN.slice(0, HAEUFIG_ANZAHL).map((art) => (
              <option key={art.id} value={art.id}>
                {art[lang].name}
              </option>
            ))}
          </optgroup>
          <optgroup label={wt.step1.weitereLabel}>
            {KREDITARTEN.slice(HAEUFIG_ANZAHL).map((art) => (
              <option key={art.id} value={art.id}>
                {art[lang].name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="rounded-[16px] bg-surface-2 border border-border ring-1 ring-white/5 p-5 flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-muted tracking-wide">
          {wt.step2.previewLabel}
        </span>
        <EditableValue
          value={payment}
          formatted={formatEuro(displayedPayment)}
          onCommit={(next) =>
            update({ amount: clampAmount(principalFromPayment(next, data.months)) })
          }
          label={wt.step2.editPayment}
          className="text-4xl font-bold tracking-tight text-accent self-start"
          inputClassName="w-48"
        />
        <span className="text-xs text-muted leading-relaxed">
          {wt.step2.totalLabel} ≈ {formatEuro(displayedTotal)} · {data.months}{" "}
          {wt.step2.monthsUnit} · {wt.step2.previewNote}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold text-muted tracking-wide">
            {wt.step2.amountLabel}
          </span>
          <EditableValue
            value={data.amount}
            formatted={formatEuro(data.amount)}
            onCommit={(next) => update({ amount: clampAmount(next) })}
            label={wt.step2.editAmount}
            className="text-lg font-semibold tracking-tight"
            inputClassName="w-32"
          />
        </div>
        <input
          id="wizard-amount"
          type="range"
          min={AMOUNT_MIN}
          max={AMOUNT_MAX}
          step={AMOUNT_STEP}
          value={data.amount}
          onChange={(e) => update({ amount: Number(e.target.value) })}
        />
        <div className="flex justify-between text-xs text-muted">
          <span>{formatEuro(AMOUNT_MIN)}</span>
          <span>{formatEuro(AMOUNT_MAX)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-semibold text-muted tracking-wide">
            {wt.step2.durationLabel}
          </span>
          <span className="text-lg font-semibold tracking-tight">
            {data.months} {wt.step2.monthsUnit}
          </span>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
          {DURATIONS.map((m) => {
            const active = data.months === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => update({ months: m })}
                className={`rounded-[14px] border px-3 py-2 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  active
                    ? "border-accent bg-accent text-accent-foreground shadow-sm shadow-black/20"
                    : "border-border bg-surface-2 text-muted hover:text-foreground hover:border-border-strong"
                }`}
              >
                {m} {wt.step2.monthsUnit}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-[14px] bg-surface-2 border border-border p-3">
        <span className="text-accent text-sm">✓</span>
        <span className="text-xs text-muted leading-relaxed">
          {wt.step2.trustBadge}
        </span>
      </div>

      <p className="text-[11px] text-muted leading-relaxed">
        {wt.step2.socialProof}
      </p>
    </WizardStepLayout>
  );
}
