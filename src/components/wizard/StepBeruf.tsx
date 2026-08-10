"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  BESCHAEFTIGUNG_RENTNER,
  wizardTranslations,
  type WizardTranslations,
} from "@/lib/wizard-i18n";
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

/**
 * Beschaeftigung einer Person — einmal geschrieben, zweimal benutzt.
 *
 * Wie bei Name und Geburtsdatum: Bei zwei Kreditnehmern steht derselbe Satz
 * Felder zweimal auf der Seite, und eine Regel, die an zwei Stellen steht,
 * wird beim naechsten Mal nur an einer geaendert.
 */
function BerufFelder({
  praefix,
  wt,
  werte,
  aendereArt,
  aendereArbeitgeber,
  aendereSeit,
  months,
  monthLimit,
  years,
}: {
  praefix: string;
  wt: WizardTranslations;
  werte: {
    beschaeftigungsart: string;
    arbeitgeber: string;
    beschaeftigtSeitMonat: string;
    beschaeftigtSeitJahr: string;
  };
  aendereArt: (art: string) => void;
  aendereArbeitgeber: (wert: string) => void;
  aendereSeit: (patch: { monat?: string; jahr?: string }) => void;
  months: { value: string; label: string }[];
  monthLimit: number;
  years: number[];
}) {
  const t = wt.step6;
  return (
    <>
      <FormSelect
        id={`${praefix}beschaeftigungsart`}
        label={t.beschaeftigungsart}
        value={werte.beschaeftigungsart}
        onChange={(e) => aendereArt(e.target.value)}
      >
        <option value="">{t.beschaeftigungsartPlaceholder}</option>
        {t.beschaeftigungsartOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FormSelect>
      <FormField
        id={`${praefix}arbeitgeber`}
        label={t.arbeitgeber}
        value={werte.arbeitgeber}
        onChange={(e) => aendereArbeitgeber(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {t.beschaeftigtSeit}
        </span>
        {/* Nach oben begrenzt, damit das Monatsfeld auf breiten Karten nicht
            unnötig auseinandergezogen wird, und schrumpffähig fürs Handy. */}
        <div className="grid grid-cols-[minmax(0,12rem)_5.75rem] gap-3">
          <FormSelect
            id={`${praefix}beschaeftigtSeitMonat`}
            label={t.monat}
            value={werte.beschaeftigtSeitMonat}
            onChange={(e) => aendereSeit({ monat: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {months.slice(0, monthLimit).map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            id={`${praefix}beschaeftigtSeitJahr`}
            label={t.jahr}
            value={werte.beschaeftigtSeitJahr}
            onChange={(e) => aendereSeit({ jahr: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>
    </>
  );
}

export default function StepBeruf() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, updateZweite, goNext, goBack } = useWizard();
  const zwei = data.personCount === 2;

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

  const zweiteMonthLimit =
    Number(data.zweitePerson.beschaeftigtSeitJahr) === thisYear ? thisMonth : 12;

  /** Dasselbe fuer den zweiten Kreditnehmer. */
  function updateZweiteSince(patch: { monat?: string; jahr?: string }) {
    const p = data.zweitePerson;
    const month = patch.monat ?? p.beschaeftigtSeitMonat;
    const year = patch.jahr ?? p.beschaeftigtSeitJahr;
    const limit = Number(year) === thisYear ? thisMonth : 12;
    const validMonth = month && Number(month) > limit ? "" : month;
    updateZweite({
      beschaeftigtSeitMonat: validMonth,
      beschaeftigtSeitJahr: year,
      beschaeftigtSeit: composeMonth(year, validMonth),
    });
  }

  const rentner = wt.step6.beschaeftigungsartOptions[BESCHAEFTIGUNG_RENTNER];

  /**
   * Beschaeftigungsart waehlen — und den Arbeitgeber mitfuehren.
   *
   * Bei "Rentner/-in" gibt es keinen Arbeitgeber im Wortsinn; gefragt ist der
   * Traeger, und der ist bei den allermeisten die Deutsche
   * Rentenversicherung. Sie wird deshalb eingesetzt, statt den Kunden vor ein
   * Pflichtfeld zu stellen, auf das er keine Antwort hat. Das Feld bleibt
   * offen: Wer eine Pensionskasse oder ein Versorgungswerk hat, ueberschreibt
   * es.
   *
   * Beim Wechsel weg von "Rentner/-in" wird der Vorschlag wieder
   * zurueckgenommen — aber nur, wenn er unveraendert dasteht. Ein selbst
   * eingetragener Arbeitgeber bleibt stehen, sonst loeschte ein Verklicken in
   * der Auswahl eine Eingabe, die niemand mehr sieht.
   */
  function waehleArt(art: string) {
    const vorschlagSteht = data.arbeitgeber === wt.step6.rentnerArbeitgeber;
    update({
      beschaeftigungsart: art,
      arbeitgeber:
        art === rentner
          ? wt.step6.rentnerArbeitgeber
          : vorschlagSteht
            ? ""
            : data.arbeitgeber,
    });
  }

  /** Dieselbe Regel — der Traeger als Vorschlag — fuer den zweiten. */
  function waehleZweiteArt(art: string) {
    const p = data.zweitePerson;
    const vorschlagSteht = p.arbeitgeber === wt.step6.rentnerArbeitgeber;
    updateZweite({
      beschaeftigungsart: art,
      arbeitgeber:
        art === rentner
          ? wt.step6.rentnerArbeitgeber
          : vorschlagSteht
            ? ""
            : p.arbeitgeber,
    });
  }

  const vollstaendig = (p: {
    beschaeftigungsart: string;
    arbeitgeber: string;
    beschaeftigtSeit: string;
  }) =>
    p.beschaeftigungsart.trim() !== "" &&
    p.arbeitgeber.trim() !== "" &&
    p.beschaeftigtSeit.trim() !== "";

  const valid =
    vollstaendig(data) && (!zwei || vollstaendig(data.zweitePerson));

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
      {zwei && <h2 className="text-sm font-semibold">{wt.zweite.ersterTitel}</h2>}

      <BerufFelder
        praefix=""
        wt={wt}
        werte={data}
        aendereArt={waehleArt}
        aendereArbeitgeber={(wert) => update({ arbeitgeber: wert })}
        aendereSeit={updateSince}
        months={months}
        monthLimit={monthLimit}
        years={years}
      />

      {zwei && (
        <div className="border-t border-border pt-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold">{wt.zweite.zweiterTitel}</h2>
          <BerufFelder
            praefix="zweite-"
            wt={wt}
            werte={data.zweitePerson}
            aendereArt={waehleZweiteArt}
            aendereArbeitgeber={(wert) => updateZweite({ arbeitgeber: wert })}
            aendereSeit={updateZweiteSince}
            months={months}
            monthLimit={zweiteMonthLimit}
            years={years}
          />
        </div>
      )}
    </WizardStepLayout>
  );
}
