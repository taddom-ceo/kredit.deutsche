"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard, KEINE_KREDITE } from "@/lib/wizard-context";
import { berechneRestschuld } from "@/lib/restschuld";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";
import { BetragFeld } from "./BetragFeld";

// Ein Kredit, der laenger als 40 Jahre laeuft, kommt praktisch nicht vor;
// Immobilienfinanzierungen bilden die Obergrenze. Nach vorne ist der laufende
// Monat die Grenze — ausgezahlt werden kann nichts, was noch nicht war.
const MAX_JAHRE_ZURUECK = 40;

function baueMonat(jahr: string, monat: string) {
  if (!jahr || !monat) return "";
  return `${jahr}-${monat.padStart(2, "0")}`;
}

/**
 * Ein aufklappender Bereich. Die Zeilenhoehe waechst von 0fr auf 1fr und
 * damit genau auf die Inhaltshoehe, ohne dass sie vorher gemessen werden
 * muesste — anders als bei max-height, das immer geraten waere.
 */
function Ausklapp({
  offen,
  children,
}: {
  offen: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`ausklapp grid ${offen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      // inert statt nur aria-hidden: Der zugeklappte Bereich ist zwar
      // abgeschnitten und nicht zu sehen, seine Felder behalten aber einen
      // Kasten im Layout und blieben damit mit der Tabulatortaste erreichbar.
      // Gemessen sprang der Fokus so in unsichtbare Eingaben. inert nimmt den
      // ganzen Teilbaum aus Fokusfolge und Vorlesehilfe zugleich — aria-hidden
      // allein haette die schlechteste Kombination ergeben: erreichbar, aber
      // nicht angesagt.
      inert={!offen}
    >
      <div className="overflow-hidden">
        <div
          className={`flex flex-col gap-5 pt-5 ${
            offen ? "opacity-100" : "opacity-0 -translate-y-2"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Auswahlknopf im Stil der uebrigen Kacheln des Antrags. */
function Wahl({
  aktiv,
  onClick,
  children,
}: {
  aktiv: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className={`rounded-[14px] border bg-surface-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
        aktiv ? "border-accent ring-1 ring-accent/40" : "border-border"
      }`}
    >
      {children}
    </button>
  );
}

export default function StepEinkommen() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack } = useWizard();

  const jetzt = useMemo(() => new Date(), []);
  const diesesJahr = jetzt.getFullYear();
  const dieserMonat = jetzt.getMonth() + 1;

  const jahre = useMemo(
    () => Array.from({ length: MAX_JAHRE_ZURUECK + 1 }, (_, i) => diesesJahr - i),
    [diesesJahr]
  );

  const monate = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(lang, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => ({
      value: String(i + 1),
      label: fmt.format(new Date(Date.UTC(2000, i, 1))),
    }));
  }, [lang]);

  // Im laufenden Jahr enden die waehlbaren Monate beim aktuellen.
  const monatsGrenze =
    Number(data.kreditAuszahlungJahr) === diesesJahr ? dieserMonat : 12;

  function setzeAuszahlung(patch: { monat?: string; jahr?: string }) {
    const monat = patch.monat ?? data.kreditAuszahlungMonat;
    const jahr = patch.jahr ?? data.kreditAuszahlungJahr;
    // Beim Wechsel ins laufende Jahr kann ein bereits gewaehlter spaeterer
    // Monat in der Zukunft liegen. Er wird geleert statt still verschoben.
    const grenze = Number(jahr) === diesesJahr ? dieserMonat : 12;
    const gueltigerMonat = monat && Number(monat) > grenze ? "" : monat;
    update({
      kreditAuszahlungMonat: gueltigerMonat,
      kreditAuszahlungJahr: jahr,
      kreditAuszahlung: baueMonat(jahr, gueltigerMonat),
    });
  }

  /**
   * "Keine" und die einzelnen Kreditarten schliessen einander aus: Wer eine
   * Art waehlt, hat Kredite, und wer "Keine" waehlt, hat keine. Ohne diese
   * Regel liesse sich beides zugleich anwaehlen und der Folgebereich stuende
   * offen, obwohl der Kunde gerade "Keine" gesagt hat.
   */
  function wechsleKreditart(wert: string) {
    if (wert === KEINE_KREDITE) {
      update({
        kreditarten: data.kreditarten.includes(KEINE_KREDITE)
          ? []
          : [KEINE_KREDITE],
      });
      return;
    }
    const ohneKeine = data.kreditarten.filter((k) => k !== KEINE_KREDITE);
    update({
      kreditarten: ohneKeine.includes(wert)
        ? ohneKeine.filter((k) => k !== wert)
        : [...ohneKeine, wert],
    });
  }

  const hatMiete = data.mieteinnahmen === "ja";
  const hatKredite =
    data.kreditarten.length > 0 && !data.kreditarten.includes(KEINE_KREDITE);

  const restschuld = useMemo(() => {
    if (!hatKredite) return null;
    return berechneRestschuld({
      summe: Number(data.kreditSumme),
      auszahlung: data.kreditAuszahlung,
      rate: Number(data.kreditRate),
      zins: data.kreditZins.trim() === "" ? undefined : Number(data.kreditZins),
      laufzeit:
        data.kreditLaufzeit.trim() === ""
          ? undefined
          : Number(data.kreditLaufzeit),
      stichtag: jetzt,
    });
  }, [
    hatKredite,
    data.kreditSumme,
    data.kreditAuszahlung,
    data.kreditRate,
    data.kreditZins,
    data.kreditLaufzeit,
    jetzt,
  ]);

  // Die Schaetzung ist ein Vorschlag. Traegt der Kunde einen eigenen Wert ein,
  // gilt seiner — er kennt seinen Kontostand besser als jede Formel. Ein
  // geleertes Feld faellt auf die Schaetzung zurueck.
  const eigeneRestschuld = data.kreditRestschuld !== "";
  const restschuldWert = eigeneRestschuld
    ? data.kreditRestschuld
    : restschuld
      ? String(Math.round(restschuld.wert))
      : "";

  const valid =
    data.nettoeinkommen.trim() !== "" &&
    Number(data.nettoeinkommen) > 0 &&
    // Beide Fragen sind Pflicht — unbeantwortet geht es nicht weiter.
    data.mieteinnahmen !== null &&
    data.kreditarten.length > 0 &&
    (!hatMiete || Number(data.mieteinnahmenBetrag) > 0) &&
    (!hatKredite ||
      (Number(data.kreditSumme) > 0 &&
        data.kreditAuszahlung !== "" &&
        Number(data.kreditRate) > 0));

  return (
    <WizardStepLayout
      eyebrow={wt.step7.eyebrow}
      title={wt.step7.title}
      highlight={wt.step7.highlight}
      subtitle={wt.step7.subtitle}
      trust={wt.step7.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <BetragFeld
        id="nettoeinkommen"
        placeholder="2.800"
        label={`${wt.step7.nettoeinkommen} (€)`}
        wert={data.nettoeinkommen}
        onWert={(z) => update({ nettoeinkommen: z })}
      />
      <BetragFeld
        id="ausgaben"
        placeholder="900"
        label={`${wt.step7.ausgaben} (€)`}
        wert={data.ausgaben}
        onWert={(z) => update({ ausgaben: z })}
      />
      <p className="text-xs text-muted -mt-3">{wt.step7.ausgabenHint}</p>

      {/* Mieteinnahmen */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-muted">
          {wt.step7.mieteinnahmenFrage}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <Wahl
            aktiv={data.mieteinnahmen === "ja"}
            onClick={() => update({ mieteinnahmen: "ja" })}
          >
            {wt.step7.ja}
          </Wahl>
          <Wahl
            aktiv={data.mieteinnahmen === "nein"}
            // Ein spaeteres "nein" raeumt den Betrag mit weg. Sonst ginge eine
            // Zahl mit, die der Kunde sichtbar zurueckgenommen hat.
            onClick={() => update({ mieteinnahmen: "nein", mieteinnahmenBetrag: "" })}
          >
            {wt.step7.nein}
          </Wahl>
        </div>
        <Ausklapp offen={hatMiete}>
          <BetragFeld
            id="mieteinnahmenBetrag"
            placeholder="650"
            label={`${wt.step7.mieteinnahmenBetrag} (€)`}
            wert={data.mieteinnahmenBetrag}
            onWert={(z) => update({ mieteinnahmenBetrag: z })}
          />
        </Ausklapp>
      </fieldset>

      {/* Laufende Kredite */}
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-muted">
          {wt.step7.kreditFrage}
        </legend>
        <p className="text-xs text-muted -mt-1">{wt.step7.kreditHint}</p>
        <div className="flex flex-wrap gap-2">
          {wt.step7.kreditarten.map(({ wert, label }) => (
            <Wahl
              key={wert}
              aktiv={data.kreditarten.includes(wert)}
              onClick={() => wechsleKreditart(wert)}
            >
              {label}
            </Wahl>
          ))}
          <Wahl
            aktiv={data.kreditarten.includes(KEINE_KREDITE)}
            onClick={() => wechsleKreditart(KEINE_KREDITE)}
          >
            {wt.step7.keineKredite}
          </Wahl>
        </div>

        <Ausklapp offen={hatKredite}>
          <p className="text-sm font-semibold">{wt.step7.kreditAngabenTitel}</p>

          <BetragFeld
            id="kreditSumme"
            placeholder="15.000"
            label={`${wt.step7.kreditSumme} (€)`}
            wert={data.kreditSumme}
            onWert={(z) => update({ kreditSumme: z })}
          />

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted">
              {wt.step7.kreditAuszahlung}
            </span>
            {/* Dieselbe Form wie beim Beschaeftigungsbeginn: nach oben
                begrenzt, damit das Monatsfeld auf breiten Karten nicht
                auseinandergezogen wird, und schrumpffaehig fuers Handy. */}
            <div className="grid grid-cols-[minmax(0,12rem)_5.75rem] gap-3">
              <FormSelect
                id="kreditAuszahlungMonat"
                label={wt.step7.monat}
                value={data.kreditAuszahlungMonat}
                onChange={(e) => setzeAuszahlung({ monat: e.target.value })}
              >
                <option value="">{wt.step7.auswahlPlatzhalter}</option>
                {monate.slice(0, monatsGrenze).map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </FormSelect>
              <FormSelect
                id="kreditAuszahlungJahr"
                label={wt.step7.jahr}
                value={data.kreditAuszahlungJahr}
                onChange={(e) => setzeAuszahlung({ jahr: e.target.value })}
              >
                <option value="">{wt.step7.auswahlPlatzhalter}</option>
                {jahre.map((jahr) => (
                  <option key={jahr} value={jahr}>
                    {jahr}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <BetragFeld
            id="kreditRate"
            placeholder="250"
            label={`${wt.step7.kreditRate} (€)`}
            wert={data.kreditRate}
            onWert={(z) => update({ kreditRate: z })}
          />

          {/* Die Gesamtlaufzeit ist mehr als eine Angabe fuers Protokoll:
              Zusammen mit Summe und Rate legt sie den Zinssatz eindeutig fest.
              Wer ihn nicht kennt, bekommt die Restschuld damit trotzdem genau. */}
          <FormField
            id="kreditLaufzeit"
            type="number"
            min={1}
            max={480}
            step={1}
            inputMode="numeric"
            placeholder="60"
            label={`${wt.step7.kreditLaufzeit} (${wt.step7.kreditLaufzeitEinheit})`}
            value={data.kreditLaufzeit}
            onChange={(e) => update({ kreditLaufzeit: e.target.value })}
          />

          <FormField
            id="kreditZins"
            type="number"
            min={0}
            max={30}
            step={0.01}
            inputMode="decimal"
            placeholder="z. B. 5,49"
            label={`${wt.step7.kreditZins} (%) — ${wt.step7.optional}`}
            value={data.kreditZins}
            onChange={(e) => update({ kreditZins: e.target.value })}
          />

          {/* Ergebnisfeld — vorbelegt mit der Schaetzung, aber aenderbar. */}
          <div className="flex flex-col gap-2">
            <BetragFeld
              id="kreditRestschuld"
              label={`${wt.step7.restschuld} (€)`}
              wert={restschuldWert}
              onWert={(z) => update({ kreditRestschuld: z })}
            />
            <p className="text-xs text-muted" aria-live="polite">
              {eigeneRestschuld
                ? wt.step7.restschuldSelbst
                : !restschuld
                  ? wt.step7.restschuldOffen
                  : restschuld.abbezahlt
                    ? wt.step7.restschuldAbbezahlt
                    : restschuld.zinsHergeleitet
                      ? wt.step7.restschuldHergeleitet
                      : restschuld.ohneZins
                        ? wt.step7.restschuldOhneZins
                        : wt.step7.restschuldMitZins}
            </p>
            {eigeneRestschuld && (
              <button
                type="button"
                onClick={() => update({ kreditRestschuld: "" })}
                className="w-fit text-xs font-medium text-accent underline underline-offset-2 transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                {wt.step7.restschuldNeuBerechnen}
              </button>
            )}
          </div>

        </Ausklapp>
      </fieldset>
    </WizardStepLayout>
  );
}
