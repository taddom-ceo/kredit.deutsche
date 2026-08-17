import type { Metadata } from "next";
import V21Client from "./V21Client";

/**
 * Die dritte Fassung der Startseite, unter eigener Adresse.
 *
 * Wie die zweite von der Suche ausgenommen: Drei Seiten mit demselben Zweck
 * machten einander Konkurrenz, und die Fassungen sind zum Vergleichen da und
 * nicht zum Gefundenwerden. Faellt die Entscheidung, wandert die gewaehlte
 * auf "/" und die uebrigen verschwinden.
 */
export const metadata: Metadata = {
  title: "Startseite, dritte Fassung",
  robots: { index: false, follow: false },
};

export default function V21Seite() {
  return <V21Client />;
}
