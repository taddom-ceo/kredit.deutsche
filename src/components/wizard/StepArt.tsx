"use client";

import { Fragment } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";

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
        {wt.step1.options.map((option) => {
          const active = data.kreditart === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => select(option.id)}
              className={`text-left rounded-[16px] border bg-surface-2 p-4 flex items-center justify-between gap-3 transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                active ? "border-accent ring-1 ring-accent/40" : "border-border"
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
                </span>
                <span className="text-xs text-muted break-words">
                  {option.description}
                </span>
              </span>
              <span className="text-accent shrink-0">→</span>
            </button>
          );
        })}
      </div>
    </WizardStepLayout>
  );
}
