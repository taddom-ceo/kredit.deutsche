"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/lib/language-context";
import { useWizard, DEV_MODUS_VERFUEGBAR } from "@/lib/wizard-context";
import { wizardTranslations } from "@/lib/wizard-i18n";

export default function WizardStepLayout({
  eyebrow,
  title,
  highlight,
  subtitle,
  trust,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
  showNav = true,
  ausfahrer,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  trust: string[];
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showNav?: boolean;
  // Element, das hinter dem Hauptfenster liegt und daraus hervorfahren kann.
  // Es muss ein Geschwister des Fensters sein: Innerhalb davon liesse es sich
  // nicht dahinter legen, weil der undurchsichtige Hintergrund des Fensters
  // es sonst nie verdecken koennte.
  ausfahrer?: ReactNode;
}) {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update } = useWizard();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted tracking-wide">
          {eyebrow}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold leading-[1.1] tracking-[-0.02em]">
          {title} <span className="text-accent">{highlight}</span>
        </h1>
        <p className="text-muted leading-relaxed max-w-md">{subtitle}</p>
        <ul className="flex flex-col gap-2 mt-2">
          {trust.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-muted"
            >
              <span className="text-accent">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative">
        {ausfahrer}
        {/* Auf schmalen Handys fällt der Innenabstand knapper aus: Mit der
            größeren Schrift braucht der Inhalt die Breite dringender als der
            Rahmen.
            relative ist nötig, damit das Fenster ein positioniertes Element
            ist: Nur dann entscheidet die Reihenfolge im Markup darüber, was
            oben liegt, und der Ausfahrer bleibt dahinter verborgen. */}
        <div
          data-wizard-panel
          className="relative rounded-[24px] border border-border bg-surface p-5 sm:p-7 lg:p-9 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.55)] ring-1 ring-white/5 flex flex-col gap-7"
        >
          {/* key am Schritt: React tauscht den Block dadurch aus statt ihn zu
              aktualisieren, und die Einblendung laeuft bei jedem Wechsel neu.
              Bewusst kurz — der Ablauf soll nicht ausgebremst werden. */}
          <div key={data.step} className="schritt-wechsel flex flex-col gap-7">
            {children}
          </div>

          {showNav && (
            <div className="flex items-center gap-3 pt-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-[16px] border border-border px-4 py-3.5 text-sm font-medium text-muted transition-all duration-200 hover:text-foreground hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                >
                  ← {wt.nav.back}
                </button>
              )}
              <button
                type="button"
                onClick={onNext}
                // Im Entwicklermodus bleibt "Weiter" offen, egal was fehlt.
                disabled={nextDisabled && !data.devModus}
                className="flex-1 text-center rounded-[16px] bg-accent text-accent-foreground font-semibold px-4 py-3.5 text-sm shadow-[0_8px_24px_-6px_rgba(52,211,153,0.45)] transition-all duration-200 hover:bg-accent-strong hover:shadow-[0_10px_30px_-6px_rgba(52,211,153,0.55)] hover:-translate-y-px active:translate-y-0 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {nextLabel ?? wt.nav.next} →
              </button>
            </div>
          )}
        </div>

        {/* Schalter fuer die Entwicklung — unterhalb der Karte statt darin.
            Im Fenster stand er zwischen den Eingaben und wurde auf langen
            Schritten mitgescrollt; hier steht er fuer sich und ist auf jedem
            Schritt an derselben Stelle zu finden.
            Er haengt an einem gemeinsamen Zustand: einmal umgelegt, gilt er
            fuer die ganze Strecke.
            Ausserhalb der Entwicklung wird der Block gar nicht erst erzeugt —
            DEV_MODUS_VERFUEGBAR ist eine Konstante aus process.env, die Next
            beim Bauen einsetzt. */}
        {DEV_MODUS_VERFUEGBAR && (
          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2.5 rounded-[12px] border border-dashed border-amber-400/50 bg-amber-400/[0.06] px-3 py-2 text-xs font-medium text-amber-200/90">
            <input
              type="checkbox"
              checked={data.devModus}
              onChange={(e) => update({ devModus: e.target.checked })}
              className="size-3.5 accent-amber-400"
            />
            dev mode
            <span className="font-normal text-amber-200/60">
              {data.devModus
                ? "— Weiter immer frei, alle Schritte anklickbar"
                : "— Schritte ohne Eingaben durchklicken"}
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
