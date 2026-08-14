import { TOTAL_STEPS, type WizardData } from "./wizard-context";

/**
 * Den Antrag an den Server schicken — einmal als Zwischenstand waehrend der
 * Strecke, einmal fertig am Ende.
 *
 * Warum ueberhaupt zwischendurch: Die meisten Menschen brechen eine
 * achtschrittige Strecke irgendwo ab. Wer bis zu den persoenlichen Daten
 * gekommen ist, hat aber schon gesagt, was er will und wie man ihn erreicht —
 * dieser Kontakt ist zu wertvoll, um ihn im Browser verfallen zu lassen. Der
 * Fall steht dann als "Abbrecher" im CRM und kann angerufen werden.
 */

/**
 * Nur die Angaben des Antrags, nicht der ganze Zustand: `step` und `devModus`
 * gehoeren zur Bedienung der Strecke und haben im Fall nichts verloren.
 *
 * Eine Ausnahme: `maxStep` geht als `erreichterSchritt` mit. Ohne ihn weiss
 * das CRM, dass jemand abgebrochen hat, aber nicht wo — und "wir verlieren
 * Leute" ist keine Auskunft, mit der sich etwas anfangen laesst.
 */
export function antragNutzlast(data: WizardData) {
  return {
    kreditart: data.kreditart,
    amount: data.amount,
    months: data.months,
    personCount: data.personCount,
    vorname: data.vorname,
    zweiterVorname: data.zweiterVorname,
    nachname: data.nachname,
    geburtsdatum: data.geburtsdatum,
    email: data.email,
    telefonVorwahl: data.telefonVorwahl,
    telefon: data.telefon,
    strasse: data.strasse,
    hausnummer: data.hausnummer,
    plz: data.plz,
    ort: data.ort,
    beschaeftigungsart: data.beschaeftigungsart,
    arbeitgeber: data.arbeitgeber,
    beschaeftigtSeit: data.beschaeftigtSeit,
    nettoeinkommen: data.nettoeinkommen,
    gehaelter: data.gehaelter,
    mieteinnahmen: data.mieteinnahmen,
    mieteinnahmenBetrag: data.mieteinnahmenBetrag,
    wohnnebenkosten: data.wohnnebenkosten,
    krankenversicherung: data.krankenversicherung,
    unterhalt: data.unterhalt,
    hatKredite: data.hatKredite,
    kredite: data.kredite,
    iban: data.iban,
    bankname: data.bankname,
    kontoinhaber: data.kontoinhaber,
    /**
     * Der zweite Kreditnehmer — nur, wenn es ihn gibt.
     *
     * Wer auf zwei Antragsteller geklickt hat, etwas eingetragen und dann auf
     * einen zurueckgewechselt ist, hat einen Antragsteller gestellt. Seine
     * Eingaben bleiben im Formular stehen, damit ein Zurueckwechseln nichts
     * kostet — mitgeschickt werden sie nicht. Sonst stuende im CRM ein
     * zweiter Kreditnehmer, den es im Antrag nicht gibt.
     */
    zweitePerson: data.personCount === 2 ? data.zweitePerson : null,
    /**
     * Der weiteste erreichte Schritt, hoechstens der letzte der Strecke.
     *
     * `maxStep` zaehlt die Bestaetigungsseite mit, sobald der Antrag draussen
     * ist. Ungekuerzt stuende im CRM "Schritt 9" — eine Zahl, die es in der
     * Strecke nicht gibt.
     */
    erreichterSchritt: Math.min(Math.max(data.maxStep, 1), TOTAL_STEPS),
  };
}

/**
 * Ob genug fuer einen Zwischenstand dasteht: ein Weg, den Menschen zu
 * erreichen. Der Server prueft dasselbe noch einmal — hier steht es, damit
 * gar nicht erst gesendet wird, was ohnehin abgewiesen wuerde.
 */
export function kontaktVorhanden(data: WizardData): boolean {
  const email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim());
  const telefon = data.telefon.replace(/\D/g, "").length >= 5;
  return email || telefon;
}

export type SendeErgebnis = { ok: boolean; id: string | null };

/**
 * Senden. Gibt die Kennung des Falls zurueck, damit der naechste Aufruf
 * denselben Fall trifft und keinen zweiten anlegt.
 */
export async function sendeAntrag(
  data: WizardData,
  id: string | null,
  abgeschlossen: boolean,
  /**
   * Der Browser ist gerade dabei, die Seite zu verlassen. `keepalive` haelt
   * die Anfrage dann am Leben, auch wenn das Fenster schon zu ist — sonst
   * bricht genau der Fall ab, den wir festhalten wollen.
   */
  dringend = false
): Promise<SendeErgebnis> {
  const antwort = await fetch("/api/antraege", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: dringend,
    body: JSON.stringify({
      ...antragNutzlast(data),
      id,
      abgeschlossen,
    }),
  }).catch(() => null);

  if (!antwort) return { ok: false, id };

  const gelesen = await antwort
    .json()
    .catch(() => null as { ok?: boolean; id?: string } | null);

  if (gelesen?.ok === true) {
    return { ok: true, id: typeof gelesen.id === "string" ? gelesen.id : id };
  }
  return { ok: false, id };
}
