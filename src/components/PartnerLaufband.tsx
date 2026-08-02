"use client";

import { PARTNERS } from "@/components/BankMarquee";

/**
 * Die Partnerbanken laufen als Band von links nach rechts über die volle
 * Bildschirmbreite — unabhängig von der Auflösung, weil der Streifen aus der
 * festen Bühne ausbricht.
 *
 * Die Liste steht viermal hintereinander: Ein Versatz um genau ein Viertel
 * zeigt wieder dasselbe Bild, dadurch läuft es ohne sichtbaren Sprung. Vier
 * Durchgänge statt zwei, damit auch auf sehr breiten Bildschirmen zu keinem
 * Zeitpunkt eine Lücke entsteht.
 */
const DURCHGAENGE = 4;

export default function PartnerLaufband({ label }: { label: string }) {
  return (
    // Der ganze Streifen bricht aus der Buehne aus, nicht nur das Band:
    // Sonst endete die Trennlinie an der Buehnenkante, waehrend die Namen
    // darueber bis zum Bildrand liefen.
    <div className="vollbreite border-y border-border flex flex-col gap-5 py-9">
      <span className="mx-auto max-w-6xl px-4 sm:px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>

      <div className="bankenband w-full overflow-hidden">
        <div className="bankenlauf flex w-max">
          {Array.from({ length: DURCHGAENGE }).map((_, durchgang) => (
            <ul
              key={durchgang}
              // Nur der erste Durchgang wird vorgelesen — die übrigen sind
              // reine Wiederholung und würden die Liste sonst vervierfachen.
              aria-hidden={durchgang > 0}
              className="flex shrink-0 items-center"
            >
              {PARTNERS.map((name) => (
                <li
                  key={name}
                  className="shrink-0 px-8 text-sm font-semibold tracking-wide text-muted/60 whitespace-nowrap"
                >
                  {name}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
