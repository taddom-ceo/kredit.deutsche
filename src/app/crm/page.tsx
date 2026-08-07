import Link from "next/link";
import AbmeldeKnopf from "@/components/crm/AbmeldeKnopf";
import { ROLLEN_NAMEN } from "@/lib/crm/benutzer";
import { ENDSTATIONEN, PIPELINE } from "@/lib/crm/pipeline";
import { verlangeAnmeldung } from "@/lib/crm/zugang";

/**
 * Die Startseite des CRM.
 *
 * Sie zeigt heute noch keine Faelle, und das ist kein Versehen: Die
 * Antragsstrecke schickt ihre Daten bisher nirgendwohin, es gibt also nichts
 * anzuzeigen. Erfundene Beispielfaelle waeren hier das Schlechteste — man
 * gewoehnt sich an Zahlen, die nichts bedeuten. Stattdessen steht die
 * vereinbarte Pipeline schon da, damit sichtbar ist, wohin die Faelle
 * einsortiert werden, sobald sie ankommen.
 */
export default async function CrmSeite() {
  const benutzer = await verlangeAnmeldung("/crm");

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-6">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold tracking-[-0.02em]">CRM</span>
            <span className="text-xs text-muted">kredit.deutsche</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold">{benutzer.anzeigename}</div>
              <div className="text-[11px] text-muted">
                {ROLLEN_NAMEN[benutzer.rolle]}
              </div>
            </div>
            <AbmeldeKnopf />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-10">
        <section className="rounded-[24px] border border-border bg-surface p-6 lg:p-8 flex flex-col gap-3">
          <span className="text-[11px] font-semibold text-muted tracking-wide">
            Stand
          </span>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">
            Noch keine Antraege — <span className="text-accent">die Ablage fehlt</span>
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            Der letzte Schritt der Antragsstrecke setzt bisher nur ein
            Kennzeichen im Browser: Es gibt keinen Endpunkt, der den Antrag
            entgegennimmt, und keine Datenbank, die ihn behaelt. Solange das so
            ist, bleibt diese Liste leer. Der naechste Schritt ist eine
            Postgres-Datenbank in der EU und die Umgebungsvariable{" "}
            <code className="text-foreground">DATABASE_URL</code>.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold">Pipeline</h2>
            <span className="text-xs text-muted">
              {PIPELINE.length} Stationen bis zur Entscheidung
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {PIPELINE.map((station) => (
              <div
                key={station.id}
                className="shrink-0 w-56 rounded-[20px] border border-border bg-surface p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{station.name}</span>
                  <span className="text-xs text-muted tabular-nums">0</span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {station.beschreibung}
                </p>
                <div className="rounded-[12px] border border-dashed border-border px-3 py-4 text-center text-[11px] text-muted">
                  leer
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {ENDSTATIONEN.map((station) => (
              <span
                key={station.id}
                className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-[11px] text-muted"
              >
                {station.name} <span className="tabular-nums">0</span>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-border bg-surface p-6 lg:p-8 flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Was als Naechstes kommt</h2>
          <ol className="flex flex-col gap-3 text-sm text-muted leading-relaxed list-decimal pl-5">
            <li>
              Antrag wirklich absenden: Endpunkt, serverseitige Pruefung,
              Speichern — dazu den Entwicklermodus der Strecke schliessen,
              sonst laufen leere Antraege ein.
            </li>
            <li>
              Schema und Migrationen: Kontakt, Antrag, laufende Kredite,
              Aktivitaet, Aufgabe. IBAN verschluesselt, in Listen nur die
              letzten vier Stellen.
            </li>
            <li>
              Fallliste und Falldetails mit Statuswechsel, Notiz, Wiedervorlage
              und Zuweisung.
            </li>
            <li>Benachrichtigung ans Team bei Eingang, CSV-Export.</li>
          </ol>
          <p className="text-xs text-muted">
            Die Anmeldung hier ist vorlaeufig: Konten stehen in einer
            Umgebungsvariable statt in der Datenbank, und eine Sitzung laesst
            sich noch nicht vorzeitig beenden. Beides wechselt mit Schritt 2.
          </p>
        </section>

        <Link
          href="/"
          className="text-xs text-muted hover:text-foreground transition-colors duration-200"
        >
          ← Zur Website
        </Link>
      </div>
    </main>
  );
}
