import { ANBIETER } from "./anbieter";

/**
 * Die Zahlen der Vertrauensleiste unter der Kopfzeile.
 *
 * ------------------------------------------------------------------
 * WARUM DAS HIER STEHT UND NICHT IM BAUTEIL
 *
 * Eine Bewertung ist eine Tatsachenbehauptung, keine Gestaltung. "4,9 von 5
 * aus über 1.800 Bewertungen" ist entweder wahr oder eine irrefuehrende
 * geschaeftliche Handlung nach Paragraf 5 UWG. Seit der UWG-Novelle von 2022
 * kommt Paragraf 5b Absatz 3 dazu: Wer mit Bewertungen wirbt, muss sagen, ob
 * und wie er ihre Echtheit prueft. Bewertungen, die nie abgegeben wurden,
 * stehen ausserdem im Anhang zu Paragraf 3 Absatz 3 — sie sind ohne jede
 * Abwaegung unzulaessig und werden abgemahnt.
 *
 * Dieselbe Ueberlegung liegt schon dem Hinweis unter dem Partnerband und dem
 * unter den Kundenstimmen zugrunde. Die Zahlen hier sind nach demselben
 * Muster behandelt: Sie stehen an einer Stelle, sie sind als noch nicht
 * belegt gekennzeichnet, und solange sie es sind, traegt die Leiste den
 * sichtbaren Hinweis darauf.
 *
 * ------------------------------------------------------------------
 * WAS DER BETREIBER TUN MUSS, BEVOR DIE SEITE OEFFENTLICH WIRD
 *
 *   1. `BEWERTUNG` auf die tatsaechlichen Zahlen setzen.
 *   2. `quelle` auf das Portal setzen, das sie fuehrt (Trustpilot,
 *      ProvenExpert, Google). Ohne nachpruefbare Quelle bleibt die Angabe
 *      angreifbar, auch wenn sie stimmt.
 *   3. `aufsicht` in `anbieter.ts` eintragen — die Kammer, die tatsaechlich
 *      zustaendig ist.
 *   4. Erst dann `VERTRAUEN_BELEGT` auf `true` setzen. Damit verschwindet
 *      der Hinweis.
 *
 * Schritt 4 vor den Schritten 1 bis 3 zu machen ist der Fehler, vor dem
 * dieser Kommentar warnt.
 */

/** Die Bewertung, mit der geworben wird. */
export const BEWERTUNG = {
  schnitt: 4.9,
  hoechstwert: 5,
  anzahl: 1800,
  /** Das Portal, das die Bewertungen fuehrt. Leer heisst: noch keines. */
  quelle: "",
};

/**
 * Die zustaendige Industrie- und Handelskammer.
 *
 * Sie steht schon in `anbieter.ts`, weil Impressum und Datenschutzerklaerung
 * sie ebenfalls brauchen — hier wird sie nur gelesen. Zwei Stellen fuer
 * dieselbe Kammer waeren zwei Stellen, die auseinanderlaufen koennen.
 */
export function ihkName(): string {
  return ANBIETER.aufsicht.trim();
}

/**
 * Sind die Angaben belegt?
 *
 * Solange `false`, traegt die Leiste den Hinweis, dass die Zahlen noch
 * beispielhaft sind — genau wie das Partnerband und die Kundenstimmen.
 */
export const VERTRAUEN_BELEGT = false;

/** Die Bewertung als Anteil, fuer die teilweise gefuellten Sterne. */
export function bewertungsAnteil(): number {
  const anteil = BEWERTUNG.schnitt / BEWERTUNG.hoechstwert;
  return Math.min(1, Math.max(0, anteil));
}

/** "4,9" — mit Komma, wie es im Deutschen geschrieben wird. */
export function schnittFormatiert(sprache: string): string {
  return new Intl.NumberFormat(sprache === "de" ? "de-DE" : "en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(BEWERTUNG.schnitt);
}

/** "1.800" beziehungsweise "1,800". */
export function anzahlFormatiert(sprache: string): string {
  return new Intl.NumberFormat(sprache === "de" ? "de-DE" : "en-GB").format(
    BEWERTUNG.anzahl
  );
}
