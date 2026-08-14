"use client";

import { useWizard } from "@/lib/wizard-context";
import { seitdem } from "@/lib/wizard-speicher";

/**
 * Der Hinweis, dass hier gerade Angaben von vorhin wieder aufgetaucht sind.
 *
 * Er ist keine Hoeflichkeit, sondern notwendig. Ein Formular, das sich von
 * selbst ausfuellt, ist im besten Fall angenehm und im schlechtesten
 * beunruhigend — vor allem auf einem Geraet, das mehrere Menschen benutzen.
 * Wer sieht, woher die Angaben kommen und wie alt sie sind, kann beides
 * einordnen; und wer sie nicht will, wirft sie mit einem Klick weg.
 *
 * Bewusst kein Kasten in Warnfarbe: Es ist nichts schiefgegangen. Eine ruhige
 * Zeile in der Betonungsfarbe der Seite sagt, was Sache ist, und nimmt der
 * Ueberschrift darunter nicht den Platz.
 */
export default function WiederaufnahmeHinweis() {
  const { wiederhergestellt, verwirfWiederherstellung } = useWizard();
  if (!wiederhergestellt) return null;

  return (
    <div className="border-b border-accent/20 bg-accent/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span aria-hidden="true" className="text-accent">
          ✓
        </span>
        <span className="text-foreground">
          Wir haben Ihre Angaben behalten
          <span className="text-muted"> — gespeichert {seitdem(wiederhergestellt)}.</span>
        </span>
        {/* Der Weg zurueck steht daneben und nicht in einem Menue: Er ist die
            Antwort auf "das bin ich nicht" oder "das will ich nicht mehr", und
            beides soll einen Klick kosten. */}
        <button
          type="button"
          onClick={verwirfWiederherstellung}
          className="rounded-[10px] border border-border px-2.5 py-1 font-medium text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Verwerfen und neu anfangen
        </button>
        {/* Wo die Angaben liegen, gehoert dazu — es ist der Unterschied
            zwischen "die kennen mich" und "das steht in meinem Browser". */}
        <span className="text-muted/70">
          Gespeichert in diesem Browser, nicht auf unseren Servern. Die
          Bankverbindung wird nicht mitgespeichert.
        </span>
      </div>
    </div>
  );
}
