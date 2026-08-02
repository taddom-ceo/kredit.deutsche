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
  /** Gesamtlaufzeit in Monaten. Unbekannt, wenn nicht angegeben. */
  laufzeit?: number;
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
  /** Der Zinssatz war nicht angegeben, liess sich aber aus der Laufzeit
      herleiten — die Schaetzung ist dann so genau wie mit Angabe. */
  zinsHergeleitet: boolean;
};

/**
 * Sucht den Monatszins, bei dem sich die Summe mit der genannten Rate in
 * genau der genannten Laufzeit tilgt.
 *
 * Die Annuitaetenformel laesst sich nach dem Zins nicht aufloesen, wohl aber
 * einschachteln: Der Barwert faellt streng mit steigendem Zins, deshalb
 * findet eine Intervallhalbierung die Loesung sicher.
 *
 * Ohne Ergebnis bleibt es, wenn die Raten zusammen die Summe nicht
 * uebersteigen — dann traegt der Kredit ueberhaupt keine Zinsen.
 */
function leiteMonatszinsAb(
  summe: number,
  rate: number,
  laufzeit: number
): number | null {
  if (laufzeit <= 0) return null;
  if (rate * laufzeit <= summe) return null;

  const barwert = (i: number) => (rate * (1 - Math.pow(1 + i, -laufzeit))) / i;

  let unten = 1e-9;
  let oben = 0.5; // 0,5 % im Monat waeren ueber 70 % im Jahr — daraufkommt nichts
  if (barwert(oben) > summe) return null;

  for (let n = 0; n < 80; n++) {
    const mitte = (unten + oben) / 2;
    if (barwert(mitte) > summe) unten = mitte;
    else oben = mitte;
  }
  return (unten + oben) / 2;
}

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
  laufzeit,
  stichtag = new Date(),
}: RestschuldEingabe): RestschuldErgebnis | null {
  if (!Number.isFinite(summe) || summe <= 0) return null;
  if (!Number.isFinite(rate) || rate <= 0) return null;

  const vergangen = monateSeit(auszahlung, stichtag);
  if (vergangen === null) return null;

  // Nach dem Ende der Laufzeit ist nichts mehr offen. Ohne diese Grenze liefe
  // die Rechnung weiter und ergaebe ein Guthaben statt einer Restschuld.
  const monate =
    laufzeit != null && Number.isFinite(laufzeit) && laufzeit > 0
      ? Math.min(vergangen, laufzeit)
      : vergangen;

  // Ein Auszahlungsdatum in der Zukunft ergibt keine Tilgung — dann steht die
  // volle Summe. Ohne diesen Fall lieferte die Formel eine Restschuld über
  // der Darlehenssumme.
  if (monate <= 0) {
    return {
      wert: summe,
      monate: 0,
      abbezahlt: false,
      ohneZins: true,
      zinsHergeleitet: false,
    };
  }

  // Der angegebene Zinssatz hat Vorrang. Fehlt er, liefert die Laufzeit ihn
  // mit: Summe, Rate und Laufzeit legen ihn eindeutig fest.
  let i: number | null = null;
  let zinsHergeleitet = false;
  if (zins != null && Number.isFinite(zins) && zins > 0) {
    i = Math.pow(1 + zins / 100, 1 / 12) - 1;
  } else if (laufzeit != null && Number.isFinite(laufzeit) && laufzeit > 0) {
    i = leiteMonatszinsAb(summe, rate, laufzeit);
    zinsHergeleitet = i !== null;
  }

  let wert: number;
  if (i === null) {
    wert = summe - rate * monate;
  } else {
    const q = Math.pow(1 + i, monate);
    wert = summe * q - (rate * (q - 1)) / i;
  }

  const abbezahlt = wert <= 0;
  return {
    wert: abbezahlt ? 0 : wert,
    monate,
    abbezahlt,
    ohneZins: i === null,
    zinsHergeleitet,
  };
}
