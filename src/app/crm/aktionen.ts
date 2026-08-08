"use server";

import { revalidatePath } from "next/cache";
import {
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

export async function wiedervorlageSetzen(formular: FormData) {
  const benutzer = await verlangeBearbeiter();
  const id = fallKennung(formular);

  const tag = String(formular.get("tag") ?? "").trim();
  await setzeWiedervorlage(id, tag === "" ? null : tag, benutzer.anzeigename);
  aktualisiere(id);
}
