import type { Metadata } from "next";
import V2Client from "./V2Client";

/**
 * Die zweite Fassung der Startseite, unter eigener Adresse.
 *
 * Nicht in der Suche: Zwei Seiten mit demselben Inhalt und demselben Zweck
 * machten einander Konkurrenz, und die zweite Fassung ist zum Vergleichen da
 * und nicht zum Gefundenwerden. Faellt die Entscheidung fuer sie, wandert ihr
 * Inhalt auf "/" und diese Adresse verschwindet.
 */
export const metadata: Metadata = {
  title: "Startseite, zweite Fassung",
  robots: { index: false, follow: false },
};

export default function V2Seite() {
  return <V2Client />;
}
