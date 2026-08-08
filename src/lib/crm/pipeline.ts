/**
 * Die Ordner, in denen ein Fall im CRM liegt.
 *
 * Steht bewusst als eigene Liste da und nicht als Aufzaehlung mitten im
 * Datenbankschema: Die Reihenfolge ist der Vertriebsprozess selbst. Sie
 * bestimmt die Spalten des Bretts, die Auswahl beim Statuswechsel, die
 * Beschriftung im Verlauf und im Export — an vier Stellen dieselbe Liste zu
 * pflegen ist genau die Art Fehler, die still auseinanderlaeuft.
 *
 * Die Kennung `id` ist der Wert, der in der Datenbank steht. Sie darf sich
 * nach dem ersten echten Fall nicht mehr aendern; der angezeigte Name schon.
 * Genau davon macht diese Liste Gebrauch: "Abgebrochen" heisst innen weiter
 * `abbrecher`, weil unter dieser Kennung schon Faelle liegen und weil die
 * Antragsstrecke sie schreibt, wenn jemand mittendrin aussteigt.
 */

export type StatusId =
  /* Die Ordner der Pipeline, in der Reihenfolge der Spalten. */
  | "neu"
  | "rueckruf"
  | "abbrecher"
  | "recall"
  | "abgelehnt"
  | "todo"
  | "rsv_aktivierung"
  | "after_sale"
  | "in_bearbeitung"
  | "tag2"
  | "tag3"
  | "tag4plus"
  | "on_hold"
  | "watch"
  /* Stillgelegt — siehe unten. */
  | "kontaktiert"
  | "unterlagen_angefordert"
  | "unterlagen_vollstaendig"
  | "bei_bank"
  | "zusage"
  | "ausgezahlt"
  | "abgebrochen";

/**
 * Die Farbfamilie eines Ordners. Bei vierzehn Spalten nebeneinander ist das
 * kein Schmuck: Es ist der Unterschied zwischen "ich sehe, wo etwas liegt" und
 * "ich lese vierzehn Ueberschriften".
 */
export type Ton = "neu" | "arbeit" | "warten" | "erfolg" | "weg" | "alt";

/**
 * Die Klassen je Ton, ausgeschrieben. Tailwind liest den Quelltext nach
 * fertigen Klassennamen ab — zusammengesetzte wie `bg-${farbe}-400` faende es
 * nicht und liesse sie beim Bauen einfach weg.
 */
export const TON_KLASSEN: Record<Ton, { punkt: string; schild: string }> = {
  neu: {
    punkt: "bg-accent",
    schild: "border-accent/40 bg-accent/10 text-accent",
  },
  arbeit: {
    punkt: "bg-sky-400",
    schild: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  warten: {
    punkt: "bg-amber-400",
    schild: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  },
  erfolg: {
    punkt: "bg-emerald-400",
    schild: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  },
  weg: {
    punkt: "bg-red-400",
    schild: "border-red-400/40 bg-red-400/10 text-red-300",
  },
  alt: {
    punkt: "bg-muted",
    schild: "border-border bg-surface-2 text-muted",
  },
};

export type Station = {
  id: StatusId;
  name: string;
  /**
   * Wofuer der Ordner da ist. Steht im Brett dort, wo sonst die Karten waeren
   * — eine leere Spalte erklaert sich damit selbst, eine volle braucht keine
   * Erklaerung mehr.
   */
  beschreibung: string;
  ton: Ton;
};

/**
 * Die Pipeline, wie sie im Vertrieb gefahren wird.
 *
 * Alle vierzehn sind gleichberechtigte Ordner: Es gibt keine Endstation, in
 * die ein Fall faellt und aus der er nicht mehr herauskommt. "Ablehnung" und
 * "Abgebrochen" sind Ablagen, keine Loeschungen — ein abgelehnter Fall wandert
 * spaeter nach "Recall", ein abgebrochener nach "Rückruf", und genau dafuer
 * laesst sich jede Karte in jede Spalte ziehen.
 */
export const STATIONEN: Station[] = [
  {
    id: "neu",
    name: "Neu",
    beschreibung: "Antrag ist eingegangen, noch niemand hat ihn angefasst.",
    ton: "neu",
  },
  {
    id: "rueckruf",
    name: "Rückruf",
    beschreibung: "Kunde erwartet einen Rückruf — Zeitpunkt als Wiedervorlage.",
    ton: "arbeit",
  },
  {
    id: "abbrecher",
    name: "Abgebrochen",
    beschreibung:
      "Strecke verlassen oder Kunde springt ab. Der Kontakt liegt vor.",
    ton: "weg",
  },
  {
    id: "recall",
    name: "Recall",
    beschreibung: "Alter Fall, der noch einmal angegangen wird.",
    ton: "arbeit",
  },
  {
    id: "abgelehnt",
    name: "Ablehnung",
    beschreibung: "Abgelehnt — den Grund als Notiz festhalten.",
    ton: "weg",
  },
  {
    id: "todo",
    name: "ToDo",
    beschreibung: "Etwas ist zu erledigen, bevor es weitergeht.",
    ton: "arbeit",
  },
  {
    id: "rsv_aktivierung",
    name: "RSV Aktivierung",
    beschreibung: "Restschuldversicherung wird aufgesetzt.",
    ton: "erfolg",
  },
  {
    id: "after_sale",
    name: "After Sale",
    beschreibung: "Abgeschlossen — Betreuung nach dem Vertrag.",
    ton: "erfolg",
  },
  {
    id: "in_bearbeitung",
    name: "In Bearbeitung",
    beschreibung: "Liegt gerade auf dem Tisch.",
    ton: "arbeit",
  },
  {
    id: "tag2",
    name: "Tag 2",
    beschreibung: "Zweiter Tag im Nachfassen.",
    ton: "arbeit",
  },
  {
    id: "tag3",
    name: "Tag 3",
    beschreibung: "Dritter Tag im Nachfassen.",
    ton: "arbeit",
  },
  {
    id: "tag4plus",
    name: "Tag 4+",
    beschreibung: "Vierter Tag und danach.",
    ton: "arbeit",
  },
  {
    id: "on_hold",
    name: "On Hold",
    beschreibung: "Liegt bewusst still — auf Wunsch des Kunden oder auf Zuruf.",
    ton: "warten",
  },
  {
    id: "watch",
    name: "Watch",
    beschreibung: "Nichts zu tun, aber nicht aus den Augen verlieren.",
    ton: "warten",
  },
];

/**
 * Ordner aus der frueheren Aufteilung.
 *
 * Sie bekommen keine eigene Spalte mehr, bleiben aber auffindbar — aus zwei
 * Gruenden, die beide zaehlen. Erstens steht im Verlauf jedes Falls, aus
 * welcher Station er gekommen ist; ohne diese Liste stuende dort ab jetzt
 * `unterlagen_angefordert` statt "Unterlagen angefordert". Zweitens koennen in
 * der Datenbank noch Faelle darauf stehen. Das Brett holt sie als eigene
 * Spalte dazu, solange welche da sind, und laesst sie verschwinden, sobald der
 * letzte herausgezogen ist. Eine Station lautlos zu streichen hiesse, die
 * Faelle darin verschwinden zu lassen.
 */
export const STILLGELEGTE: Station[] = [
  {
    id: "kontaktiert",
    name: "Kontaktiert",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
  {
    id: "unterlagen_angefordert",
    name: "Unterlagen angefordert",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
  {
    id: "unterlagen_vollstaendig",
    name: "Unterlagen vollständig",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
  {
    id: "bei_bank",
    name: "Bei Bank",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
  {
    id: "zusage",
    name: "Zusage",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
  {
    id: "ausgezahlt",
    name: "Ausgezahlt",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
  {
    id: "abgebrochen",
    name: "Abgebrochen (früher)",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
];

const ALLE = [...STATIONEN, ...STILLGELEGTE];

export function findeStation(id: string): Station | undefined {
  return ALLE.find((s) => s.id === id);
}

/**
 * Die Station zu einer Kennung, notfalls erfunden.
 *
 * Fuer die Anzeige. Steht in der Datenbank ein Wert, den niemand mehr kennt —
 * ein Tippfehler von Hand, ein Rest aus einer aelteren Fassung —, bekommt er
 * hier trotzdem einen Ordner, statt dass der Fall aus dem Brett faellt. Wer
 * ihn sieht, kann ihn wegziehen; wer ihn nie sieht, kann es nicht.
 */
export function stationOderErsatz(id: string): Station {
  return (
    findeStation(id) ?? {
      id: id as StatusId,
      name: id || "Ohne Station",
      beschreibung: "Unbekannte Kennung aus der Datenbank.",
      ton: "alt",
    }
  );
}
