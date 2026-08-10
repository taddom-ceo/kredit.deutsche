import { normalizeStreet } from "./streets";

/**
 * Rückwärtssuche: von der Straße zur Postleitzahl.
 *
 * Das Gegenstück zu `streets.ts`. Dort geht es von der Postleitzahl zu den
 * Straßen — das genügt, solange die Postleitzahl zuerst eingegeben wird. Seit
 * die Straße vorn steht, braucht es beide Richtungen.
 *
 * Das Verzeichnis liegt unter public/plz-index, gebündelt nach den ersten drei
 * Zeichen der Vergleichsform (siehe scripts/plz-index.mjs). Geladen wird immer
 * nur das eine Bündel, das zum Eingetippten passt — im Median 0,1 KB.
 *
 * Was die Suche NICHT kann, und das gehört dazu: Häufige Namen sind nicht
 * enthalten. "Bismarckstraße" gibt es in 518 Postleitzahlen; eine Auswahl
 * daraus hilft niemandem. Gerechnet über alle Straßen-Orte greift die Suche
 * bei gut vier von zehn Adressen. Greift sie nicht, passiert schlicht nichts
 * und die Postleitzahl wird wie bisher eingetippt.
 */

/** Umlaute nur für den Dateinamen — dieselbe Regel wie im Erzeugerskript. */
function bundName(vergleichsform: string): string {
  return (vergleichsform + "___")
    .slice(0, 3)
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
}

export function plzBundUrl(strasse: string): string | null {
  const form = normalizeStreet(strasse);
  // Unter drei Zeichen wäre das Bündel riesig und die Eingabe noch nichts,
  // wonach sich suchen ließe.
  if (form.length < 3) return null;
  return `/plz-index/${bundName(form)}.json`;
}

/** Die Postleitzahlen zu einem Straßennamen, oder eine leere Liste. */
export function plzZuStrasse(
  bund: Record<string, string[]>,
  strasse: string
): string[] {
  return bund[normalizeStreet(strasse)] ?? [];
}
