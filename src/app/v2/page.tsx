import type { Metadata } from "next";
import Startseite from "@/components/Startseite";

/**
 * Fassung 2 — zum Vergleich, unter eigener Adresse.
 *
 * Derselbe Inhalt wie unter /, nur anders angeordnet: der Rechner vor den
 * Kreditarten, ein knapperer Aufmacher, weniger Bewegung. Was sich genau
 * unterscheidet, steht an den Weichen in `Startseite.tsx`.
 *
 * Die Seite liegt wie jede andere hinter dem Seitenpasswort — der Zaun in
 * `src/proxy.ts` erfasst alles, was nicht ausdruecklich ausgenommen ist, und
 * `src/proxy.test.ts` prueft das auch fuer diese Adresse.
 */
export const metadata: Metadata = {
  title: "cresolu.de — Fassung 2",
  alternates: { canonical: "/v2" },
  robots: { index: false, follow: false },
};

export default function V2() {
  return <Startseite fassung="v2" />;
}
