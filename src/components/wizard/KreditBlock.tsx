"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import type { BestehenderKredit } from "@/lib/wizard-context";
import { berechneRestschuld, ZINS_OBERGRENZE } from "@/lib/restschuld";
import { dezimalZuZahl, gruppiere, nurDezimal } from "@/lib/betrag";
import { BetragFeld } from "./BetragFeld";
import { FormField, FormSelect } from "./FormField";

/** Weiter zurück als 40 Jahre reicht praktisch kein laufender Kredit. */
const MAX_JAHRE_ZURUECK = 40;

function baueMonat(jahr: string, monat: string) {
  if (!jahr || !monat) return "";
  return `${jahr}-${monat.padStart(2, "0")}`;
}

export function KreditBlock({
  kredit,
  nummer,
  mehrere,
  onAendern,
  onEntfernen,
}: {
  kredit: BestehenderKredit;
  nummer: number;
  /** Nur bei mehreren Krediten bekommt jeder eine Nummer als Überschrift. */
  mehrere: boolean;
  onAendern: (patch: Partial<BestehenderKredit>) => void;
  onEntfernen: () => void;
}) {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const t = wt.step7;

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

  const monatsGrenze =
    Number(kredit.auszahlungJahr) === diesesJahr ? dieserMonat : 12;

  function setzeAuszahlung(patch: { monat?: string; jahr?: string }) {
    const monat = patch.monat ?? kredit.auszahlungMonat;
    const jahr = patch.jahr ?? kredit.auszahlungJahr;
    // Beim Wechsel ins laufende Jahr kann ein bereits gewählter späterer Monat
    // in der Zukunft liegen. Er wird geleert statt still verschoben.
    const grenze = Number(jahr) === diesesJahr ? dieserMonat : 12;
    const gueltig = monat && Number(monat) > grenze ? "" : monat;
    onAendern({
      auszahlungMonat: gueltig,
      auszahlungJahr: jahr,
      auszahlung: baueMonat(jahr, gueltig),
    });
  }

  const schaetzung = useMemo(() => {
    const zins = dezimalZuZahl(kredit.zins);
    return berechneRestschuld({
      summe: Number(kredit.betrag),
      auszahlung: kredit.auszahlung,
      rate: Number(kredit.rate),
      zins: Number.isNaN(zins) ? undefined : zins,
      laufzeit: kredit.laufzeit === "" ? undefined : Number(kredit.laufzeit),
      stichtag: jetzt,
    });
  }, [
    kredit.betrag,
    kredit.auszahlung,
    kredit.rate,
    kredit.zins,
    kredit.laufzeit,
    jetzt,
  ]);

  const zahl = useMemo(() => new Intl.NumberFormat(lang), [lang]);

  // Die selteneren Arten stehen erst zur Wahl, wenn "Andere" sie freigegeben
  // hat. Eine bereits gewaehlte gehoert dazu — sonst verschwaende der Wert
  // beim Zurueckspringen aus einem spaeteren Schritt aus der Reihe.
  const arten = useMemo(() => {
    const zeigeWeitere =
      kredit.weitereArten || t.kreditartenWeitere.includes(kredit.art);
    return zeigeWeitere
      ? [...t.kreditarten, ...t.kreditartenWeitere]
      : t.kreditarten;
  }, [kredit.weitereArten, kredit.art, t.kreditarten, t.kreditartenWeitere]);

  // "72" allein sagt wenig — die Jahre daneben machen die Laufzeit greifbar.
  const laufzeitInJahren = useMemo(() => {
    const m = Number(kredit.laufzeit);
    if (!Number.isFinite(m) || m <= 0) return null;
    const jahre = m / 12;
    const gerundet = Math.round(jahre * 10) / 10;
    return `${zahl.format(gerundet)} ${t.jahre}`;
  }, [kredit.laufzeit, zahl, t.jahre]);

  return (
    <div className="flex flex-col gap-5">
      {mehrere && (
        <p className="text-sm font-semibold">
          {nummer}. {t.kreditNummer}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-muted">{t.kreditartTitel}</span>
        <div className="flex flex-wrap gap-2">
          {arten.map((art) => {
            const aktiv = kredit.art === art;
            return (
              <button
                key={art}
                type="button"
                aria-pressed={aktiv}
                onClick={() => onAendern({ art: aktiv ? "" : art })}
                className={`rounded-full border px-4 py-2 text-sm transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                  aktiv
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface-2 text-muted"
                }`}
              >
                {art}
              </button>
            );
          })}

          {/* "Andere" ist keine Kreditart, sondern der Weg zu den selteneren.
              Angetippt macht es ihnen Platz und verschwindet dabei selbst — es
              hat dann seinen Zweck erfuellt, und als Auswahl stehenzubleiben
              waere neben der genaueren Angabe nur verwirrend. */}
          {!kredit.weitereArten && t.kreditartenWeitere.length > 0 && (
            <button
              type="button"
              aria-expanded={false}
              onClick={() => onAendern({ weitereArten: true })}
              className="rounded-full border border-border bg-surface-2 px-4 py-2 text-sm text-muted transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {t.kreditartAndere}
            </button>
          )}
        </div>
      </div>

      <BetragFeld
        id={`betrag-${kredit.id}`}
        label={`${t.kreditBetrag} (€)`}
        placeholder="10.000"
        wert={kredit.betrag}
        onWert={(z) => onAendern({ betrag: z })}
      />

      <BetragFeld
        id={`rate-${kredit.id}`}
        label={`${t.kreditRate} (€)`}
        placeholder="300"
        wert={kredit.rate}
        onWert={(z) => onAendern({ rate: z })}
      />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {t.kreditAuszahlung}
        </span>
        <div className="grid grid-cols-[minmax(0,12rem)_5.75rem] gap-3">
          <FormSelect
            id={`auszMonat-${kredit.id}`}
            label={t.monat}
            value={kredit.auszahlungMonat}
            onChange={(e) => setzeAuszahlung({ monat: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {monate.slice(0, monatsGrenze).map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            id={`auszJahr-${kredit.id}`}
            label={t.jahr}
            value={kredit.auszahlungJahr}
            onChange={(e) => setzeAuszahlung({ jahr: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {jahre.map((jahr) => (
              <option key={jahr} value={jahr}>
                {jahr}
              </option>
            ))}
          </FormSelect>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <FormField
          id={`laufzeit-${kredit.id}`}
          type="number"
          min={1}
          max={480}
          step={1}
          inputMode="numeric"
          placeholder="72"
          label={`${t.kreditLaufzeit} (${t.monate})`}
          value={kredit.laufzeit}
          onChange={(e) => onAendern({ laufzeit: e.target.value })}
        />
        <p className="text-xs text-muted">
          {t.laufzeitHinweis}
          {laufzeitInJahren && ` · ${laufzeitInJahren}`}
        </p>
      </div>

      {/* Der Zinssatz ist unsere Zusatzangabe gegenüber der Vorlage: Wer ihn
          kennt, bekommt die Restschuld ohne Umweg über die Laufzeit — und
          genau, statt nur so genau wie die Herleitung. */}
      <div className="flex flex-col gap-1.5">
        <FormField
          id={`zins-${kredit.id}`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="5,49"
          label={`${t.kreditZins} (%) — ${t.optional}`}
          value={kredit.zins}
          onChange={(e) => onAendern({ zins: nurDezimal(e.target.value) })}
        />
        <p className="text-xs text-muted">{t.kreditZinsHinweis}</p>
      </div>

      <div className="flex flex-col gap-2">
        <BetragFeld
          id={`restschuld-${kredit.id}`}
          label={`${t.kreditRestschuld} (€)`}
          wert={kredit.restschuld}
          onWert={(z) => onAendern({ restschuld: z })}
        />

        {/* Die Schätzung wird angeboten, nicht eingesetzt. Der Kunde übernimmt
            sie mit einem Klick oder trägt seinen eigenen Wert ein — sie ist
            eine Hilfe, kein Ersatz für den Kontoauszug. */}
        {schaetzung.ok ? (
          <p className="text-xs text-muted">
            {t.schaetzung.replace(
              "{zins}",
              new Intl.NumberFormat(lang, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              }).format(schaetzung.zinsProzent)
            )}{" "}
            <span className="font-semibold text-foreground">
              {gruppiere(String(Math.round(schaetzung.wert)), lang)} €
            </span>{" "}
            <button
              type="button"
              onClick={() =>
                onAendern({ restschuld: String(Math.round(schaetzung.wert)) })
              }
              className="font-medium text-accent underline underline-offset-2 transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {t.uebernehmen}
            </button>
          </p>
        ) : (
          // Zwei verschiedene Gruende, zwei verschiedene Saetze: Sonst steht
          // "es fehlen noch Angaben" auch dann da, wenn alles ausgefuellt ist
          // und nur die Zahlen nicht zusammenpassen.
          <p className="text-xs text-muted">
            {schaetzung.grund === "passtNichtZusammen"
              ? t.schaetzungPasstNicht
              : t.schaetzungFehlt}
          </p>
        )}

        {schaetzung.ok && schaetzung.abbezahlt && (
          <p className="text-xs text-muted">{t.abbezahlt}</p>
        )}

        {schaetzung.ok && schaetzung.gekappt && (
          <div className="flex items-start gap-2.5 rounded-[14px] border border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 text-xs leading-relaxed text-amber-200/90">
            <span aria-hidden="true" className="mt-px shrink-0 text-amber-300">
              ⚠
            </span>
            <span>
              {t.zinsWarnung.replaceAll(
                "{grenze}",
                new Intl.NumberFormat(lang, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }).format(ZINS_OBERGRENZE)
              )}
            </span>
          </div>
        )}
      </div>

      <FormField
        id={`bank-${kredit.id}`}
        label={`${t.bank} (${t.optional})`}
        value={kredit.bank}
        onChange={(e) => onAendern({ bank: e.target.value })}
      />

      <FormField
        id={`iban-${kredit.id}`}
        label={`${t.iban} (${t.optional})`}
        value={kredit.iban}
        autoComplete="off"
        onChange={(e) =>
          onAendern({ iban: e.target.value.toUpperCase().slice(0, 34) })
        }
      />

      <button
        type="button"
        onClick={onEntfernen}
        className="flex w-fit items-center gap-2 text-xs font-medium text-red-400 transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span
          aria-hidden="true"
          className="grid size-4 place-items-center rounded-[4px] bg-red-400/20 text-[13px] leading-none"
        >
          −
        </span>
        {t.kreditEntfernen}
      </button>
    </div>
  );
}
