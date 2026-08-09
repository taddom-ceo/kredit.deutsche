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

export type Pruefzeile = {
  /** Kennung des Feldes, unter der die Prüfung abgelegt wird. */
  schluessel: string;
  name: string;
  /** Was der Kunde angegeben hat, fertig aufbereitet. */
  wert: string;
  /** Was jemand stattdessen eingetragen hat. */
  korrektur?: string;
  bestaetigt?: boolean;
};

export type Pruefblock = {
  titel: string;
  zeilen: Pruefzeile[];
};

export default function Datenblatt({
  antragId,
  bloecke,
  darfBearbeiten,
}: {
  antragId: string;
  bloecke: Pruefblock[];
  darfBearbeiten: boolean;
}) {
  /**
   * Der eigene Stand, damit Haken und Eingaben sofort sitzen.
   *
   * `useOptimistic` wäre hier das falsche Werkzeug: Es nimmt seinen Wert nach
   * dem Übergang zurück und stützt sich darauf, dass gleich frische Daten vom
   * Server kommen. Genau das passt nicht zu einem Eingabefeld, in dem jemand
   * gerade tippt — die Rücknahme fiele mitten ins Wort.
   */
  const [stand, setStand] = useState<
    Record<string, { korrektur?: string; bestaetigt?: boolean }>
  >(() => {
    const anfang: Record<string, { korrektur?: string; bestaetigt?: boolean }> =
      {};
    for (const block of bloecke) {
      for (const z of block.zeilen) {
        anfang[z.schluessel] = {
          korrektur: z.korrektur,
          bestaetigt: z.bestaetigt,
        };
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

      {bloecke.map((block) => (
        <section
          key={block.titel}
          className="rounded-[20px] border border-border bg-surface px-5 py-4 flex flex-col gap-1"
        >
          <div className="grid grid-cols-[minmax(6rem,1fr)_minmax(0,auto)] items-baseline gap-x-3 pb-1 sm:grid-cols-[minmax(7rem,1fr)_minmax(0,15rem)_minmax(0,15rem)_auto]">
            <h2 className="text-xs font-semibold text-muted tracking-wide">
              {block.titel}
            </h2>
            <span className="hidden text-[10px] text-muted/40 sm:block sm:text-right">
              Angabe des Kunden
            </span>
            <span className="hidden text-[10px] text-muted/40 sm:block sm:pr-2 sm:text-right">
              Richtigstellung
            </span>
            <span className="hidden size-6 sm:block" aria-hidden />
          </div>

          <dl className="flex flex-col">
            {block.zeilen.map((zeile) => {
              const eigen = stand[zeile.schluessel] ?? {};
              const geaendert = Boolean(eigen.korrektur?.trim());
              const ok = Boolean(eigen.bestaetigt);
              const gilt = geaendert ? eigen.korrektur!.trim() : zeile.wert;

              return (
                <div
                  key={zeile.schluessel}
                  className="group grid grid-cols-[minmax(6rem,1fr)_minmax(0,auto)] items-baseline gap-x-3 gap-y-1 border-b border-border/60 py-2 last:border-0 sm:grid-cols-[minmax(7rem,1fr)_minmax(0,15rem)_minmax(0,15rem)_auto]"
                >
                  <dt className="text-xs text-muted">{zeile.name}</dt>

                  {/* Die Angabe des Kunden. Ist sie richtiggestellt, tritt sie
                      zurück — durchgestrichen und blass, aber lesbar. */}
                  <dd
                    className={`min-w-0 break-words text-sm sm:text-right ${
                      geaendert
                        ? "text-muted/50 line-through decoration-muted/40"
                        : ok
                          ? "text-emerald-300"
                          : ""
                    }`}
                  >
                    {zeile.wert || "—"}
                  </dd>

                  {/* Die zweite Spalte: die eigene Eingabe. Ohne Inhalt ist sie
                      eine leere Fläche ohne Rahmen — sie soll nicht danach
                      aussehen, als müsse man sie ausfüllen. */}
                  <dd className="min-w-0 sm:text-right">
                    {darfBearbeiten ? (
                      <input
                        type="text"
                        aria-label={`${zeile.name} richtigstellen`}
                        defaultValue={eigen.korrektur ?? ""}
                        placeholder="·"
                        onBlur={(e) => {
                          const neu = e.target.value;
                          if ((eigen.korrektur ?? "") === neu) return;
                          const vorher = eigen;
                          setStand((s) => ({
                            ...s,
                            [zeile.schluessel]: { ...eigen, korrektur: neu },
                          }));
                          schicke(
                            zeile.schluessel,
                            { wert: neu },
                            zeile.wert,
                            vorher
                          );
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

                  {/* Der Haken. Blass, bis er gesetzt ist — vierzig sichtbare
                      Kästchen sähen aus wie eine Checkliste, die abzuarbeiten
                      ist, und das ist sie nicht. */}
                  <dd className="justify-self-end">
                    {darfBearbeiten ? (
                      <button
                        type="button"
                        aria-pressed={ok}
                        title={
                          ok
                            ? `${zeile.name}: bestätigt — noch einmal klicken hebt es auf`
                            : `${zeile.name} als geprüft bestätigen`
                        }
                        onClick={() => {
                          const vorher = eigen;
                          setStand((s) => ({
                            ...s,
                            [zeile.schluessel]: { ...eigen, bestaetigt: !ok },
                          }));
                          schicke(
                            zeile.schluessel,
                            { ok: !ok },
                            zeile.wert,
                            vorher
                          );
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
                        <span className="sr-only">
                          {ok ? "bestätigt" : "bestätigen"}
                        </span>
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

                  {/* Für Vorleseprogramme: Was am Ende gilt, steht sonst nur
                      in der Farbe — und Farbe liest niemand vor. */}
                  {(geaendert || ok) && (
                    <span className="sr-only">
                      {geaendert ? `Richtiggestellt auf ${gilt}.` : ""}
                      {ok ? " Bestätigt." : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
