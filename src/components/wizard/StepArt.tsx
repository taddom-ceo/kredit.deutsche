"use client";

import { Fragment } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";

// Die ersten vier Verwendungszwecke werden hervorgehoben — auf Schritt 1 durch
// einen Akzentrand, auf Schritt 2 durch eine eigene Gruppe im Auswahlfeld.
export const HIGHLIGHTED_COUNT = 4;

// Erlaubt den Zeilenumbruch nach einem Schrägstrich. Ohne diesen Hinweis
// bricht der Browser innerhalb des Wortes ("Baufin|anzierung"); so entsteht
// stattdessen "Modernisierung/" und "Baufinanzierung".
function withBreakAfterSlash(text: string) {
  return text.split("/").map((part, i, parts) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          /<wbr />
        </>
      )}
    </Fragment>
  ));
}

export default function StepArt() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext } = useWizard();

  // Beide Schritte verwenden dieselben Werte, deshalb ist der
  // Verwendungszweck schlicht die hier gewählte Art. Wer sie nachträglich
  // ändert, bekommt den Zweck entsprechend mitgeführt.
  function select(id: string) {
    update({ kreditart: id, purpose: id });
    goNext();
  }

  return (
    <WizardStepLayout
      eyebrow={wt.step1.eyebrow}
      title={wt.step1.title}
      highlight={wt.step1.highlight}
      subtitle={wt.step1.subtitle}
      trust={wt.step1.trust}
      showNav={false}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {wt.step1.options.map((option, index) => {
          const active = data.kreditart === option.id;
          // Die ersten vier decken den Großteil der Anträge ab und bekommen
          // einen leichten Akzentrand. Bewusst schwächer als der
          // Auswahlzustand, damit beides unterscheidbar bleibt.
          const betont = index < HIGHLIGHTED_COUNT;
          const hinweisId = option.hinweis ? `hinweis-${option.id}` : undefined;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => select(option.id)}
              aria-describedby={hinweisId}
              // hover:z-30 hebt die ganze Karte über die nachfolgenden: Durch
              // hover:-translate-y-px bildet sie einen eigenen Stapelkontext,
              // in dem die Kurzinfo gefangen bleibt — ohne das Anheben läge
              // sie hinter den Karten darunter.
              className={`group relative hover:z-30 focus-visible:z-30 text-left rounded-[16px] border bg-surface-2 p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                active
                  ? // Der gewählte Zweck bekommt einen weißen Rahmen: Grün ist
                    // hier bereits die Farbe der Hervorhebung, beides wäre
                    // nicht auseinanderzuhalten. Der Rahmen wird beim
                    // Überfahren ausdrücklich gehalten, sonst überschriebe ihn
                    // hover:border-border-strong.
                    "border-foreground hover:border-foreground ring-1 ring-foreground/30"
                  : betont
                    ? "accent-breathe bg-accent/[0.07]"
                    : "border-border"
              }`}
            >
              {/* min-w-0 hebt die Standard-Mindestbreite von Flex-Elementen
                  auf, sonst schrumpft der Textblock nicht unter seine
                  Inhaltsbreite und lange Bezeichnungen wie
                  "Modernisierung/Baufinanzierung" ragen über die Karte
                  hinaus. break-words erlaubt den Umbruch innerhalb des Wortes. */}
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-semibold break-words">
                  {withBreakAfterSlash(option.title)}
                  {option.hinweis && (
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-flex h-[1.15em] w-[1.15em] shrink-0 items-center justify-center rounded-full border border-accent/50 align-[0.05em] text-[0.7em] font-bold leading-none text-accent"
                    >
                      i
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted break-words">
                  {option.description}
                </span>
              </span>
              <span className="text-accent shrink-0">→</span>
              {/* Kurzinfo zum Verwendungszweck. Sie hängt am Zeiger bzw. am
                  Tastaturfokus der ganzen Karte, weil ein eigener Auslöser ein
                  Bedienelement in einem Bedienelement wäre — das ist als
                  Markup nicht zulässig. Absolut positioniert und ohne
                  Zeigerereignisse, damit sie weder das Raster verschiebt noch
                  den Klick abfängt. */}
              {option.hinweis && (
                <span
                  id={hinweisId}
                  role="tooltip"
                  className="pointer-events-none absolute left-3 right-3 top-full z-20 mt-2 rounded-[12px] border border-accent/30 bg-surface px-3 py-2 text-xs leading-relaxed text-foreground/85 opacity-0 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.7)] transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {option.hinweis}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </WizardStepLayout>
  );
}
