import Link from "next/link";

/**
 * Bausteine fuer Impressum und Datenschutzerklaerung.
 *
 * Beide Seiten sind Fliesstext mit vielen Abschnitten. Ohne gemeinsame
 * Bausteine liefen ihre Abstaende und Schriftgroessen mit der Zeit
 * auseinander, und ein Rechtstext, der wie zwei verschiedene Seiten aussieht,
 * wirkt zusammengeklaubt.
 */

export function RechtstextSeite({
  titel,
  stand,
  children,
}: {
  titel: string;
  stand?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
            {titel}
          </h1>
          {stand && <p className="text-xs text-muted">Stand: {stand}</p>}
        </div>
        {children}
      </div>
    </main>
  );
}

export function Abschnitt({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold tracking-[-0.01em]">{titel}</h2>
      <div className="flex flex-col gap-3 text-sm text-muted leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/**
 * Eine Angabe, die der Betreiber eintragen muss.
 *
 * Fehlt sie, steht hier kein leerer Platz, sondern ein sichtbarer Hinweis.
 * Ein Impressum, dem eine Pflichtangabe fehlt, ist ein Rechtsverstoss — er
 * soll ins Auge fallen und nicht im Layout verschwinden.
 */
export function Angabe({ wert, feld }: { wert: string; feld: string }) {
  if (wert.trim() !== "") return <>{wert}</>;
  return (
    <span className="rounded border border-amber-400/50 bg-amber-400/10 px-1.5 py-0.5 text-amber-200">
      {feld} fehlt — in src/lib/anbieter.ts eintragen
    </span>
  );
}

/** Der Warnhinweis oben, solange noch Angaben fehlen. */
export function UnvollstaendigHinweis() {
  return (
    <div className="rounded-[20px] border border-amber-400/40 bg-amber-400/[0.07] p-5 flex flex-col gap-2">
      <span className="text-xs font-semibold text-amber-200/90">
        Diese Seite ist noch nicht vollständig
      </span>
      <p className="text-xs text-amber-200/70 leading-relaxed">
        Es fehlen Angaben, die nur der Betreiber liefern kann — Firma,
        Anschrift, Registereintrag, Erlaubnis nach § 34c GewO und die
        zuständigen Behörden. Sie stehen gesammelt in{" "}
        <code>src/lib/anbieter.ts</code>. Solange sie fehlen, erfüllt die Seite
        die Pflichten aus § 5 DDG und Art. 13 DSGVO nicht.
      </p>
    </div>
  );
}

/** Verweis auf die jeweils andere Rechtsseite. */
export function AndereSeite({
  ziel,
  text,
}: {
  ziel: string;
  text: string;
}) {
  return (
    <Link
      href={ziel}
      className="text-sm text-accent underline underline-offset-2 hover:opacity-80"
    >
      {text}
    </Link>
  );
}
