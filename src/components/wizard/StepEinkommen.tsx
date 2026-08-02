"use client";

import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard, leererKredit } from "@/lib/wizard-context";
import type { BestehenderKredit } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { BetragFeld } from "./BetragFeld";
import { JaNeinWahl } from "./JaNeinWahl";
import { KreditBlock } from "./KreditBlock";

/**
 * Ein aufklappender Bereich. Die Zeilenhöhe wächst von 0fr auf 1fr und damit
 * genau auf die Inhaltshöhe, ohne dass sie vorher gemessen werden müsste —
 * anders als bei max-height, das immer geraten wäre.
 *
 * inert statt nur aria-hidden: Der zugeklappte Bereich ist zwar abgeschnitten
 * und nicht zu sehen, seine Felder behalten aber einen Kasten im Layout und
 * blieben damit mit der Tabulatortaste erreichbar. inert nimmt den Teilbaum
 * aus Fokusfolge und Vorlesehilfe zugleich.
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

/** Überschrift eines Abschnitts mit erklärendem Text darunter. */
function Abschnitt({
  titel,
  text,
  children,
}: {
  titel: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{titel}</h2>
        {text && <p className="text-xs leading-relaxed text-muted">{text}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StepEinkommen() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const t = wt.step7;
  const { data, update, goNext, goBack } = useWizard();

  const hatMiete = data.mieteinnahmen === "ja";
  const hatKredite = data.hatKredite === "ja";

  function aendereKredit(id: string, patch: Partial<BestehenderKredit>) {
    update({
      kredite: data.kredite.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    });
  }

  function entferneKredit(id: string) {
    const rest = data.kredite.filter((k) => k.id !== id);
    // Den letzten Kredit zu entfernen heißt: doch keine Kredite. Bliebe die
    // Frage auf "ja" stehen, stünde ein leerer Abschnitt da, der sich nicht
    // mehr ausfüllen ließe.
    update(
      rest.length === 0 ? { kredite: [], hatKredite: "nein" } : { kredite: rest }
    );
  }

  function setzeKreditfrage(wert: "ja" | "nein") {
    if (wert === "nein") {
      update({ hatKredite: "nein", kredite: [] });
      return;
    }
    update({
      hatKredite: "ja",
      // Beim ersten "ja" steht sofort ein leerer Satz Felder bereit, statt
      // erst noch ein Hinzufügen zu verlangen.
      kredite: data.kredite.length > 0 ? data.kredite : [leererKredit()],
    });
  }

  const kreditVollstaendig = (k: BestehenderKredit) =>
    k.art !== "" &&
    Number(k.betrag) > 0 &&
    Number(k.rate) > 0 &&
    k.auszahlung !== "" &&
    Number(k.restschuld) > 0;

  const valid =
    Number(data.nettoeinkommen) > 0 &&
    data.mieteinnahmen !== null &&
    (!hatMiete || Number(data.mieteinnahmenBetrag) > 0) &&
    data.hatKredite !== null &&
    (!hatKredite ||
      (data.kredite.length > 0 && data.kredite.every(kreditVollstaendig)));

  return (
    <WizardStepLayout
      eyebrow={t.eyebrow}
      title={t.title}
      highlight={t.highlight}
      subtitle={t.subtitle}
      trust={t.trust}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!valid}
    >
      <Abschnitt titel={t.einnahmenTitel} text={t.einnahmenText}>
        <BetragFeld
          id="nettoeinkommen"
          label={`${t.nettoeinkommen} (€)`}
          placeholder="2.800"
          wert={data.nettoeinkommen}
          onWert={(z) => update({ nettoeinkommen: z })}
        />

        <div className="flex flex-col gap-2">
          <span id="frage-miete" className="text-sm font-medium text-muted">
            {t.mieteinnahmenFrage}
          </span>
          <JaNeinWahl
            name="mieteinnahmen"
            beschriftetVon="frage-miete"
            wert={data.mieteinnahmen}
            jaLabel={t.ja}
            neinLabel={t.nein}
            // Ein späteres "nein" räumt den Betrag mit weg. Sonst ginge eine
            // Zahl mit, die der Kunde sichtbar zurückgenommen hat.
            onWert={(w) =>
              update(
                w === "ja"
                  ? { mieteinnahmen: "ja" }
                  : { mieteinnahmen: "nein", mieteinnahmenBetrag: "" }
              )
            }
          />
          <Ausklapp offen={hatMiete}>
            <BetragFeld
              id="mieteinnahmenBetrag"
              label={`${t.mieteinnahmenBetrag} (€)`}
              placeholder="650"
              wert={data.mieteinnahmenBetrag}
              onWert={(z) => update({ mieteinnahmenBetrag: z })}
            />
          </Ausklapp>
        </div>
      </Abschnitt>

      <Abschnitt titel={t.ausgabenTitel} text={t.ausgabenText}>
        <div className="flex flex-col gap-1.5">
          <BetragFeld
            id="wohnnebenkosten"
            label={`${t.wohnnebenkosten} (€)`}
            placeholder="180"
            wert={data.wohnnebenkosten}
            onWert={(z) => update({ wohnnebenkosten: z })}
          />
          <p className="text-xs text-muted">{t.wohnnebenkostenHinweis}</p>
        </div>

        <p className="text-sm font-medium text-muted">
          {t.weitereAusgabenFrage}
        </p>
        <BetragFeld
          id="krankenversicherung"
          label={`${t.krankenversicherung} (€) — ${t.optional}`}
          wert={data.krankenversicherung}
          onWert={(z) => update({ krankenversicherung: z })}
        />
        <BetragFeld
          id="unterhalt"
          label={`${t.unterhalt} (€) — ${t.optional}`}
          wert={data.unterhalt}
          onWert={(z) => update({ unterhalt: z })}
        />
      </Abschnitt>

      <Abschnitt titel={t.krediteTitel}>
        <div className="flex flex-col gap-2">
          <span id="frage-kredite" className="text-sm font-medium text-muted">
            {t.kreditFrage}
          </span>
          <JaNeinWahl
            name="hatKredite"
            beschriftetVon="frage-kredite"
            wert={data.hatKredite}
            jaLabel={t.ja}
            neinLabel={t.nein}
            onWert={setzeKreditfrage}
          />
        </div>

        <Ausklapp offen={hatKredite}>
          {data.kredite.map((kredit, i) => (
            <div key={kredit.id} className={i > 0 ? "border-t border-border pt-6" : undefined}>
              <KreditBlock
                kredit={kredit}
                nummer={i + 1}
                mehrere={data.kredite.length > 1}
                onAendern={(patch) => aendereKredit(kredit.id, patch)}
                onEntfernen={() => entferneKredit(kredit.id)}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => update({ kredite: [...data.kredite, leererKredit()] })}
            className="flex w-fit items-center gap-2 text-xs font-medium text-accent transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span
              aria-hidden="true"
              className="grid size-4 place-items-center rounded-[4px] bg-accent/20 text-[13px] leading-none"
            >
              +
            </span>
            {t.kreditHinzufuegen}
          </button>
        </Ausklapp>
      </Abschnitt>
    </WizardStepLayout>
  );
}
