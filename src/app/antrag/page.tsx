import type { Metadata } from "next";
import { istKreditartId } from "@/lib/kreditarten";
import AntragClient from "./AntragClient";

export const metadata: Metadata = {
  title: "Kreditantrag — cresolu.de",
  description:
    "Ihre Angaben in acht Schritten: Betrag, Laufzeit und persönliche Daten für den Vergleich von über 20 Banken.",
  // Ein Formular ohne eigenen Inhalt. In einem Suchergebnis führte es mitten
  // in die Strecke, ohne dass klar wäre, worum es geht.
  robots: { index: false, follow: true },
};

export default async function AntragPage({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; months?: string; zweck?: string }>;
}) {
  const params = await searchParams;
  const amount = params.amount ? Number(params.amount) : undefined;
  const months = params.months ? Number(params.months) : undefined;

  return (
    <AntragClient
      initialAmount={Number.isFinite(amount) ? amount : undefined}
      initialMonths={Number.isFinite(months) ? months : undefined}
      // Nur bekannte Zwecke werden übernommen. Ein frei erfundener Wert in der
      // Adresszeile stünde sonst als gewählte Kreditart im Antrag, ohne dass
      // es dazu eine Kachel gäbe.
      initialKreditart={
        istKreditartId(params.zweck) ? params.zweck : undefined
      }
    />
  );
}
