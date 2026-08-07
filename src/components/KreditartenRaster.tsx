"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { zweckIcon } from "@/components/illustrations/ZweckIcons";
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
 * Erkannt werden soll die Art aber schon vor dem Lesen. Dafür trägt jede
 * Kachel ein großes eigenes Zeichen in einer eigenen Farbe, die auch den
 * Rahmen beim Überfahren einfärbt. Der Text bestätigt dann nur noch.
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
        const Zeichen = zweckIcon(art.id);
        return (
          // Der Versatz läuft nur über die ersten Kacheln hoch. Bei sechzehn
          // Stück wartete man auf die letzte sonst mehrere Sekunden.
          <Reveal key={art.slug} delay={Math.min(i, 5) * 90} className="h-full">
            <Link
              href={kreditartPfad(art)}
              style={{ "--zweck": art.farbe } as CSSProperties}
              className="zweck-kachel group h-full rounded-[18px] border border-border bg-surface ring-1 ring-white/5 p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {/* Groß genug, um aus dem Augenwinkel erkannt zu werden. Die
                  Fläche dahinter trägt dieselbe Farbe stark abgeschwächt,
                  damit das Zeichen nicht frei im Dunkeln steht. */}
              <span className="zweck-zeichen grid size-14 shrink-0 place-items-center rounded-[14px] transition-transform duration-300 group-hover:scale-105">
                <Zeichen className="size-8" />
              </span>

              <span className="flex min-w-0 flex-col">
                {/* Der Produktname trägt die Farbe des Zwecks. Klein genug,
                    dass sechzehn verschiedene Farben als Beschriftung wirken
                    und nicht als Jahrmarkt — und er bleibt das Wort, unter
                    dem gesucht wird. */}
                <span className="zweck-name text-[10px] font-bold uppercase tracking-[0.16em] break-words">
                  {inhalt.name}
                </span>
                {/* Anlauf klein, Kernaussage groß. Der Anlauf steht auf fast
                    jeder Kachel gleich; groß gesetzt las man beim
                    Überfliegen sechsmal "Ich möchte", bevor der Unterschied
                    kam. */}
                <span className="mt-2 text-[13px] font-medium leading-none text-muted break-words">
                  {inhalt.wunschVor}
                </span>
                <span className="mt-1 text-[1.3rem] font-bold leading-[1.15] tracking-[-0.02em] break-words">
                  {inhalt.wunschKern}
                </span>
              </span>

              <span className="text-[13px] text-muted leading-relaxed break-words">
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
