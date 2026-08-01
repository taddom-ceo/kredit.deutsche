"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";

// Weiter zurück als 60 Jahre kann ein bestehendes Arbeitsverhältnis
// realistisch nicht reichen; nach vorne ist der laufende Monat die Grenze.
const MAX_YEARS_BACK = 60;

function composeMonth(year: string, month: string) {
  if (!year || !month) return "";
  return `${year}-${month.padStart(2, "0")}`;
}

export default function StepBeruf() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const now = useMemo(() => new Date(), []);
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;

  const years = useMemo(
    () =>
      Array.from({ length: MAX_YEARS_BACK + 1 }, (_, i) => thisYear - i),
    [thisYear]
  );

  // Im laufenden Jahr enden die wählbaren Monate beim aktuellen — beschäftigt
  // zu sein „seit" einem Monat, der noch nicht begonnen hat, gibt es nicht.
  const monthLimit =
    Number(data.beschaeftigtSeitJahr) === thisYear ? thisMonth : 12;

  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: fmt.format(new Date(Date.UTC(2000, i, 1))),
    }));
  }, [lang]);

  function updateSince(patch: { monat?: string; jahr?: string }) {
    const month = patch.monat ?? data.beschaeftigtSeitMonat;
    const year = patch.jahr ?? data.beschaeftigtSeitJahr;
    // Beim Wechsel ins laufende Jahr kann ein bereits gewählter späterer Monat
    // in der Zukunft liegen. Er wird geleert statt still verschoben.
    const limit = Number(year) === thisYear ? thisMonth : 12;
    const validMonth = month && Number(month) > limit ? "" : month;
    update({
      beschaeftigtSeitMonat: validMonth,
      beschaeftigtSeitJahr: year,
      beschaeftigtSeit: composeMonth(year, validMonth),
    });
  }

  const valid =
    data.beschaeftigungsart.trim() !== "" &&
    data.arbeitgeber.trim() !== "" &&
    data.beschaeftigtSeit.trim() !== "";

  return (
    <WizardStepLayout
      eyebrow={wt.step6.eyebrow}
      title={wt.step6.title}
      highlight={wt.step6.highlight}
      subtitle={wt.step6.subtitle}
      trust={wt.step6.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <FormSelect
        id="beschaeftigungsart"
        label={wt.step6.beschaeftigungsart}
        value={data.beschaeftigungsart}
        onChange={(e) => update({ beschaeftigungsart: e.target.value })}
      >
        <option value="">{wt.step6.beschaeftigungsartPlaceholder}</option>
        {wt.step6.beschaeftigungsartOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FormSelect>
      <FormField
        id="arbeitgeber"
        label={wt.step6.arbeitgeber}
        value={data.arbeitgeber}
        onChange={(e) => update({ arbeitgeber: e.target.value })}
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {wt.step6.beschaeftigtSeit}
        </span>
        {/* Nach oben begrenzt, damit das Monatsfeld auf breiten Karten nicht
            unnötig auseinandergezogen wird, und schrumpffähig fürs Handy. */}
        <div className="grid grid-cols-[minmax(0,12rem)_5.75rem] gap-3">
          <FormSelect
            id="beschaeftigtSeitMonat"
            label={wt.step6.monat}
            value={data.beschaeftigtSeitMonat}
            onChange={(e) => updateSince({ monat: e.target.value })}
          >
            <option value="">{wt.step6.auswahlPlatzhalter}</option>
            {months.slice(0, monthLimit).map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            id="beschaeftigtSeitJahr"
            label={wt.step6.jahr}
            value={data.beschaeftigtSeitJahr}
            onChange={(e) => updateSince({ jahr: e.target.value })}
          >
            <option value="">{wt.step6.auswahlPlatzhalter}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>
    </WizardStepLayout>
  );
}
