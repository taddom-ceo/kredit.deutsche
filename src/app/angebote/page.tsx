import type { Metadata } from "next";
import AngeboteClient from "./AngeboteClient";

export const metadata: Metadata = {
  title: "Ihre Angebote — cresolu.de",
  description:
    "Beispielansicht der Ergebnisliste: Raten und effektive Jahreszinsen mehrerer Partnerbanken im Vergleich.",
  // Die Liste zeigt Musterangebote. In einem Suchergebnis gelesen, sähen die
  // Zinssätze wie ein Versprechen aus — deshalb bleibt die Seite draußen.
  robots: { index: false, follow: false },
};

export default async function AngebotePage({
  searchParams,
}: {
  searchParams: Promise<{ betrag?: string; monate?: string }>;
}) {
  const params = await searchParams;
  const betrag = Number(params.betrag);
  const monate = Number(params.monate);

  return (
    <AngeboteClient
      startBetrag={Number.isFinite(betrag) && betrag > 0 ? betrag : undefined}
      startMonate={Number.isFinite(monate) && monate > 0 ? monate : undefined}
    />
  );
}
