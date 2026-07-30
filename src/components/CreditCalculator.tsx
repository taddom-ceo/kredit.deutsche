"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/language-context";

const DURATIONS = [12, 24, 36, 48, 60, 84, 120, 180, 240];
const SAMPLE_ANNUAL_RATE = 0.0549;

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function monthlyPayment(principal: number, months: number, annualRate: number) {
  const monthlyRate = annualRate / 12;
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

export default function CreditCalculator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(20000);
  const [months, setMonths] = useState(84);

  const payment = useMemo(
    () => monthlyPayment(amount, months, SAMPLE_ANNUAL_RATE),
    [amount, months]
  );
  const total = payment * months;

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="amount" className="text-sm font-medium text-muted">
              {t.calculator.amountLabel}
            </label>
            <span className="text-lg font-semibold">
              {formatEuro(amount)}
            </span>
          </div>
          <input
            id="amount"
            type="range"
            min={500}
            max={150000}
            step={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="accent-accent"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>500 €</span>
            <span>150.000 €</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="duration" className="text-sm font-medium text-muted">
            {t.calculator.durationLabel}
          </label>
          <select
            id="duration"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-foreground"
          >
            {DURATIONS.map((m) => (
              <option key={m} value={m}>
                {m} {t.calculator.months}
                {m >= 12
                  ? ` (${m / 12} ${
                      m === 12 ? t.calculator.year : t.calculator.years
                    })`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl bg-surface-2 border border-border p-4 flex flex-col gap-1">
          <span className="text-xs text-muted">
            {t.calculator.paymentLabel}
          </span>
          <span className="text-3xl font-bold text-accent">
            {formatEuro(payment)}
          </span>
          <span className="text-xs text-muted">
            {t.calculator.totalLabel} {formatEuro(total)} ·{" "}
            {t.calculator.rateLabel}{" "}
            {(SAMPLE_ANNUAL_RATE * 100).toFixed(2).replace(".", ",")} %
          </span>
        </div>

        <a
          href="#kontakt"
          className="w-full text-center rounded-lg bg-accent text-accent-foreground font-semibold px-4 py-3 text-sm hover:opacity-90 transition-opacity"
        >
          {t.calculator.cta}
        </a>
        <p className="text-[11px] leading-snug text-muted">
          {t.calculator.disclaimer}
        </p>
      </div>
    </div>
  );
}
