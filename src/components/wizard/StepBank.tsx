"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import { formatIbanInput, isValidIban } from "@/lib/iban";
import { bankZuBlz, blzAusIban, blzBundUrl } from "@/lib/blz-suche";
import WizardStepLayout from "./WizardStepLayout";
import { FormField } from "./FormField";

/**
 * Einmal geladene Bündel bleiben liegen — beim Tippen ändert sich die
 * Bankleitzahl mit jedem Zeichen, das Bündel meist nicht.
 *
 * Gemerkt wird das Versprechen und nicht erst sein Ergebnis: Wer eine IBAN in
 * einem Zug eintippt, löst sonst zehn Anfragen auf dieselbe Datei aus, weil
 * keine davon fertig ist, wenn die nächste startet.
 */
const buendel = new Map<string, Promise<Record<string, string>>>();

function ladeBund(url: string): Promise<Record<string, string>> {
  const gemerkt = buendel.get(url);
  if (gemerkt) return gemerkt;
  const unterwegs = fetch(url)
    .then((antwort) => (antwort.ok ? antwort.json() : {}))
    // Ohne Verzeichnis gibt es eben keinen Vorschlag. Kein Fehler, den jemand
    // sehen müsste — der Name der Bank lässt sich eintippen.
    .catch(() => ({}));
  buendel.set(url, unterwegs);
  return unterwegs;
}

export default function StepBank() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext, goBack, sendeFertigenAntrag } = useWizard();
  const [touched, setTouched] = useState(false);
  const [sendet, setSendet] = useState(false);
  const [fehler, setFehler] = useState(false);
  /** Der Name, den die Bankleitzahl gerade hergibt. */
  const [erkannt, setErkannt] = useState<string | null>(null);

  const ibanLeer = data.iban.trim() === "";
  const ibanValid = isValidIban(data.iban);

  /**
   * Die IBAN ist keine Pflicht mehr.
   *
   * Sie wird für die Auszahlung gebraucht, aber nicht, um den Antrag
   * aufzunehmen — und wer sie am Telefon oder unterwegs nicht zur Hand hat,
   * brach bisher an dieser Stelle ab. Steht eine da, muss sie stimmen: Eine
   * falsche IBAN ist schlimmer als keine, weil sie so aussieht, als wäre die
   * Sache erledigt.
   */
  const valid =
    (ibanLeer || ibanValid) &&
    data.bankname.trim() !== "" &&
    data.kontoinhaber.trim() !== "";

  /**
   * Der Stand des Bankfeldes, mitgeführt statt beim Rendern abgelesen.
   *
   * Gebraucht wird er erst, wenn das Verzeichnis da ist — bis dahin kann
   * jemand weitergetippt haben, und der Wert aus dem Durchlauf, in dem die
   * Taste fiel, wäre dann veraltet. Geschrieben wird er an beiden Stellen,
   * an denen sich das Feld ändern kann: hier unten von Hand, oben aus der
   * IBAN.
   */
  const bankname = useRef(data.bankname);
  /** Was zuletzt selbst eingetragen wurde. Nur das darf überschrieben
      werden — ein von Hand getippter Name bleibt stehen. */
  const eingetragen = useRef<string | null>(null);
  /** Die Bankleitzahl, auf die gerade gewartet wird. */
  const laufend = useRef<string | null>(null);

  /**
   * Aus der IBAN den Namen der Bank.
   *
   * Im Eingabehändler und nicht in einem Effekt: Nachzuschlagen ist die
   * Folge einer Eingabe, nicht ein Zustand, der mit etwas außerhalb abgeglichen
   * werden müsste.
   */
  async function ibanGetippt(rohwert: string) {
    const wert = formatIbanInput(rohwert);
    update({ iban: wert });

    const blz = blzAusIban(wert);
    laufend.current = blz;
    if (!blz) {
      setErkannt(null);
      return;
    }

    const bund = await ladeBund(blzBundUrl(blz));
    // Inzwischen weitergetippt? Dann gilt die spätere Antwort.
    if (laufend.current !== blz) return;

    const name = bankZuBlz(bund, blz);
    setErkannt(name);
    if (!name) return;

    const jetzt = bankname.current.trim();
    if (jetzt === "" || jetzt === eingetragen.current) {
      eingetragen.current = name;
      bankname.current = name;
      update({ bankname: name });
    }
  }

  function banknameGetippt(wert: string) {
    bankname.current = wert;
    update({ bankname: wert });
  }

  async function handleSubmit() {
    setTouched(true);
    if (!valid || sendet) return;

    setSendet(true);
    setFehler(false);

    // Der Zusammenbau des Antrags und das Senden liegen im Zustand der
    // Strecke: Von dort ging schon der Zwischenstand hinaus, und beide
    // muessen dieselbe Kennung benutzen, damit im CRM ein Fall steht und
    // nicht zwei.
    const angekommen = await sendeFertigenAntrag();

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
        onChange={(e) => ibanGetippt(e.target.value)}
        onBlur={() => setTouched(true)}
        error={touched && !ibanLeer && !ibanValid ? wt.step8.ibanError : undefined}
      />

      {/* Der Hinweis steht nur da, solange das Feld leer ist — genau dann ist
          er die Antwort auf die Frage "muss ich das jetzt?". Ist die IBAN
          eingetragen, wäre er eine Warnung ohne Anlass.

          Bernstein und nicht Rot: Hier ist nichts falsch. Es fehlt etwas, das
          später gebraucht wird, und das ist ein Unterschied. */}
      {ibanLeer && (
        <div className="flex gap-3 rounded-[16px] border border-amber-400/30 bg-amber-400/[0.07] px-4 py-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-amber-300"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.5v.5" />
          </svg>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-amber-100">
              {wt.step8.ibanSpaeterTitel}
            </span>
            <p className="text-xs leading-relaxed text-muted">
              {wt.step8.ibanSpaeterText}
            </p>
          </div>
        </div>
      )}

      <FormField
        id="bankname"
        label={wt.step8.bankname}
        value={data.bankname}
        onChange={(e) => banknameGetippt(e.target.value)}
      />
      {/* Nur solange der eingetragene Name auch der erkannte ist. Wer ihn
          überschreibt, bekommt keine Auskunft mehr über eine Bank, die dort
          nicht mehr steht. */}
      {erkannt !== null && data.bankname.trim() === erkannt && (
        <p className="-mt-1 text-xs text-muted">{wt.step8.bankErkannt}</p>
      )}

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
