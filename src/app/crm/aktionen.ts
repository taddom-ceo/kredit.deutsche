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
