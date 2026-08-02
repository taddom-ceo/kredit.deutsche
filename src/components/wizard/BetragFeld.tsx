"use client";

import { useLayoutEffect, useRef } from "react";
import { gruppiere, nurZiffern, zeigerNachZiffern } from "@/lib/betrag";
import { useLanguage } from "@/lib/language-context";
import { FormField } from "./FormField";

/**
 * Eingabefeld für einen Eurobetrag mit Tausendertrennung.
 *
 * Bewusst ein Textfeld und kein Zahlenfeld: `<input type="number">` lässt nur
 * eine gültige Zahl zu, und "1.000" ist für den Browser keine — der Wert
 * bliebe leer, sobald der erste Punkt gesetzt wird. `inputMode="numeric"`
 * holt auf dem Handy trotzdem die Zifferntastatur.
 *
 * Nach außen gibt das Feld nur Ziffern weiter. Jede Prüfung, die `Number(...)`
 * benutzt, bleibt dadurch unverändert gültig.
 */
export function BetragFeld({
  id,
  label,
  wert,
  onWert,
  placeholder,
}: {
  id: string;
  label: string;
  /** Nur Ziffern, ohne Trennzeichen. */
  wert: string;
  onWert: (ziffern: string) => void;
  placeholder?: string;
}) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLInputElement>(null);
  // Stelle, an die der Schreibzeiger nach dem Neuzeichnen gehört. Ohne diese
  // Rückstellung spränge er bei jeder Eingabe ans Ende, sobald ein Trennpunkt
  // dazukommt oder wegfällt — eine Korrektur mitten in der Zahl wäre damit
  // praktisch unmöglich.
  const zeiger = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (zeiger.current === null || !ref.current) return;
    ref.current.setSelectionRange(zeiger.current, zeiger.current);
    zeiger.current = null;
  });

  const anzeige = gruppiere(wert, lang);

  return (
    <FormField
      id={id}
      label={label}
      inputRef={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={anzeige}
      onChange={(e) => {
        const roh = e.target.value;
        const stelle = e.target.selectionStart ?? roh.length;
        // Der Zeiger wird über die Zahl der Ziffern vor ihm verfolgt, nicht
        // über die Zeichenposition: Trennpunkte verschieben die Position,
        // die Ziffern davor bleiben dieselben.
        // Hier wird gezählt, nicht bereinigt: nurZiffern wirft führende Nullen
        // weg und käme damit auf zu wenige Stellen.
        const ziffernDavor = (roh.slice(0, stelle).match(/\d/g) ?? []).length;
        const ziffern = nurZiffern(roh);
        zeiger.current = zeigerNachZiffern(gruppiere(ziffern, lang), ziffernDavor);
        onWert(ziffern);
      }}
    />
  );
}
