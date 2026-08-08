import Link from "next/link";
import AbmeldeKnopf from "@/components/crm/AbmeldeKnopf";
import PipelineBrett, {
  type BrettFall,
  type BrettStation,
} from "@/components/crm/PipelineBrett";
import {
  ablageart,
  alleAntraege,
  ibanVerkuerzt,
  vollerName,
  zaehleAntraege,
  zaehleFaellige,
  zaehleNachStatus,
  type Antrag,
  type AntragFilter,
} from "@/lib/crm/antraege";
import { adressName } from "@/lib/crm/db";
import { schluesselVorhanden } from "@/lib/crm/verschluesselung";
import { ROLLEN_NAMEN } from "@/lib/crm/benutzer";
import {
  STATIONEN,
  TON_KLASSEN,
  findeStation,
  stationOderErsatz,
  type StatusId,
} from "@/lib/crm/pipeline";
import { verlangeAnmeldung } from "@/lib/crm/zugang";
import { findeKreditartNachId } from "@/lib/kreditarten";
import { formatEuro } from "@/lib/loan-calc";

/**
 * Die Startseite des CRM: der Eingang.
 *
 * Zwei Ansichten auf dieselben Faelle, und beide werden gebraucht. Oben das
 * Brett — wo steht was, und wohin schiebe ich es. Unten die Liste — wer war
 * das noch mal, und gib mir das als Datei. Die Zahlen an den Ordnern sind
 * gezaehlt, nicht gesetzt: Steht dort eine Null, ist der Ordner wirklich leer.
 */
function einzeln(wert: string | string[] | undefined): string {
  return (Array.isArray(wert) ? wert[0] : wert) ?? "";
}

/** Adresse mit geaenderten Suchparametern, ohne die uebrigen zu verlieren. */
function mitParametern(
  jetzige: AntragFilter,
  aenderung: Partial<AntragFilter>
): string {
  const zusammen = { ...jetzige, ...aenderung };
  const p = new URLSearchParams();
  if (zusammen.suche) p.set("q", zusammen.suche);
  if (zusammen.station) p.set("station", zusammen.station);
  if (zusammen.nurFaellig) p.set("faellig", "1");
  const text = p.toString();
  return text ? `/crm?${text}` : "/crm";
}

/** TT.MM. — mehr traegt eine Karte nicht, ohne unruhig zu werden. */
function kurzerTag(wert: string): string {
  return new Date(wert).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default async function CrmSeite({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const benutzer = await verlangeAnmeldung("/crm");
  const parameter = await searchParams;

  const gewaehlteStation = einzeln(parameter.station);
  const filter: AntragFilter = {
    suche: einzeln(parameter.q).trim(),
    // Nur Stationen, die es gibt — sonst zeigte eine erfundene Adresse eine
    // leere Liste, als waere wirklich nichts da.
    station: findeStation(gewaehlteStation)
      ? (gewaehlteStation as StatusId)
      : null,
    nurFaellig: einzeln(parameter.faellig) === "1",
  };
  const filterAktiv = Boolean(
    filter.suche || filter.station || filter.nurFaellig
  );

  /**
   * Das Brett kennt den Ordner-Filter nicht. Es ist die Uebersicht ueber alle
   * Ordner — auf einen einzigen eingeschraenkt waeren dreizehn Spalten leer,
   * und der Sinn des Bretts, naemlich zu sehen wo etwas liegt und es
   * woandershin zu ziehen, waere weg. Suche und Faelligkeit gelten dagegen
   * auch dort: Wer nach "Müller" sucht, will Müller im Brett sehen.
   */
  const brettFilter: AntragFilter = {
    suche: filter.suche,
    nurFaellig: filter.nurFaellig,
  };

  // Faellt die Datenbank aus, soll hier nicht eine leere Liste stehen — die
  // saehe aus wie "keine Antraege" und ist etwas ganz anderes.
  let antraege: Antrag[] = [];
  let fuersBrett: Antrag[] = [];
  let gesamt = 0;
  let getroffen = 0;
  let faellige = 0;
  let zaehler: Record<string, number> = {};
  let fehler: string | null = null;
  let eigenesBrett: Antrag[] | null = null;

  try {
    [antraege, eigenesBrett, gesamt, getroffen, faellige, zaehler] =
      await Promise.all([
        alleAntraege(filter),
        // Ohne Ordner-Filter ist es dieselbe Abfrage — dann keine zweite.
        filter.station ? alleAntraege(brettFilter) : Promise.resolve(null),
        zaehleAntraege(),
        zaehleAntraege(filter),
        zaehleFaellige(),
        zaehleNachStatus(),
      ]);
    fuersBrett = eigenesBrett ?? antraege;
  } catch (ausnahme) {
    fehler = ausnahme instanceof Error ? ausnahme.message : String(ausnahme);
  }

  const art = ablageart();
  // Fuer die Frage, ob eine Wiedervorlage schon faellig ist.
  const heute = new Date().toISOString().slice(0, 10);

  /**
   * Die Spalten: die vierzehn Ordner der Pipeline, und dahinter jeder weitere
   * Status, auf dem noch Faelle stehen.
   *
   * Der zweite Teil ist die Versicherung gegen lautlosen Verlust. Wird die
   * Pipeline spaeter wieder umgebaut, faellt kein Fall aus dem Brett, nur weil
   * sein Ordner gestrichen wurde — er bekommt eine eigene, gestrichelte Spalte,
   * bis ihn jemand herauszieht. Danach verschwindet sie von selbst.
   */
  const bekannt = new Set(STATIONEN.map((s) => s.id));
  const uebrige = new Set<string>();
  for (const [status, anzahl] of Object.entries(zaehler)) {
    if (anzahl > 0 && !bekannt.has(status as StatusId)) uebrige.add(status);
  }
  for (const antrag of fuersBrett) {
    if (!bekannt.has(antrag.status)) uebrige.add(antrag.status);
  }

  const spalten: BrettStation[] = [
    ...STATIONEN.map((s) => ({
      id: s.id,
      name: s.name,
      beschreibung: s.beschreibung,
      ton: s.ton,
    })),
    ...[...uebrige].map((status) => {
      const s = stationOderErsatz(status);
      return {
        id: s.id,
        name: s.name,
        beschreibung: s.beschreibung,
        ton: s.ton,
        stillgelegt: true,
      };
    }),
  ];

  const karten: BrettFall[] = fuersBrett.map((antrag) => ({
    id: antrag.id,
    status: antrag.status,
    name: vollerName(antrag),
    ort: antrag.ort,
    betrag: formatEuro(antrag.amount),
    laufzeit: `${antrag.months} Mon.`,
    eingang: kurzerTag(antrag.eingang),
    wiedervorlage: antrag.wiedervorlage
      ? antrag.wiedervorlage.slice(8, 10) +
        "." +
        antrag.wiedervorlage.slice(5, 7) +
        "."
      : null,
    faellig: Boolean(antrag.wiedervorlage && antrag.wiedervorlage <= heute),
    art: antrag.kreditart
      ? (findeKreditartNachId(antrag.kreditart)?.de.name ?? null)
      : null,
  }));

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        {/* Umbrechend und mit truncate: Auf schmalen Geraeten schob der Name
            sonst den Abmelden-Knopf ueber den Rand hinaus. */}
        <div className="w-full px-6 lg:px-10 py-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-bold tracking-[-0.02em]">CRM</span>
            <span className="hidden sm:inline text-xs text-muted">
              cresolu.de
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-4">
            <div className="min-w-0 text-right leading-tight">
              <div className="truncate text-sm font-semibold">
                {benutzer.anzeigename}
              </div>
              <div className="truncate text-[11px] text-muted">
                {ROLLEN_NAMEN[benutzer.rolle]}
              </div>
            </div>
            <AbmeldeKnopf />
          </div>
        </div>
      </header>

      <div className="w-full px-6 lg:px-10 py-10 flex flex-col gap-10">
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

        {/* Bei einem Ausfall bleiben Brett und Liste ganz weg. Sonst stuenden
            dort lauter Nullen und "Noch kein Antrag eingegangen" — eine
            Aussage ueber die Faelle, die niemand treffen kann, solange die
            Datenbank schweigt. Die Meldung darueber sagt, was Sache ist. */}
        {!fehler && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-sm font-semibold">Pipeline</h2>
              <span className="text-xs text-muted">
                {benutzer.rolle === "lesen"
                  ? "Dieses Konto darf Fälle nur ansehen."
                  : "Karte am Griff links greifen und in einen anderen Ordner ziehen."}{" "}
                {gesamt} {gesamt === 1 ? "Fall" : "Fälle"} insgesamt
              </span>
            </div>

            <PipelineBrett
              stationen={spalten}
              faelle={karten}
              darfSchieben={benutzer.rolle !== "lesen"}
            />
          </section>
        )}

        {!fehler && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              Eingang
              {filterAktiv && (
                <span className="ml-2 font-normal text-muted">
                  {getroffen} von {gesamt}
                </span>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Ein gewoehnliches Formular ohne Skript: Die Suche steht danach
                  in der Adresse und laesst sich als Lesezeichen ablegen oder
                  weitergeben. */}
              <form method="get" action="/crm" className="flex flex-wrap gap-2">
                {filter.nurFaellig && (
                  <input type="hidden" name="faellig" value="1" />
                )}
                <input
                  type="search"
                  name="q"
                  defaultValue={filter.suche}
                  placeholder="Name, E-Mail, Telefon, Ort"
                  className="w-64 rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                />
                {/* Das Brett zeigt alle Ordner; hier wird auf einen
                    eingeschraenkt — fuer die Liste und fuer den Export, der
                    denselben Filter mitnimmt. */}
                <select
                  name="station"
                  defaultValue={filter.station ?? ""}
                  aria-label="Ordner"
                  className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <option value="">Alle Ordner</option>
                  {spalten.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-[12px] border border-border-strong bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-surface"
                >
                  Suchen
                </button>
              </form>

              <Link
                href={mitParametern(filter, { nurFaellig: !filter.nurFaellig })}
                className={`rounded-[12px] border px-3 py-2 text-xs transition-colors duration-150 ${
                  filter.nurFaellig
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-200"
                    : "border-border bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                Fällig <span className="tabular-nums">{faellige}</span>
              </Link>

              {filterAktiv && (
                <Link
                  href="/crm"
                  className="rounded-[12px] border border-border px-3 py-2 text-xs text-muted transition-colors duration-150 hover:text-foreground"
                >
                  Filter zurücksetzen
                </Link>
              )}

              {/* Kein Link auf eine Seite, sondern auf den Endpunkt: Der
                  liefert die Datei mit demselben Filter, der gerade gilt. */}
              <a
                href={`/api/crm-export${mitParametern(filter, {}).slice("/crm".length)}`}
                className="rounded-[12px] border border-border px-3 py-2 text-xs text-muted transition-colors duration-150 hover:text-foreground"
              >
                Export
              </a>
            </div>
          </div>

          {antraege.length === 0 ? (
            <div className="rounded-[24px] border border-border bg-surface p-8 flex flex-col gap-2 text-center">
              <span className="text-sm font-semibold">
                {filterAktiv
                  ? "Kein Fall passt zu dieser Suche"
                  : "Noch kein Antrag eingegangen"}
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {filterAktiv
                  ? `Insgesamt liegen ${gesamt} Fälle vor.`
                  : "Sobald jemand die Antragsstrecke abschließt, steht der Fall hier — mit allen Angaben aus den acht Schritten."}
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
                        Ordner
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {antraege.map((antrag) => {
                      const art = antrag.kreditart
                        ? findeKreditartNachId(antrag.kreditart)?.de.name
                        : undefined;
                      const station = stationOderErsatz(antrag.status);
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
                            {/* Dieselbe Farbe wie der Punkt am Ordner im
                                Brett — sonst muesste man zwischen zwei
                                Ansichten Namen vergleichen. */}
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] whitespace-nowrap ${
                                TON_KLASSEN[station.ton].schild
                              }`}
                            >
                              {station.name}
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
