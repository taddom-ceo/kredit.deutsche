import Link from "next/link";
import AbmeldeKnopf from "@/components/crm/AbmeldeKnopf";
import {
  alleAntraege,
  ibanVerkuerzt,
  vollerName,
  zaehleNachStatus,
} from "@/lib/crm/antraege";
import { ROLLEN_NAMEN } from "@/lib/crm/benutzer";
import { ENDSTATIONEN, PIPELINE } from "@/lib/crm/pipeline";
import { verlangeAnmeldung } from "@/lib/crm/zugang";
import { findeKreditartNachId } from "@/lib/kreditarten";
import { formatEuro } from "@/lib/loan-calc";

/**
 * Die Startseite des CRM: der Eingang.
 *
 * Die Zahlen an den Stationen sind gezaehlt, nicht gesetzt — steht dort eine
 * Null, ist die Station wirklich leer.
 */
export default async function CrmSeite() {
  const benutzer = await verlangeAnmeldung("/crm");
  const antraege = alleAntraege();
  const zaehler = zaehleNachStatus();

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
        <section className="rounded-[20px] border border-dashed border-amber-400/40 bg-amber-400/[0.06] p-5 flex flex-col gap-2">
          <span className="text-xs font-semibold text-amber-200/90">
            Zwischenlösung ohne Datenbank
          </span>
          <p className="text-xs text-amber-200/70 leading-relaxed max-w-3xl">
            Eingehende Anträge liegen im Arbeitsspeicher des Servers. Auf der
            veröffentlichten Seite beantwortet nicht immer dieselbe Instanz die
            nächste Anfrage, und eine Instanz wird nach kurzer Ruhe
            weggeräumt — Einträge können hier also wieder verschwinden. Zum
            Ansehen des Ablaufs reicht das, für echte Kunden nicht. Dauerhaft
            wird es mit einer Postgres-Datenbank und{" "}
            <code>DATABASE_URL</code>.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold">Pipeline</h2>
            <span className="text-xs text-muted">
              {antraege.length}{" "}
              {antraege.length === 1 ? "Fall" : "Fälle"} insgesamt
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
                  <span className="text-xs text-muted tabular-nums">
                    {zaehler[station.id] ?? 0}
                  </span>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {station.beschreibung}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {ENDSTATIONEN.map((station) => (
              <span
                key={station.id}
                className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-[11px] text-muted"
              >
                {station.name}{" "}
                <span className="tabular-nums">{zaehler[station.id] ?? 0}</span>
              </span>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Eingang</h2>

          {antraege.length === 0 ? (
            <div className="rounded-[24px] border border-border bg-surface p-8 flex flex-col gap-2 text-center">
              <span className="text-sm font-semibold">
                Noch kein Antrag eingegangen
              </span>
              <p className="text-xs text-muted leading-relaxed">
                Sobald jemand die Antragsstrecke abschließt, steht der Fall
                hier — mit allen Angaben aus den acht Schritten.
              </p>
            </div>
          ) : (
            <div className="rounded-[24px] border border-border bg-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-muted">
                      <th className="text-left font-semibold px-5 py-3">
                        Eingang
                      </th>
                      <th className="text-left font-semibold px-5 py-3">Name</th>
                      <th className="text-left font-semibold px-5 py-3">
                        Verwendung
                      </th>
                      <th className="text-right font-semibold px-5 py-3">
                        Betrag
                      </th>
                      <th className="text-right font-semibold px-5 py-3">
                        Laufzeit
                      </th>
                      <th className="text-left font-semibold px-5 py-3">IBAN</th>
                      <th className="text-left font-semibold px-5 py-3">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {antraege.map((antrag) => {
                      const art = antrag.kreditart
                        ? findeKreditartNachId(antrag.kreditart)?.de.name
                        : undefined;
                      return (
                        <tr
                          key={antrag.id}
                          className="border-b border-border/60 last:border-0 hover:bg-surface-2/60 transition-colors duration-150"
                        >
                          <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">
                            {new Date(antrag.eingang).toLocaleString("de-DE", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-3">
                            <Link
                              href={`/crm/antrag/${antrag.id}`}
                              className="font-semibold hover:text-accent transition-colors duration-150"
                            >
                              {vollerName(antrag)}
                            </Link>
                            <div className="text-[11px] text-muted">
                              {antrag.ort || "—"}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-muted">
                            {art ?? "—"}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums whitespace-nowrap">
                            {formatEuro(antrag.amount)}
                          </td>
                          <td className="px-5 py-3 text-right text-xs text-muted tabular-nums whitespace-nowrap">
                            {antrag.months} Mon.
                          </td>
                          <td className="px-5 py-3 text-xs text-muted tabular-nums">
                            {ibanVerkuerzt(antrag.iban)}
                          </td>
                          <td className="px-5 py-3">
                            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] text-accent">
                              Neu
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[24px] border border-border bg-surface p-6 lg:p-8 flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Was als Nächstes kommt</h2>
          <ol className="flex flex-col gap-3 text-sm text-muted leading-relaxed list-decimal pl-5">
            <li>
              Postgres in der EU, damit die Fälle bleiben — und die IBAN
              verschlüsselt liegt statt offen im Speicher.
            </li>
            <li>
              Statuswechsel, Notiz, Wiedervorlage und Zuweisung, damit aus dem
              Eingang eine Bearbeitung wird.
            </li>
            <li>Benachrichtigung ans Team bei Eingang, CSV-Export.</li>
          </ol>
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
