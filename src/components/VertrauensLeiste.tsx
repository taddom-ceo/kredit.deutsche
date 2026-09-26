"use client";

import { useId } from "react";
import { useLanguage } from "@/lib/language-context";
import {
  ERLAUBNIS,
  VERTRAUEN_BELEGT,
  anzahlFormatiert,
  bewertungsAnteil,
  bewertungsWort,
  schnittFormatiert,
} from "@/lib/vertrauen";

/**
 * Die Vertrauensleiste direkt unter der Kopfzeile.
 *
 * Zwei Nachweise, mehr nicht: die Bewertung und die Erlaubnis. Eine Leiste
 * mit sechs Zeichen liest niemand — sie wird zum Muster, und ein Muster
 * traegt nichts.
 *
 * Die Bewertung steht links, weil sie die Frage beantwortet, die zuerst
 * kommt ("taugen die was?"); die Erlaubnis rechts beantwortet die zweite
 * ("duerfen die das ueberhaupt?").
 *
 * Sie steht ueber dem Aufmacher, weil sie dort noch wirkt: Wer die
 * Ueberschrift liest, hat die Frage "kann ich denen glauben?" im Kopf, und
 * die Antwort soll nicht drei Bildschirme weiter unten stehen.
 *
 * ------------------------------------------------------------------
 * Der Hinweis am Ende
 *
 * Solange `VERTRAUEN_BELEGT` in `src/lib/vertrauen.ts` auf `false` steht,
 * traegt die Leiste denselben Hinweis wie das Partnerband und die
 * Kundenstimmen. Bewertung und Erlaubnis sind Tatsachenbehauptungen — ohne
 * Beleg daneben zu stehen, waere der Unterschied zwischen Werbung und
 * Irrefuehrung. Die Begruendung im einzelnen steht in `vertrauen.ts`.
 */
export default function VertrauensLeiste() {
  const { lang, t } = useLanguage();
  const v = t.vertrauen;

  return (
    <section
      aria-label={v.aria}
      className="border-b border-border bg-surface/30"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 sm:justify-start">
        {/* Bewertung */}
        <span className="flex items-center gap-2.5">
          <Sterne anteil={bewertungsAnteil()} />
          <span className="flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-foreground">
              {bewertungsWort(lang)} · {schnittFormatiert(lang)}
            </span>
            <span className="text-[11px] text-muted">
              {v.bewertungUnter.replace("{anzahl}", anzahlFormatiert(lang))}
            </span>
          </span>
        </span>

        {/* Trennstrich wie in der Vorlage. Er entfaellt, wo die beiden
            Plaketten umbrechen — ein Strich zwischen zwei Zeilen steht quer
            und trennt nichts. */}
        <span
          aria-hidden="true"
          className="hidden h-8 w-px bg-border-strong sm:block"
        />

        {/* Erlaubnis */}
        <span className="flex items-center gap-2.5">
          <SiegelZeichen />
          <span className="flex flex-col leading-tight">
            <span className="text-[13px] font-semibold text-foreground">
              {v.ihkTitel}
            </span>
            <span className="text-[11px] text-muted">
              {ERLAUBNIS.paragrafen}
            </span>
          </span>
        </span>

        {!VERTRAUEN_BELEGT && (
          // muted/75 und nicht muted/70 wie bei den anderen Hinweisen:
          // Gemessen auf dieser Flaeche sind 70 Prozent nur 4,32 zu 1 und
          // damit unter der Schwelle von 4,5 fuer Fliesstext. Ausgerechnet
          // der Satz, der die Zahlen daneben einordnet, darf nicht der
          // schlechtest lesbare der Seite sein. Bei 75 Prozent sind es 4,81.
          <span className="w-full text-center text-[11px] text-muted/75 sm:ml-2 sm:w-auto sm:text-left">
            {v.hinweis}
          </span>
        )}
      </div>
    </section>
  );
}

/** Siegel mit Haken — das Zeichen fuer die Erlaubnis. */
function SiegelZeichen() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className="size-6 shrink-0 text-accent"
    >
      <path d="M12 2.8l7.2 2.7v5.3c0 4.4-3 8.3-7.2 9.6-4.2-1.3-7.2-5.2-7.2-9.6V5.5L12 2.8Z" />
      <path d="m8.8 11.9 2.2 2.2 4.2-4.3" />
    </svg>
  );
}

/**
 * Fuenf Sterne, der letzte anteilig gefuellt.
 *
 * Gold und nicht in der Akzentfarbe: Das Gruen gehoert auf dieser Seite dem
 * Handlungsaufruf. Stuenden die Sterne darin, waeren sie das zweite gruene
 * Element ueber der Falz und naehmen ihm Aufmerksamkeit — und gelbe Sterne
 * sind ohnehin das Zeichen, das ohne Lesen verstanden wird.
 *
 * Fuenf volle Sterne bei 4,9 waeren gerundet und damit falsch. Der
 * Unterschied zwischen 4,9 und 5,0 ist genau das, was eine echte Bewertung
 * glaubwuerdig macht; der Verlauf schneidet deshalb an der gemessenen Stelle
 * ab, bei 4,9 von 5 nach 98 Prozent der Breite.
 */
function Sterne({ anteil }: { anteil: number }) {
  // Der Verlauf braucht eine eigene Kennung je Vorkommen. Zwei Leisten auf
  // einer Seite teilten sich sonst eine, und die zweite faerbte die erste.
  //
  // Die Kennung von useId enthaelt Zeichen, die in einem `url(#…)` innerhalb
  // von SVG nicht ueberall tragen — sie fliegen deshalb heraus. Der Rest ist
  // weiterhin je Vorkommen verschieden, und darauf kommt es an.
  const id = `sterne-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const grenze = `${(anteil * 100).toFixed(1)}%`;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 90 18"
      focusable="false"
      className="h-[15px] w-[75px] shrink-0"
    >
      <defs>
        <linearGradient id={id}>
          <stop offset={grenze} stopColor="#fbbf24" />
          <stop offset={grenze} stopColor="rgba(148,163,196,0.28)" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          transform={`translate(${i * 18} 0)`}
          fill={`url(#${id})`}
          d="M9 1.4l2.28 4.62 5.1.74-3.69 3.6.87 5.08L9 13.04l-4.56 2.4.87-5.08-3.69-3.6 5.1-.74L9 1.4Z"
        />
      ))}
    </svg>
  );
}
