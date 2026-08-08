import Link from "next/link";
import AbmeldeKnopf from "@/components/crm/AbmeldeKnopf";
import {
  ablageart,
  alleAntraege,
  ibanVerkuerzt,
  vollerName,
  zaehleAntraege,
  zaehleNachStatus,
  type Antrag,
} from "@/lib/crm/antraege";
import { adressName } from "@/lib/crm/db";
import { schluesselVorhanden } from "@/lib/crm/verschluesselung";
import { ROLLEN_NAMEN } from "@/lib/crm/benutzer";
import { ENDSTATIONEN, PIPELINE, findeStation } from "@/lib/crm/pipeline";
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

  // Faellt die Datenbank aus, soll hier nicht eine leere Liste stehen — die
  // saehe aus wie "keine Antraege" und ist etwas ganz anderes.
  let antraege: Antrag[] = [];
  let gesamt = 0;
  let zaehler: Record<string, number> = {};
  let fehler: string | null = null;

  try {
    [antraege, gesamt, zaehler] = await Promise.all([
      alleAntraege(),
      zaehleAntraege(),
      zaehleNachStatus(),
    ]);
  } catch (ausnahme) {
    fehler = ausnahme instanceof Error ? ausnahme.message : String(ausnahme);
  }

  const art = ablageart();
  // Fuer die Frage, ob eine Wiedervorlage schon faellig ist.
  const heute = new Date().toISOString().slice(0, 10);

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
        {fehler && (
          <section className="rounded-[20px] border border-red-400/40 bg-red-400/[0.08] p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-red-300">
              Die Datenbank antwortet nicht
            </span>
            <p className="text-xs text-red-200/80 leading-relaxed max-w-3xl">
              Diese Liste ist deshalb leer — das heißt nicht, dass keine
              Anträge da sind. Eingehende Anträge werden derzeit ebenfalls
              abgewiesen, damit kein Fall verloren geht.
            </p>
            <code className="text-[11px] text-red-200/60 break-words">
              {fehler}
            </code>
          </section>
        )}

        {!fehler && art === "postgres" && (
          <section className="rounded-[20px] border border-border bg-surface px-5 py-3 flex items-center gap-3">
            <span className="size-2 rounded-full bg-accent shrink-0" />
            <span className="text-xs text-muted">
              Postgres verbunden über{" "}
              <code className="text-foreground">{adressName()}</code> — Anträge
              bleiben gespeichert.{" "}
              {schluesselVorhanden() ? (
                <>Bankverbindungen liegen verschlüsselt.</>
              ) : (
                <span className="text-amber-200/80">
                  Bankverbindungen liegen im Klartext — dafür fehlt{" "}
                  <code>CRM_DATEN_SCHLUESSEL</code>.
                </span>
              )}
            </span>
          </section>
        )}

        {!fehler && art === "speicher" && (
          <section className="rounded-[20px] border border-dashed border-amber-400/40 bg-amber-400/[0.06] p-5 flex flex-col gap-2">
            <span className="text-xs font-semibold text-amber-200/90">
              Zwischenlösung ohne Datenbank
            </span>
            <p className="text-xs text-amber-200/70 leading-relaxed max-w-3xl">
              Es ist keine Verbindungsadresse gesetzt, eingehende Anträge
              liegen deshalb im Arbeitsspeicher des Servers und können wieder
              verschwinden. Sobald <code>DATABASE_URL</code> in den
              Projekteinstellungen steht, wechselt das CRM von selbst auf
              Postgres.
            </p>
          </section>
        )}

        {/* Bei einem Ausfall bleiben Pipeline und Liste ganz weg. Sonst stuenden
            dort lauter Nullen und "Noch kein Antrag eingegangen" — eine
            Aussage ueber die Faelle, die niemand treffen kann, solange die
            Datenbank schweigt. Die Meldung darueber sagt, was Sache ist. */}
        {!fehler && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold">Pipeline</h2>
            <span className="text-xs text-muted">
              {gesamt} {gesamt === 1 ? "Fall" : "Fälle"} insgesamt
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
        )}

        {!fehler && (
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
                        Wiedervorlage
                      </th>
                      <th className="text-left font-semibold px-5 py-3">
                        Station
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
                          <td className="px-5 py-3 text-xs tabular-nums whitespace-nowrap">
                            {antrag.wiedervorlage ? (
                              <span
                                className={
                                  antrag.wiedervorlage < heute
                                    ? "text-amber-300"
                                    : "text-muted"
                                }
                              >
                                {antrag.wiedervorlage
                                  .split("-")
                                  .reverse()
                                  .join(".")}
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] whitespace-nowrap ${
                                antrag.status === "neu"
                                  ? "border border-accent/40 bg-accent/10 text-accent"
                                  : "border border-border bg-surface-2 text-muted"
                              }`}
                            >
                              {findeStation(antrag.status)?.name ??
                                antrag.status}
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
        )}

        <section className="rounded-[24px] border border-border bg-surface p-6 lg:p-8 flex flex-col gap-4">
          <h2 className="text-sm font-semibold">Was als Nächstes kommt</h2>
          <ol className="flex flex-col gap-3 text-sm text-muted leading-relaxed list-decimal pl-5">
            <li>
              Zuweisung an einen Berater — heute steht am Verlauf, wer etwas
              getan hat, aber nicht, wer zuständig ist.
            </li>
            <li>Benachrichtigung ans Team bei Eingang, Excel-Export.</li>
            <li>
              Eigene Konten statt der Umgebungsvariable, damit sich eine
              Sitzung auch vorzeitig beenden lässt.
            </li>
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
