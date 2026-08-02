/**
 * Schätzt die Restschuld eines laufenden Annuitätendarlehens zum heutigen Tag.
 *
 * Grundlage sind die Angaben, die ein Kunde ohne Unterlagen zur Hand hat:
 * ursprünglich finanzierte Summe, Auszahlungsdatum, monatliche Rate und —
 * wenn bekannt — der effektive Jahreszins.
 *
 * Mit Zinssatz wird sauber gerechnet: Jede Rate deckt zuerst die aufgelaufenen
 * Zinsen, nur der Rest tilgt. Ohne Zinssatz bleibt allein die lineare
 * Schätzung „Summe minus gezahlte Raten". Sie fällt zu niedrig aus, weil ein
 * Teil jeder Rate in Wirklichkeit Zinsen waren — deshalb weist die Oberfläche
 * darauf hin, dass die Angabe des Zinssatzes die Schätzung verbessert.
 *
 * Der Monatszins wird wie überall auf der Seite aus dem effektiven Jahreszins
 * gezogen: i = (1 + p)^(1/12) − 1. Das ist die zinseszinsrichtige Umrechnung,
 * nicht die verbreitete Division durch zwölf.
 */

export type RestschuldEingabe = {
  /** Ursprünglich finanzierte Summe in Euro. */
  summe: number;
  /** Auszahlungsmonat als JJJJ-MM. */
  auszahlung: string;
  /** Monatliche Rate in Euro. */
  rate: number;
  /** Effektiver Jahreszins in Prozent. Unbekannt, wenn nicht angegeben. */
  zins?: number;
  /** Stichtag der Schätzung. Vorgabe ist heute. */
  stichtag?: Date;
};

export type RestschuldErgebnis = {
  /** Geschätzte Restschuld in Euro, nie unter null. */
  wert: number;
  /** Zahl der seit der Auszahlung vergangenen vollen Monate. */
  monate: number;
  /** Rechnerisch bereits vollständig zurückgeführt. */
  abbezahlt: boolean;
  /** Ohne Zinssatz gerechnet und damit nur grob. */
  ohneZins: boolean;
};

/** Volle Monate zwischen einem Auszahlungsmonat (JJJJ-MM) und dem Stichtag. */
function monateSeit(auszahlung: string, stichtag: Date): number | null {
  const treffer = /^(\d{4})-(\d{2})$/.exec(auszahlung);
  if (!treffer) return null;
  const jahr = Number(treffer[1]);
  const monat = Number(treffer[2]);
  if (monat < 1 || monat > 12) return null;
  return (
    (stichtag.getFullYear() - jahr) * 12 + (stichtag.getMonth() + 1 - monat)
  );
}

export function berechneRestschuld({
  summe,
  auszahlung,
  rate,
  zins,
  stichtag = new Date(),
}: RestschuldEingabe): RestschuldErgebnis | null {
  if (!Number.isFinite(summe) || summe <= 0) return null;
  if (!Number.isFinite(rate) || rate <= 0) return null;

  const monate = monateSeit(auszahlung, stichtag);
  if (monate === null) return null;

  // Ein Auszahlungsdatum in der Zukunft ergibt keine Tilgung — dann steht die
  // volle Summe. Ohne diesen Fall lieferte die Formel eine Restschuld über
  // der Darlehenssumme.
  if (monate <= 0) {
    return { wert: summe, monate: 0, abbezahlt: false, ohneZins: zins == null };
  }

  const ohneZins = zins == null || !Number.isFinite(zins) || zins <= 0;

  let wert: number;
  if (ohneZins) {
    wert = summe - rate * monate;
  } else {
    const i = Math.pow(1 + (zins as number) / 100, 1 / 12) - 1;
    const q = Math.pow(1 + i, monate);
    wert = summe * q - (rate * (q - 1)) / i;
  }

  const abbezahlt = wert <= 0;
  return { wert: abbezahlt ? 0 : wert, monate, abbezahlt, ohneZins };
}
