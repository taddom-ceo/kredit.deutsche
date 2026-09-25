"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Umschalter zwischen den beiden Fassungen der Startseite.
 *
 * Ein Hilfsmittel fuer den Vergleich, kein Teil der Seite: Er sitzt unten
 * links, ausserhalb des Leseweges, und liegt ueber allem, damit er auf jeder
 * Scrollhoehe erreichbar ist — man vergleicht selten den Aufmacher allein.
 *
 * Er zeigt sich nur auf den beiden Startseiten. Auf /antrag oder im CRM waere
 * er sinnlos, denn dort gibt es nur eine Fassung.
 *
 * Wenn eine der beiden Fassungen gewonnen hat, faellt dieses Bauteil weg und
 * mit ihm die Weichen in `Startseite.tsx`.
 */
export default function VersionsWechsel() {
  const pfad = usePathname();
  if (pfad !== "/" && pfad !== "/v2") return null;

  return (
    <nav
      aria-label="Fassung der Startseite"
      // Unten links: Rechts unten sitzt der mitlaufende Handlungsaufruf, und
      // zwei schwebende Dinge in derselben Ecke verdecken einander.
      //
      // Auf dem Handy reicht das nicht — dort laeuft der Handlungsaufruf ueber
      // die volle Breite, unten gemessen von 776px bis 828px bei 844px Hoehe.
      // Der Umschalter sass mitten darauf. Deshalb dort eine Etage hoeher;
      // ab sm ist die Ecke frei und er rutscht zurueck nach unten.
      className="fixed bottom-24 sm:bottom-4 left-4 z-40 flex items-center gap-1 rounded-full border border-border-strong bg-surface/95 p-1 text-xs font-semibold shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur"
    >
      <Wahl href="/" label="V1" aktiv={pfad === "/"} />
      <Wahl href="/v2" label="V2" aktiv={pfad === "/v2"} />
    </nav>
  );
}

function Wahl({
  href,
  label,
  aktiv,
}: {
  href: string;
  label: string;
  aktiv: boolean;
}) {
  return (
    <Link
      href={href}
      // `aria-current` sagt Vorlesehilfen, welche Fassung gerade offen ist.
      // Die Farbe allein sagt es ihnen nicht.
      aria-current={aktiv ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        aktiv
          ? "bg-accent text-accent-foreground"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
