import type { Metadata } from "next";
import Link from "next/link";
import { loeschgrundName, loeschungen } from "@/lib/crm/loeschprotokoll";
import { datenbankVorhanden } from "@/lib/crm/db";
import { verlangeAnmeldung } from "@/lib/crm/zugang";

export const metadata: Metadata = {
  title: "Löschprotokoll",
  robots: { index: false, follow: false },
};

/**
 * Der Nachweis über endgültig gelöschte Fälle.
 *
 * Nur für Administratoren — dieselbe Rolle, die löschen darf, darf auch
 * nachsehen, was gelöscht wurde.
 *
 * Was hier steht, steht bewusst knapp: wann, durch wen, unter welcher Kennung
 * und aus welchem Grund. Kein Name, keine Adresse, keine Bankverbindung. Ein
 * Protokoll, das festhält, wessen Daten gelöscht wurden, indem es diese Daten
 * aufschreibt, hebt die Löschung wieder auf — dann bliebe ausgerechnet
 * derjenige gespeichert, der um Löschung gebeten hat.
 */
export default async function ProtokollSeite() {
  const benutzer = await verlangeAnmeldung("/crm/protokoll");

  if (benutzer.rolle !== "admin") {
    return (
      <main className="min-h-screen bg-background">
        <div className="w-full px-6 lg:px-10 py-10 flex flex-col gap-4">
          <Link
            href="/crm"
            className="text-xs text-muted hover:text-foreground transition-colors duration-200"
          >
            ← Eingang
          </Link>
          <p className="text-sm text-muted">
            Das Löschprotokoll sehen nur Administratoren.
          </p>
        </div>
      </main>
    );
  }

  const eintraege = await loeschungen();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="w-full px-6 lg:px-10 py-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/crm"
            className="text-xs text-muted hover:text-foreground transition-colors duration-200"
          >
            ← Eingang
          </Link>
          <span className="ml-auto text-xs text-muted">
            {eintraege.length}{" "}
            {eintraege.length === 1 ? "Eintrag" : "Einträge"}
          </span>
        </div>
      </header>

      <div className="w-full px-6 lg:px-10 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2 max-w-3xl">
          <h1 className="text-2xl font-bold tracking-[-0.02em]">
            Löschprotokoll
          </h1>
          <p className="text-sm text-muted leading-relaxed">
            Jede endgültige Löschung eines Falls, mit Zeitpunkt, Konto und
            Grund. Bewusst ohne die Daten des Gelöschten: Ein Protokoll, das
            festhält, wessen Daten entfernt wurden, indem es diese Daten
            aufschreibt, hebt die Löschung wieder auf. Die Kennung zeigt nach
            der Löschung auf nichts mehr und genügt trotzdem, um einen Vorgang
            zuzuordnen, wenn jemand mit ihr nachfragt.
          </p>
        </div>

        {!datenbankVorhanden() && (
          <section className="rounded-[20px] border border-dashed border-amber-400/40 bg-amber-400/[0.06] p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-amber-200/90">
              Ohne Datenbank kein Nachweis
            </span>
            <p className="text-xs text-amber-200/70 leading-relaxed max-w-3xl">
              Es ist keine Verbindungsadresse gesetzt. Das Protokoll liegt
              deshalb im Arbeitsspeicher des Servers und ist beim nächsten
              Neustart weg — als Nachweis taugt es dann nicht. Sobald{" "}
              <code>DATABASE_URL</code> steht, schreibt es in die Tabelle{" "}
              <code>loeschprotokoll</code>.
            </p>
          </section>
        )}

        {eintraege.length === 0 ? (
          <div className="rounded-[24px] border border-border bg-surface p-8 flex flex-col gap-2 text-center">
            <span className="text-sm font-semibold">
              Noch nichts endgültig gelöscht
            </span>
            <p className="text-xs text-muted leading-relaxed">
              Fälle im Papierkorb sind nicht gelöscht — sie tauchen hier erst
              auf, wenn sie wirklich entfernt wurden.
            </p>
          </div>
        ) : (
          <div className="rounded-[24px] border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] text-muted">
                    <th className="text-left font-semibold px-5 py-3">
                      Gelöscht am
                    </th>
                    <th className="text-left font-semibold px-5 py-3">Konto</th>
                    <th className="text-left font-semibold px-5 py-3">Grund</th>
                    <th className="text-left font-semibold px-5 py-3">
                      Fall eingegangen
                    </th>
                    <th className="text-left font-semibold px-5 py-3">
                      Kennung
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eintraege.map((eintrag) => (
                    <tr
                      key={eintrag.id}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="px-5 py-3 text-xs whitespace-nowrap tabular-nums">
                        {/* Auf die Sekunde genau, wie im Verlauf der Fallakte:
                            Ein Loeschprotokoll ist ein Nachweis, und ein
                            Nachweis auf die Minute genau reicht nicht, wenn in
                            derselben Minute mehrere Faelle geloescht wurden. */}
                        {new Date(eintrag.zeit).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3 text-xs">{eintrag.benutzer}</td>
                      <td className="px-5 py-3 text-xs">
                        {loeschgrundName(eintrag.grund)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted whitespace-nowrap tabular-nums">
                        {eintrag.eingang
                          ? new Date(eintrag.eingang).toLocaleDateString(
                              "de-DE",
                              { day: "2-digit", month: "2-digit", year: "numeric" }
                            )
                          : "—"}
                      </td>
                      {/* Die Kennung in Schreibmaschinenschrift und klein: Sie
                          ist zum Vergleichen da, nicht zum Lesen. */}
                      <td className="px-5 py-3 font-mono text-[11px] text-muted break-all">
                        {eintrag.antragId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
