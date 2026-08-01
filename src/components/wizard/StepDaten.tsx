"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";
import { dialCodeOptions } from "@/lib/country-codes";

// Volljährigkeit ist Voraussetzung für einen Kreditvertrag; die Obergrenze
// fängt Tippfehler wie das Jahr 0511 ab, ohne reale Antragsteller auszuschließen.
const MIN_AGE = 18;
const MAX_AGE = 100;

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

// Alter in vollen Jahren am Stichtag.
function ageAt(birth: Date, today: Date) {
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export default function StepDaten() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  // Grenzen für den Datumswähler, damit unplausible Werte gar nicht erst
  // auswählbar sind — die Prüfung unten fängt getippte Eingaben zusätzlich ab.
  const { minDate, maxDate } = useMemo(() => {
    const today = new Date();
    const latest = new Date(today);
    latest.setFullYear(latest.getFullYear() - MIN_AGE);
    const earliest = new Date(today);
    earliest.setFullYear(earliest.getFullYear() - MAX_AGE);
    return { minDate: toIsoDate(earliest), maxDate: toIsoDate(latest) };
  }, []);

  const birth = data.geburtsdatum.trim();
  const birthCheck = useMemo(() => {
    if (birth === "") return { ok: false, error: undefined as string | undefined };
    const parsed = new Date(birth);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: wt.step4.geburtsdatumImplausible };
    }
    const age = ageAt(parsed, new Date());
    if (age < MIN_AGE) {
      return { ok: false, error: wt.step4.geburtsdatumTooYoung };
    }
    if (age > MAX_AGE) {
      return { ok: false, error: wt.step4.geburtsdatumImplausible };
    }
    return { ok: true, error: undefined };
  }, [birth, wt]);

  const countries = useMemo(() => dialCodeOptions(lang), [lang]);

  const email = data.email.trim();
  // Ein @ genügt nicht: dahinter muss noch etwas stehen, "max@" ist
  // unvollständig. Geprüft wird das letzte @, damit auch "max@@" abgewiesen wird.
  const atIndex = email.lastIndexOf("@");
  const emailOk = atIndex > -1 && atIndex < email.length - 1;
  const emailError = email !== "" && !emailOk ? wt.step4.emailInvalid : undefined;

  const valid =
    data.vorname.trim() !== "" &&
    data.nachname.trim() !== "" &&
    birthCheck.ok &&
    emailOk &&
    data.telefonLand !== "" &&
    data.telefonVorwahl.trim() !== "" &&
    data.telefon.trim() !== "";

  return (
    <WizardStepLayout
      eyebrow={wt.step4.eyebrow}
      title={wt.step4.title}
      highlight={wt.step4.highlight}
      subtitle={wt.step4.subtitle}
      trust={wt.step4.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FormField
          id="vorname"
          label={wt.step4.vorname}
          value={data.vorname}
          onChange={(e) => update({ vorname: e.target.value })}
        />
        <FormField
          id="zweiterVorname"
          label={wt.step4.zweiterVorname}
          value={data.zweiterVorname}
          onChange={(e) => update({ zweiterVorname: e.target.value })}
          placeholder={wt.step4.optionalHint}
        />
        <FormField
          id="nachname"
          label={wt.step4.nachname}
          value={data.nachname}
          onChange={(e) => update({ nachname: e.target.value })}
        />
      </div>
      <FormField
        id="geburtsdatum"
        type="date"
        label={wt.step4.geburtsdatum}
        value={data.geburtsdatum}
        onChange={(e) => update({ geburtsdatum: e.target.value })}
        min={minDate}
        max={maxDate}
        error={birthCheck.error}
      />
      <FormField
        id="email"
        type="email"
        label={wt.step4.email}
        value={data.email}
        onChange={(e) => update({ email: e.target.value })}
        error={emailError}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[9.5rem_5.5rem_1fr] gap-4">
        <FormSelect
          id="telefonLand"
          label={wt.step4.telefonLand}
          value={data.telefonLand}
          onChange={(e) => update({ telefonLand: e.target.value })}
        >
          {countries.map(({ iso, dial, name }) => (
            <option key={iso} value={dial}>
              {dial} {name}
            </option>
          ))}
        </FormSelect>
        <FormField
          id="telefonVorwahl"
          type="tel"
          inputMode="numeric"
          label={wt.step4.telefonVorwahl}
          value={data.telefonVorwahl}
          onChange={(e) =>
            update({ telefonVorwahl: e.target.value.replace(/\D/g, "") })
          }
        />
        <FormField
          id="telefon"
          type="tel"
          inputMode="numeric"
          label={wt.step4.telefon}
          value={data.telefon}
          onChange={(e) =>
            update({ telefon: e.target.value.replace(/\D/g, "") })
          }
        />
      </div>
    </WizardStepLayout>
  );
}
