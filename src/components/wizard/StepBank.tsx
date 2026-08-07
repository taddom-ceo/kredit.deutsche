"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import { formatIbanInput, isValidIban } from "@/lib/iban";
import WizardStepLayout from "./WizardStepLayout";
import { FormField } from "./FormField";

export default function StepBank() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();
  const [touched, setTouched] = useState(false);
  const [sendet, setSendet] = useState(false);
  const [fehler, setFehler] = useState(false);

  const ibanValid = isValidIban(data.iban);
  const valid =
    ibanValid &&
    data.bankname.trim() !== "" &&
    data.kontoinhaber.trim() !== "";

  async function handleSubmit() {
    setTouched(true);
    if (!valid || sendet) return;

    setSendet(true);
    setFehler(false);

    // Nur die Angaben des Antrags, nicht der ganze Zustand: step, maxStep und
    // devModus gehoeren zur Bedienung der Strecke und haben im Fall nichts
    // verloren.
    const antwort = await fetch("/api/antraege", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kreditart: data.kreditart,
        amount: data.amount,
        months: data.months,
        personCount: data.personCount,
        vorname: data.vorname,
        zweiterVorname: data.zweiterVorname,
        nachname: data.nachname,
        geburtsdatum: data.geburtsdatum,
        email: data.email,
        telefonVorwahl: data.telefonVorwahl,
        telefon: data.telefon,
        strasse: data.strasse,
        hausnummer: data.hausnummer,
        plz: data.plz,
        ort: data.ort,
        beschaeftigungsart: data.beschaeftigungsart,
        arbeitgeber: data.arbeitgeber,
        beschaeftigtSeit: data.beschaeftigtSeit,
        nettoeinkommen: data.nettoeinkommen,
        mieteinnahmen: data.mieteinnahmen,
        mieteinnahmenBetrag: data.mieteinnahmenBetrag,
        wohnnebenkosten: data.wohnnebenkosten,
        krankenversicherung: data.krankenversicherung,
        unterhalt: data.unterhalt,
        hatKredite: data.hatKredite,
        kredite: data.kredite,
        iban: data.iban,
        bankname: data.bankname,
        kontoinhaber: data.kontoinhaber,
      }),
    }).catch(() => null);

    const angekommen = await antwort
      ?.json()
      .then((d: { ok?: boolean }) => d?.ok === true)
      .catch(() => false);

    if (!angekommen) {
      // Kein Weiterblaettern: Die Bestaetigung waere sonst eine Zusage, die
      // niemand einloesen kann — der Antrag liegt dann nirgends.
      setSendet(false);
      setFehler(true);
      return;
    }

    update({ submitted: true });
    goNext();
  }

  return (
    <WizardStepLayout
      eyebrow={wt.step8.eyebrow}
      title={wt.step8.title}
      highlight={wt.step8.highlight}
      subtitle={wt.step8.subtitle}
      trust={wt.step8.trust}
      onBack={goBack}
      onNext={handleSubmit}
      nextLabel={sendet ? wt.step8.sendet : wt.nav.submit}
      nextDisabled={sendet}
    >
      <FormField
        id="iban"
        label={wt.step8.iban}
        placeholder="DE89 3704 0044 0532 0130 00"
        value={data.iban}
        onChange={(e) => update({ iban: formatIbanInput(e.target.value) })}
        onBlur={() => setTouched(true)}
        error={touched && data.iban.trim() !== "" && !ibanValid ? wt.step8.ibanError : undefined}
      />
      <FormField
        id="bankname"
        label={wt.step8.bankname}
        value={data.bankname}
        onChange={(e) => update({ bankname: e.target.value })}
      />
      <FormField
        id="kontoinhaber"
        label={wt.step8.kontoinhaber}
        value={data.kontoinhaber}
        onChange={(e) => update({ kontoinhaber: e.target.value })}
      />
      {fehler && (
        <p className="text-sm text-red-400 leading-relaxed">
          {wt.step8.sendeFehler}
        </p>
      )}
    </WizardStepLayout>
  );
}
