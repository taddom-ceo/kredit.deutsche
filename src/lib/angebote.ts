/**
 * Rechnung hinter der Angebotsliste.
 *
 * Solange keine Bank angebunden ist, kommen die Angebote aus einer festen
 * Liste. Die Raten daraus sind aber nicht erfunden, sondern mit derselben
 * Formel gerechnet wie überall auf der Seite — dadurch passen sie zu Betrag
 * und Laufzeit, die der Kunde oben einstellt, und ändern sich mit ihnen.
 */

/** Monatszins aus dem effektiven Jahreszins — zinseszinsrichtig, nicht p/12. */
function monatszins(effJahreszins: number): number {
  return Math.pow(1 + effJahreszins / 100, 1 / 12) - 1;
}

/** Annuität: die monatliche Rate für Betrag, Laufzeit und Zinssatz. */
export function monatsrate(
  betrag: number,
  monate: number,
  effJahreszins: number
): number {
  if (monate <= 0) return 0;
  const i = monatszins(effJahreszins);
  if (i <= 0) return betrag / monate;
  return (betrag * i) / (1 - Math.pow(1 + i, -monate));
}

/** Was der Kunde über die ganze Laufzeit zahlt. */
export function gesamtbetrag(
  betrag: number,
  monate: number,
  effJahreszins: number
): number {
  return monatsrate(betrag, monate, effJahreszins) * monate;
}

/**
 * Gebundener Sollzins zum effektiven Jahreszins — der nominale Satz, der
 * monatlich verrechnet auf denselben Effektivzins führt. Ohne weitere Kosten
 * ist das genau der zwölffache Monatszins und liegt darum immer etwas unter
 * dem effektiven Satz. Er gehört in die Kreditdetails, weil Kreditverträge
 * beide Zahlen nennen müssen.
 */
export function sollzins(effJahreszins: number): number {
  return monatszins(effJahreszins) * 12 * 100;
}

/** Ein Angebot, wie es in der Liste steht. */
export type Angebot = {
  id: string;
  bank: string;
  /** Bester und schlechtester effektiver Jahreszins der Bank. */
  zinsAb: number;
  zinsBis: number;
  sterne: number;
  bewertungen: number;
  /** Werktage bis zur Auszahlung — bestimmt auch die Sortierung nach Tempo. */
  auszahlungTage: number;
  /** Schlagzeile über den Eigenschaften, etwa "Sofort-Auszahlung". */
  merkmal: string;
  merkmalText: string;
  /** Was für die Bank spricht. */
  plus: string[];
  /** Was einschränkt — gehört sichtbar dazu, sonst ist die Liste Werbung. */
  minus: string[];
  /**
   * Ob kostenlose Sondertilgung möglich ist. Steht als eigenes Feld da und
   * wird nicht aus `plus` herausgelesen: Diese Liste ist übersetzt, und ein
   * Filter darf nicht daran hängen, dass ein Satz wörtlich gleich bleibt.
   */
  sondertilgung: boolean;
  /** Hebt genau ein Angebot hervor. */
  empfohlen?: boolean;
};

export type Sortierung = "zins" | "rate" | "tempo";

export function sortiere(angebote: Angebot[], nach: Sortierung): Angebot[] {
  const kopie = [...angebote];
  if (nach === "tempo") {
    return kopie.sort(
      (a, b) => a.auszahlungTage - b.auszahlungTage || a.zinsAb - b.zinsAb
    );
  }
  // Nach Rate zu sortieren ergibt bei gleichem Betrag und gleicher Laufzeit
  // dieselbe Reihenfolge wie nach Zins — die Rate haengt allein am Zinssatz.
  // Beides bleibt trotzdem waehlbar, weil der Kunde in Raten denkt.
  return kopie.sort((a, b) => a.zinsAb - b.zinsAb);
}

export type Filter = {
  /** Nur Banken, die in ein bis zwei Werktagen auszahlen. */
  sofort: boolean;
  sondertilgung: boolean;
};

export const LEERER_FILTER: Filter = { sofort: false, sondertilgung: false };

export function filtere(angebote: Angebot[], filter: Filter): Angebot[] {
  return angebote.filter(
    (a) =>
      (!filter.sofort || a.auszahlungTage <= 2) &&
      (!filter.sondertilgung || a.sondertilgung)
  );
}

/** Grenzen der Eingabefelder über der Liste. */
export const BETRAG_MIN = 1000;
export const BETRAG_MAX = 100000;
export const LAUFZEITEN = [12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
