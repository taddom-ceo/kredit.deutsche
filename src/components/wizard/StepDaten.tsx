"use client";

import { useMemo } from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations, type WizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";
import { FormField, FormSelect } from "./FormField";
import { JaNeinWahl } from "./JaNeinWahl";
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

/**
 * Ob ein Geburtsdatum taugt — und wenn nicht, warum.
 *
 * Steht ausserhalb der Komponente, weil es zweimal gebraucht wird: einmal fuer
 * den ersten Kreditnehmer und einmal fuer den zweiten. Dieselbe Pruefung
 * zweimal zu schreiben hiesse, sie beim naechsten Mal einmal zu aendern.
 */
function pruefeGeburt(
  iso: string,
  texte: { zuJung: string; unstimmig: string }
): { ok: boolean; error?: string } {
  if (iso.trim() === "") return { ok: false };
  // Bewusst aus den Bestandteilen als lokales Datum gebaut. new Date("…")
  // liest die Zeichenkette als UTC, das Alter unten aber lokal — in
  // westlichen Zeitzonen verschöbe das die 18-Jahres-Grenze um einen Tag.
  const [y, m, d] = iso.trim().split("-").map(Number);
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
    return { ok: false, error: texte.unstimmig };
  }
  const age = ageAt(parsed, new Date());
  if (age < MIN_AGE) return { ok: false, error: texte.zuJung };
  if (age > MAX_AGE) return { ok: false, error: texte.unstimmig };
  return { ok: true };
}

/**
 * Name und Geburtsdatum einer Person — einmal geschrieben, zweimal benutzt.
 *
 * Bei zwei Kreditnehmern steht derselbe Satz Felder zweimal auf der Seite.
 * Sie ein zweites Mal hinzuschreiben hiesse, jede spaetere Aenderung an der
 * Namensregel, an der Tagesliste oder an der Beschriftung an zwei Stellen zu
 * machen — und die zweite beim uebernaechsten Mal zu vergessen.
 */
function PersonFelder({
  praefix,
  wt,
  werte,
  aendere,
  aendereGeburt,
  months,
  years,
  geburtsFehler,
}: {
  /** Vorsilbe der Feldkennungen, damit id und label eindeutig bleiben. */
  praefix: string;
  wt: WizardTranslations;
  werte: {
    vorname: string;
    zweiterVorname: string;
    nachname: string;
    geburtstag: string;
    geburtsmonat: string;
    geburtsjahr: string;
  };
  aendere: (patch: {
    vorname?: string;
    zweiterVorname?: string;
    nachname?: string;
  }) => void;
  aendereGeburt: (patch: {
    geburtstag?: string;
    geburtsmonat?: string;
    geburtsjahr?: string;
  }) => void;
  months: { value: string; label: string }[];
  years: number[];
  geburtsFehler?: string;
}) {
  const t = wt.step4;
  const vornameOk = NAME.test(werte.vorname.trim());
  const nachnameOk = NAME.test(werte.nachname.trim());
  const zweiterVornameOk =
    werte.zweiterVorname.trim() === "" || NAME.test(werte.zweiterVorname.trim());
  const fehler = (wert: string, ok: boolean) =>
    wert.trim() !== "" && !ok ? t.nameInvalid : undefined;
  const dayCount = maxDaysInMonth(Number(werte.geburtsmonat));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <FormField
          id={`${praefix}vorname`}
          label={t.vorname}
          value={werte.vorname}
          onChange={(e) => aendere({ vorname: e.target.value })}
          error={fehler(werte.vorname, vornameOk)}
        />
        <FormField
          id={`${praefix}zweiterVorname`}
          label={t.zweiterVorname}
          value={werte.zweiterVorname}
          onChange={(e) => aendere({ zweiterVorname: e.target.value })}
          placeholder={t.optionalHint}
          error={fehler(werte.zweiterVorname, zweiterVornameOk)}
        />
        <FormField
          id={`${praefix}nachname`}
          label={t.nachname}
          value={werte.nachname}
          onChange={(e) => aendere({ nachname: e.target.value })}
          error={fehler(werte.nachname, nachnameOk)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">{t.geburtsdatum}</span>
        {/* Anteile statt fester Breiten: Feste rem-Breiten wachsen mit der
            Schriftgröße, die Kartenbreite nicht — auf schmalen Bildschirmen
            ragte das Jahr dadurch über den Rand. Der Monat bekommt den
            größten Anteil, damit "September" vollständig lesbar bleibt.
            Auf dem Handy fallen Abstand und Innenabstand knapper aus, weil
            drei Felder dort sonst keinen Platz für ihren Text lassen. */}
        <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,10fr)_minmax(0,7fr)] gap-2 sm:gap-3">
          <FormSelect
            id={`${praefix}geburtstag`}
            selectClassName="px-2 sm:px-4"
            label={t.geburtstag}
            value={werte.geburtstag}
            onChange={(e) => aendereGeburt({ geburtstag: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {Array.from({ length: dayCount }, (_, i) => String(i + 1)).map(
              (day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              )
            )}
          </FormSelect>
          <FormSelect
            id={`${praefix}geburtsmonat`}
            selectClassName="px-2 sm:px-4"
            label={t.geburtsmonat}
            value={werte.geburtsmonat}
            onChange={(e) => aendereGeburt({ geburtsmonat: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {months.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            id={`${praefix}geburtsjahr`}
            selectClassName="px-2 sm:px-4"
            label={t.geburtsjahr}
            value={werte.geburtsjahr}
            onChange={(e) => aendereGeburt({ geburtsjahr: e.target.value })}
          >
            <option value="">{t.auswahlPlatzhalter}</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </FormSelect>
        </div>
        {geburtsFehler && (
          <span className="text-xs text-red-400">{geburtsFehler}</span>
        )}
      </div>
    </>
  );
}

/**
 * E-Mail, Land und Telefonnummer — einmal geschrieben, zweimal benutzt.
 *
 * Dieselbe Ueberlegung wie bei Name und Geburtsdatum: Der zweite Kreditnehmer
 * bekommt denselben Satz Felder, und eine Regel, die an zwei Stellen steht,
 * wird beim naechsten Mal nur an einer geaendert.
 */
function KontaktFelder({
  praefix,
  wt,
  werte,
  aendere,
  countries,
  emailFehler,
  vorwahlFehler,
}: {
  praefix: string;
  wt: WizardTranslations;
  werte: {
    email: string;
    telefonLand: string;
    telefonVorwahl: string;
    telefon: string;
  };
  aendere: (patch: {
    email?: string;
    telefonLand?: string;
    telefonVorwahl?: string;
    telefon?: string;
  }) => void;
  countries: { iso: string; name: string }[];
  emailFehler?: string;
  vorwahlFehler?: string;
}) {
  const t = wt.step4;
  return (
    <>
      <FormField
        id={`${praefix}email`}
        type="email"
        label={t.email}
        value={werte.email}
        onChange={(e) => aendere({ email: e.target.value })}
        error={emailFehler}
      />
      <FormSelect
        id={`${praefix}telefonLand`}
        label={t.telefonLand}
        value={werte.telefonLand}
        onChange={(e) => aendere({ telefonLand: e.target.value })}
      >
        {countries.map(({ iso, name }) => (
          <option key={iso} value={iso}>
            {name}
          </option>
        ))}
      </FormSelect>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-muted">
          {t.telefon}
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
              src={flagSrc(werte.telefonLand)}
              alt=""
              width={20}
              height={15}
              className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-white/15"
            />
            {dialForIso(werte.telefonLand)}
          </span>
          <FormField
            id={`${praefix}telefonVorwahl`}
            type="tel"
            inputMode="numeric"
            label={t.telefonVorwahl}
            value={werte.telefonVorwahl}
            maxLength={AREA_CODE_MAX}
            onChange={(e) =>
              aendere({
                telefonVorwahl: e.target.value
                  .replace(/\D/g, "")
                  .slice(0, AREA_CODE_MAX),
              })
            }
            error={vorwahlFehler}
          />
          <FormField
            id={`${praefix}telefon`}
            className="col-span-2 sm:col-span-1"
            type="tel"
            inputMode="numeric"
            label={t.telefonNummer}
            value={werte.telefon}
            maxLength={SUBSCRIBER_MAX}
            onChange={(e) =>
              aendere({
                telefon: e.target.value
                  .replace(/\D/g, "")
                  .slice(0, SUBSCRIBER_MAX),
              })
            }
          />
        </div>
      </div>
    </>
  );
}

/** Ob E-Mail und Telefonnummer einer Person vollstaendig sind. */
function kontaktVollstaendig(werte: {
  email: string;
  telefonLand: string;
  telefonVorwahl: string;
  telefon: string;
}): boolean {
  const email = werte.email.trim();
  const at = email.lastIndexOf("@");
  return (
    at > 0 &&
    at < email.length - 1 &&
    werte.telefonLand !== "" &&
    werte.telefonVorwahl.length >= AREA_CODE_MIN &&
    werte.telefon.trim() !== ""
  );
}

/** Ob Name und Geburtsdatum einer Person vollstaendig und stimmig sind. */
function personVollstaendig(
  werte: {
    vorname: string;
    zweiterVorname: string;
    nachname: string;
    geburtsdatum: string;
  },
  geburtOk: boolean
): boolean {
  return (
    NAME.test(werte.vorname.trim()) &&
    NAME.test(werte.nachname.trim()) &&
    (werte.zweiterVorname.trim() === "" ||
      NAME.test(werte.zweiterVorname.trim())) &&
    geburtOk
  );
}

export default function StepDaten() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, updateZweite, goNext, goBack } = useWizard();
  const zwei = data.personCount === 2;

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

  /** Dasselbe fuer den zweiten Kreditnehmer. */
  function updateZweiteGeburt(patch: {
    geburtstag?: string;
    geburtsmonat?: string;
    geburtsjahr?: string;
  }) {
    const p = data.zweitePerson;
    const day = patch.geburtstag ?? p.geburtstag;
    const month = patch.geburtsmonat ?? p.geburtsmonat;
    const year = patch.geburtsjahr ?? p.geburtsjahr;
    const validDay =
      day && Number(day) > maxDaysInMonth(Number(month)) ? "" : day;
    updateZweite({
      geburtstag: validDay,
      geburtsmonat: month,
      geburtsjahr: year,
      geburtsdatum: composeIsoDate(year, month, validDay),
    });
  }

  const geburtsTexte = useMemo(
    () => ({
      zuJung: wt.step4.geburtsdatumTooYoung,
      unstimmig: wt.step4.geburtsdatumImplausible,
    }),
    [wt]
  );
  const birthCheck = useMemo(
    () => pruefeGeburt(data.geburtsdatum, geburtsTexte),
    [data.geburtsdatum, geburtsTexte]
  );
  const zweiteGeburt = useMemo(
    () => pruefeGeburt(data.zweitePerson.geburtsdatum, geburtsTexte),
    [data.zweitePerson.geburtsdatum, geburtsTexte]
  );

  const countries = useMemo(() => dialCodeOptions(lang), [lang]);

  const email = data.email.trim();
  // Vor und hinter dem @ muss etwas stehen: weder "max@" noch "@anbieter.de"
  // ist eine vollständige Adresse. Geprüft wird das letzte @, damit auch
  // "max@@" abgewiesen wird.
  const atIndex = email.lastIndexOf("@");
  const emailOk = atIndex > 0 && atIndex < email.length - 1;
  const emailError = email !== "" && !emailOk ? wt.step4.emailInvalid : undefined;

  const zweiteEmail = data.zweitePerson.email.trim();
  const zweiteAt = zweiteEmail.lastIndexOf("@");
  const zweiteEmailFehler =
    zweiteEmail !== "" && !(zweiteAt > 0 && zweiteAt < zweiteEmail.length - 1)
      ? wt.step4.emailInvalid
      : undefined;
  const zweiteVorwahlFehler =
    data.zweitePerson.telefonVorwahl !== "" &&
    data.zweitePerson.telefonVorwahl.length < AREA_CODE_MIN
      ? wt.step4.telefonVorwahlTooShort
      : undefined;

  const valid =
    personVollstaendig(data, birthCheck.ok) &&
    // Bei zwei Kreditnehmern gilt fuer den zweiten dasselbe wie fuer den
    // ersten. Der zweite Vorname bleibt freiwillig, alles andere nicht.
    (!zwei || personVollstaendig(data.zweitePerson, zweiteGeburt.ok)) &&
    // Die Frage nach dem Kontakt muss beantwortet sein, und ein eigener
    // Kontakt muss vollstaendig sein.
    (!zwei ||
      (data.zweitePerson.eigenerKontakt !== null &&
        (data.zweitePerson.eigenerKontakt === "nein" ||
          kontaktVollstaendig(data.zweitePerson)))) &&
    kontaktVollstaendig(data);

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
      {/* Nur bei zwei Kreditnehmern eine Ueberschrift. Bei einem waere
          "Erster Kreditnehmer" eine Ordnung ohne Zweitem — sie erklaerte
          nichts und faenge an, eine Frage zu stellen, die niemand gestellt
          hat. */}
      {zwei && (
        <div className="flex flex-col gap-1">
          <p className="text-xs leading-relaxed text-muted">
            {wt.zweite.einleitung}
          </p>
          <h2 className="text-sm font-semibold">{wt.zweite.ersterTitel}</h2>
        </div>
      )}

      <PersonFelder
        praefix=""
        wt={wt}
        werte={data}
        aendere={update}
        aendereGeburt={updateBirthPart}
        months={months}
        years={years}
        geburtsFehler={birthCheck.error}
      />

      <KontaktFelder
        praefix=""
        wt={wt}
        werte={data}
        aendere={update}
        countries={countries}
        emailFehler={emailError}
        vorwahlFehler={areaCodeError}
      />

      {zwei && (
        <>
          {/* Der Kontakt steht bewusst beim ersten Kreditnehmer, nicht
              zwischen den beiden Personen: Er gehoert zum Antrag. Der Hinweis
              sagt das, damit niemand die zweite E-Mail-Adresse sucht. */}
          <p className="text-xs leading-relaxed text-muted">
            {wt.zweite.kontaktHinweis}
          </p>

          <div className="border-t border-border pt-6 flex flex-col gap-5">
            <h2 className="text-sm font-semibold">{wt.zweite.zweiterTitel}</h2>
            <PersonFelder
              praefix="zweite-"
              wt={wt}
              werte={data.zweitePerson}
              aendere={updateZweite}
              aendereGeburt={updateZweiteGeburt}
              months={months}
              years={years}
              geburtsFehler={zweiteGeburt.error}
            />

            {/* Erst die Frage, dann die Felder. Meldet sich einer fuer beide,
                bleibt es bei einem Kontakt; hat der zweite eigene Angaben,
                sind sie beide Pflicht — eine Telefonnummer ohne E-Mail oder
                umgekehrt ist ein halber Kontakt, und den sucht spaeter
                jemand. */}
            <div className="flex flex-col gap-2">
              <span
                id="frage-kontakt"
                className="text-sm font-medium text-muted"
              >
                {wt.zweite.kontaktFrage}
              </span>
              <JaNeinWahl
                name="eigenerKontakt"
                beschriftetVon="frage-kontakt"
                wert={data.zweitePerson.eigenerKontakt}
                jaLabel={wt.zweite.ja}
                neinLabel={wt.zweite.nein}
                // Ein spaeteres "nein" raeumt die Angaben mit weg. Sonst ginge
                // ein Kontakt mit, den der Kunde sichtbar zurueckgenommen hat.
                onWert={(w) =>
                  updateZweite(
                    w === "nein"
                      ? {
                          eigenerKontakt: w,
                          email: "",
                          telefonVorwahl: "",
                          telefon: "",
                        }
                      : { eigenerKontakt: w }
                  )
                }
              />
            </div>

            {data.zweitePerson.eigenerKontakt === "ja" && (
              <KontaktFelder
                praefix="zweite-"
                wt={wt}
                werte={data.zweitePerson}
                aendere={updateZweite}
                countries={countries}
                emailFehler={zweiteEmailFehler}
                vorwahlFehler={zweiteVorwahlFehler}
              />
            )}
          </div>
        </>
      )}
    </WizardStepLayout>
  );
}
