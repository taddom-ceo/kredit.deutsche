import type { Metadata } from "next";
import type { ReactNode } from "react";
import { absolut } from "@/lib/site";

const TITEL = "Kreditrechner: Monatsrate berechnen — cresolu.de";
const BESCHREIBUNG =
  "Betrag und Laufzeit einstellen, Monatsrate und Gesamtkosten sofort sehen — und anschließend über 20 Banken Schufa-neutral vergleichen.";

/**
 * Die Seite selbst läuft im Browser und kann deshalb keine Metadaten
 * ausliefern — "use client" und der Export von `metadata` schließen einander
 * aus. Diese Hülle liegt auf dem Server und trägt sie statt ihrer.
 */
export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  alternates: { canonical: "/rechner" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: absolut("/rechner"),
    siteName: "cresolu.de",
    title: TITEL,
    description: BESCHREIBUNG,
  },
};

export default function RechnerLayout({ children }: { children: ReactNode }) {
  return children;
}
