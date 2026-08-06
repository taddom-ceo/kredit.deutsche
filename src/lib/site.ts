/**
 * Adresse, unter der die Seite erreichbar ist.
 *
 * Wird für Suchmaschinen gebraucht: kanonische Verweise, sitemap.xml und
 * robots.txt müssen vollständige Adressen enthalten, relative genügen dort
 * nicht. Über die Umgebungsvariable lässt sie sich je Umgebung setzen, damit
 * eine Vorschau nicht auf die Produktivseite verweist.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://cresolu.de";

/** Adresse einer Unterseite, ohne doppelte Schrägstriche. */
export function absolut(pfad: string): string {
  return `${SITE_URL}${pfad.startsWith("/") ? pfad : `/${pfad}`}`;
}
