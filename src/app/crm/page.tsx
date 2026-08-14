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
import {
  alsAdresse,
  alsFilter,
  angezeigteFaelle,
  anzahlFilter,
  ersteRichtung,
  feinfilterAktiv,
  filterAktiv as istFilterAktiv,
  leseAnsicht,
  type Sortierschluessel,
} from "@/lib/crm/ansicht";
import { adressName } from "@/lib/crm/db";
import { schluesselVorhanden } from "@/lib/crm/verschluesselung";
import { ROLLEN_NAMEN } from "@/lib/crm/benutzer";
import {
  nachGruppen,
  PAPIERKORB,
  STATIONEN,
  TON_KLASSEN,
  stationOderErsatz,
  type StatusId,
} from "@/lib/crm/pipeline";
import {
  bewerte,
  KLASSEN,
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

/** Kennung des Filterformulars — die Felder in der Klappe gehoeren dazu. */
const FORMULAR = "eingangsfilter";

/** Einheitliches Aussehen fuer die Felder in der Filterklappe. */
const FELD =
  "w-28 rounded-[10px] border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

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

/**
 * Ein Paar Von-Bis-Felder mit Beschriftung darueber.
 *
 * Vier Mal derselbe Aufbau in der Filterklappe — einmal beschrieben statt
 * viermal abgeschrieben. Die Einheit steht hinter den Feldern und nicht in
 * ihnen: In einem Zahlenfeld waere sie ein Platzhalter, der beim ersten
 * Tastendruck verschwindet.
 */
function Spanne({
  titel,
  einheit,
  hinweis,
  children,
}: {
  titel: string;
  einheit?: string;
  hinweis?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-muted">
        {titel}
        {hinweis && (
          <span className="ml-1.5 font-normal text-muted/60">{hinweis}</span>
        )}
      </span>
      <div className="flex items-center gap-1.5">
        {children}
        {einheit && (
          <span className="text-[11px] text-muted/70">{einheit}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Eine Spaltenueberschrift, nach der sich sortieren laesst.
 *
 * Ein Dreieck steht an jeder Ueberschrift, nicht nur an der sortierten. Es ist
 * die Ansage, dass hier ueberhaupt etwas anzuklicken ist — ohne sie muesste
 * man es raten oder mit der Maus darueberfahren, und auf einem Tastgeraet
 * faellt beides weg.
 *
 * Unterschieden wird ueber die Farbe und nicht ueber die Anwesenheit: Die
 * sortierte Spalte traegt ihr Dreieck in der Betonungsfarbe, die uebrigen in
 * einem Grau, das man sieht, wenn man hinsieht, und uebersieht, wenn man
 * liest. Die Richtung, die das blasse Dreieck zeigt, ist die, in die der erste
 * Klick sortieren wird — es ist damit keine Behauptung ueber den jetzigen
 * Zustand, sondern eine ueber den naechsten.
 */
function Kopf({
  titel,
  href,
  aktiv,
  richtung,
  rechts = false,
}: {
  titel: string;
  href: string;
  aktiv: boolean;
  /** Bei der aktiven Spalte die geltende Richtung, sonst die des ersten Klicks. */
  richtung: "auf" | "ab";
  rechts?: boolean;
}) {
  return (
    <th
      // Die Auskunft gehoert an die Spalte, nicht an den Verweis darin: Eine
      // Vorlesehilfe fragt die Zelle, wie die Tabelle sortiert ist.
      aria-sort={
        aktiv ? (richtung === "auf" ? "ascending" : "descending") : "none"
      }
      className={`font-semibold px-5 py-3 ${rechts ? "text-right" : "text-left"}`}
    >
      <Link
        href={href}
        // Der Verweis fuehrt auf dieselbe Liste zurueck, damit die Antwort auf
        // den Klick im Bild bleibt statt oben am Brett zu landen.
        className={`inline-flex items-center gap-1 whitespace-nowrap transition-colors duration-150 hover:text-foreground ${
          aktiv ? "text-accent" : ""
        }`}
      >
        {titel}
        {/* 60 Prozent und nicht weniger: Bei 40 kam das Dreieck auf 2,2:1
            gegen den Hintergrund und war damit unter der Grenze, ab der ein
            Bedienelement als erkennbar gilt. Gemessen, nicht geschaetzt —
            gegen #0f1c37 sind es so 3,35:1, der Titel daneben hat 6,9:1. */}
        <span
          aria-hidden="true"
          className={`text-[9px] ${aktiv ? "" : "text-muted/60"}`}
        >
          {richtung === "auf" ? "▲" : "▼"}
        </span>
      </Link>
    </th>
  );
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

  /**
   * Filter und Reihenfolge stehen vollstaendig in der Adresse.
   *
   * Damit ist jede Ansicht ein Lesezeichen und laesst sich weitergeben — "die
   * offenen Faelle ab 30.000 aus dem letzten Monat" ist ein Link und keine
   * Anleitung. Ausgelesen wird das an einer Stelle, die Liste, Brett und
   * Export gemeinsam benutzen; sonst zeigte der Export irgendwann eine andere
   * Auswahl als die Liste, aus der man ihn angeklickt hat.
   */
  const ansicht = leseAnsicht((name) => einzeln(parameter[name]));
  const filter: AntragFilter = alsFilter(ansicht);
  const filterAktiv = istFilterAktiv(ansicht);
  const sortierung = ansicht.sortierung;

  /**
   * Das Brett kennt den Ordner-Filter nicht. Es ist die Uebersicht ueber alle
   * Ordner — auf einen einzigen eingeschraenkt waeren dreizehn Spalten leer,
   * und der Sinn des Bretts, naemlich zu sehen wo etwas liegt und es
   * woandershin zu ziehen, waere weg. Suche und Faelligkeit gelten dagegen
   * auch dort: Wer nach "Müller" sucht, will Müller im Brett sehen.
   */
  const brettFilter: AntragFilter = {
    ...filter,
    station: null,
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
    `${alsAdresse(ansicht, {
      station: ansicht.station === id ? null : id,
    })}#eingang`;

  /**
   * Die Adresse, die eine Spaltenueberschrift traegt.
   *
   * Erster Klick: nach dieser Kennzahl sortieren, in der Richtung, die bei ihr
   * die naheliegende ist. Jeder weitere: die Richtung umdrehen. Dass beides an
   * derselben Ueberschrift haengt, ist die Bedienung, die man aus jeder
   * Tabelle kennt — und sie braucht kein Skript, weil es Verweise sind.
   */
  /**
   * Welche Richtung das Dreieck einer Ueberschrift zeigt: bei der sortierten
   * Spalte die geltende, bei allen anderen die, in die ihr erster Klick
   * sortieren wird.
   */
  const kopfRichtung = (schluessel: Sortierschluessel) =>
    sortierung === schluessel ? ansicht.richtung : ersteRichtung(schluessel);

  const sortierAdresse = (schluessel: Sortierschluessel) =>
    `${alsAdresse(ansicht, {
      sortierung: schluessel,
      richtung:
        ansicht.sortierung === schluessel
          ? ansicht.richtung === "auf"
            ? "ab"
            : "auf"
          : ersteRichtung(schluessel),
    })}#eingang`;

  /**
   * Die Liste, wie sie angezeigt wird: nachgefiltert und sortiert.
   *
   * Beides passiert hier und nicht in SQL, weil Einkommen und Prioritaet in
   * keiner Spalte stehen — das Einkommen als getippte Zeichenkette im JSON,
   * die Prioritaet gar nicht, weil sie von der Uhr abhaengt. Das traegt,
   * solange die Abfrage laedt, was sie laedt: hoechstens fuenfhundert Zeilen.
   */
  const listenAntraege = angezeigteFaelle(antraege, ansicht, jetzt);

  /**
   * Wie viele Faelle die Auswahl trifft.
   *
   * Sobald hier nachgefiltert wird, ist die gezaehlte Zahl aus der Datenbank
   * nicht mehr die Antwort — sie kennt weder Einkommen noch Prioritaet.
   * Gezaehlt wird dann, was uebrig geblieben ist.
   */
  const angezeigt = feinfilterAktiv(ansicht) ? listenAntraege.length : getroffen;

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

  // Das Brett bekommt dieselbe Auswahl und dieselbe Reihenfolge wie die Liste.
  // Sonst stuende oben eine Karte, die unten herausgefiltert ist — und die
  // Zahl an der Spalte, die aus den Karten gezaehlt wird, widerspraeche der
  // Zahl an der Ueberschrift darunter.
  const karten: BrettFall[] = angezeigteFaelle(fuersBrett, ansicht, jetzt).map((antrag) => ({
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
                    {angezeigt} von {gesamt}
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
                      {angezeigt} von {gesamt}
                    </span>
                  )}
                </>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {/* Ein gewoehnliches Formular ohne Skript: Die Suche steht danach
                  in der Adresse und laesst sich als Lesezeichen ablegen oder
                  weitergeben.
                  Die Kennung traegt die Felder in der Filterklappe weiter
                  unten mit: Sie stehen ueber `form` in demselben Formular,
                  ohne darin geschachtelt zu sein. Ohne das setzte ein Klick
                  auf "Suchen" jede eingestellte Spanne zurueck. */}
              <form
                id={FORMULAR}
                method="get"
                action="/crm"
                className="flex flex-wrap gap-2"
              >
                {filter.nurFaellig && (
                  <input type="hidden" name="faellig" value="1" />
                )}
                {/* Die Reihenfolge ueberlebt eine Suche. Sie ist eine
                    Einstellung der Ansicht und keine Auswahl von Faellen — wer
                    nach Betrag sortiert und dann sucht, will die Treffer nach
                    Betrag sehen. */}
                {ansicht.sortierung !== "eingang" && (
                  <input
                    type="hidden"
                    name="sortierung"
                    value={ansicht.sortierung}
                  />
                )}
                {ansicht.richtung !== ersteRichtung(ansicht.sortierung) && (
                  <input
                    type="hidden"
                    name="richtung"
                    value={ansicht.richtung}
                  />
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
                  sie abarbeiten sollte. Dieselbe Einstellung wie ein Klick auf
                  die Spalte "Priorität"; beide lesen und schreiben denselben
                  Wert und koennen sich deshalb nicht widersprechen. */}
              <Link
                href={alsAdresse(ansicht, {
                  sortierung: sortierung === "prio" ? "eingang" : "prio",
                  richtung: ersteRichtung(
                    sortierung === "prio" ? "eingang" : "prio"
                  ),
                })}
                className={`rounded-[12px] border px-3 py-2 text-xs transition-colors duration-150 ${
                  sortierung === "prio"
                    ? "border-accent/50 bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-muted hover:text-foreground"
                }`}
              >
                {sortierung === "prio" ? "Nach Priorität" : "Nach Eingang"}
              </Link>

              <Link
                href={alsAdresse(ansicht, { nurFaellig: !ansicht.nurFaellig })}
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
                href={alsAdresse(ansicht, {}, "/api/crm-export")}
                className="rounded-[12px] border border-border px-3 py-2 text-xs text-muted transition-colors duration-150 hover:text-foreground"
              >
                Export
              </a>
            </div>
          </div>

          {/*
            Die Spannen stehen in einer Klappe und nicht in der Zeile darueber.

            Acht weitere Felder neben Suche und Ordner waeren eine Werkzeugbank
            und keine Werkzeugleiste — gebraucht werden sie selten, und wer sie
            braucht, klappt sie auf. Ist etwas eingestellt, steht die Klappe
            offen und traegt die Zahl der Einschraenkungen: Ein Filter, der
            wirkt, aber zugeklappt ist, ist die Erklaerung dafuer, warum die
            Liste "schon wieder leer" ist.

            `details` und nicht ein Knopf mit Zustand: Das Auf- und Zuklappen
            ist die einzige Bewegung, die es hier gibt, und der Browser kann
            sie ohne eine Zeile JavaScript.
          */}
          <details
            open={anzahlFilter(ansicht) > 0}
            className="rounded-[16px] border border-border bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted transition-colors duration-150 hover:text-foreground">
              <span aria-hidden="true" className="text-[10px]">
                ▸
              </span>
              Filter
              {anzahlFilter(ansicht) > 0 && (
                <span className="rounded-full border border-accent/50 bg-accent/10 px-2 py-0.5 text-[10px] text-accent tabular-nums">
                  {anzahlFilter(ansicht)}
                </span>
              )}
              <span className="font-normal text-muted/70">
                Kreditsumme, Einkommen, Priorität, Zeitraum
              </span>
            </summary>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-4 border-t border-border px-4 py-4">
              <Spanne titel="Kreditsumme" einheit="€">
                <input
                  key={`bv-${ansicht.betragVon}`}
                  form={FORMULAR}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  name="betrag_von"
                  defaultValue={ansicht.betragVon ?? ""}
                  placeholder="von"
                  aria-label="Kreditsumme von"
                  className={FELD}
                />
                <span className="text-muted">–</span>
                <input
                  key={`bb-${ansicht.betragBis}`}
                  form={FORMULAR}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1000}
                  name="betrag_bis"
                  defaultValue={ansicht.betragBis ?? ""}
                  placeholder="bis"
                  aria-label="Kreditsumme bis"
                  className={FELD}
                />
              </Spanne>

              {/* Gemeint ist der niedrigste der angegebenen Monate — dieselbe
                  Zahl, mit der die Fallakte rechnet und mit der eine Bank
                  rechnet. Das steht dabei, sonst filtert man nach etwas
                  anderem als man denkt. */}
              <Spanne
                titel="Einkommen"
                einheit="€ netto"
                hinweis="niedrigster Monat"
              >
                <input
                  key={`ev-${ansicht.einkommenVon}`}
                  form={FORMULAR}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  name="netto_von"
                  defaultValue={ansicht.einkommenVon ?? ""}
                  placeholder="von"
                  aria-label="Einkommen von"
                  className={FELD}
                />
                <span className="text-muted">–</span>
                <input
                  key={`eb-${ansicht.einkommenBis}`}
                  form={FORMULAR}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  name="netto_bis"
                  defaultValue={ansicht.einkommenBis ?? ""}
                  placeholder="bis"
                  aria-label="Einkommen bis"
                  className={FELD}
                />
              </Spanne>

              <Spanne titel="Priorität">
                <select
                  key={`pv-${ansicht.prioVon}`}
                  form={FORMULAR}
                  name="prio_von"
                  defaultValue={ansicht.prioVon ?? ""}
                  aria-label="Priorität von"
                  className={FELD}
                >
                  <option value="">von</option>
                  {KLASSEN.map((k, i) => (
                    <option key={k.klasse} value={i + 1}>
                      {k.klasse}
                    </option>
                  ))}
                </select>
                <span className="text-muted">–</span>
                <select
                  key={`pb-${ansicht.prioBis}`}
                  form={FORMULAR}
                  name="prio_bis"
                  defaultValue={ansicht.prioBis ?? ""}
                  aria-label="Priorität bis"
                  className={FELD}
                >
                  <option value="">bis</option>
                  {KLASSEN.map((k, i) => (
                    <option key={k.klasse} value={i + 1}>
                      {k.klasse}
                    </option>
                  ))}
                </select>
              </Spanne>

              {/* Beide Tage zaehlen mit. Der Zeitraum meint den Eingang und
                  nicht die Wiedervorlage — danach fragt der Knopf "Fällig". */}
              <Spanne titel="Eingang" hinweis="Zeitraum">
                <input
                  key={`dv-${ansicht.vonDatum}`}
                  form={FORMULAR}
                  type="date"
                  name="von"
                  defaultValue={ansicht.vonDatum ?? ""}
                  aria-label="Eingang von"
                  className={`${FELD} w-36`}
                />
                <span className="text-muted">–</span>
                <input
                  key={`db-${ansicht.bisDatum}`}
                  form={FORMULAR}
                  type="date"
                  name="bis"
                  defaultValue={ansicht.bisDatum ?? ""}
                  aria-label="Eingang bis"
                  className={`${FELD} w-36`}
                />
              </Spanne>

              <button
                form={FORMULAR}
                type="submit"
                className="rounded-[12px] border border-border-strong bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-surface"
              >
                Anwenden
              </button>
            </div>
          </details>

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
                    {/* Jede Spalte ist anklickbar und dreht sich beim zweiten
                        Klick um — die Zahlen auf- und absteigend, die Namen
                        nach Alphabet, der Ordner den Weg der Pipeline entlang
                        von "Neu" bis zum Papierkorb. */}
                    <tr className="border-b border-border text-[11px] text-muted">
                      {/* Die Kundennummer ganz vorn: Sie ist die Angabe, mit
                          der jemand anruft, und damit die, nach der man in
                          einer Liste sucht. */}
                      <Kopf
                        titel="Nr."
                        href={sortierAdresse("nummer")}
                        aktiv={sortierung === "nummer"}
                        richtung={kopfRichtung("nummer")}
                      />
                      <Kopf
                        titel="Eingang"
                        href={sortierAdresse("eingang")}
                        aktiv={sortierung === "eingang"}
                        richtung={kopfRichtung("eingang")}
                      />
                      <Kopf
                        titel="Name"
                        href={sortierAdresse("name")}
                        aktiv={sortierung === "name"}
                        richtung={kopfRichtung("name")}
                      />
                      <Kopf
                        titel="Verwendung"
                        href={sortierAdresse("verwendung")}
                        aktiv={sortierung === "verwendung"}
                        richtung={kopfRichtung("verwendung")}
                      />
                      <Kopf
                        titel="Betrag"
                        href={sortierAdresse("betrag")}
                        aktiv={sortierung === "betrag"}
                        richtung={kopfRichtung("betrag")}
                        rechts
                      />
                      <Kopf
                        titel="Laufzeit"
                        href={sortierAdresse("laufzeit")}
                        aktiv={sortierung === "laufzeit"}
                        richtung={kopfRichtung("laufzeit")}
                        rechts
                      />
                      {/* Der Prioritaetswert als eigene Spalte. Er steht in
                          der Liste, weil hier entschieden wird, wen man als
                          naechstes anruft — in der Fallakte steht daneben,
                          woraus er sich zusammensetzt. */}
                      <Kopf
                        titel="Priorität"
                        href={sortierAdresse("prio")}
                        aktiv={sortierung === "prio"}
                        richtung={kopfRichtung("prio")}
                        rechts
                      />
                      {/* Keine IBAN-Spalte. Sie stand hier verkuerzt, aber
                          auch die letzten vier Stellen sind eine
                          Bankverbindung — und diese Liste ist die Ansicht, die
                          offen liegt, waehrend jemand telefoniert oder einen
                          Bildschirm teilt. Wer die IBAN braucht, ruft den Fall
                          auf; dort steht sie vollstaendig, mit Kopierknopf und
                          Vermerk im Verlauf. */}
                      <Kopf
                        titel="Wiedervorlage"
                        href={sortierAdresse("wiedervorlage")}
                        aktiv={sortierung === "wiedervorlage"}
                        richtung={kopfRichtung("wiedervorlage")}
                      />
                      <Kopf
                        titel="Ordner"
                        href={sortierAdresse("ordner")}
                        aktiv={sortierung === "ordner"}
                        richtung={kopfRichtung("ordner")}
                      />
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
