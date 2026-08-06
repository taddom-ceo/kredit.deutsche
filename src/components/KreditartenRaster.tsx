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
 * Die Kacheln sind bewusst echte Verweise und keine Schaltflächen mit
 * Sprungbefehl: Nur so lassen sie sich in einem neuen Tab öffnen, und nur so
 * findet eine Suchmaschine die elf Unterseiten überhaupt.
 */
export default function KreditartenRaster({
  className = "",
}: {
  className?: string;
}) {
  const { lang } = useLanguage();

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {KREDITARTEN.map((art, i) => (
        // Der Versatz läuft nur über die ersten Kacheln hoch. Bei elf Stück
        // wartete man auf die letzte sonst über eine Sekunde.
        <Reveal key={art.slug} delay={Math.min(i, 5) * 90} className="h-full">
          <Link
            href={kreditartPfad(art)}
            className="group h-full rounded-[18px] border border-border bg-surface ring-1 ring-white/5 p-5 flex flex-col gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="text-base font-semibold tracking-[-0.01em] break-words">
              {art[lang].name}
            </span>
            <span className="text-sm text-muted leading-relaxed break-words">
              {art[lang].teaser}
            </span>
            <span
              aria-hidden="true"
              className="mt-auto pt-3 text-accent transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
