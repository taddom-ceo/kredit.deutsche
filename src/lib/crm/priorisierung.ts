import type { Antrag } from "./antraege";
import { gehaltsliste, niedrigstesGehalt } from "./antraege";
import { isValidIban } from "../iban";

/**
 * Vertriebliche Priorisierung von Kreditanfragen.
 *
 * Fuenf Merkmale, jedes fuer sich auf 0 bis 100 gerechnet, danach gewichtet
 * zusammengezaehlt. Heraus kommt ein Punktwert von 0 bis 100 und daraus eine
 * Prioritaetsklasse P1 bis P5.
 *
 * ------------------------------------------------------------------
 * WOFUER DIESER WERT NICHT DA IST
 *
 * Er sagt, welcher Lead als naechstes angerufen werden sollte. Er sagt nichts
 * ueber Bonitaet, Kreditwuerdigkeit oder darueber, ob jemand einen Kredit
 * bekommt. Er darf nicht verwendet werden, um Antraege abzulehnen, Zinssaetze
 * festzulegen oder Menschen wegen geschuetzter Merkmale schlechter zu stellen.
 * Die Kreditentscheidung trifft die Bank, nicht diese Datei.
 *
 * Das gilt besonders fuer die IBAN. Sie zaehlt hier ausschliesslich als
 * Prozesssignal: Wer sie eingetragen hat, ist im Formular weiter gekommen —
 * mehr wird daraus nicht gelesen. Fuer die Rechnung genuegt ein Ja oder Nein;
 * die Nummer selbst wird weder mitgefuehrt noch protokolliert.
 *
 * ------------------------------------------------------------------
 * WARUM JEDES MERKMAL EINZELN
 *
 * Die Gewichte unten sind gesetzt, nicht gemessen. Sie sind eine begruendete
 * Annahme darueber, was einen Lead vertrieblich wertvoll macht — und Annahmen
 * gehoeren ueberpruefbar gemacht. Deshalb liegt jedes Merkmal als eigener
 * Wert vor und wird erst am Ende gewichtet:
 *
 *     merkmale.recency * 0.30 + merkmale.betrag * 0.20 + ...
 *
 * und nicht als eine Reihe von Zuschlaegen auf einen Gesamtwert. Wer spaeter
 * anhand echter Abschluesse feststellt, dass die IBAN mehr oder weniger wert
 * ist als angenommen, aendert eine Zahl in `GEWICHTE` — nicht die Logik.
 * Dasselbe fuer die Halbwertszeit der Aktualitaet, den Referenzbetrag und die
 * Stuetzstellen der Passung.
 *
 * ------------------------------------------------------------------
 * NICHT RECHENBAR IST NICHT NULL
 *
 * Ein Merkmal, das sich aus den vorhandenen Angaben nicht ermitteln laesst,
 * gibt `null` zurueck und faellt aus der Rechnung heraus; die uebrigen
 * Gewichte werden neu normiert. Das ist der Unterschied zwischen "der Kunde
 * hat nichts angegeben" und "der Kunde ist schlecht". Wer sein Einkommen
 * nicht genannt hat, bekommt keine 0 fuer die Passung, sondern gar keine
 * Passung — sonst waere die luecke im Formular das Urteil.
 *
 * Zwei Merkmale sind davon ausgenommen, und zwar mit Absicht: Die IBAN und
 * die Datenlage selbst. Dort ist "nicht da" die Auskunft, um die es geht.
 *
 * ------------------------------------------------------------------
 * SPAETER: ERWARTETER WERT
 *
 * Das Ziel hinter diesem Wert ist nicht der Wert, sondern die Frage, welcher
 * Anruf sich lohnt:
 *
 *     EV = P(Abschluss) x erwartete Provision x P(Angebot passt)
 *
 * Diese Datei bereitet das vor, ohne es vorwegzunehmen. `bewerte` liefert die
 * Merkmale einzeln (die spaeteren Eingangsgroessen eines Modells fuer
 * P(Abschluss)), `konvertiert` liefert die Zielgroesse dazu, und
 * `bewertungsProtokoll` bringt beides in die Form, in der man es mitschreiben
 * kann. Was fehlt, sind Provisionsdaten — die gibt es im System noch nicht.
 * Kommen sie, tritt der Punktwert an die Stelle von P(Abschluss) und wird
 * multipliziert; umgebaut werden muss dafuer nichts.
 */

/* ------------------------------------------------------------------ */
/* Konfiguration                                                       */
/* ------------------------------------------------------------------ */

/**
 * Die Gewichte der fuenf Merkmale. Zusammen 1.
 *
 * Gesetzt, nicht gemessen — siehe oben. Die Aktualitaet wiegt am schwersten,
 * weil sie im Vertrieb die einzige Groesse ist, die sich von selbst
 * verschlechtert: Ein Lead von heute Morgen ist morgen frueh ein anderer.
 */
export const GEWICHTE = {
  recency: 0.3,
  betrag: 0.2,
  passung: 0.2,
  absicht: 0.2,
  iban: 0.1,
} as const;

export const RECENCY = {
  /**
   * Nach acht Stunden ist die Haelfte weg.
   *
   * Acht Stunden sind ein Arbeitstag: Was heute frueh hereinkam und bis
   * Feierabend niemand angerufen hat, ist die Haelfte wert. Nach zwei Tagen
   * bleibt fast nichts — dann ist der Kunde in aller Regel woanders.
   */
  halbwertszeitStunden: 8,
} as const;

export const BETRAG = {
  /**
   * Der Betrag, ab dem es 100 Punkte gibt.
   *
   * Gerechnet wird logarithmisch: Von 5.000 auf 10.000 Euro ist der Sprung
   * gross, von 90.000 auf 95.000 kaum noch spuerbar. Das entspricht dem, was
   * ein zusaetzlicher Euro Kreditsumme fuer die Provision bedeutet — und
   * verhindert, dass ein einziger Grossantrag das ganze Brett dominiert.
   */
  referenzMax: 100_000,
} as const;

/**
 * Die Passung: Kreditwunsch im Verhaeltnis zum Jahreseinkommen.
 *
 * Stuetzstellen, dazwischen wird linear interpoliert. Unterhalb der ersten
 * gilt der erste Wert, oberhalb der letzten der letzte.
 *
 * Was hier gemessen wird, ist kein Urteil ueber den Menschen, sondern die
 * Frage, wie leicht sich fuer diese Anfrage ein Angebot finden laesst. Ein
 * Wunsch in Hoehe eines Vierteljahreseinkommens ist fast ueberall
 * unterzubringen, das Vierfache fast nirgends — das eine ist ein schneller
 * Abschluss, das andere ein langer Weg mit ungewissem Ausgang.
 */
export const PASSUNG_STUETZSTELLEN: readonly (readonly [number, number])[] = [
  [0.25, 100],
  [0.5, 95],
  [1, 85],
  [2, 65],
  [3, 40],
  [4, 20],
] as const;

/**
 * Die Signale der Datenlage.
 *
 * `verfuegbar: false` heisst: Dieses Signal gibt es im System noch nicht. Es
 * faellt dann aus Zaehler UND Nenner heraus, statt allen Leads zu fehlen —
 * ein Signal, das niemand erreichen kann, darf keinen Punktabzug bedeuten.
 * Sobald es erhoben wird, wird hier eine Zeile umgestellt und `lies`
 * geschrieben; an der Rechnung aendert sich nichts.
 */
export type AbsichtSignal = {
  name: string;
  gewicht: number;
  verfuegbar: boolean;
  lies: (antrag: Antrag) => boolean;
};

export const ABSICHT_SIGNALE: AbsichtSignal[] = [
  {
    name: "Kreditsumme angegeben",
    gewicht: 15,
    verfuegbar: true,
    lies: (a) => a.amount > 0,
  },
  {
    name: "Einkommen angegeben",
    gewicht: 15,
    verfuegbar: true,
    lies: (a) => gehaltsliste(a).some((g) => g.trim() !== ""),
  },
  {
    name: "Beschäftigung angegeben",
    gewicht: 10,
    verfuegbar: true,
    lies: (a) => a.beschaeftigungsart.trim() !== "",
  },
  {
    name: "Laufzeit angegeben",
    gewicht: 10,
    verfuegbar: true,
    lies: (a) => a.months > 0,
  },
  {
    name: "Verwendungszweck angegeben",
    gewicht: 10,
    verfuegbar: true,
    lies: (a) => Boolean(a.kreditart && a.kreditart.trim() !== ""),
  },
  {
    /**
     * Vollstaendig heisst: Die Strecke wurde nicht unterwegs verlassen.
     * Gefragt wird dieselbe Stelle, die das CRM auch sonst dafuer fragt
     * (`unvollstaendig` in antraege.ts) — zwei Definitionen von
     * "vollstaendig" waeren eine zu viel.
     */
    name: "Anfrage vollständig",
    gewicht: 20,
    verfuegbar: true,
    lies: (a) => Boolean(a.iban.trim() || a.nettoeinkommen.trim()),
  },
  {
    /**
     * Wird im System nicht erhoben. Die Angebotsseite haelt nicht fest, wer
     * sie gesehen hat, und ein Vermerk dafuer waere eine eigene Entscheidung
     * ueber Datenerhebung — nicht eine, die nebenbei in einem Scoring
     * getroffen wird.
     */
    name: "Angebote angesehen",
    gewicht: 10,
    verfuegbar: false,
    lies: () => false,
  },
  {
    /**
     * Ebenfalls nicht erhoben. Der Verlauf eines Falls kennt zwar den Wechsel
     * von "Abgebrochen" nach "Neu" — also den zweiten Anlauf —, aber der
     * steht in der Aktivitaetstabelle und nicht am Fall. Ihn hier zu lesen
     * hiesse, fuer jede Zeile der Liste eine zweite Abfrage zu fahren.
     */
    name: "Prozess erneut begonnen",
    gewicht: 10,
    verfuegbar: false,
    lies: () => false,
  },
];

/** Die Klassen, von oben nach unten geprueft. */
export const KLASSEN = [
  { klasse: "P1", ab: 85, bedeutung: "sofort bearbeiten" },
  { klasse: "P2", ab: 70, bedeutung: "sehr hohe Priorität" },
  { klasse: "P3", ab: 50, bedeutung: "normale Bearbeitung" },
  { klasse: "P4", ab: 30, bedeutung: "niedrige Priorität" },
  { klasse: "P5", ab: 0, bedeutung: "sehr niedrige Priorität" },
] as const;

export type Prioritaetsklasse = (typeof KLASSEN)[number]["klasse"];

/* ------------------------------------------------------------------ */
/* Rechenhilfen                                                        */
/* ------------------------------------------------------------------ */

export function begrenze(wert: number, min = 0, max = 100): number {
  if (!Number.isFinite(wert)) return min;
  return Math.min(Math.max(wert, min), max);
}

/**
 * Eine Zahl aus einer Angabe der Antragsstrecke.
 *
 * Die Strecke legt Betraege als Zeichenkette ab, so wie der Kunde sie getippt
 * hat: "2800", "2.800", "2800,50". Kommt nichts Brauchbares heraus, ist das
 * Ergebnis null und nicht 0 — der Unterschied entscheidet weiter unten
 * darueber, ob ein Merkmal fehlt oder schlecht ist.
 */
export function zahlAus(wert: string | null | undefined): number | null {
  if (typeof wert !== "string") return null;
  const sauber = wert.trim();
  if (sauber === "") return null;
  const zahl = Number(sauber.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(zahl) ? zahl : null;
}

/* ------------------------------------------------------------------ */
/* Die fuenf Merkmale                                                  */
/* ------------------------------------------------------------------ */

/**
 * Aktualitaet: 100 Punkte im Moment des Eingangs, danach exponentiell weniger.
 *
 * Der Zeitpunkt kommt vom Server. Die Uhr des Browsers taugt dafuer nicht —
 * sie geht falsch, steht in einer anderen Zeitzone oder laesst sich stellen,
 * und ein Lead waere dann so alt, wie sein Betrachter es haben will.
 */
export function recencyScore(
  eingang: string | Date | null | undefined,
  jetzt: Date = new Date()
): number | null {
  if (!eingang) return null;
  const zeit = eingang instanceof Date ? eingang : new Date(eingang);
  if (Number.isNaN(zeit.getTime())) return null;

  // Ein Eingang in der Zukunft ist eine falsch gestellte Uhr, kein besonders
  // frischer Lead. Das Alter wird bei null abgeschnitten, damit daraus keine
  // Punkte oberhalb von 100 werden.
  const alterStunden = Math.max(
    0,
    (jetzt.getTime() - zeit.getTime()) / 3_600_000
  );
  return begrenze(
    100 * Math.pow(2, -alterStunden / RECENCY.halbwertszeitStunden)
  );
}

/**
 * Kreditsumme, logarithmisch.
 *
 * Eine Verdopplung der Summe verdoppelt den Wert nicht. Ohne den Logarithmus
 * stuende ein einzelner Antrag ueber 90.000 Euro dauerhaft ganz oben, und
 * zwanzig Anfragen ueber 8.000 Euro daneben saehen aus wie nichts.
 */
export function betragScore(betrag: number | null | undefined): number | null {
  if (typeof betrag !== "number" || !Number.isFinite(betrag)) return null;
  // Null oder negativ ist keine Kreditsumme, sondern ein kaputter Datensatz.
  if (betrag <= 0) return null;
  return begrenze(
    (100 * Math.log(1 + betrag)) / Math.log(1 + BETRAG.referenzMax)
  );
}

/**
 * Passung: Kreditwunsch zu Jahreseinkommen.
 *
 * Ohne brauchbares Einkommen gibt es keine Passung — null, nicht 0. Ein
 * Kunde, der sein Einkommen nicht genannt hat, ist kein schlechter Kunde,
 * sondern einer, ueber den diese Frage nichts weiss.
 */
export function passungScore(
  betrag: number | null | undefined,
  monatsEinkommen: number | null | undefined
): number | null {
  if (typeof betrag !== "number" || !Number.isFinite(betrag) || betrag <= 0) {
    return null;
  }
  if (
    typeof monatsEinkommen !== "number" ||
    !Number.isFinite(monatsEinkommen) ||
    monatsEinkommen <= 0
  ) {
    return null;
  }

  const jahresEinkommen = monatsEinkommen * 12;
  const verhaeltnis = betrag / jahresEinkommen;
  return begrenze(interpoliere(verhaeltnis, PASSUNG_STUETZSTELLEN));
}

/** Linear zwischen den Stuetzstellen, ausserhalb der jeweilige Randwert. */
function interpoliere(
  x: number,
  punkte: readonly (readonly [number, number])[]
): number {
  const erster = punkte[0];
  const letzter = punkte[punkte.length - 1];
  if (x <= erster[0]) return erster[1];
  if (x >= letzter[0]) return letzter[1];

  for (let i = 1; i < punkte.length; i++) {
    const [x1, y1] = punkte[i - 1];
    const [x2, y2] = punkte[i];
    if (x <= x2) {
      const anteil = (x - x1) / (x2 - x1);
      return y1 + anteil * (y2 - y1);
    }
  }
  return letzter[1];
}

export type AbsichtErgebnis = {
  wert: number;
  erfuellt: string[];
  offen: string[];
  /** Signale, die es im System noch nicht gibt — weder Plus noch Minus. */
  nichtErhoben: string[];
};

/**
 * Datenlage und Absicht.
 *
 * Gezaehlt wird ueber die Signale, die es gibt: Der Wert ist der Anteil der
 * erreichten an den erreichbaren Punkten. Nicht erhobene Signale fallen aus
 * beidem heraus — sonst haette jeder Lead 20 Punkte Abzug fuer etwas, das
 * niemand erfuellen kann, und die Verteilung waere um denselben Betrag
 * verschoben, ohne dass sich die Reihenfolge aendert. Der Wert waere dann
 * nur noch schwerer zu lesen.
 */
export function absichtScore(antrag: Antrag): AbsichtErgebnis {
  const erfuellt: string[] = [];
  const offen: string[] = [];
  const nichtErhoben: string[] = [];
  let erreicht = 0;
  let erreichbar = 0;

  for (const signal of ABSICHT_SIGNALE) {
    if (!signal.verfuegbar) {
      nichtErhoben.push(signal.name);
      continue;
    }
    erreichbar += signal.gewicht;
    let trifftZu = false;
    try {
      trifftZu = signal.lies(antrag);
    } catch {
      // Ein Signal, das sich an unerwarteten Daten verschluckt, darf den
      // ganzen Wert nicht mitreissen. Es gilt dann als nicht erfuellt.
      trifftZu = false;
    }
    if (trifftZu) {
      erreicht += signal.gewicht;
      erfuellt.push(signal.name);
    } else {
      offen.push(signal.name);
    }
  }

  return {
    wert: erreichbar === 0 ? 0 : begrenze((100 * erreicht) / erreichbar),
    erfuellt,
    offen,
    nichtErhoben,
  };
}

/**
 * Das IBAN-Signal: 100 oder 0.
 *
 * Es geht um den Prozessschritt, nicht um die Bankverbindung. Deshalb nimmt
 * diese Funktion ein Ja/Nein entgegen und nicht die Nummer — sie kann so gar
 * nicht in eine Kennzahl, ein Protokoll oder eine Auswertung geraten.
 */
export function ibanScore(hatGueltigeIban: boolean): number {
  return hatGueltigeIban ? 100 : 0;
}

/* ------------------------------------------------------------------ */
/* Zusammenrechnen                                                     */
/* ------------------------------------------------------------------ */

export type Merkmale = {
  recency: number | null;
  betrag: number | null;
  passung: number | null;
  absicht: number;
  iban: number;
};

export type Bewertung = {
  score: number;
  klasse: Prioritaetsklasse;
  bedeutung: string;
  merkmale: Merkmale;
  absicht: AbsichtErgebnis;
  /** Merkmale, die sich aus den Angaben nicht ermitteln liessen. */
  ohneWert: (keyof Merkmale)[];
};

/**
 * Der gewichtete Mittelwert ueber die Merkmale, die einen Wert haben.
 *
 * Bei vollstaendigen Daten ist das genau die Formel aus der Vorgabe —
 * 0,30 R + 0,20 A + 0,20 F + 0,20 I + 0,10 B. Fehlt ein Merkmal, wird durch
 * die Summe der uebrigen Gewichte geteilt, statt das fehlende als 0 zu
 * zaehlen.
 */
export function gewichteterWert(merkmale: Merkmale): number {
  const teile: [number | null, number][] = [
    [merkmale.recency, GEWICHTE.recency],
    [merkmale.betrag, GEWICHTE.betrag],
    [merkmale.passung, GEWICHTE.passung],
    [merkmale.absicht, GEWICHTE.absicht],
    [merkmale.iban, GEWICHTE.iban],
  ];

  let summe = 0;
  let gewicht = 0;
  for (const [wert, g] of teile) {
    if (wert === null) continue;
    summe += wert * g;
    gewicht += g;
  }
  // Ohne ein einziges rechenbares Merkmal gibt es keinen Wert. Das kann nur
  // passieren, wenn selbst der Eingangszeitpunkt fehlt — dann steht die
  // niedrigste Klasse da, und die Fallakte sagt, woran es liegt.
  if (gewicht === 0) return 0;
  return begrenze(summe / gewicht);
}

export function klasseZu(score: number): (typeof KLASSEN)[number] {
  return KLASSEN.find((k) => score >= k.ab) ?? KLASSEN[KLASSEN.length - 1];
}

/**
 * Die Bewertung eines Falls.
 *
 * `jetzt` wird hereingereicht, damit die Aktualitaet pruefbar ist und damit
 * eine ganze Liste denselben Zeitpunkt benutzt — sonst haette die erste Zeile
 * eine andere Uhr als die letzte.
 */
export function bewerte(antrag: Antrag, jetzt: Date = new Date()): Bewertung {
  const betrag = betragScore(antrag.amount);
  const einkommen = niedrigstesGehalt(antrag);
  const absicht = absichtScore(antrag);

  const merkmale: Merkmale = {
    recency: recencyScore(antrag.eingang, jetzt),
    betrag,
    // Gerechnet wird mit dem niedrigsten der angegebenen Monate — derselben
    // Zahl, die auch in der Fallakte hervorgehoben ist. Urlaubsgeld in einem
    // Monat soll die Passung nicht schoenrechnen.
    passung: passungScore(antrag.amount, einkommen),
    absicht: absicht.wert,
    // Geprueft wird die Pruefsumme, nicht bloss "steht was drin": Eine
    // hingetippte Zahlenfolge ist kein durchgefuehrter Prozessschritt.
    iban: ibanScore(isValidIban(antrag.iban ?? "")),
  };

  const score = gewichteterWert(merkmale);
  const klasse = klasseZu(score);

  return {
    score,
    klasse: klasse.klasse,
    bedeutung: klasse.bedeutung,
    merkmale,
    absicht,
    ohneWert: (Object.keys(merkmale) as (keyof Merkmale)[]).filter(
      (k) => merkmale[k] === null
    ),
  };
}

/** Auf eine Nachkommastelle — fuer die Anzeige, nicht fuer die Rechnung. */
export function zeigeWert(wert: number | null): string {
  return wert === null ? "—" : wert.toFixed(1);
}

/* ------------------------------------------------------------------ */
/* Fuer die spaetere Auswertung                                        */
/* ------------------------------------------------------------------ */

/**
 * Die Zielgroesse: Ist aus dem Lead ein Abschluss geworden?
 *
 * "Auszahlung" ist der einzige Ordner, in dem das eindeutig ist. "Hat sich
 * erledigt" ist ausdruecklich das Gegenteil — abgeschlossen ohne Abschluss —,
 * und alles andere ist noch offen. Wer spaeter misst, welches Gewicht welches
 * Merkmal verdient, braucht genau diese Unterscheidung.
 */
export function konvertiert(antrag: Antrag): boolean {
  return antrag.status === "ausgezahlt";
}

/**
 * Ein Satz Zahlen zu einem Lead, so wie man ihn mitschreiben wuerde.
 *
 * Bewusst ohne Namen, Adresse, E-Mail oder IBAN: Fuer die Frage, welches
 * Merkmal wie viel wert ist, braucht es die Merkmale und das Ergebnis — nicht
 * die Person. Die Kennung genuegt, um beides spaeter wieder zusammenzufuehren.
 *
 * Geschrieben wird hier noch nichts. Das CRM hat als Protokoll den Verlauf je
 * Fall, und dort gehoert eine Kennzahl nicht hinein, die sich stuendlich von
 * selbst aendert. Sobald es eine Ablage fuer Auswertungen gibt, ist dies die
 * Zeile, die hineingeschrieben wird.
 */
export function bewertungsProtokoll(
  antrag: Antrag,
  bewertung: Bewertung,
  jetzt: Date = new Date()
) {
  return {
    lead_id: antrag.id,
    score_timestamp: jetzt.toISOString(),
    recency_score: bewertung.merkmale.recency,
    amount_score: bewertung.merkmale.betrag,
    financial_fit_score: bewertung.merkmale.passung,
    intent_score: bewertung.merkmale.absicht,
    iban_score: bewertung.merkmale.iban,
    base_priority_score: bewertung.score,
    priority_class: bewertung.klasse,
    converted: konvertiert(antrag),
  };
}
