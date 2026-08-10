"use client";

import { useState, useTransition } from "react";
import { feldPruefen } from "@/app/crm/aktionen";

/**
 * Die Angaben eines Falls, prüfbar Zeile für Zeile.
 *
 * Gedacht für das Telefonat: Man liest vor, was der Kunde angegeben hat, und
 * hakt es ab — oder man tippt daneben, was er stattdessen sagt. Beides steht
 * danach nebeneinander. Die Angabe des Kunden wird nie überschrieben; sie ist
 * das, was er selbst abgeschickt hat, und die Frage "stand das von Anfang an
 * so da?" muss beantwortbar bleiben.
 *
 * ------------------------------------------------------------------
 * Bei zwei Kreditnehmern steht jede Angabe zweimal in derselben Zeile:
 * links der erste, rechts der zweite, jeder mit eigener Richtigstellung und
 * eigenem Haken. Vorher hing der zweite als eigener Block unter allem
 * anderen, und wer am Telefon Geburtsdaten abglich, sprang zwischen zwei
 * Stellen der Seite hin und her. Nebeneinander steht die Frage einmal da und
 * die beiden Antworten daneben — so wird verglichen.
 *
 * ------------------------------------------------------------------
 * Die Gestaltung folgt einer Vorgabe, die leicht zu unterschätzen ist: Die
 * Prüfspalte soll fast nicht auffallen, solange nichts geprüft wurde. Ein
 * Datenblatt mit zwanzig Eingabefeldern und zwanzig Kästchen sieht aus wie ein
 * Formular, das ausgefüllt werden will — dabei ist der Normalfall, dass alles
 * stimmt und nichts zu tun ist.
 *
 * Deshalb:
 *   · Das Eingabefeld hat keinen Rahmen und keinen Grund, solange es leer ist.
 *     Es ist eine freie Fläche rechts neben dem Wert. Erst beim Zeigen oder
 *     Hineinklicken zeichnet sich einer ab.
 *   · Der Haken ist ein blasser Kreis, kaum dunkler als der Grund. Angehakt
 *     wird er grün, und der Wert wird es mit — die Zeile sagt dann auf einen
 *     Blick "geprüft".
 *   · Eine Richtigstellung schaltet die ursprüngliche Angabe auf
 *     durchgestrichen und blass. Sie verschwindet nicht: Wer sie sucht, findet
 *     sie, und wer sie nicht sucht, liest über sie hinweg.
 *
 * Geschrieben wird beim Verlassen des Feldes, nicht bei jedem Tastendruck.
 * Sonst liefe je Zeichen eine Anfrage, und der Server schriebe zwanzigmal,
 * während jemand eine Telefonnummer eintippt.
 */

/** Was eine Person zu einem Feld gesagt hat. */
export type Pruefangabe = {
  /** Kennung des Feldes, unter der die Prüfung abgelegt wird. */
  schluessel: string;
  /** Was der Kunde angegeben hat, fertig aufbereitet. */
  wert: string;
  /** Was jemand stattdessen eingetragen hat. */
  korrektur?: string;
  bestaetigt?: boolean;
  /**
   * Diese Angabe ist die maßgebliche unter mehreren gleichartigen — bei den
   * drei Gehältern der niedrigste Monat. Sie wird hervorgehoben, damit man
   * beim Überfliegen den Wert trifft, mit dem gerechnet wird.
   */
  hervorgehoben?: boolean;
  /** Ein Wort dazu, warum sie hervorsticht. Steht klein unter dem Namen. */
  hinweis?: string;
};

export type Pruefzeile = Pruefangabe & {
  name: string;
  /**
   * Dieselbe Angabe beim zweiten Kreditnehmer, wenn es ihn gibt und das Feld
   * ihn betrifft. Miete, Wohnnebenkosten und Kreditwunsch gehören zum
   * Haushalt und stehen deshalb nur einmal da — dort bleibt die rechte Hälfte
   * der Zeile leer.
   */
  zweite?: Pruefangabe;
};

export type Pruefblock = {
  titel: string;
  zeilen: Pruefzeile[];
};

export default function Datenblatt({
  antragId,
  bloecke,
  darfBearbeiten,
  namen,
}: {
  antragId: string;
  bloecke: Pruefblock[];
  darfBearbeiten: boolean;
  /**
   * Über den Spalten stehen die Namen der Kreditnehmer. Zwei Einträge heißen:
   * Es gibt einen zweiten, und jede Zeile bekommt eine rechte Hälfte.
   */
  namen: string[];
}) {
  const zwei = namen.length > 1;

  /**
   * Der eigene Stand, damit Haken und Eingaben sofort sitzen.
   *
   * `useOptimistic` wäre hier das falsche Werkzeug: Es nimmt seinen Wert nach
   * dem Übergang zurück und stützt sich darauf, dass gleich frische Daten vom
   * Server kommen. Genau das passt nicht zu einem Eingabefeld, in dem jemand
   * gerade tippt — die Rücknahme fiele mitten ins Wort.
   *
   * Ein Eintrag je Schlüssel, und der zweite Kreditnehmer hat eigene
   * Schlüssel. Damit braucht die Ablage keine zweite Ebene: Was für ein Feld
   * gilt, gilt für jedes.
   */
  const [stand, setStand] = useState<
    Record<string, { korrektur?: string; bestaetigt?: boolean }>
  >(() => {
    const anfang: Record<string, { korrektur?: string; bestaetigt?: boolean }> =
      {};
    for (const block of bloecke) {
      for (const z of block.zeilen) {
        anfang[z.schluessel] = { korrektur: z.korrektur, bestaetigt: z.bestaetigt };
        if (z.zweite) {
          anfang[z.zweite.schluessel] = {
            korrektur: z.zweite.korrektur,
            bestaetigt: z.zweite.bestaetigt,
          };
        }
      }
    }
    return anfang;
  });
  const [fehler, setFehler] = useState<string | null>(null);
  const [, uebergang] = useTransition();

  function schicke(
    schluessel: string,
    aenderung: { wert?: string; ok?: boolean },
    original: string,
    vorher: { korrektur?: string; bestaetigt?: boolean }
  ) {
    setFehler(null);
    uebergang(async () => {
      const ergebnis = await feldPruefen(
        antragId,
        schluessel,
        aenderung,
        original
      );
      if (!ergebnis.ok) {
        // Zurück auf den Stand von vor dem Klick. Ein Haken, der stehen
        // bleibt, obwohl nichts gespeichert wurde, ist schlimmer als keiner:
        // Er behauptet, jemand habe geprüft.
        setStand((s) => ({ ...s, [schluessel]: vorher }));
        setFehler(ergebnis.fehler);
      }
    });
  }

  /** Wert, Richtigstellung und Haken einer Person. */
  function Gruppe({
    angabe,
    feldname,
    person,
  }: {
    angabe: Pruefangabe;
    feldname: string;
    /** Wessen Angabe das ist — für Vorleseprogramme und die Titel. */
    person: string;
  }) {
    const eigen = stand[angabe.schluessel] ?? {};
    const geaendert = Boolean(eigen.korrektur?.trim());
    const ok = Boolean(eigen.bestaetigt);
    const gilt = geaendert ? eigen.korrektur!.trim() : angabe.wert;
    const wen = zwei ? `${feldname} · ${person}` : feldname;

    return (
      <div className="pruefgruppe">
        {/* Die Angabe des Kunden. Ist sie richtiggestellt, tritt sie
            zurück — durchgestrichen und blass, aber lesbar.
            Die Reihenfolge ist Absicht: richtiggestellt schlägt bestätigt,
            bestätigt schlägt hervorgehoben. Sonst sähe ein bestätigtes
            Gehalt aus wie ein ungeprüftes. */}
        <dd
          title={angabe.hervorgehoben ? angabe.hinweis : undefined}
          className={`min-w-0 flex-1 break-words text-sm sm:text-right ${
            geaendert
              ? "text-muted/50 line-through decoration-muted/40"
              : ok
                ? "text-emerald-300"
                : angabe.hervorgehoben
                  ? "font-semibold text-amber-200"
                  : ""
          }`}
        >
          {angabe.wert || "—"}
        </dd>

        {/* Die eigene Eingabe. Ohne Inhalt ist sie eine leere Fläche ohne
            Rahmen — sie soll nicht danach aussehen, als müsse man sie
            ausfüllen. */}
        <dd className="min-w-0 flex-1 sm:text-right">
          {darfBearbeiten ? (
            <input
              type="text"
              aria-label={`${wen} richtigstellen`}
              defaultValue={eigen.korrektur ?? ""}
              placeholder="·"
              onBlur={(e) => {
                const neu = e.target.value;
                if ((eigen.korrektur ?? "") === neu) return;
                const vorher = eigen;
                setStand((s) => ({
                  ...s,
                  [angabe.schluessel]: { ...eigen, korrektur: neu },
                }));
                schicke(angabe.schluessel, { wert: neu }, angabe.wert, vorher);
              }}
              className={`w-full rounded-[8px] border border-transparent bg-transparent px-2 py-1 text-sm placeholder:text-muted/25 hover:border-border focus:border-accent/50 focus:bg-surface-2 focus-visible:outline-none sm:text-right ${
                geaendert
                  ? ok
                    ? "text-emerald-300 font-medium"
                    : "text-foreground font-medium"
                  : "text-foreground"
              }`}
            />
          ) : (
            <span className="block px-2 py-1 text-sm sm:text-right">
              {eigen.korrektur ?? ""}
            </span>
          )}
        </dd>

        {/* Der Haken. Blass, bis er gesetzt ist — vierzig sichtbare Kästchen
            sähen aus wie eine Checkliste, die abzuarbeiten ist, und das ist
            sie nicht. */}
        <dd className="shrink-0 justify-self-end">
          {darfBearbeiten ? (
            <button
              type="button"
              aria-pressed={ok}
              title={
                ok
                  ? `${wen}: bestätigt — noch einmal klicken hebt es auf`
                  : `${wen} als geprüft bestätigen`
              }
              onClick={() => {
                const vorher = eigen;
                setStand((s) => ({
                  ...s,
                  [angabe.schluessel]: { ...eigen, bestaetigt: !ok },
                }));
                schicke(angabe.schluessel, { ok: !ok }, angabe.wert, vorher);
              }}
              className={`grid size-6 place-items-center rounded-full border transition-colors duration-150 ${
                ok
                  ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                  : "border-border/60 text-transparent hover:border-border-strong hover:text-muted/60 focus-visible:text-muted/60"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="size-3.5"
              >
                <path d="M5 12.5 10 17.5 19 7" />
              </svg>
              <span className="sr-only">{ok ? "bestätigt" : "bestätigen"}</span>
            </button>
          ) : (
            ok && (
              <span
                className="text-emerald-300"
                title="bestätigt"
                aria-label="bestätigt"
              >
                ✓
              </span>
            )
          )}
        </dd>

        {/* Für Vorleseprogramme: Was am Ende gilt, steht sonst nur in der
            Farbe — und Farbe liest niemand vor. */}
        {(geaendert || ok) && (
          <span className="sr-only">
            {geaendert ? `Richtiggestellt auf ${gilt}.` : ""}
            {ok ? " Bestätigt." : ""}
          </span>
        )}
      </div>
    );
  }

  const zeilenKlasse = `pruefzeile${zwei ? " pruefzeile-zwei" : ""}`;

  return (
    <div className="flex flex-col gap-4">
      {fehler && (
        <p
          role="alert"
          className="rounded-[14px] border border-red-400/40 bg-red-400/[0.08] px-4 py-2.5 text-xs text-red-200"
        >
          Nicht gespeichert: {fehler}
        </p>
      )}

      {bloecke.map((block) => {
        /* Kreditwunsch und Haushalt betreffen beide Kreditnehmer gemeinsam;
           dort bleibt die rechte Haelfte durchweg leer. Der Name darueber
           versprraeche eine Spalte, die nie etwas enthaelt. Das Gitter bleibt
           trotzdem dasselbe, damit die Karten untereinander auf einer Linie
           stehen. */
        const zweiteHaelfte = zwei && block.zeilen.some((z) => z.zweite);
        return (
        <section
          key={block.titel}
          className="rounded-[20px] border border-border bg-surface px-5 py-4 flex flex-col gap-1"
        >
          <div className={`${zeilenKlasse} pb-1`}>
            <h2 className="text-xs font-semibold text-muted tracking-wide">
              {block.titel}
            </h2>
            {/* Über jeder Hälfte steht, wessen Angaben dort stehen. Bei einem
                Kreditnehmer bleibt es bei der alten Beschriftung — sein Name
                steht schon über der Seite. */}
            <div className="pruefgruppe">
              <span className="hidden flex-1 text-[10px] text-muted/60 sm:block sm:text-right">
                {zwei ? namen[0] : "Angabe des Kunden"}
              </span>
              <span className="hidden flex-1 text-[10px] text-muted/40 sm:block sm:text-right">
                Richtigstellung
              </span>
              <span className="hidden size-6 shrink-0 sm:block" aria-hidden />
            </div>
            {zweiteHaelfte && (
              <div className="pruefgruppe">
                <span className="hidden flex-1 text-[10px] text-muted/60 sm:block sm:text-right">
                  {namen[1]}
                </span>
                <span className="hidden flex-1 text-[10px] text-muted/40 sm:block sm:text-right">
                  Richtigstellung
                </span>
                <span className="hidden size-6 shrink-0 sm:block" aria-hidden />
              </div>
            )}
          </div>

          <dl className="flex flex-col">
            {block.zeilen.map((zeile) => (
              <div
                key={zeile.schluessel}
                className={`${zeilenKlasse} border-b border-border/60 py-2 last:border-0 ${
                  zeile.hervorgehoben || zeile.zweite?.hervorgehoben
                    ? "-mx-2 rounded-[10px] bg-amber-400/[0.07] px-2"
                    : ""
                }`}
              >
                <dt className="text-xs text-muted">
                  {zeile.name}
                  {/* Der Hinweis steht nur bei einem Kreditnehmer unter dem
                      Namen. Bei zweien liesse er offen, wessen Monat gemeint
                      ist — die Zeile gilt fuer beide, der niedrigste Monat
                      aber je Person. Dort sagt es die Farbe des Betrags, und
                      der Grund haengt als Titel daran. */}
                  {!zwei && zeile.hinweis && (
                    <span className="block text-[10px] leading-tight text-amber-200/70">
                      {zeile.hinweis}
                    </span>
                  )}
                </dt>

                <Gruppe
                  angabe={zeile}
                  feldname={zeile.name}
                  person={namen[0] ?? ""}
                />

                {/* Eine leere rechte Hälfte, wo das Feld den zweiten
                    Kreditnehmer nicht betrifft. Ein Gedankenstrich stünde da
                    wie eine fehlende Angabe — dabei gibt es die Frage für ihn
                    gar nicht. */}
                {zwei &&
                  (zeile.zweite ? (
                    <Gruppe
                      angabe={zeile.zweite}
                      feldname={zeile.name}
                      person={namen[1] ?? ""}
                    />
                  ) : (
                    <div className="pruefgruppe" aria-hidden>
                      <span className="flex-1" />
                      <span className="flex-1" />
                      <span className="size-6 shrink-0" />
                    </div>
                  ))}
              </div>
            ))}
          </dl>
        </section>
        );
      })}
    </div>
  );
}
