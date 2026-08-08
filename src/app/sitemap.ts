import type { MetadataRoute } from "next";
import { KREDITARTEN, kreditartPfad } from "@/lib/kreditarten";
import { absolut } from "@/lib/site";

/**
 * Verzeichnis aller Seiten, die in einer Suche auftauchen sollen.
 *
 * Nicht enthalten sind /antrag und /angebote: Der Antrag ist ein Formular ohne
 * eigenständigen Inhalt, und die Angebotsliste zeigt bis zur Anbindung der
 * Banken Musterkonditionen — in einem Suchergebnis gelesen sähen die wie ein
 * Versprechen aus.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const stand = new Date();

  return [
    {
      url: absolut("/"),
      lastModified: stand,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absolut("/kredit"),
      lastModified: stand,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...KREDITARTEN.map((art) => ({
      url: absolut(kreditartPfad(art)),
      lastModified: stand,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: absolut("/rechner"),
      lastModified: stand,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Pflichtseiten. Sie stehen weit unten in der Gewichtung, gehoeren aber
    // ins Verzeichnis: Eine Suchmaschine, die Impressum und
    // Datenschutzerklaerung findet, wertet das als Zeichen fuer einen
    // ernsthaften Anbieter.
    {
      url: absolut("/impressum"),
      lastModified: stand,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absolut("/datenschutz"),
      lastModified: stand,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
