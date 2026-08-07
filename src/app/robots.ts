import type { MetadataRoute } from "next";
import { absolut } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Formular, Beispielliste und das interne CRM gehören nicht in den
      // Index. Alle tragen dieselbe Angabe zusätzlich in ihren eigenen
      // Metadaten — hier steht sie für Crawler, die gar nicht erst anfragen
      // sollen.
      disallow: ["/antrag", "/angebote", "/crm"],
    },
    sitemap: absolut("/sitemap.xml"),
  };
}
