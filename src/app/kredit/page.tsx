import type { Metadata } from "next";
import { KREDITARTEN, kreditartPfad } from "@/lib/kreditarten";
import { absolut } from "@/lib/site";
import KreditUebersichtClient from "./KreditUebersichtClient";

const TITEL = "Kreditarten im Überblick — cresolu.de";
const BESCHREIBUNG =
  "Autokredit, Umschuldung, Modernisierung, Dispoablösung und mehr: Für jeden Verwendungszweck die passende Finanzierung, mit Rechner und den wichtigsten Punkten.";

export const metadata: Metadata = {
  title: TITEL,
  description: BESCHREIBUNG,
  alternates: { canonical: "/kredit" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: absolut("/kredit"),
    siteName: "cresolu.de",
    title: TITEL,
    description: BESCHREIBUNG,
  },
  twitter: { card: "summary", title: TITEL, description: BESCHREIBUNG },
};

export default function KreditUebersichtPage() {
  // Die Liste der elf Seiten in maschinenlesbarer Form. Sie sagt einer
  // Suchmaschine, dass es sich um eine Übersicht handelt und wohin sie führt —
  // die Verweise im Text stehen unabhängig davon ohnehin auf der Seite.
  const strukturierteDaten = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Startseite",
            item: absolut("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Kreditarten",
            item: absolut("/kredit"),
          },
        ],
      },
      {
        "@type": "ItemList",
        itemListElement: KREDITARTEN.map((art, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: art.de.name,
          url: absolut(kreditartPfad(art)),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(strukturierteDaten).replace(/</g, "\\u003c"),
        }}
      />
      <KreditUebersichtClient />
    </>
  );
}
