"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import { KREDITARTEN, kreditartPfad } from "@/lib/kreditarten";
import { useLanguage } from "@/lib/language-context";

/**
 * Alle Kreditarten als Kachelraster.
 *
 * Steht an zwei Stellen: als Abschnitt auf der Startseite und als Hauptinhalt
 * der Übersicht unter /kredit. Beide Male dieselben Kacheln — wer den Block
 * einmal gesehen hat, erkennt ihn wieder.
 *
 * Die Kachel führt mit dem Vorhaben statt mit dem Produkt: Niemand sucht nach
 * "Modernisierungskredit", gedacht wird in "Ich möchte renovieren". Der
 * Produktname steht trotzdem darüber — er ist das Wort, unter dem die Seite
 * gefunden wird, und gehört deshalb in den Verweistext.
 *
 * Die Kacheln sind bewusst echte Verweise und keine Schaltflächen mit
 * Sprungbefehl: Nur so lassen sie sich in einem neuen Tab öffnen, und nur so
 * findet eine Suchmaschine die Unterseiten überhaupt.
 */
export default function KreditartenRaster({
  className = "",
  anzahl,
}: {
  className?: string;
  /**
   * Wie viele Kacheln gezeigt werden. Ohne Angabe alle.
   *
   * Die Startseite begrenzt hier: Sechzehn Kacheln zu je vier Zeilen sind
   * dort viereinhalb Bildschirmhöhen und über ein Drittel der ganzen Seite —
   * der Abschnitt soll aber nur zeigen, dass der eigene Fall dabei ist, und
   * nicht alles aufzählen. Die Übersicht unter /kredit zeigt weiterhin alle;
   * dort ist die vollständige Liste der Zweck der Seite.
   */
  anzahl?: number;
}) {
  const { lang } = useLanguage();
  const gezeigte = anzahl ? KREDITARTEN.slice(0, anzahl) : KREDITARTEN;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {gezeigte.map((art, i) => {
        const inhalt = art[lang];
        return (
          // Der Versatz läuft nur über die ersten Kacheln hoch. Bei sechzehn
          // Stück wartete man auf die letzte sonst mehrere Sekunden.
          <Reveal key={art.slug} delay={Math.min(i, 5) * 90} className="h-full">
            <Link
              href={kreditartPfad(art)}
              className="group h-full rounded-[18px] border border-border bg-surface ring-1 ring-white/5 p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex items-start gap-3">
                {/* Das Bildzeichen ist Schmuck und trägt keine Aussage — der
                    Text daneben sagt dasselbe. Deshalb für Vorlesehilfen
                    ausgeblendet, sonst käme "Auto" doppelt. */}
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-accent/[0.12] text-lg leading-none transition-colors duration-300 group-hover:bg-accent/20"
                >
                  {art.emoji}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted break-words">
                    {inhalt.name}
                  </span>
                  <span className="text-[15px] font-semibold leading-snug tracking-[-0.01em] break-words">
                    {inhalt.wunsch}
                  </span>
                </span>
              </div>

              <span className="text-sm text-muted leading-relaxed break-words">
                {inhalt.teaser}
              </span>

              {/* Der Vorteil sitzt unten und ist über mt-auto auf allen
                  Kacheln einer Zeile auf gleicher Höhe — auch wenn der Text
                  darüber unterschiedlich lang ausfällt. */}
              <span className="mt-auto flex items-center gap-2 pt-2 text-xs font-semibold text-accent">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  className="size-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                >
                  <path d="M2.6 6.2 L4.9 8.5 L9.4 3.7" />
                </svg>
                {inhalt.vorteil}
              </span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
