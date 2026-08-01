"use client";

import { Fragment } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { TOTAL_STEPS, useWizard } from "@/lib/wizard-context";

export default function StepProgress({ current }: { current: number }) {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, goToStep } = useWizard();

  const zaehler = wt.progress.stepCounter
    .replace("{n}", String(current))
    .replace("{gesamt}", String(TOTAL_STEPS));
  const aktuellerTitel = wt.progress.stepLabels[current - 1] ?? "";
  const anteil = ((current - 1) / (TOTAL_STEPS - 1)) * 100;

  // Zustand eines Schritts. Erreichbar sind alle bereits besuchten — auch
  // vorwärts, wenn man zwischendurch zurückgegangen ist.
  function zustand(stepNum: number) {
    return {
      done: stepNum < current,
      active: stepNum === current,
      reachable: stepNum <= data.maxStep && stepNum !== current,
    };
  }

  return (
    <div className="border-b border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 lg:py-6 flex flex-col gap-3 lg:gap-5">
        {/* Kopfzeile: Wo bin ich, wie heißt der Schritt, wie lange noch.
            Nur auf großen Bildschirmen — auf dem Handy sagt das die Seite
            selbst über ihre Überschrift. */}
        <div className="hidden lg:flex items-baseline justify-between gap-4">
          <span className="text-sm">
            <span className="font-semibold text-foreground">{zaehler}</span>
            <span className="text-muted"> · {aktuellerTitel}</span>
          </span>
          <span className="text-xs font-medium text-muted">
            {wt.progress.timeRemaining}
          </span>
        </div>

        {/* Große Leiste ab 1024px: Kreise mit Beschriftung darunter, dazwischen
            eine Linie, die den bereits zurückgelegten Weg in der Akzentfarbe
            zeigt. */}
        <div className="hidden lg:flex items-start">
          {wt.progress.stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const { done, active, reachable } = zustand(stepNum);
            return (
              <Fragment key={label}>
                {i > 0 && (
                  // mt-[calc(...)] setzt die Linie auf die Mitte der Kreise:
                  // halbe Kreishöhe abzüglich der halben Linienstärke.
                  <span
                    aria-hidden="true"
                    className={`h-1 flex-1 rounded-full mt-[calc(1.25rem-0.125rem)] transition-colors duration-300 ${
                      stepNum <= current ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => goToStep(stepNum)}
                  disabled={!reachable}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${wt.progress.stepAriaPrefix} ${stepNum}: ${label}`}
                  className={`group flex shrink-0 flex-col items-center gap-2 px-2 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[12px] ${
                    reachable ? "hover:text-foreground" : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      active
                        ? "border-accent bg-accent text-accent-foreground shadow-[0_0_0_5px_rgba(52,211,153,0.18)]"
                        : done
                          ? "border-accent bg-accent/15 text-accent group-hover:bg-accent/25"
                          : "border-border bg-surface-2 text-muted"
                    }`}
                  >
                    {done ? "✓" : stepNum}
                  </span>
                  <span
                    className={`text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                      active
                        ? "text-foreground font-semibold"
                        : done
                          ? "text-accent"
                          : "text-muted"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              </Fragment>
            );
          })}
        </div>

        {/* Handy: nur Ziffern, dafür ein durchgehender Fortschrittsbalken.
            Die Reihe rollt nicht mehr seitlich — acht Kreise passen nebeneinander,
            sobald die Verbindungslinien entfallen. Damit verschwindet auch die
            Bildlaufleiste, die den unteren Rand der Leiste verdeckt hat. */}
        <div className="lg:hidden flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-semibold text-foreground">
              {zaehler} · {aktuellerTitel}
            </span>
            <span className="text-[11px] text-muted shrink-0">
              {wt.progress.timeRemaining}
            </span>
          </div>
          <div className="flex items-center justify-between gap-1">
            {wt.progress.stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const { done, active, reachable } = zustand(stepNum);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => goToStep(stepNum)}
                  disabled={!reachable}
                  aria-current={active ? "step" : undefined}
                  aria-label={`${wt.progress.stepAriaPrefix} ${stepNum}: ${label}`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-200 ${
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : done
                        ? "border-accent/60 bg-accent/15 text-accent"
                        : "border-border text-muted"
                  } ${reachable ? "" : "cursor-default"}`}
                >
                  {done ? "✓" : stepNum}
                </button>
              );
            })}
          </div>
          <div className="h-1 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
              style={{ width: `${anteil}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
