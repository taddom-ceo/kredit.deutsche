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
 *      zustaendig ist. Sie steht nicht in dieser Leiste, sondern im
 *      Impressum; wer "IHK-lizenziert" liest und nachsieht, sucht sie dort.
 *   4. Pruefen, dass die Erlaubnis nach Paragraf 34c GewO wirklich erteilt
 *      ist. "IHK-lizenziert" ohne Erlaubnis ist keine Uebertreibung, sondern
 *      eine falsche Angabe ueber eine behoerdliche Gestattung.
 *   5. Erst dann `VERTRAUEN_BELEGT` auf `true` setzen. Damit verschwindet
 *      der Hinweis.
 *
 * Den letzten Schritt vor den anderen zu machen ist der Fehler, vor dem
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
 * Die Erlaubnis, auf die sich die zweite Plakette beruft.
 *
 * Hier steht `§ 34c GewO` und nicht `§ 34c & 34i GewO`.
 *
 * Paragraf 34c Absatz 1 Satz 1 Nummer 2 deckt die Vermittlung von Darlehen —
 * das ist es, was diese Seite tut. Paragraf 34i gilt fuer die Vermittlung von
 * Immobiliardarlehen an Verbraucher, also grundpfandrechtlich gesicherte
 * Finanzierungen. Die sechzehn Verwendungszwecke dieser Seite sind samt und
 * sonders unbesicherte Raten- und Umschuldungskredite; auch "Modernisierung"
 * meint hier den Ratenkredit und nicht die Baufinanzierung.
 *
 * Mit einer Erlaubnis zu werben, die man weder hat noch braucht, ist derselbe
 * Fehler wie mit Bewertungen, die es nicht gibt. Kommt die Baufinanzierung
 * spaeter dazu UND liegt die Erlaubnis nach 34i tatsaechlich vor, gehoert sie
 * hier hinein — vorher nicht.
 */
export const ERLAUBNIS = {
  paragrafen: "§ 34c GewO",
};

/**
 * Das Wort vor der Zahl: "Hervorragend · 4,9".
 *
 * Abgeleitet und nicht hingeschrieben, damit es der Zahl nicht widersprechen
 * kann. Ein fest eingetragenes "Hervorragend" bliebe auch dann stehen, wenn
 * der Schnitt eines Tages auf 3,1 faellt — und dann steht da "Hervorragend ·
 * 3,1", was niemandem auffaellt ausser dem Leser.
 *
 * Die Schwellen folgen der Einteilung, die die gaengigen Bewertungsportale
 * verwenden.
 */
export function bewertungsWort(sprache: string): string {
  const s = BEWERTUNG.schnitt / BEWERTUNG.hoechstwert;
  if (sprache === "de") {
    if (s >= 0.9) return "Hervorragend";
    if (s >= 0.76) return "Sehr gut";
    if (s >= 0.6) return "Gut";
    return "Befriedigend";
  }
  if (s >= 0.9) return "Excellent";
  if (s >= 0.76) return "Great";
  if (s >= 0.6) return "Good";
  return "Average";
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
