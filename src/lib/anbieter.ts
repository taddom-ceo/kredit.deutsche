/**
 * Wer diese Seite betreibt.
 *
 * Diese Angaben kann niemand ausser dem Betreiber selbst eintragen, und ohne
 * sie sind Impressum und Datenschutzerklaerung unvollstaendig. Sie stehen
 * deshalb an einer Stelle und nicht verstreut im Text: Ein Umzug oder ein
 * Wechsel des Geschaeftsfuehrers ist dann eine Aenderung und nicht sechs.
 *
 * Leere Felder werden auf den Seiten sichtbar als fehlend ausgewiesen, statt
 * still zu verschwinden. Ein Impressum, das eine Pflichtangabe weglaesst, ist
 * schlimmer als eines, das offen sagt, dass sie noch fehlt — im ersten Fall
 * merkt es niemand.
 */

export type Anbieter = {
  /** Vollstaendige Firma einschliesslich Rechtsform. */
  name: string;
  strasse: string;
  plzOrt: string;
  land: string;
  /** Vertretungsberechtigte Person, bei einer GmbH der Geschaeftsfuehrer. */
  vertreten: string;
  telefon: string;
  email: string;
  /** Registergericht und Nummer, etwa "Amtsgericht Augsburg, HRB 12345". */
  register: string;
  /** Umsatzsteuer-Identifikationsnummer nach Paragraf 27a UStG. */
  ustId: string;
  /**
   * Erlaubnis nach Paragraf 34c Absatz 1 Satz 1 Nummer 2 GewO fuer die
   * Vermittlung von Darlehen, und die Behoerde, die sie erteilt hat.
   */
  erlaubnis: string;
  erlaubnisBehoerde: string;
  /** Zustaendige Aufsichtsbehoerde, in der Regel die oertliche IHK. */
  aufsicht: string;
  /** Datenschutzbeauftragter, falls einer benannt ist. */
  datenschutzKontakt: string;
  /** Zustaendige Datenschutz-Aufsichtsbehoerde fuer die Beschwerde. */
  datenschutzAufsicht: string;
};

/**
 * Noch nichts eingetragen. Jede Zeile hier ist eine Pflichtangabe, die im
 * Impressum oder in der Datenschutzerklaerung auftauchen muss.
 */
export const ANBIETER: Anbieter = {
  name: "",
  strasse: "",
  plzOrt: "",
  land: "Deutschland",
  vertreten: "",
  telefon: "",
  email: "",
  register: "",
  ustId: "",
  erlaubnis: "",
  erlaubnisBehoerde: "",
  aufsicht: "",
  datenschutzKontakt: "",
  datenschutzAufsicht: "",
};

/** Ob ueberhaupt schon etwas eingetragen wurde. */
export function anbieterUnvollstaendig(): boolean {
  return Object.entries(ANBIETER).some(
    ([feld, wert]) => feld !== "land" && String(wert).trim() === ""
  );
}
