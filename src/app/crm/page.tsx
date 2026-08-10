import Link from "next/link";
import AbmeldeKnopf from "@/components/crm/AbmeldeKnopf";
import FallZeile from "@/components/crm/FallZeile";
import PipelineBrett, {
  type BrettFall,
  type BrettStation,
} from "@/components/crm/PipelineBrett";
import {
  ablageart,
  alleAntraege,
  kundennummer,
  vollerName,
  zaehleAntraege,
  zaehleUebersicht,
  type Antrag,
  type AntragFilter,
} from "@/lib/crm/antraege";
import { adressName } from "@/lib/crm/db";
import { schluesselVorhanden } from "@/lib/crm/verschluesselung";
import { ROLLEN_NAMEN } from "@/lib/crm/benutzer";
import {
  nachGruppen,
  PAPIERKORB,
  STATIONEN,
  TON_KLASSEN,
  findeStation,
  stationOderErsatz,
  type StatusId,
} from "@/lib/crm/pipeline";
import {
  bewerte,
  zeigeWert,
  type Prioritaetsklasse,
} from "@/lib/crm/priorisierung";
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
  aenderung: Partial<AntragFilter>,
  sortierung?: string
): string {
  const zusammen = { ...jetzige, ...aenderung };
  const p = new URLSearchParams();
  if (zusammen.suche) p.set("q", zusammen.suche);
  if (zusammen.station) p.set("station", zusammen.station);
  if (zusammen.nurFaellig) p.set("faellig", "1");
  // Die Sortierung ueberlebt einen Ordnerwechsel: Wer nach Prioritaet sortiert
  // und dann einen Ordner aufschlaegt, will ihn auch nach Prioritaet sehen.
  if (sortierung && sortierung !== "eingang") p.set("sortierung", sortierung);
  const text = p.toString();
  return text ? `/crm?${text}` : "/crm";
}

/**
 * Die Farbe der Prioritaetsplakette.
 *
 * Ausgeschrieben und nicht zusammengesetzt: Tailwind liest den Quelltext nach
 * fertigen Klassennamen ab. Dieselbe Regel wie bei den Toenen der Ordner.
 *
 * Rot fuer P1 waere falsch — rot heisst in diesem CRM "hier endet etwas".
 * P1 ist kein Alarm, sondern das, was als naechstes drankommt.
 */
const KLASSEN_KLASSEN: Record<Prioritaetsklasse, string> = {
  P1: "border-accent/50 bg-accent/10 text-accent",
  P2: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  P3: "border-border text-muted",
  P4: "border-border/60 text-muted/70",
  P5: "border-border/40 text-muted/50",
};

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
   * Wonach die Liste sortiert ist.
   *
   * "Eingang" bleibt die Voreinstellung: Es ist die Reihenfolge, in der die
   * Faelle hereinkommen, und die Datenbank liefert sie ohnehin so.
   * "Priorität" sortiert die geladenen Zeilen hier — nicht in SQL, weil der
   * Wert von der Uhr abhaengt und in keiner Spalte steht. Das reicht, solange
   * die Liste geladen ist, wie sie ist: hoechstens fuenfhundert Zeilen.
   */
  const sortierung = einzeln(parameter.sortierung) === "prio" ? "prio" : "eingang";

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
    // Nur hier: Ohne die Karten des Papierkorbs liesse sich aus ihm nichts
    // wieder herausziehen. Liste, Zaehlung und Export lassen ihn weg.
    mitPapierkorb: true,
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

  try {
    // Drei Abfragen statt sechs. Die Zahlen der Uebersicht — Gesamtzahl,
    // Faelligkeiten, Zahl je Ordner — kommen aus einer einzigen Gruppierung;
    // vorher waren es drei Anfragen ans Netz fuer dieselbe Tabelle.
    const [liste, brett, zahlen, gefiltert] = await Promise.all([
      alleAntraege(filter),
      // Immer eine eigene Abfrage: Das Brett zeigt alle Ordner und nimmt
      // den Papierkorb mit, die Liste tut beides nicht.
      alleAntraege(brettFilter),
      zaehleUebersicht(),
      zaehleAntraege(filter),
    ]);
    antraege = liste;
    fuersBrett = brett;
    gesamt = zahlen.gesamt;
    faellige = zahlen.faellig;
    zaehler = zahlen.jeOrdner;
    getroffen = gefiltert;
  } catch (ausnahme) {
    fehler = ausnahme instanceof Error ? ausnahme.message : String(ausnahme);
  }

  const art = ablageart();
  // Fuer die Frage, ob eine Wiedervorlage schon faellig ist.
  const heute = new Date().toISOString().slice(0, 10);
  /**
   * Ein Zeitpunkt fuer die ganze Liste.
   *
   * Die Aktualitaet geht in den Prioritaetswert ein, und die haengt an der
   * Uhr. Jede Zeile ihre eigene nehmen zu lassen hiesse, dass die erste und
   * die letzte nach verschiedenen Massstaeben bewertet werden — bei
   * fuenfhundert Zeilen sind das Millisekunden, aber der Unterschied waere
   * willkuerlich und nicht erklaerbar.
   */
  const jetzt = new Date();

  /**
   * Die Spalten: die sechzehn Ordner der Pipeline, und dahinter jeder weitere
   * Status, auf dem noch Faelle stehen.
   *
   * Der zweite Teil ist die Versicherung gegen lautlosen Verlust. Wird die
   * Pipeline spaeter wieder umgebaut, faellt kein Fall aus dem Brett, nur weil
   * sein Ordner gestrichen wurde — er bekommt eine eigene, gestrichelte Spalte,
   * bis ihn jemand herauszieht. Danach verschwindet sie von selbst.
   */
  // Der Papierkorb gehoert dazu, obwohl er nicht in STATIONEN steht. Ohne ihn
  // hier hielte ihn die Schleife unten fuer eine unbekannte Kennung und gaebe
  // ihm eine gestrichelte Ersatzspalte neben der eigenen.
  const bekannt = new Set<string>([
    ...STATIONEN.map((s) => s.id),
    PAPIERKORB.id,
  ]);
  const uebrige = new Set<string>();
  for (const [status, anzahl] of Object.entries(zaehler)) {
    if (anzahl > 0 && !bekannt.has(status as StatusId)) uebrige.add(status);
  }
  for (const antrag of fuersBrett) {
    if (!bekannt.has(antrag.status)) uebrige.add(antrag.status);
  }

  /**
   * Wohin der Kopf einer Spalte fuehrt.
   *
   * Ist der Ordner schon aufgeschlagen, hebt derselbe Klick den Filter wieder
   * auf — sonst gaebe es einen Weg hinein und keinen zurueck ausser ueber
   * "Filter zuruecksetzen", das ganz woanders steht.
   *
   * Die Sprungmarke ist kein Schmuck: Das Brett ist hoch, die Liste steht
   * darunter. Ohne `#eingang` klickte man oben auf einen Ordner, die Seite
   * lade neu, und man staende wieder oben vor demselben Brett — die Antwort
   * auf den Klick laege ungesehen unterhalb des Bildschirmrands.
   */
  const ordnerAdresse = (id: StatusId) =>
    `${mitParametern(
      filter,
      { station: filter.station === id ? null : id },
      sortierung
    )}#eingang`;

  /**
   * Die Liste in der gewaehlten Reihenfolge.
   *
   * Kopiert, nicht an Ort und Stelle sortiert: `antraege` ist das Ergebnis
   * der Abfrage, und das soll nicht davon abhaengen, was die Anzeige damit
   * vorhat. Bei gleichem Wert bleibt die Reihenfolge der Abfrage — neueste
   * zuerst.
   */
  const listenAntraege =
    sortierung === "prio"
      ? [...antraege].sort(
          (a, b) => bewerte(b, jetzt).score - bewerte(a, jetzt).score
        )
      : antraege;

  const spalten: BrettStation[] = [
    ...STATIONEN.map((s) => ({
      id: s.id,
      name: s.name,
      beschreibung: s.beschreibung,
      ton: s.ton,
      gruppe: s.gruppe,
      href: ordnerAdresse(s.id),
    })),
    // Der Papierkorb steht am Ende, hinter allen Ordnern der Pipeline und vor
    // den stillgelegten. Er ist kein Schritt im Vertrieb, sondern der Weg
    // hinaus — und ganz rechts ist er da, wo man ihn sucht, ohne zwischen den
    // Arbeitsordnern im Weg zu stehen.
    {
      id: PAPIERKORB.id,
      name: PAPIERKORB.name,
      beschreibung: PAPIERKORB.beschreibung,
      ton: PAPIERKORB.ton,
      href: ordnerAdresse(PAPIERKORB.id),
      abseits: true,
    },
    ...[...uebrige].map((status) => {
      const s = stationOderErsatz(status);
      return {
        id: s.id,
        name: s.name,
        beschreibung: s.beschreibung,
        ton: s.ton,
        href: ordnerAdresse(s.id),
        stillgelegt: true,
        abseits: true,
      };
    }),
  ];

  /** Der aufgeschlagene Ordner — fuer die Markierung oben und die Ueberschrift unten. */
  const offenerOrdner = filter.station ? stationOderErsatz(filter.station) : null;

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
    kreditart: antrag.kreditart || null,
    // Die Farbe des Zwecks kommt aus derselben Liste, aus der die
    // Antragsstrecke sie nimmt. Damit sieht das Zeichen im CRM aus wie das,
    // das der Kunde angeklickt hat — und nicht wie ein zweites, eigenes.
    farbe: antrag.kreditart
      ? (findeKreditartNachId(antrag.kreditart)?.farbe ?? null)
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
            {/* Nur fuer Administratoren, weil nur sie loeschen duerfen — und
                weil ein Verweis auf eine Seite, die dann "nicht fuer Sie"
                sagt, schlechter ist als gar keiner. */}
            {benutzer.rolle === "admin" && (
              <Link
                href="/crm/protokoll"
                className="hidden sm:inline text-xs text-muted transition-colors duration-150 hover:text-foreground"
              >
                Löschprotokoll
              </Link>
            )}
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

        {/* Der Zustand der Ablage als schmale Zeile statt als Kasten.
            Solange alles steht, ist das eine Randnotiz — und eine Randnotiz
            gehoert an den Rand. Fehlt der Schluessel oder die Datenbank,
            faerbt sich dieselbe Zeile und faellt dann auch auf. */}
        {!fehler && art === "postgres" && (
          <p className="-mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
            <span className="size-1.5 rounded-full bg-accent shrink-0" />
            Postgres über <code className="text-foreground/80">{adressName()}</code>
            {schluesselVorhanden() ? (
              <span>· Bankverbindungen verschlüsselt</span>
            ) : (
              <span className="text-amber-200/90">
                · Bankverbindungen im Klartext, es fehlt{" "}
                <code>CRM_DATEN_SCHLUESSEL</code>
              </span>
            )}
          </p>
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
              {/* Seit die Spalten nur noch ein Zeichen tragen, gehoert der
                  Hinweis auf die Fahne hierher: Wer das Brett zum ersten Mal
                  sieht, kaeme sonst nicht darauf, dass die Namen ueberhaupt
                  noch irgendwo stehen. */}
              <span className="text-xs text-muted">
                Auf ein Symbol zeigen zeigt den Namen, klicken öffnet den
                Ordner in der Liste darunter.{" "}
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
              gewaehlt={filter.station ?? null}
            />
          </section>
        )}

        {!fehler && (
        /* `scroll-mt`: Der Sprung vom Brett landet sonst mit der Ueberschrift
           genau auf der Oberkante, und die Liste klebt am Fensterrand. */
        <section id="eingang" className="flex flex-col gap-4 scroll-mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Ist ein Ordner aufgeschlagen, traegt die Ueberschrift seinen
                Namen. "Eingang" ueber einer Liste, in der nur "Tag 2" steht,
                waere schlicht die falsche Auskunft — und der Klick oben im
                Brett bliebe ohne sichtbare Antwort. */}
            <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              {offenerOrdner ? (
                <>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[11px] whitespace-nowrap ${
                      TON_KLASSEN[offenerOrdner.ton].schild
                    }`}
                  >
                    {offenerOrdner.name}
                  </span>
                  <span className="font-normal text-muted">
                    {getroffen} von {gesamt}
                  </span>
                  <span className="hidden font-normal text-muted sm:inline">
                    · {offenerOrdner.beschreibung}
                  </span>
                </>
              ) : (
                <>
                  Eingang
                  {filterAktiv && (
                    <span className="font-normal text-muted">
                      {getroffen} von {gesamt}
                    </span>
                  )}
                </>
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
                {/* `key` an beiden Feldern, und zwar am jeweils gefilterten
                    Wert: `defaultValue` wirkt nur beim ersten Aufbau. Beim
                    Klick auf einen Ordner im Brett wechselt die Seite ohne
                    Neuladen, React behaelt die vorhandenen Felder — und dann
                    stuende hier weiter "Alle Ordner", obwohl unten nur noch
                    ein Ordner zu sehen ist. Die beiden Ansichten
                    widersprechen sich, und wer danach auf "Suchen" drueckt,
                    verliert den Ordner wieder. */}
                <input
                  key={filter.suche}
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
                  key={filter.station ?? "alle"}
                  name="station"
                  defaultValue={filter.station ?? ""}
                  aria-label="Ordner"
                  className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <option value="">Alle Ordner</option>
                  {/* Ordner einer Gruppe stehen unter ihrer Ueberschrift
                      beieinander — "Erledigt" mit seinen beiden
                      Unterordnern. */}
                  {nachGruppen(spalten).map((buendel) =>
                    buendel.gruppe ? (
                      <optgroup key={buendel.gruppe} label={buendel.gruppe}>
                        {buendel.ordner.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </optgroup>
                    ) : (
                      buendel.ordner.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))
                    )
                  )}
                </select>
                <button
                  type="submit"
                  className="rounded-[12px] border border-border-strong bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-surface"
                >
                  Suchen
                </button>
              </form>

              {/* Zwei Reihenfolgen, ein Umschalter. Der Eingang ist die
                  Voreinstellung — er ist die Reihenfolge, in der die Faelle
                  hereinkommen. Die Prioritaet ist die Reihenfolge, in der man
                  sie abarbeiten sollte. */}
              <Link
                href={mitParametern(
                  filter,
                  {},
                  sortierung === "prio" ? "eingang" : "prio"
                )}
                className={`rounded-[12px] border px-3 py-2 text-xs transition-colors duration-150 ${
                  sortierung === "prio"
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {sortierung === "prio"
                  ? "Nach Priorität"
                  : "Nach Eingang"}
              </Link>

              <Link
                href={mitParametern(
                  filter,
                  { nurFaellig: !filter.nurFaellig },
                  sortierung
                )}
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
              {/* Ein leerer Ordner ist etwas anderes als eine Suche ohne
                  Treffer. "Kein Fall passt zu dieser Suche" ueber einem
                  Ordner, in den man gerade erst geklickt hat, klaenge nach
                  einem Fehler — dabei ist der Ordner einfach leer. */}
              <span className="text-sm font-semibold">
                {offenerOrdner && !filter.suche && !filter.nurFaellig
                  ? `In "${offenerOrdner.name}" liegt kein Fall`
                  : filterAktiv
                    ? "Kein Fall passt zu dieser Suche"
                    : "Noch kein Antrag eingegangen"}
              </span>
              <p className="text-xs text-muted leading-relaxed">
                {offenerOrdner && !filter.suche && !filter.nurFaellig
                  ? `${offenerOrdner.beschreibung} Insgesamt liegen ${gesamt} Fälle vor.`
                  : filterAktiv
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
                      {/* Die Kundennummer ganz vorn: Sie ist die Angabe, mit
                          der jemand anruft, und damit die, nach der man in
                          einer Liste sucht. */}
                      <th className="text-left font-semibold px-5 py-3">Nr.</th>
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
                      {/* Der Prioritaetswert als eigene Spalte. Er steht in
                          der Liste, weil hier entschieden wird, wen man als
                          naechstes anruft — in der Fallakte steht daneben,
                          woraus er sich zusammensetzt. */}
                      <th className="text-right font-semibold px-5 py-3">
                        Priorität
                      </th>
                      {/* Keine IBAN-Spalte. Sie stand hier verkuerzt, aber
                          auch die letzten vier Stellen sind eine
                          Bankverbindung — und diese Liste ist die Ansicht, die
                          offen liegt, waehrend jemand telefoniert oder einen
                          Bildschirm teilt. Wer die IBAN braucht, ruft den Fall
                          auf; dort steht sie vollstaendig, mit Kopierknopf und
                          Vermerk im Verlauf. */}
                      <th className="text-left font-semibold px-5 py-3">
                        Wiedervorlage
                      </th>
                      <th className="text-left font-semibold px-5 py-3">
                        Ordner
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listenAntraege.map((antrag) => {
                      const art = antrag.kreditart
                        ? findeKreditartNachId(antrag.kreditart)?.de.name
                        : undefined;
                      const station = stationOderErsatz(antrag.status);
                      const bewertung = bewerte(antrag, jetzt);
                      return (
                        /* Die ganze Zeile fuehrt zum Fall, nicht nur der
                           Name. Der Verweis am Namen bleibt trotzdem — er
                           ist der Weg fuer die Tastatur und fuer "in neuem
                           Tab oeffnen". */
                        <FallZeile
                          key={antrag.id}
                          href={`/crm/antrag/${antrag.id}`}
                          className="border-b border-border/60 last:border-0 hover:bg-surface-2/60 transition-colors duration-150"
                        >
                          <td className="px-5 py-3 text-xs tabular-nums whitespace-nowrap">
                            {kundennummer(antrag)}
                          </td>
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
                          <td className="px-5 py-3 text-right whitespace-nowrap">
                            <span
                              title={`${bewertung.bedeutung} · Aktualität ${zeigeWert(bewertung.merkmale.recency)}, Kreditsumme ${zeigeWert(bewertung.merkmale.betrag)}, Passung ${zeigeWert(bewertung.merkmale.passung)}, Datenlage ${zeigeWert(bewertung.merkmale.absicht)}, IBAN ${zeigeWert(bewertung.merkmale.iban)}`}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] tabular-nums ${KLASSEN_KLASSEN[bewertung.klasse]}`}
                            >
                              {bewertung.klasse}
                              <span className="text-foreground">
                                {zeigeWert(bewertung.score)}
                              </span>
                            </span>
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
                        </FallZeile>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
        )}

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
