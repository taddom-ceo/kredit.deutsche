"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";
import { dialCodeOptions, dialForIso, flagSrc } from "@/lib/country-codes";

// Volljährigkeit ist Voraussetzung für einen Kreditvertrag; die Obergrenze
// fängt Tippfehler wie das Jahr 0511 ab, ohne reale Antragsteller auszuschließen.
const MIN_AGE = 18;
const MAX_AGE = 100;

// Ein Name beginnt mit einem Buchstaben und enthält danach keine Ziffern.
// Bewusst weit gefasst: Umlaute und diakritische Zeichen (Öztürk, Nguyễn),
// Bindestriche (Anna-Maria), Apostrophe (O'Brien) und Leerzeichen
// (van der Berg) müssen durchgehen — eine zu enge Regel weist echte
// Antragsteller ab, was teurer ist als eine erfundene Eingabe.
const NAME = /^\p{L}[\p{L}\p{M}\s.'’-]*$/u;

// Deutsche Ortsnetzkennzahlen sind 2 bis 5 Ziffern lang, mit führender Null
// also 3 bis 6 — von "30"/"030" (Berlin) bis "036841". Mobilfunkvorwahlen wie
// "0170" liegen dazwischen. Sechs Ziffern decken damit beide Schreibweisen ab.
const AREA_CODE_MIN = 2;
const AREA_CODE_MAX = 6;
// E.164 erlaubt 15 Ziffern für die gesamte Rufnummer inklusive Ländervorwahl;
// für den Teilnehmeranschluss bleiben damit höchstens zwölf.
const SUBSCRIBER_MAX = 12;

// Größtmögliche Tageszahl je Monat, unabhängig vom Jahr. Der Februar steht
// mit 29 darin, weil es diesen Tag in Schaltjahren gibt.
const MAX_DAYS_PER_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Ohne gewählten Monat steht die Länge noch nicht fest, dann sind 31 Tage die
// Obergrenze.
function maxDaysInMonth(month: number) {
  return MAX_DAYS_PER_MONTH[month - 1] ?? 31;
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

  const dayCount = maxDaysInMonth(Number(data.geburtsmonat));

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
    // Monat gewählt wird. Stillschweigend zu kürzen wäre bei einem
    // Geburtsdatum falsch — deshalb wird der Tag geleert und neu abgefragt.
    const validDay =
      day && Number(day) > maxDaysInMonth(Number(month)) ? "" : day;
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
    // Bewusst aus den Bestandteilen als lokales Datum gebaut. new Date("…")
    // liest die Zeichenkette als UTC, das Alter unten aber lokal — in
    // westlichen Zeitzonen verschöbe das die 18-Jahres-Grenze um einen Tag.
    const [y, m, d] = birth.split("-").map(Number);
    const parsed = new Date(y, m - 1, d);
    // Ein nicht existierender Tag ergibt kein ungültiges Datum, sondern rutscht
    // weiter: Aus dem 29.02.1990 wird stillschweigend der 01.03.1990. Der
    // Rückvergleich deckt das auf, statt ein falsches Geburtsdatum zu
    // übernehmen. In Schaltjahren besteht der 29. Februar die Prüfung.
    if (
      parsed.getFullYear() !== y ||
      parsed.getMonth() !== m - 1 ||
      parsed.getDate() !== d
    ) {
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

  const vornameOk = NAME.test(data.vorname.trim());
  const nachnameOk = NAME.test(data.nachname.trim());
  // Der zweite Vorname ist freiwillig — leer ist in Ordnung, gefüllt muss er
  // aber denselben Anforderungen genügen.
  const zweiterVornameOk =
    data.zweiterVorname.trim() === "" || NAME.test(data.zweiterVorname.trim());

  const nameError = (value: string, ok: boolean) =>
    value.trim() !== "" && !ok ? wt.step4.nameInvalid : undefined;

  const valid =
    vornameOk &&
    nachnameOk &&
    zweiterVornameOk &&
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
          error={nameError(data.vorname, vornameOk)}
        />
        <FormField
          id="zweiterVorname"
          label={wt.step4.zweiterVorname}
          value={data.zweiterVorname}
          onChange={(e) => update({ zweiterVorname: e.target.value })}
          placeholder={wt.step4.optionalHint}
          error={nameError(data.zweiterVorname, zweiterVornameOk)}
        />
        <FormField
          id="nachname"
          label={wt.step4.nachname}
          value={data.nachname}
          onChange={(e) => update({ nachname: e.target.value })}
          error={nameError(data.nachname, nachnameOk)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {wt.step4.geburtsdatum}
        </span>
        {/* Anteile statt fester Breiten: Feste rem-Breiten wachsen mit der
            Schriftgröße, die Kartenbreite nicht — auf schmalen Bildschirmen
            ragte das Jahr dadurch über den Rand. Der Monat bekommt den
            größten Anteil, damit "September" vollständig lesbar bleibt.
            Auf dem Handy fallen Abstand und Innenabstand knapper aus, weil
            drei Felder dort sonst keinen Platz für ihren Text lassen. */}
        <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,10fr)_minmax(0,7fr)] gap-2 sm:gap-3">
          <FormSelect
            id="geburtstag"
            selectClassName="px-2 sm:px-4"
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
            selectClassName="px-2 sm:px-4"
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
            selectClassName="px-2 sm:px-4"
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
      <FormSelect
        id="telefonLand"
        label={wt.step4.telefonLand}
        value={data.telefonLand}
        onChange={(e) => update({ telefonLand: e.target.value })}
      >
        {countries.map(({ iso, name }) => (
          <option key={iso} value={iso}>
            {name}
          </option>
        ))}
      </FormSelect>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {wt.step4.telefon}
        </span>
        {/* items-end richtet die feste Vorwahl an den Eingabefeldern aus,
            obwohl sie keine eigene Beschriftung trägt.
            Auf schmalen Handys reicht die Zeile für drei Felder nicht: Nach
            Ländervorwahl und Ortsvorwahl bliebe für die Rufnummer zu wenig
            Platz, ihr Text würde weggescrollt. Dort rutscht die Rufnummer
            deshalb in eine eigene Zeile über die volle Breite. */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,4fr)_minmax(0,6fr)] gap-3 items-end">
          <span className="flex items-center gap-2 rounded-[16px] border border-border bg-surface px-3 py-2.5 text-sm text-muted tabular-nums whitespace-nowrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={flagSrc(data.telefonLand)}
              alt=""
              width={20}
              height={15}
              className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-white/15"
            />
            {dialForIso(data.telefonLand)}
          </span>
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
            className="col-span-2 sm:col-span-1"
            type="tel"
            inputMode="numeric"
            label={wt.step4.telefonNummer}
            value={data.telefon}
            maxLength={SUBSCRIBER_MAX}
            onChange={(e) =>
              update({
                telefon: e.target.value
                  .replace(/\D/g, "")
                  .slice(0, SUBSCRIBER_MAX),
              })
            }
          />
        </div>
      </div>
    </WizardStepLayout>
  );
}
