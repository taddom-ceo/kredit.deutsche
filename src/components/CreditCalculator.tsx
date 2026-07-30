"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  DURATIONS,
  SAMPLE_ANNUAL_RATE,
  formatEuro,
  monthlyPayment,
} from "@/lib/loan-calc";

export default function CreditCalculator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(20000);
  const [months, setMonths] = useState(72);

  const payment = useMemo(
    () => monthlyPayment(amount, months),
    [amount, months]
  );
  const total = payment * months;

  const displayedAmount = useAnimatedNumber(amount);
  const displayedPayment = useAnimatedNumber(payment);
  const displayedTotal = useAnimatedNumber(total);

  return (
    <div className="w-full max-w-md rounded-[24px] border border-border bg-surface p-7 sm:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="amount" className="text-sm font-medium text-muted">
              {t.calculator.amountLabel}
            </label>
            <span className="text-lg font-semibold tracking-tight">
              {formatEuro(displayedAmount)}
            </span>
          </div>
          <input
            id="amount"
            type="range"
            min={AMOUNT_MIN}
            max={AMOUNT_MAX}
            step={AMOUNT_STEP}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="flex justify-between text-xs text-muted">
            <span>{formatEuro(AMOUNT_MIN)}</span>
            <span>{formatEuro(AMOUNT_MAX)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="duration" className="text-sm font-medium text-muted">
            {t.calculator.durationLabel}
          </label>
          <select
            id="duration"
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-[16px] border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

        <div className="rounded-[16px] bg-surface-2 border border-border ring-1 ring-white/5 p-5 flex flex-col gap-1.5">
          <span className="text-xs text-muted">
            {t.calculator.paymentLabel}
          </span>
          <span className="text-4xl font-bold tracking-tight text-accent">
            {formatEuro(displayedPayment)}
          </span>
          <span className="text-xs text-muted leading-relaxed">
            {t.calculator.totalLabel} {formatEuro(displayedTotal)} ·{" "}
            {t.calculator.rateLabel}{" "}
            {(SAMPLE_ANNUAL_RATE * 100).toFixed(2).replace(".", ",")} %
          </span>
        </div>

        <Link
          href={`/antrag?amount=${amount}&months=${months}`}
          className="w-full text-center rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3.5 text-sm shadow-[0_8px_24px_-6px_rgba(52,211,153,0.45)] transition-all duration-200 hover:bg-accent-strong hover:shadow-[0_10px_30px_-6px_rgba(52,211,153,0.55)] hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          {t.calculator.cta}
        </Link>
        <p className="text-[11px] leading-relaxed text-muted">
          {t.calculator.disclaimer}
        </p>
      </div>
    </div>
  );
}
