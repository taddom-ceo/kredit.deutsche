/**
 * Die Stationen, die ein Fall im CRM durchlaeuft.
 *
 * Steht bewusst als eigene Liste da und nicht als Aufzaehlung mitten im
 * Datenbankschema: Die Reihenfolge ist der Vertriebsprozess selbst. Sie
 * bestimmt die Spalten der Pipeline-Ansicht, die Auswahl beim Statuswechsel
 * und spaeter die Loeschfristen — an drei Stellen dieselbe Liste zu pflegen
 * ist genau die Art Fehler, die still auseinanderlaeuft.
 *
 * Die Kennung `id` ist der Wert, der gespeichert wird. Sie darf sich nach dem
 * ersten echten Fall nicht mehr aendern; der angezeigte Name schon.
 */

export type StatusId =
  | "abbrecher"
  | "neu"
  | "kontaktiert"
  | "unterlagen_angefordert"
  | "unterlagen_vollstaendig"
  | "bei_bank"
  | "zusage"
  | "ausgezahlt"
  | "abgelehnt"
  | "abgebrochen";

export type Station = {
  id: StatusId;
  name: string;
  /** Was an dieser Station zu tun ist — steht als Hilfe unter der Spalte. */
  beschreibung: string;
  /**
   * Endstationen tauchen nicht als Spalte der Pipeline auf, sondern in der
   * Ablage darunter. Sonst waeren die beiden haeufigsten Spalten die, in
   * denen nichts mehr passiert.
   */
  ende?: boolean;
};

export const STATIONEN: Station[] = [
  {
    id: "abbrecher",
    name: "Abbrecher",
    beschreibung:
      "Strecke bis zu den persönlichen Daten ausgefüllt, dann verlassen. Kontakt liegt vor.",
  },
  {
    id: "neu",
    name: "Neu",
    beschreibung: "Antrag ist eingegangen, noch niemand hat ihn angefasst.",
  },
  {
    id: "kontaktiert",
    name: "Kontaktiert",
    beschreibung: "Erstkontakt steht, Bedarf ist besprochen.",
  },
  {
    id: "unterlagen_angefordert",
    name: "Unterlagen angefordert",
    beschreibung: "Nachweise sind angefragt, wir warten auf den Kunden.",
  },
  {
    id: "unterlagen_vollstaendig",
    name: "Unterlagen vollständig",
    beschreibung: "Alles da, der Fall kann eingereicht werden.",
  },
  {
    id: "bei_bank",
    name: "Bei Bank",
    beschreibung: "Eingereicht, Entscheidung der Bank steht aus.",
  },
  {
    id: "zusage",
    name: "Zusage",
    beschreibung: "Bank hat zugesagt, Auszahlung laeuft an.",
  },
  {
    id: "ausgezahlt",
    name: "Ausgezahlt",
    beschreibung: "Geld ist beim Kunden, Provision fällig.",
    ende: true,
  },
  {
    id: "abgelehnt",
    name: "Abgelehnt",
    beschreibung: "Bank hat abgelehnt — mit Grund festhalten.",
    ende: true,
  },
  {
    id: "abgebrochen",
    name: "Abgebrochen",
    beschreibung: "Kunde springt ab oder meldet sich nicht mehr.",
    ende: true,
  },
];

/** Die Spalten der Pipeline — alles bis auf die Endstationen. */
export const PIPELINE = STATIONEN.filter((s) => !s.ende);

/** Die Endstationen. */
export const ENDSTATIONEN = STATIONEN.filter((s) => s.ende);

export function findeStation(id: string): Station | undefined {
  return STATIONEN.find((s) => s.id === id);
}
