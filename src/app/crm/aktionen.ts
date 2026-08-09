"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  aktivitaeten,
  findeAntrag,
  haltEinsichtFest,
  loescheAntrag,
  schreibeNotiz,
  setzeStatus,
  setzeWiedervorlage,
} from "@/lib/crm/antraege";
import {
  PAPIERKORB,
  findeStation,
  imPapierkorb,
  type StatusId,
} from "@/lib/crm/pipeline";
import {
  haltLoeschungFest,
  istLoeschgrund,
} from "@/lib/crm/loeschprotokoll";
import { verlangeAnmeldung } from "@/lib/crm/zugang";

/**
 * Was am Fall geaendert werden kann.
 *
 * Server Functions sind per POST auch direkt erreichbar, nicht nur ueber die
 * Oberflaeche — der Leitfaden dieser Next-Version weist ausdruecklich darauf
 * hin. Deshalb steht die Pruefung in jeder einzelnen Funktion und nicht etwa
 * nur in der Seite, die die Formulare zeigt. Dass die Knoepfe fuer Nur-Lesen
 * gar nicht erst erscheinen, ist Bequemlichkeit; die Grenze zieht der Code
 * hier.
 */
async function verlangeBearbeiter() {
  const benutzer = await verlangeAnmeldung();
  if (benutzer.rolle === "lesen") {
    throw new Error("Dieses Konto darf Faelle nur ansehen.");
  }
  return benutzer;
}

/** Kennung aus dem Formular holen und den Fall danach neu laden lassen. */
function fallKennung(formular: FormData): string {
  const id = String(formular.get("id") ?? "");
  if (!id) throw new Error("Kein Fall angegeben.");
  return id;
}

function aktualisiere(id: string) {
  // Die Fallakte zeigt den Verlauf, die Uebersicht die Zahlen an den
  // Stationen — beide muessen nach einer Aenderung neu gerechnet werden.
  revalidatePath(`/crm/antrag/${id}`);
  revalidatePath("/crm");
}

export async function statusAendern(formular: FormData) {
  const benutzer = await verlangeBearbeiter();
  const id = fallKennung(formular);

  const status = String(formular.get("status") ?? "");
  // Nur Stationen, die es wirklich gibt. Sonst stuende nach einer
  // untergeschobenen Anfrage ein erfundener Status im Fall, und die Pipeline
  // haette eine Spalte, die niemand kennt.
  if (!findeStation(status)) throw new Error("Unbekannte Station.");

  await setzeStatus(id, status as StatusId, benutzer.anzeigename);
  aktualisiere(id);
}

/**
 * Dasselbe fuer das Brett: einen Fall in einen anderen Ordner ziehen.
 *
 * Zwei Unterschiede zu `statusAendern`, und beide haben mit dem Ziehen zu tun.
 * Erstens kommen Kennung und Ziel als gewoehnliche Werte statt als FormData —
 * es gibt kein Formular, nur eine losgelassene Karte. Zweitens wird geantwortet
 * statt geworfen: Die Karte liegt beim Loslassen schon in der neuen Spalte, und
 * wenn der Server nein sagt, muss sie zurueckspringen. Eine Ausnahme wuerde
 * stattdessen die ganze Seite in den Fehlerzustand kippen — mitten in einer
 * Geste, die man gerade erst gemacht hat, ist das die schlechteste aller
 * Antworten.
 *
 * Die Anmeldung wird bewusst vor dem try geholt: `verlangeAnmeldung` leitet
 * ohne gueltige Sitzung zur Anmeldemaske um, und diese Umleitung ist selbst
 * eine Ausnahme. Faengt man sie ein, wird aus "bitte neu anmelden" ein
 * beliebiger Fehlertext.
 */
export async function fallVerschieben(
  id: string,
  station: string
): Promise<{ ok: true } | { ok: false; fehler: string }> {
  const benutzer = await verlangeAnmeldung();
  if (benutzer.rolle === "lesen") {
    return { ok: false, fehler: "Dieses Konto darf Fälle nur ansehen." };
  }
  if (!id) return { ok: false, fehler: "Kein Fall angegeben." };
  if (!findeStation(station)) {
    return { ok: false, fehler: "Unbekannte Station." };
  }

  try {
    await setzeStatus(id, station as StatusId, benutzer.anzeigename);
  } catch (ausnahme) {
    return {
      ok: false,
      fehler: ausnahme instanceof Error ? ausnahme.message : String(ausnahme),
    };
  }

  aktualisiere(id);
  return { ok: true };
}

export async function notizSchreiben(formular: FormData) {
  const benutzer = await verlangeBearbeiter();
  const id = fallKennung(formular);

  await schreibeNotiz(id, String(formular.get("text") ?? ""), benutzer.anzeigename);
  aktualisiere(id);
}

/**
 * Vermerkt, dass jemand die Bankverbindung kopiert hat.
 *
 * Bewusst ohne Rollenpruefung ueber `verlangeBearbeiter`: Auch ein Konto, das
 * nur lesen darf, darf die IBAN sehen und mitnehmen — und gerade dann soll
 * der Vermerk entstehen. Angemeldet sein muss man trotzdem.
 */
export async function bankverbindungKopiert(formular: FormData) {
  const benutzer = await verlangeAnmeldung();
  const id = fallKennung(formular);
  await haltEinsichtFest(id, benutzer.anzeigename);
  revalidatePath(`/crm/antrag/${id}`);
}

export async function wiedervorlageSetzen(formular: FormData) {
  const benutzer = await verlangeBearbeiter();
  const id = fallKennung(formular);

  const tag = String(formular.get("tag") ?? "").trim();
  await setzeWiedervorlage(id, tag === "" ? null : tag, benutzer.anzeigename);
  aktualisiere(id);
}

/**
 * Einen Fall in den Papierkorb legen.
 *
 * Der gewoehnliche Weg, einen Kunden loszuwerden. Er loescht nichts, sondern
 * setzt den Status — der Fall verschwindet damit aus Liste, Gesamtzahl und
 * Export, bleibt aber vollstaendig erhalten und steht im Papierkorb.
 *
 * Darf jeder Bearbeiter, nicht nur ein Administrator: Der Schritt ist
 * umkehrbar, und eine Huerde davor haette nur zur Folge, dass Faelle
 * liegenbleiben, die niemand mehr braucht. Endgueltig loeschen darf weiterhin
 * nur der Administrator.
 *
 * Der Statuswechsel steht wie jeder andere im Verlauf. Das ist nicht Beiwerk:
 * Woher ein Fall im Papierkorb kam, ist genau die Frage, die sich beim
 * Zurueckholen stellt.
 */
export async function inPapierkorb(formular: FormData) {
  const benutzer = await verlangeBearbeiter();
  const id = fallKennung(formular);
  await setzeStatus(id, PAPIERKORB.id, benutzer.anzeigename);
  aktualisiere(id);
}

/**
 * Einen Fall aus dem Papierkorb zurueckholen.
 *
 * Zurueck geht es dorthin, wo er herkam. Der Verlauf weiss das: Beim Weg in
 * den Papierkorb wurde festgehalten, aus welchem Ordner er kam. Ihn
 * stattdessen pauschal nach "Neu" zu legen waere bequemer, wuerde aber die
 * Arbeit zurueckdrehen — ein Fall, der schon in "Tag 3" stand, faenge wieder
 * von vorne an, und niemand saehe, dass das passiert ist.
 *
 * Findet sich nichts, geht es nach "Neu". Das ist der Fall, wenn der Weg in
 * den Papierkorb aelter ist als der Verlauf oder aus einer Zeit stammt, in
 * der es ihn noch nicht gab.
 */
export async function ausPapierkorb(formular: FormData) {
  const benutzer = await verlangeBearbeiter();
  const id = fallKennung(formular);

  const eintraege = await aktivitaeten(id);
  const hinein = eintraege.find(
    (e) => e.art === "status" && e.nachStatus === PAPIERKORB.id
  );
  const zurueck =
    hinein?.vonStatus && findeStation(hinein.vonStatus)
      ? hinein.vonStatus
      : "neu";

  await setzeStatus(id, zurueck, benutzer.anzeigename);
  aktualisiere(id);
}

/**
 * Einen Fall endgueltig loeschen.
 *
 * Nur fuer Administratoren, und nur aus dem Papierkorb heraus. Die zweite
 * Bedingung ist die eigentliche Sicherung: Ein Fall ist eine Person mit
 * Telefonnummer und Bankverbindung, ein Fehlgriff beim Aufraeumen also nicht
 * aergerlich, sondern unwiederbringlich. Wer wirklich loeschen will, legt
 * erst in den Papierkorb und loescht dann von dort — zwei bewusste Schritte
 * statt einem.
 *
 * Ein Loeschbegehren nach Art. 17 DSGVO laesst sich damit weiterhin sofort
 * erfuellen, es kostet nur einen Klick mehr. Die Pruefung steht hier und
 * nicht bloss in der Oberflaeche: Server Functions sind per POST auch direkt
 * erreichbar.
 *
 * Festgehalten wird die Loeschung im Loeschprotokoll — ohne die Daten des
 * Geloeschten, nur wann, durch wen, unter welcher Kennung und aus welchem
 * Grund. Ohne diesen Eintrag verschwaende mit dem Fall auch der Umstand, dass
 * er je geloescht wurde: Sein Verlauf haengt an ihm und geht mit.
 */
export async function fallLoeschen(formular: FormData) {
  const benutzer = await verlangeAnmeldung();
  if (benutzer.rolle !== "admin") {
    throw new Error("Nur Administratoren duerfen Faelle loeschen.");
  }
  const id = fallKennung(formular);

  const antrag = await findeAntrag(id);
  if (!antrag) return;
  if (!imPapierkorb(antrag.status)) {
    throw new Error(
      "Endgueltig geloescht wird nur aus dem Papierkorb. Den Fall zuerst dorthin legen."
    );
  }

  const grund = String(formular.get("grund") ?? "");
  if (!istLoeschgrund(grund)) throw new Error("Kein gueltiger Loeschgrund.");

  // Erst der Nachweis, dann die Loeschung. Andersherum stuende im
  // schlechtesten Fall ein geloeschter Fall ohne jeden Eintrag da — und das
  // ist genau der Zustand, den das Protokoll verhindern soll.
  await haltLoeschungFest({
    antragId: antrag.id,
    eingang: antrag.eingang,
    benutzer: benutzer.anzeigename,
    grund,
  });

  await loescheAntrag(id);
  revalidatePath("/crm");
  // Die Fallakte gibt es nicht mehr; wer darauf stehen bliebe, saehe eine
  // 404. Also zurueck in den Eingang.
  redirect("/crm");
}
