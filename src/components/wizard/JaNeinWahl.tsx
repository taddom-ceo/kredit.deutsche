"use client";

import type { JaNein } from "@/lib/wizard-context";

/**
 * Ja/Nein als ein geteiltes Feld statt als zwei Kacheln — die Form, die im
 * Antrag durchgehend für Pflichtfragen benutzt wird. Beide Hälften teilen sich
 * einen Rahmen, dadurch liest sich das Paar als eine Frage mit zwei Antworten
 * und nicht als zwei unabhängige Schalter.
 *
 * Umgesetzt als echte Radiogruppe: Damit springt die Auswahl mit den Pfeiltasten
 * weiter und Vorlesehilfen sagen "1 von 2" an. Zwei einfache Knöpfe sähen
 * gleich aus, verhielten sich aber wie zwei getrennte Schaltflächen.
 */
export function JaNeinWahl({
  name,
  wert,
  onWert,
  jaLabel,
  neinLabel,
  beschriftetVon,
}: {
  name: string;
  wert: JaNein;
  onWert: (wert: "ja" | "nein") => void;
  jaLabel: string;
  neinLabel: string;
  /** id der Frage darüber, damit die Gruppe ihre Beschriftung mitbringt. */
  beschriftetVon?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={beschriftetVon}
      className="grid grid-cols-2 overflow-hidden rounded-[16px] border border-border bg-surface-2"
    >
      {(["ja", "nein"] as const).map((option, i) => {
        const aktiv = wert === option;
        return (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors duration-200 hover:bg-white/[0.03] ${
              i === 0 ? "border-r border-border" : ""
            } ${aktiv ? "text-foreground" : "text-muted"}`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={aktiv}
              onChange={() => onWert(option)}
              className="sr-only"
            />
            {/* Der Punkt ist gezeichnet und nicht das Bedienelement des
                Browsers: Dessen Farbe lässt sich nicht zuverlässig setzen, und
                auf dem dunklen Feld stach er hell heraus. */}
            <span
              aria-hidden="true"
              className={`grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors duration-200 ${
                aktiv ? "border-accent" : "border-border-strong"
              }`}
            >
              <span
                className={`size-2.5 rounded-full transition-transform duration-200 ${
                  aktiv ? "scale-100 bg-accent" : "scale-0 bg-transparent"
                }`}
              />
            </span>
            {option === "ja" ? jaLabel : neinLabel}
          </label>
        );
      })}
    </div>
  );
}
