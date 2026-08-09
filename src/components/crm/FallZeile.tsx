"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

/**
 * Eine Zeile der Fallliste, auf ganzer Breite anklickbar.
 *
 * Vorher führte nur der Name zum Fall — ein Ziel von wenigen Zentimetern in
 * einer Zeile, die über den ganzen Bildschirm geht. Wer auf den Betrag oder
 * den Ordner klickte, bekam nichts.
 *
 * ------------------------------------------------------------------
 * Warum ein Skript und nicht einfach ein Verweis über die ganze Zeile:
 *
 * Ein `<a>` darf keine Tabellenzeile umschließen — das erlaubt HTML nicht.
 * Der übliche Ausweg ist ein unsichtbarer Verweis, der sich über die ganze
 * Zeile legt. Der hat einen Haken, der ausgerechnet hier weh tut: Über so
 * einer Fläche lässt sich kein Text mehr markieren. In einem CRM markiert
 * man aber ständig etwas — eine Nummer, einen Ort, einen Betrag, um ihn
 * woanders einzufügen.
 *
 * Deshalb bleibt der Name ein echter Verweis (Tastatur, Vorschau in der
 * Statuszeile, "in neuem Tab öffnen" über das Kontextmenü), und die Zeile
 * bekommt zusätzlich einen Klick. Der hält sich an drei Regeln:
 *
 *   · Wer gerade Text markiert hat, wollte nicht navigieren.
 *   · Wer auf etwas Bedienbares in der Zeile geklickt hat — einen Verweis,
 *     einen Knopf, ein Feld —, meinte das und nicht die Zeile.
 *   · Strg/Cmd, Umschalt und die mittlere Maustaste öffnen einen neuen Tab,
 *     so wie bei jedem Verweis auch.
 */
export default function FallZeile({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const router = useRouter();

  /** Wurde etwas angeklickt, das selbst schon etwas tut? */
  function aufBedienelement(ziel: EventTarget | null): boolean {
    return Boolean(
      ziel instanceof Element &&
        ziel.closest("a, button, input, select, textarea, label, [role='button']")
    );
  }

  /** Steht gerade eine Markierung? Dann war der Klick ihr Ende, kein Ziel. */
  function markiert(): boolean {
    const auswahl = window.getSelection();
    return Boolean(auswahl && !auswahl.isCollapsed && auswahl.toString().trim());
  }

  function klick(e: MouseEvent<HTMLTableRowElement>) {
    if (e.defaultPrevented || aufBedienelement(e.target) || markiert()) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      window.open(href, "_blank", "noopener");
      return;
    }
    router.push(href);
  }

  /** Mittlere Maustaste: neuer Tab, wie bei jedem Verweis. */
  function nebenKlick(e: MouseEvent<HTMLTableRowElement>) {
    if (e.button !== 1 || aufBedienelement(e.target)) return;
    e.preventDefault();
    window.open(href, "_blank", "noopener");
  }

  return (
    <tr
      onClick={klick}
      onAuxClick={nebenKlick}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </tr>
  );
}
