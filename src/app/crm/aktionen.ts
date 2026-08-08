"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  haltEinsichtFest,
  loescheAntrag,
  schreibeNotiz,
  setzeStatus,
  setzeWiedervorlage,
} from "@/lib/crm/antraege";
import { findeStation, type StatusId } from "@/lib/crm/pipeline";
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
 * Einen Fall endgueltig loeschen.
 *
 * Nur fuer Administratoren, und ohne Netz darunter: Es gibt keinen
 * Papierkorb. Das ist Absicht — der Grund fuer diese Funktion ist ein
 * Loeschbegehren nach Art. 17 DSGVO oder der Widerspruch eines Abbrechers,
 * der nie etwas abgeschickt hat. Ein Papierkorb waere dabei keine
 * Sicherheit, sondern eine Luecke: geloescht heisst geloescht.
 *
 * Die Rueckfrage steht deshalb in der Oberflaeche, nicht hier.
 */
export async function fallLoeschen(formular: FormData) {
  const benutzer = await verlangeAnmeldung();
  if (benutzer.rolle !== "admin") {
    throw new Error("Nur Administratoren duerfen Faelle loeschen.");
  }
  const id = fallKennung(formular);
  await loescheAntrag(id);
  revalidatePath("/crm");
  // Die Fallakte gibt es nicht mehr; wer darauf stehen bliebe, saehe eine
  // 404. Also zurueck in den Eingang.
  redirect("/crm");
}
