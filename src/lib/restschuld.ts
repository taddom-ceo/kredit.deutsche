/**
 * Schätzt die Restschuld eines laufenden Annuitätendarlehens zum heutigen Tag.
 *
 * Grundlage sind die Angaben, die ein Kunde ohne Unterlagen zur Hand hat:
 * Kreditbetrag, Auszahlungsdatum, monatliche Rate und — je nachdem, was er
 * weiß — die Gesamtlaufzeit oder der effektive Jahreszins.
 *
 * Gerechnet wird als Annuitätendarlehen: Jede Rate deckt zuerst die
 * aufgelaufenen Zinsen, nur der Rest tilgt. Der Monatszins wird wie überall
 * auf der Seite aus dem effektiven Jahreszins gezogen —
 * i = (1 + p)^(1/12) − 1, nicht p/12.
 *
 * Ist der Zinssatz nicht bekannt, liefert die Laufzeit ihn mit: Betrag, Rate
 * und Laufzeit legen ihn eindeutig fest.
 */

/**
 * Über diesem effektiven Jahreszins gilt eine Angabe als unplausibel. Wer
 * 10.000 € aufnimmt und 72 Monate lang 300 € zahlt, käme rechnerisch auf über
 * 34 % — das ist fast immer ein Vertipper in einer der drei Zahlen. Statt eine
 * Zahl auszuweisen, die niemand glauben kann, wird bei dieser Grenze gekappt
 * und darauf hingewiesen.
 */
export const ZINS_OBERGRENZE = 20;

export type RestschuldEingabe = {
  /** Ursprünglicher Kreditbetrag in Euro. */
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
  /** Seit der Auszahlung vergangene, auf die Laufzeit begrenzte Monate. */
  monate: number;
  /** Effektiver Jahreszins in Prozent, mit dem gerechnet wurde. */
  zinsProzent: number;
  /** Der Zinssatz stand nicht in der Eingabe, sondern kam aus der Laufzeit. */
  hergeleitet: boolean;
  /** Der hergeleitete Zins lag über der Grenze und wurde darauf gekappt. */
  gekappt: boolean;
  /** Rechnerisch bereits vollständig zurückgeführt. */
  abbezahlt: boolean;
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

/**
 * Sucht den Monatszins, bei dem sich der Betrag mit der genannten Rate in
 * genau der genannten Laufzeit tilgt.
 *
 * Die Annuitätenformel lässt sich nach dem Zins nicht auflösen, wohl aber
 * einschachteln: Der Barwert fällt streng mit steigendem Zins, deshalb findet
 * eine Intervallhalbierung die Lösung sicher.
 *
 * Ohne Ergebnis bleibt es, wenn die Raten zusammen den Betrag nicht
 * übersteigen — dann trägt der Kredit überhaupt keine Zinsen.
 */
function leiteMonatszinsAb(
  summe: number,
  rate: number,
  laufzeit: number
): number | null {
  if (laufzeit <= 0 || rate * laufzeit <= summe) return null;

  const barwert = (i: number) => (rate * (1 - Math.pow(1 + i, -laufzeit))) / i;

  let unten = 1e-9;
  let oben = 1; // 100 % im Monat — darüber liegt nichts Denkbares
  if (barwert(oben) > summe) return null;

  for (let n = 0; n < 90; n++) {
    const mitte = (unten + oben) / 2;
    if (barwert(mitte) > summe) unten = mitte;
    else oben = mitte;
  }
  return (unten + oben) / 2;
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

  const hatLaufzeit =
    laufzeit != null && Number.isFinite(laufzeit) && laufzeit > 0;

  // Nach dem Ende der Laufzeit ist nichts mehr offen. Ohne diese Grenze liefe
  // die Rechnung weiter und ergäbe ein Guthaben statt einer Restschuld.
  const monate = hatLaufzeit
    ? Math.min(vergangen, laufzeit as number)
    : vergangen;

  // Der angegebene Zinssatz hat Vorrang; sonst kommt er aus der Laufzeit.
  let i: number | null = null;
  let hergeleitet = false;
  let gekappt = false;

  if (zins != null && Number.isFinite(zins) && zins > 0) {
    i = Math.pow(1 + zins / 100, 1 / 12) - 1;
  } else if (hatLaufzeit) {
    const abgeleitet = leiteMonatszinsAb(summe, rate, laufzeit as number);
    if (abgeleitet !== null) {
      hergeleitet = true;
      const jahr = (Math.pow(1 + abgeleitet, 12) - 1) * 100;
      if (jahr > ZINS_OBERGRENZE) {
        gekappt = true;
        i = Math.pow(1 + ZINS_OBERGRENZE / 100, 1 / 12) - 1;
      } else {
        i = abgeleitet;
      }
    }
  }

  // Ohne jeden Anhaltspunkt für den Zins lässt sich keine Restschuld schätzen,
  // die diesen Namen verdient. Die frühere lineare Näherung fiel um über einen
  // Tausender zu niedrig aus und wäre als Zahl im Feld irreführend gewesen.
  if (i === null) return null;

  // Ein Auszahlungsdatum in der Zukunft ergibt keine Tilgung.
  const q = Math.pow(1 + i, monate);
  const wert = monate <= 0 ? summe : summe * q - (rate * (q - 1)) / i;

  return {
    wert: wert <= 0 ? 0 : wert,
    monate: Math.max(monate, 0),
    zinsProzent: (Math.pow(1 + i, 12) - 1) * 100,
    hergeleitet,
    gekappt,
    abbezahlt: wert <= 0,
  };
}
