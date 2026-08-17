"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Umschalter zwischen den beiden Fassungen der Startseite.
 *
 * Er steht sichtbar auf beiden, weil die zweite Fassung zum Vergleichen da
 * ist und ein Vergleich, fuer den man Adressen von Hand tippen muss, keiner
 * ist. Zwei Verweise und kein Zustand: Welche Fassung offen ist, steht in der
 * Adresse und laesst sich weitergeben — "schau dir mal die V2 an" ist damit
 * ein Link.
 *
 * Oben rechts unter dem Kopf, in derselben Form wie die Sprachwahl darueber.
 * Fest am Fenster, damit er auch nach 6000 Pixeln noch erreichbar ist, und
 * schmal genug, dass er auf dem Handy nichts verdeckt.
 *
 * Vor dem Start gehoert er weg — dann ist eine der beiden Fassungen die
 * Startseite und die andere Geschichte. Bis dahin ist er das Werkzeug, mit
 * dem entschieden wird, welche.
 */
export default function VersionsWechsel() {
  const pfad = usePathname();
  const aufV2 = pfad === "/v2";

  return (
    <div
      aria-label="Fassung der Startseite"
      className="fixed right-3 top-20 z-40 flex items-center gap-1 rounded-full border border-border bg-surface/90 p-1 text-[11px] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] backdrop-blur lg:right-6"
    >
      <span className="pl-2 pr-1 text-muted/70">Fassung</span>
      <Wahl href="/" name="V1" aktiv={!aufV2} />
      <Wahl href="/v2" name="V2" aktiv={aufV2} />
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
