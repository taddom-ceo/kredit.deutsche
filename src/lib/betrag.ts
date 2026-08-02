/**
 * Eurobeträge in Eingabefeldern: gespeichert werden reine Ziffern, angezeigt
 * wird mit Tausendertrennung.
 *
 * Die Trennung kann nicht aus `<input type="number">` kommen — der Browser
 * lässt dort nur eine gültige Zahl zu, und "1.000" ist für ihn keine. Die
 * Felder sind deshalb Textfelder mit numerischer Tastatur, und die Trennung
 * legt diese Datei darüber.
 *
 * Im Zustand stehen weiterhin nur Ziffern. Dadurch bleibt jede Prüfung, die
 * `Number(...)` benutzt, unverändert gültig — sie müsste sonst überall erst
 * die Punkte wieder entfernen.
 */

/** Mehr Stellen trägt eine Gleitkommazahl nicht mehr genau. */
const MAX_STELLEN = 12;

/**
 * Alles außer Ziffern verwerfen. Führende Nullen fallen weg, damit aus einer
 * korrigierten Eingabe nicht "0900" wird — die einzelne Null bleibt aber
 * stehen, sonst ließe sich keine Null eintippen.
 */
export function nurZiffern(text: string): string {
  return text
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "")
    .slice(0, MAX_STELLEN);
}

/**
 * Ziffern in die Schreibweise der Sprache bringen: im Deutschen der Punkt als
 * Tausendertrennung, im Englischen das Komma. Ein fester Punkt wäre in
 * englischer Anzeige falsch — dort liest sich "1.000" als eins.
 */
export function gruppiere(ziffern: string, lang: string): string {
  if (ziffern === "") return "";
  return new Intl.NumberFormat(lang).format(Number(ziffern));
}

/**
 * Stelle im formatierten Text, an der genau `ziffernDavor` Ziffern liegen.
 * Damit wandert der Schreibzeiger nach dem Neuformatieren an dieselbe Stelle
 * im Zahlenwert zurück, statt ans Ende zu springen.
 */
export function zeigerNachZiffern(text: string, ziffernDavor: number): number {
  let gezaehlt = 0;
  let i = 0;
  while (i < text.length && gezaehlt < ziffernDavor) {
    if (text.charCodeAt(i) >= 48 && text.charCodeAt(i) <= 57) gezaehlt++;
    i++;
  }
  return i;
}
