"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import EditableValue from "@/components/EditableValue";
import { useLanguage } from "@/lib/language-context";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import {
  AMOUNT_MAX,
  AMOUNT_MIN,
  AMOUNT_STEP,
  DURATIONS,
  SAMPLE_ANNUAL_RATE,
  VERGLEICHS_ANNUAL_RATE,
  clampAmount,
  formatEuro,
  monthlyPayment,
  principalFromPayment,
} from "@/lib/loan-calc";

/**
 * Der Rechner im Aufmacher — im Handy, mit mitrechnender Ersparnis.
 *
 * Die dritte Fassung der Startseite sucht die Mitte zwischen den ersten
 * beiden. Die erste hatte an dieser Stelle ein gezeichnetes Handy, das ein
 * Formular nachspielte; das echte Formular lag dreitausend Pixel weiter unten.
 * Die zweite stellte den Rechner dorthin und liess das Handy weg.
 *
 * Hier steht beides: das Geraet als Rahmen, darin der Rechner, der wirklich
 * rechnet. Der Aufmacher behaelt sein Gesicht und bekommt trotzdem die
 * Eingabe, um die es geht.
 *
 * Das Gehaeuse ist bewusst in CSS gebaut und nicht als Zeichnung: In einem
 * SVG waeren Regler und Auswahlfeld gemalte Rechtecke. Als Rahmen um
 * gewoehnliche Formularelemente bleibt alles bedienbar — mit Tastatur, mit
 * Vorleseprogramm, mit dem Finger.
 *
 * Die Plakette daneben ist der eigentliche Gewinn gegenueber beiden
 * Vorgaengern. In der ersten Fassung stand dort eine feste Zahl, die von Hand
 * ausgerechnet war und unabhaengig vom Betrachter dieselbe blieb. Hier rechnet
 * sie mit, waehrend man den Regler zieht: Eine Zahl, die steigt, weil ich
 * gerade etwas getan habe, ueberzeugt anders als eine, die von allein laeuft.
 */
export default function AufmacherRechner({
  ctaText,
  ersparnisLabel,
  ersparnisFuss,
}: {
  ctaText?: string;
  /** Was ueber der Zahl steht, etwa "gespart". */
  ersparnisLabel: string;
  /** Die Fussnote unter der Plakette — nennt den Vergleichszins. */
  ersparnisFuss: string;
}) {
  const { t } = useLanguage();
  const [betrag, setBetrag] = useState(20000);
  const [monate, setMonate] = useState(72);

  const rate = useMemo(() => monthlyPayment(betrag, monate), [betrag, monate]);
  const gesamt = rate * monate;
  /**
   * Was derselbe Kredit beim teuren Zins kostete, und was das ausmacht.
   *
   * Gerechnet und nicht behauptet: Beide Zahlen kommen aus derselben Formel,
   * und der Vergleichszins ist dieselbe Konstante, die die Fussnote nennt.
   */
  const teuer = useMemo(
    () => monthlyPayment(betrag, monate, VERGLEICHS_ANNUAL_RATE) * monate,
    [betrag, monate]
  );
  const ersparnis = Math.max(0, teuer - gesamt);

  const gezeigteRate = useAnimatedNumber(rate);
  const gezeigteErsparnis = useAnimatedNumber(ersparnis);

  return (
    <div className="relative w-full max-w-[380px]">
      {/**
       * Der Schimmer hinter dem Geraet.
       *
       * `-z-10` und nicht dahinter im Markup: So liegt er sicher unter allem,
       * was im Rahmen steht, auch wenn der Rahmen selbst durchscheinend ist.
       *
       * Seitlich buendig (`inset-x-0`) und nur oben und unten hinausragend.
       * Als `-inset-10` war der Kasten auf jeder Seite vierzig Pixel breiter
       * als das Geraet — gemessen wuchs die Seite am Handy damit von 390 auf
       * 415 Pixel und liess sich seitlich wegschieben. Der Weichzeichner
       * strahlt trotzdem ueber die Kanten hinaus; er ist eine Malerei und
       * vergroessert den Rollbereich nicht.
       */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 -bottom-10 -z-10 rounded-full bg-accent/[0.08] blur-3xl"
      />

      {/* Das Gehaeuse. */}
      <div className="rounded-[40px] border border-border-strong bg-surface p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
        {/* Hoerer und Kamera — zwei Striche, mehr braucht die Andeutung
            nicht. Ein nachgebauter Ausschnitt waere bei dieser Groesse nur
            Unruhe. */}
        <div
          aria-hidden="true"
          className="mx-auto mb-3 flex items-center justify-center gap-2"
        >
          <span className="h-1.5 w-14 rounded-full bg-border-strong" />
          <span className="size-1.5 rounded-full bg-border-strong" />
        </div>

        {/* Der Bildschirm. */}
        <div className="flex flex-col gap-5 rounded-[30px] bg-background px-5 py-6">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor="aufmacher-betrag"
                className="text-xs font-medium text-muted"
              >
                {t.calculator.amountLabel}
              </label>
              <EditableValue
                value={betrag}
                formatted={formatEuro(betrag)}
                onCommit={(next) => setBetrag(clampAmount(next))}
                label={t.calculator.editAmount}
                className="text-base font-semibold tracking-tight"
                inputClassName="w-28"
              />
            </div>
            <input
              id="aufmacher-betrag"
              type="range"
              min={AMOUNT_MIN}
              max={AMOUNT_MAX}
              step={AMOUNT_STEP}
              value={betrag}
              onChange={(e) => setBetrag(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-muted">
              <span>{formatEuro(AMOUNT_MIN)}</span>
              <span>{formatEuro(AMOUNT_MAX)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="aufmacher-laufzeit"
              className="text-xs font-medium text-muted"
            >
              {t.calculator.durationLabel}
            </label>
            <select
              id="aufmacher-laufzeit"
              value={monate}
              onChange={(e) => setMonate(Number(e.target.value))}
              className="rounded-[14px] border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40"
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

          <div className="flex flex-col gap-1 rounded-[14px] border border-border bg-surface-2 p-4 ring-1 ring-white/5">
            <span className="text-[11px] text-muted">
              {t.calculator.paymentLabel}
            </span>
            <EditableValue
              value={rate}
              formatted={formatEuro(gezeigteRate)}
              onCommit={(next) =>
                setBetrag(clampAmount(principalFromPayment(next, monate)))
              }
              label={t.calculator.editPayment}
              className="self-start text-3xl font-bold tracking-tight text-accent"
              inputClassName="w-40"
            />
            <span className="text-[11px] leading-relaxed text-muted">
              {t.calculator.totalLabel} {formatEuro(gesamt)} ·{" "}
              {t.calculator.rateLabel}{" "}
              {(SAMPLE_ANNUAL_RATE * 100).toFixed(2).replace(".", ",")} %
            </span>
          </div>

          <Link
            href={`/antrag?amount=${betrag}&months=${monate}`}
            className="w-full rounded-[14px] bg-accent px-4 py-3.5 text-center text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-6px_rgba(52,211,153,0.45)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {ctaText ?? t.calculator.cta}
          </Link>
        </div>
      </div>

      {/**
       * Die Plakette.
       *
       * Unter dem Geraet und nicht daneben schwebend. Schwebend sah sie besser
       * aus und lag dabei ueber dem Knopf — gemessen verdeckte sie ihn zur
       * Haelfte, und der Knopf ist das eine, was hier gedrueckt werden soll.
       * Weit genug nach unten geschoben, dass sie nichts mehr trifft, stuende
       * sie mit 128 Pixeln Luft im Nichts.
       *
       * Sie behaelt ihren eigenen Rahmen und ihren eigenen Schatten: Damit
       * bleibt sie ein Stueck fuer sich, das zum Geraet gehoert, statt eine
       * weitere Zeile darin zu werden.
       */}
      <div className="mt-4 flex flex-col gap-1 rounded-[18px] border border-accent/30 bg-surface px-4 py-3 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/[0.14] text-accent"
          >
            ↓
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tabular-nums text-accent">
              {formatEuro(gezeigteErsparnis)}
            </span>
            <span className="text-[11px] text-muted">{ersparnisLabel}</span>
          </div>
        </div>
        <p className="text-[10px] leading-snug text-muted/70">{ersparnisFuss}</p>
      </div>
    </div>
  );
}
