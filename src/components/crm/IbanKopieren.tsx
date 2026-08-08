"use client";

import { useState } from "react";
import { bankverbindungKopiert } from "@/app/crm/aktionen";

/**
 * Kopiert die IBAN und haelt fest, dass es geschehen ist.
 *
 * Das Kopieren ist der Augenblick, in dem eine Bankverbindung das CRM
 * verlaesst — in die Zwischenablage, von dort in eine Mail, ein Formular, ein
 * Bankportal. Genau dieser Augenblick gehoert in den Verlauf, und nicht jeder
 * Seitenaufruf: Wer eine Fallakte oeffnet, sieht Angaben; wer kopiert, nimmt
 * sie mit. Das eine waere Rauschen, das andere ist die Auskunft, die man
 * spaeter geben koennen muss.
 */
export default function IbanKopieren({
  antragId,
  iban,
}: {
  antragId: string;
  iban: string;
}) {
  const [stand, setStand] = useState<"bereit" | "kopiert" | "fehler">("bereit");

  async function kopieren() {
    try {
      // Die Zwischenablage steht nur in gesicherten Zusammenhaengen zur
      // Verfuegung — auf der veroeffentlichten Seite und auf localhost.
      await navigator.clipboard.writeText(iban);
      setStand("kopiert");
    } catch {
      setStand("fehler");
      return;
    }

    // Der Vermerk soll das Kopieren nicht aufhalten: Er laeuft danach, und
    // scheitert er, bleibt die IBAN trotzdem in der Zwischenablage.
    const formular = new FormData();
    formular.set("id", antragId);
    await bankverbindungKopiert(formular).catch(() => undefined);
  }

  return (
    <button
      type="button"
      onClick={kopieren}
      className="shrink-0 rounded-[10px] border border-border px-2 py-1 text-[11px] text-muted transition-colors duration-200 hover:text-foreground hover:border-border-strong"
    >
      {stand === "kopiert"
        ? "kopiert"
        : stand === "fehler"
          ? "geht nicht"
          : "kopieren"}
    </button>
  );
}
