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
  | "erledigt"
  | "ausgezahlt"
  /* Kein Ordner der Pipeline, sondern der Weg hinaus — siehe unten. */
  | "papierkorb"
  /* Stillgelegt — siehe unten. */
  | "kontaktiert"
  | "unterlagen_angefordert"
  | "unterlagen_vollstaendig"
  | "bei_bank"
  | "zusage"
  | "abgebrochen";

/**
 * Die Farbfamilie eines Ordners. Bei sechzehn Spalten nebeneinander ist das
 * kein Schmuck: Es ist der Unterschied zwischen "ich sehe, wo etwas liegt" und
 * "ich lese sechzehn Ueberschriften".
 */
export type Ton = "neu" | "arbeit" | "warten" | "erfolg" | "weg" | "alt";

/**
 * Die Klassen je Ton, ausgeschrieben. Tailwind liest den Quelltext nach
 * fertigen Klassennamen ab — zusammengesetzte wie `bg-${farbe}-400` faende es
 * nicht und liesse sie beim Bauen einfach weg.
 *
 * `zeichen` faerbt das Symbol ueber der Spalte, `schild` die Plakette im
 * Fall selbst. Seit die Spalten nur noch Symbole tragen, ist die Farbe kein
 * Beiwerk mehr, sondern die zweite Unterscheidung neben der Form: Wer die
 * sechzehn Zeichen noch nicht auswendig kennt, sieht wenigstens sofort, ob
 * ein Ordner Arbeit, Warten oder Ende bedeutet.
 */
export const TON_KLASSEN: Record<Ton, { zeichen: string; schild: string }> = {
  neu: {
    zeichen: "text-accent",
    schild: "border-accent/40 bg-accent/10 text-accent",
  },
  arbeit: {
    zeichen: "text-sky-300",
    schild: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  },
  warten: {
    zeichen: "text-amber-300",
    schild: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  },
  erfolg: {
    zeichen: "text-emerald-300",
    schild: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  },
  weg: {
    zeichen: "text-red-300",
    schild: "border-red-400/40 bg-red-400/10 text-red-300",
  },
  alt: {
    zeichen: "text-muted",
    schild: "border-border bg-surface-2 text-muted",
  },
};

export type Station = {
  id: StatusId;
  name: string;
  /**
   * Ueberordner, unter dem dieser Ordner steht.
   *
   * Das Brett bleibt flach — sechzehn Spalten nebeneinander vertragen keine
   * zweite Ebene. Ueberall dort, wo die Ordner als Liste erscheinen (die
   * Auswahl an der Karte, die am Fall, der Filter ueber der Liste), stehen
   * die Ordner einer Gruppe aber unter ihrer Ueberschrift beieinander. Dafuer
   * gibt es in HTML `optgroup`, und das ist genau dieser Fall: ein Ordner mit
   * Unterordnern, ohne dass etwas nachgebaut werden muesste.
   */
  gruppe?: string;
  /**
   * Wofuer der Ordner da ist. Steht im Brett dort, wo sonst die Karten waeren
   * — eine leere Spalte erklaert sich damit selbst, eine volle braucht keine
   * Erklaerung mehr.
   */
  beschreibung: string;
  ton: Ton;
};

/** Der Ueberordner der beiden Endstationen. Steht hier, damit ihn niemand
    an zwei Stellen tippt. */
export const ERLEDIGT = "Erledigt";

/**
 * Die Pipeline, wie sie im Vertrieb gefahren wird.
 *
 * Alle sechzehn sind gleichberechtigte Ordner: Es gibt keine Endstation, in
 * die ein Fall faellt und aus der er nicht mehr herauskommt. "Ablehnung" und
 * "Abgebrochen" sind Ablagen, keine Loeschungen — ein abgelehnter Fall wandert
 * spaeter nach "Recall", ein abgebrochener nach "Rückruf", und genau dafuer
 * laesst sich jede Karte in jede Spalte ziehen. Das gilt auch fuer "Erledigt":
 * Ein Kunde, dessen Auszahlung durch ist, kann in einem Jahr wieder ein Thema
 * sein.
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
  /**
   * "Erledigt" — zwei Ordner, ein Ueberordner.
   *
   * Ein Fall endet auf zweierlei Weise, und die beiden sind nicht dasselbe:
   * Entweder ist der Kredit ausgezahlt, oder die Sache hat sich anders
   * erledigt — der Kunde hat woanders abgeschlossen, braucht das Geld nicht
   * mehr, meldet sich nicht wieder. Beides ist abgeschlossen, aber nur eines
   * davon ist ein Abschluss. In einem gemeinsamen Ordner waere die Frage
   * "wie viele Faelle sind dieses Jahr durchgegangen" nicht mehr zu
   * beantworten.
   *
   * "Auszahlung" traegt die alte Kennung `ausgezahlt` weiter, statt eine neue
   * danebenzustellen: Unter ihr liegen moeglicherweise noch Faelle aus der
   * frueheren Aufteilung, und die bedeuten genau dasselbe. Sie landen damit
   * im neuen Ordner, statt in einer stillgelegten Spalte zu warten — und es
   * gibt keine zwei Kennungen, die dasselbe heissen.
   */
  {
    id: "ausgezahlt",
    name: "Auszahlung",
    beschreibung: "Der Kredit ist ausgezahlt — der Fall ist durch.",
    ton: "erfolg",
    gruppe: ERLEDIGT,
  },
  {
    id: "erledigt",
    name: "Hat sich erledigt",
    beschreibung:
      "Abgeschlossen ohne Auszahlung — anderswo unterschrieben, kein Bedarf mehr, nicht mehr erreichbar.",
    ton: "weg",
    gruppe: ERLEDIGT,
  },
];

/**
 * Die Ordner, die das Brett zunaechst zusammenklappt.
 *
 * Fuenfzehn Spalten nebeneinander lassen jeder rund 120 Pixel — genug fuer
 * eine Karte, aber nicht genug, damit sie etwas zeigt. Zusammengeklappt sind
 * deshalb die, an denen nicht taeglich gearbeitet wird: die Tageszaehlung ab
 * Tag 2, die beiden Wartezustaende und der Papierkorb. Was bleibt, ist die
 * Strecke, die ein Fall an einem Arbeitstag durchlaeuft — von "Neu" bis "In
 * Bearbeitung".
 *
 * Zugeklappt heisst nicht verschwunden: Die Zahl der Faelle darin steht am
 * Knopf, und liegt der aufgeschlagene Ordner darunter, klappt das Brett von
 * selbst auf. Ein Ordner, der Faelle schluckt, ohne es zu sagen, waere
 * schlimmer als eine Spalte zu viel. Und wer eine Karte auf den Knopf zieht,
 * klappt damit auf, ohne die Karte loszulassen.
 */
export const SPAETE_ORDNER: StatusId[] = [
  "tag2",
  "tag3",
  "tag4plus",
  "on_hold",
  "watch",
  "ausgezahlt",
  "erledigt",
  "papierkorb",
];

/**
 * Der Papierkorb.
 *
 * Kein Ordner der Pipeline, sondern der Weg hinaus — deshalb steht er nicht in
 * STATIONEN, sondern hier für sich. Der Unterschied ist nicht kosmetisch: Wer
 * hier liegt, zählt nicht mehr mit. Er fehlt in der Liste, in der Gesamtzahl
 * und im Export, und er taucht erst wieder auf, wenn man den Papierkorb
 * ausdrücklich öffnet. Stünde er weiter zwischen den anderen, wäre "gelöscht"
 * nur ein anderes Wort für "woanders einsortiert".
 *
 * Warum überhaupt eine Zwischenstufe: Ein Fall ist eine Person mit
 * Telefonnummer und Bankverbindung. Ein Fehlgriff beim Aufräumen ist damit
 * nicht ärgerlich, sondern unwiederbringlich — der Kunde ist weg, und niemand
 * weiß mehr, dass es ihn gab. Der Papierkorb kostet einen zweiten Klick und
 * nimmt genau diesen Fehler zurück.
 *
 * Endgültig gelöscht wird trotzdem, und zwar nur von hier aus. Ein
 * Löschbegehren nach Art. 17 DSGVO lässt sich damit weiterhin in zwei
 * Schritten erfüllen; ein Papierkorb, aus dem nichts mehr herauskommt, wäre
 * dagegen keine Sicherheit, sondern eine Lücke.
 */
export const PAPIERKORB: Station = {
  id: "papierkorb",
  name: "Papierkorb",
  beschreibung:
    "Zum Löschen vorgemerkt. Herausziehen holt den Fall zurück, endgültig gelöscht wird nur von hier aus.",
  ton: "weg",
};

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
    id: "abgebrochen",
    name: "Abgebrochen (früher)",
    beschreibung: "Aus der früheren Aufteilung — bitte weiterschieben.",
    ton: "alt",
  },
];

const ALLE = [...STATIONEN, PAPIERKORB, ...STILLGELEGTE];

/**
 * Ordner fuer ein Auswahlfeld, Gruppen zusammengefasst.
 *
 * Die Reihenfolge bleibt, wie sie hereinkommt; nur unmittelbar aufeinander
 * folgende Ordner derselben Gruppe werden gebuendelt. Damit steht in der
 * Auswahl "Erledigt" mit seinen beiden Unterordnern darunter, und alles
 * andere steht wie bisher fuer sich.
 */
export function nachGruppen<T extends { gruppe?: string }>(
  ordner: T[]
): { gruppe: string | null; ordner: T[] }[] {
  const buendel: { gruppe: string | null; ordner: T[] }[] = [];
  for (const eintrag of ordner) {
    const letzte = buendel[buendel.length - 1];
    if (letzte && letzte.gruppe === (eintrag.gruppe ?? null)) {
      letzte.ordner.push(eintrag);
    } else {
      buendel.push({ gruppe: eintrag.gruppe ?? null, ordner: [eintrag] });
    }
  }
  return buendel;
}

export function findeStation(id: string): Station | undefined {
  return ALLE.find((s) => s.id === id);
}

/**
 * Der Platz eines Ordners in der Pipeline.
 *
 * Die Reihenfolge der Ordner ist keine alphabetische und keine zufaellige: Sie
 * ist der Weg, den ein Fall nimmt — von "Neu" ueber die Bearbeitung bis zur
 * Auszahlung, danach der Papierkorb. Wer die Liste nach dem Ordner sortiert,
 * meint diese Reihenfolge und nicht die Anfangsbuchstaben; "Abgebrochen" vor
 * "Neu" waere keine Auskunft ueber irgendetwas.
 *
 * Der Papierkorb steht hinter allen Stationen, unbekannte Kennungen dahinter.
 * Beide sind kein Schritt im Vertrieb und haben deshalb am Anfang nichts
 * verloren.
 */
export function rangDerStation(id: string): number {
  const platz = STATIONEN.findIndex((s) => s.id === id);
  if (platz >= 0) return platz;
  if (id === PAPIERKORB.id) return STATIONEN.length;
  return STATIONEN.length + 1;
}

/** Liegt der Fall im Papierkorb? An einer Stelle, damit die Kennung nur hier steht. */
export function imPapierkorb(status: string): boolean {
  return status === PAPIERKORB.id;
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
