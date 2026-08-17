"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Umschalter zwischen den Fassungen der Startseite.
 *
 * Er steht sichtbar auf allen, weil die weiteren Fassungen zum Vergleichen da
 * sind und ein Vergleich, fuer den man Adressen von Hand tippen muss, keiner
 * ist. Verweise und kein Zustand: Welche Fassung offen ist, steht in der
 * Adresse und laesst sich weitergeben — "schau dir mal die V2.1 an" ist damit
 * ein Link.
 *
 * Oben rechts unter dem Kopf, in derselben Form wie die Sprachwahl darueber.
 * Fest am Fenster, damit er auch nach 6000 Pixeln noch erreichbar ist, und
 * schmal genug, dass er auf dem Handy nichts verdeckt.
 *
 * Vor dem Start gehoert er weg — dann ist eine der Fassungen die Startseite
 * und die uebrigen sind Geschichte. Bis dahin ist er das Werkzeug, mit dem
 * entschieden wird, welche.
 */

/**
 * Die Fassungen, in der Reihenfolge ihrer Entstehung.
 *
 * Als Liste und nicht als drei Zeilen Markup: Eine vierte Fassung ist dann
 * eine Zeile hier und keine Aenderung am Aufbau.
 */
const FASSUNGEN = [
  { href: "/", name: "V1" },
  { href: "/v2", name: "V2" },
  { href: "/v2-1", name: "V2.1" },
];

export default function VersionsWechsel() {
  const pfad = usePathname();

  return (
    <div
      aria-label="Fassung der Startseite"
      className="fixed right-3 top-20 z-40 flex items-center gap-1 rounded-full border border-border bg-surface/90 p-1 text-[11px] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] backdrop-blur lg:right-6"
    >
      <span className="hidden pl-2 pr-1 text-muted/70 sm:inline">Fassung</span>
      {FASSUNGEN.map((fassung) => (
        <Wahl
          key={fassung.href}
          href={fassung.href}
          name={fassung.name}
          aktiv={pfad === fassung.href}
        />
      ))}
    </div>
  );
}

function Wahl({
  href,
  name,
  aktiv,
}: {
  href: string;
  name: string;
  aktiv: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={aktiv ? "page" : undefined}
      className={`rounded-full px-2.5 py-1 font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
        aktiv
          ? "bg-accent text-accent-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {name}
    </Link>
  );
}
