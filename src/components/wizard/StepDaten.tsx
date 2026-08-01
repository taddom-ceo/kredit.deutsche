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

// Deutsche Ortsnetzkennzahlen sind 2 bis 5 Ziffern lang, mit führender Null
// also 3 bis 6 — von "30"/"030" (Berlin) bis "036841". Mobilfunkvorwahlen wie
// "0170" liegen dazwischen. Sechs Ziffern decken damit beide Schreibweisen ab.
const AREA_CODE_MIN = 2;
const AREA_CODE_MAX = 6;
// E.164 erlaubt 15 Ziffern für die gesamte Rufnummer inklusive Ländervorwahl;
// für den Teilnehmeranschluss bleiben damit höchstens zwölf.
const SUBSCRIBER_MAX = 12;

// Wie viele Tage der gewählte Monat hat. Ohne Monat oder Jahr wird die
// Obergrenze angenommen, damit die Tagesliste nie künstlich kurz ist.
function daysInMonth(year: number, month: number) {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

function composeIsoDate(year: string, month: string, day: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

  // Jahresliste genau im erlaubten Bereich: vom jüngsten zulässigen Jahrgang
  // absteigend bis zum ältesten. Die Randjahrgänge sind nur teilweise gültig
  // (wer heute noch nicht 18 ist), das fängt die tagesgenaue Prüfung unten ab.
  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const newest = thisYear - MIN_AGE;
    const oldest = thisYear - MAX_AGE;
    return Array.from({ length: newest - oldest + 1 }, (_, i) => newest - i);
  }, []);

  // Monatsnamen ausgeschrieben und in der aktuellen Sprache.
  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: fmt.format(new Date(Date.UTC(2000, i, 1))),
    }));
  }, [lang]);

  const dayCount = daysInMonth(
    Number(data.geburtsjahr),
    Number(data.geburtsmonat)
  );

  // Jede Teiländerung setzt zugleich den zusammengesetzten ISO-Wert neu.
  function updateBirthPart(patch: {
    geburtstag?: string;
    geburtsmonat?: string;
    geburtsjahr?: string;
  }) {
    const day = patch.geburtstag ?? data.geburtstag;
    const month = patch.geburtsmonat ?? data.geburtsmonat;
    const year = patch.geburtsjahr ?? data.geburtsjahr;
    // Ein bereits gewählter 31. passt nicht mehr, wenn danach ein kürzerer
    // Monat gewählt wird. Stillschweigend auf den 28. zu ändern wäre bei einem
    // Geburtsdatum falsch — deshalb wird der Tag geleert und neu abgefragt.
    const validDay =
      day && Number(day) > daysInMonth(Number(year), Number(month)) ? "" : day;
    update({
      geburtstag: validDay,
      geburtsmonat: month,
      geburtsjahr: year,
      geburtsdatum: composeIsoDate(year, month, validDay),
    });
  }

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
  // Vor und hinter dem @ muss etwas stehen: weder "max@" noch "@anbieter.de"
  // ist eine vollständige Adresse. Geprüft wird das letzte @, damit auch
  // "max@@" abgewiesen wird.
  const atIndex = email.lastIndexOf("@");
  const emailOk = atIndex > 0 && atIndex < email.length - 1;
  const emailError = email !== "" && !emailOk ? wt.step4.emailInvalid : undefined;

  const valid =
    data.vorname.trim() !== "" &&
    data.nachname.trim() !== "" &&
    birthCheck.ok &&
    emailOk &&
    data.telefonLand !== "" &&
    data.telefonVorwahl.length >= AREA_CODE_MIN &&
    data.telefon.trim() !== "";

  const areaCodeError =
    data.telefonVorwahl !== "" && data.telefonVorwahl.length < AREA_CODE_MIN
      ? wt.step4.telefonVorwahlTooShort
      : undefined;

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
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {wt.step4.geburtsdatum}
        </span>
        {/* Der Tag braucht kaum Platz, das Jahr eine feste Breite — der Rest
            geht an den Monat, damit "September" und "Dezember" auch auf
            schmalen Bildschirmen vollständig lesbar bleiben. */}
        <div className="grid grid-cols-[4.75rem_1fr_5.75rem] gap-3">
          <FormSelect
            id="geburtstag"
            label={wt.step4.geburtstag}
            value={data.geburtstag}
            onChange={(e) => updateBirthPart({ geburtstag: e.target.value })}
          >
            <option value="">{wt.step4.auswahlPlatzhalter}</option>
            {Array.from({ length: dayCount }, (_, i) => String(i + 1)).map(
              (day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              )
            )}
          </FormSelect>
          <FormSelect
            id="geburtsmonat"
            label={wt.step4.geburtsmonat}
            value={data.geburtsmonat}
            onChange={(e) => updateBirthPart({ geburtsmonat: e.target.value })}
          >
            <option value="">{wt.step4.auswahlPlatzhalter}</option>
            {months.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            id="geburtsjahr"
            label={wt.step4.geburtsjahr}
            value={data.geburtsjahr}
            onChange={(e) => updateBirthPart({ geburtsjahr: e.target.value })}
          >
            <option value="">{wt.step4.auswahlPlatzhalter}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormSelect>
        </div>
        {birthCheck.error && (
          <span className="text-xs text-red-400">{birthCheck.error}</span>
        )}
      </div>
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
          maxLength={AREA_CODE_MAX}
          onChange={(e) =>
            update({
              telefonVorwahl: e.target.value
                .replace(/\D/g, "")
                .slice(0, AREA_CODE_MAX),
            })
          }
          error={areaCodeError}
        />
        <FormField
          id="telefon"
          type="tel"
          inputMode="numeric"
          label={wt.step4.telefon}
          value={data.telefon}
          maxLength={SUBSCRIBER_MAX}
          onChange={(e) =>
            update({
              telefon: e.target.value.replace(/\D/g, "").slice(0, SUBSCRIBER_MAX),
            })
          }
        />
      </div>
    </WizardStepLayout>
  );
}
