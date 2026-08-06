import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KREDITARTEN, findeKreditart, kreditartPfad } from "@/lib/kreditarten";
import { absolut } from "@/lib/site";
import KreditartClient from "./KreditartClient";

/**
 * Alle elf Seiten entstehen beim Bauen. Sie hängen an keiner Abfrage, ihr
 * Inhalt steht im Quelltext — es gibt also nichts, was zur Laufzeit noch
 * dazukommen könnte.
 */
export function generateStaticParams() {
  return KREDITARTEN.map((art) => ({ art: art.slug }));
}

/**
 * Adressen außerhalb dieser Liste ergeben 404 statt einer leeren Seite.
 * Wichtig für die Auffindbarkeit: Eine erfundene Adresse wie
 * /kredit/kredit-guenstig darf kein Ergebnis liefern, das sich indexieren
 * ließe.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ art: string }>;
}): Promise<Metadata> {
  const { art: slug } = await params;
  const art = findeKreditart(slug);
  if (!art) return {};

  const pfad = kreditartPfad(art);
  const titel = `${art.de.metaTitel} — cresolu.de`;

  return {
    title: titel,
    description: art.de.metaBeschreibung,
    // Ohne kanonische Adresse gälten /kredit/autokredit und dieselbe Seite mit
    // angehängten Parametern als zwei Seiten mit gleichem Inhalt.
    alternates: { canonical: pfad },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url: absolut(pfad),
      siteName: "cresolu.de",
      title: titel,
      description: art.de.metaBeschreibung,
    },
    twitter: {
      card: "summary",
      title: titel,
      description: art.de.metaBeschreibung,
    },
  };
}

export default async function KreditartPage({
  params,
}: {
  params: Promise<{ art: string }>;
}) {
  const { art: slug } = await params;
  const art = findeKreditart(slug);
  if (!art) notFound();

  const pfad = kreditartPfad(art);

  /**
   * Strukturierte Daten. Sie wiederholen, was auf der Seite ohnehin steht —
   * nur in einer Form, die Suchmaschinen ohne Deutung lesen können: die
   * Fragen als FAQ, der Weg dorthin als Brotkrume.
   *
   * Bewusst deutsch: Die Adresse ist deutsch, das Dokument ist als deutsch
   * ausgezeichnet, und der Sprachschalter im Kopf ändert daran nichts — er
   * wirkt erst im Browser und damit nach dem, was ein Crawler liest.
   */
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
          {
            "@type": "ListItem",
            position: 3,
            name: art.de.name,
            item: absolut(pfad),
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: art.de.faq.map((eintrag) => ({
          "@type": "Question",
          name: eintrag.frage,
          acceptedAnswer: { "@type": "Answer", text: eintrag.antwort },
        })),
      },
    ],
  };

  return (
    <>
      {/* Der Inhalt ist fest im Quelltext hinterlegt und stammt aus keiner
          Eingabe. Der Ersatz von < verhindert, dass ein späterer Text den
          Skriptblock vorzeitig schließen könnte. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(strukturierteDaten).replace(/</g, "\\u003c"),
        }}
      />
      <KreditartClient slug={art.slug} />
    </>
  );
}
