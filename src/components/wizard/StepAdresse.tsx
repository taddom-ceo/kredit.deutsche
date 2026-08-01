"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";

type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; places: string[] }
  | { status: "unknown" }
  | { status: "failed" };

// Ein Straßenname muss mindestens zwei Buchstaben enthalten — das schließt
// reine Zahlen- oder Zeichenfolgen aus, ohne echte Namen wie "Ob dem Tal"
// oder "Große Straße" zu behindern.
const STREET = /\p{L}[\p{L}\s.\-'’]*\p{L}/u;
// Hausnummern beginnen mit einer Ziffer, optional mit Zusatz: 12, 12a, 12-14,
// 12/3, 12 a.
const HOUSE_NUMBER = /^\d{1,4}\s*[a-zA-Z]?([-/]\s*\d{1,4}\s*[a-zA-Z]?)?$/;

// Antworten je PLZ merken, damit Sprünge im Wizard nicht erneut anfragen.
const cache = new Map<string, string[]>();

export default function StepAdresse() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();
  const [lookup, setLookup] = useState<Lookup>({ status: "idle" });

  const plz = data.plz.trim();
  // Der zuletzt gewählte Ort wird über eine Ref gelesen, damit die Abfrage
  // ausschließlich von der PLZ abhängt und nicht bei jedem Tastendruck neu läuft.
  const ortRef = useRef(data.ort);
  ortRef.current = data.ort;

  useEffect(() => {
    if (!/^\d{5}$/.test(plz)) {
      setLookup({ status: "idle" });
      if (ortRef.current !== "") update({ ort: "" });
      return;
    }

    // Übernimmt das Ergebnis und wählt einen passenden Ort vor.
    const apply = (places: string[]) => {
      if (places.length === 0) {
        setLookup({ status: "unknown" });
        if (ortRef.current !== "") update({ ort: "" });
        return;
      }
      setLookup({ status: "ok", places });
      if (!places.includes(ortRef.current)) update({ ort: places[0] });
    };

    const cached = cache.get(plz);
    if (cached) {
      apply(cached);
      return;
    }

    let cancelled = false;
    setLookup({ status: "loading" });
    fetch(`/api/plz?code=${plz}`)
      .then((r) => r.json())
      .then((res: { ok: boolean; places: string[] }) => {
        if (cancelled) return;
        const places = res.ok ? res.places : [];
        cache.set(plz, places);
        apply(places);
      })
      .catch(() => {
        if (!cancelled) setLookup({ status: "failed" });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plz]);

  const strasseTouched = data.strasse.trim() !== "";
  const hausnummerTouched = data.hausnummer.trim() !== "";
  const strasseOk = STREET.test(data.strasse.trim());
  const hausnummerOk = HOUSE_NUMBER.test(data.hausnummer.trim());
  const plzOk = lookup.status === "ok";
  const ortOk = plzOk && lookup.places.includes(data.ort);

  const valid = strasseOk && hausnummerOk && plzOk && ortOk;

  const plzError =
    lookup.status === "unknown"
      ? wt.step5.plzUnknown
      : lookup.status === "failed"
        ? wt.step5.plzLookupFailed
        : undefined;

  return (
    <WizardStepLayout
      eyebrow={wt.step5.eyebrow}
      title={wt.step5.title}
      highlight={wt.step5.highlight}
      subtitle={wt.step5.subtitle}
      trust={wt.step5.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
        <FormField
          id="strasse"
          label={wt.step5.strasse}
          value={data.strasse}
          onChange={(e) => update({ strasse: e.target.value })}
          error={
            strasseTouched && !strasseOk ? wt.step5.strasseInvalid : undefined
          }
        />
        <FormField
          id="hausnummer"
          label={wt.step5.hausnummer}
          value={data.hausnummer}
          onChange={(e) => update({ hausnummer: e.target.value })}
          className="lg:w-28"
          error={
            hausnummerTouched && !hausnummerOk
              ? wt.step5.hausnummerInvalid
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
        <FormField
          id="plz"
          label={wt.step5.plz}
          value={data.plz}
          onChange={(e) =>
            update({ plz: e.target.value.replace(/\D/g, "").slice(0, 5) })
          }
          inputMode="numeric"
          autoComplete="postal-code"
          className="lg:w-28"
          error={plzError}
        />
        <FormSelect
          id="ort"
          label={wt.step5.ort}
          value={data.ort}
          onChange={(e) => update({ ort: e.target.value })}
          disabled={!plzOk}
        >
          {plzOk ? (
            <>
              {!lookup.places.includes(data.ort) && (
                <option value="">{wt.step5.ortPlaceholder}</option>
              )}
              {lookup.places.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </>
          ) : (
            <option value="">{wt.step5.ortAwaitingPlz}</option>
          )}
        </FormSelect>
      </div>

      <p
        className={`text-xs leading-relaxed ${
          plzOk ? "text-accent" : "text-muted"
        }`}
        aria-live="polite"
      >
        {lookup.status === "loading"
          ? wt.step5.plzChecking
          : plzOk
            ? `✓ ${wt.step5.plzVerified}`
            : wt.step5.addressNote}
      </p>
    </WizardStepLayout>
  );
}
