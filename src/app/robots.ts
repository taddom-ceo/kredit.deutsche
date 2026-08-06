import type { MetadataRoute } from "next";
import { absolut } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Formular und Beispielliste gehören nicht in den Index. Beide tragen
      // dieselbe Angabe zusätzlich in ihren eigenen Metadaten — hier steht sie
      // für Crawler, die gar nicht erst anfragen sollen.
      disallow: ["/antrag", "/angebote"],
    },
    sitemap: absolut("/sitemap.xml"),
  };
}
