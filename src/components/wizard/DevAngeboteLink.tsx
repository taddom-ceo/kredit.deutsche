"use client";

import Link from "next/link";
import { useWizard, DEV_MODUS_VERFUEGBAR } from "@/lib/wizard-context";

/**
 * Abkürzung zur Angebotsseite, die nur im Entwicklermodus erscheint.
 *
 * Die Liste hängt später an einer Bankabfrage, die es noch nicht gibt. Damit
 * sich das Ergebnis trotzdem ansehen lässt, führt hier ein Weg direkt dorthin
 * — mit Betrag und Laufzeit aus dem Antrag, damit die Raten zu dem passen,
 * was vorher eingestellt wurde.
 *
 * Bewusst in derselben gestrichelten Bernsteinfarbe wie der Schalter darüber:
 * Alles, was zur Entwicklung gehört, sieht gleich aus und ist damit auf einen
 * Blick vom eigentlichen Antrag zu unterscheiden.
 */
export default function DevAngeboteLink({
  className = "",
}: {
  className?: string;
}) {
  const { data } = useWizard();

  if (!DEV_MODUS_VERFUEGBAR || !data.devModus) return null;

  return (
    <Link
      href={`/angebote?betrag=${data.amount}&monate=${data.months}`}
      className={`flex w-fit items-center gap-2 rounded-[12px] border border-dashed border-amber-400/50 bg-amber-400/[0.06] px-3 py-2 text-xs font-medium text-amber-200/90 transition-colors duration-200 hover:border-amber-400/80 hover:bg-amber-400/[0.12] ${className}`}
    >
      dev mode
      <span className="font-normal text-amber-200/60">
        — Beispielangebote ansehen
      </span>
      <span aria-hidden>→</span>
    </Link>
  );
}
