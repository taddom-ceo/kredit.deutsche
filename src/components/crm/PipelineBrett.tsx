"use client";

import Link from "next/link";
import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  type PointerEvent as ZeigerEreignis,
} from "react";
import { fallVerschieben } from "@/app/crm/aktionen";
import { stationIcon } from "@/components/crm/StationIcons";
import { TON_KLASSEN, type StatusId, type Ton } from "@/lib/crm/pipeline";

/**
 * Die Pipeline als Brett: vierzehn Ordner nebeneinander, die Faelle als Karten
 * darin, und jede Karte laesst sich von Ordner zu Ordner ziehen.
 *
 * Die Spalten tragen nur ein Zeichen und die Anzahl. Mit ausgeschriebenem
 * Namen und Beschreibung brauchte jede rund 270 Pixel; vierzehn davon sind
 * knapp vier Meter Brett, von dem immer nur ein Drittel zu sehen war. Wer eine
 * Karte von "Neu" nach "Watch" ziehen wollte, zog blind ueber neun Spalten,
 * die er nicht sah. Jetzt passen alle nebeneinander, und der Name steht beim
 * Zeigen darueber — als eingeblendete Fahne, nicht als Text in der Spalte,
 * denn Text in der Spalte ist genau das, was die Breite gekostet hat.
 *
 * Warum Zeigerereignisse und nicht das eingebaute Ziehen des Browsers
 * (`draggable`): Letzteres kennt nur die Maus. Auf einem Tablet oder Telefon
 * passiert damit gar nichts, und ein CRM, das nur am Schreibtisch bedienbar
 * ist, ist im Aussendienst keins. `pointerdown/-move/-up` gilt fuer Maus,
 * Finger und Stift gleichermassen.
 *
 * Gezogen wird am Griff links, nicht an der ganzen Karte. Das ist kein
 * Schoenheitsentscheid: Am Finger muss der Griff `touch-action: none` tragen,
 * damit der Browser die Geste nicht als Blaettern deutet und wegnimmt. Truege
 * die ganze Karte das, liesse sich die Spalte am Telefon nicht mehr scrollen.
 * So bleibt die Karte anfassbar zum Blaettern und der Griff zum Schieben.
 *
 * Wer nicht ziehen kann oder will — Tastatur, Vorleseprogramm, ruhige Hand —
 * nimmt das Auswahlfeld am Fuss der Karte. Es fuehrt zur selben Aktion.
 */

export type BrettStation = {
  id: StatusId;
  name: string;
  beschreibung: string;
  ton: Ton;
  /**
   * Wohin der Kopf fuehrt: die Liste unten auf diesen Ordner eingeschraenkt.
   * Ist der Ordner schon gewaehlt, hebt derselbe Klick den Filter wieder auf.
   *
   * Fertig gebaut vom Server statt hier zusammengesetzt, weil die Adresse die
   * uebrigen Filter — Suchwort, nur Faellige — mitnehmen muss. Die kennt diese
   * Ansicht nicht, und sie sollte sie auch nicht kennen muessen.
   */
  href: string;
  /** Nicht mehr Teil der Pipeline, nur noch da, weil Faelle darin liegen. */
  stillgelegt?: boolean;
  /**
   * Steht neben der Pipeline, nicht darin — Papierkorb und stillgelegte
   * Ordner. Sie bekommen einen gestrichelten Rahmen und einen blasseren
   * Grund, damit die Reihe der Arbeitsordner sichtbar dort aufhoert, wo sie
   * aufhoert. Ohne das laege der Papierkorb als fuenfzehnte gleichberechtigte
   * Spalte da, und "weggeworfen" saehe aus wie "eine Station weiter".
   */
  abseits?: boolean;
};

/**
 * Ein Fall, so knapp wie die Karte ihn braucht.
 *
 * Alles Formatierte kommt fertig vom Server. Datum und Betrag hier zu
 * formatieren hiesse, sie zweimal zu erzeugen — einmal in der Zeitzone des
 * Servers, einmal in der des Browsers —, und React beschwerte sich zu Recht
 * ueber die Abweichung. Ausserdem hat eine Karte nichts von Feldern, die sie
 * nicht zeigt: Je weniger hier steht, desto weniger Kundendaten stehen im
 * ausgelieferten HTML.
 */
export type BrettFall = {
  id: string;
  status: StatusId;
  name: string;
  ort: string;
  betrag: string;
  laufzeit: string;
  eingang: string;
  /** Vorformatiert als TT.MM., oder null. */
  wiedervorlage: string | null;
  faellig: boolean;
  art: string | null;
};

/** Wie weit der Zeiger wandern muss, bis aus einem Klick ein Zug wird. */
const SCHWELLE = 6;

/** Ab diesem Abstand zum Rand rollt das Brett beim Ziehen mit. */
const RANDZONE = 90;
const ROLLSCHRITT = 16;

export default function PipelineBrett({
  stationen,
  faelle,
  darfSchieben,
  gewaehlt,
}: {
  stationen: BrettStation[];
  faelle: BrettFall[];
  darfSchieben: boolean;
  /** Der Ordner, auf den die Liste unten gerade eingeschraenkt ist. */
  gewaehlt: StatusId | null;
}) {
  /**
   * Die Karte liegt in der neuen Spalte, sobald man loslaesst — nicht erst,
   * wenn der Server geantwortet hat. Ueber eine Leitung, die auch mal eine
   * halbe Sekunde braucht, ist das der Unterschied zwischen einem Brett, das
   * sich anfuehlt wie Papier, und einem, das hakt.
   *
   * `useOptimistic` nimmt die Anzeige nach dem Uebergang von selbst zurueck.
   * Ging es gut, steht dann schon der neue Stand vom Server da und man sieht
   * keinen Unterschied; ging es schief, springt die Karte zurueck — und der
   * Grund steht darueber.
   */
  const [ansicht, zeigeVerschoben] = useOptimistic(
    faelle,
    (jetzt: BrettFall[], zug: { id: string; nach: StatusId }) =>
      jetzt.map((f) => (f.id === zug.id ? { ...f, status: zug.nach } : f))
  );

  const [fehler, setFehler] = useState<string | null>(null);
  /** Welche Karte gerade in der Luft ist, und wo der Zeiger steht. */
  const [zug, setZug] = useState<{
    id: string;
    name: string;
    x: number;
    y: number;
  } | null>(null);
  /**
   * Der Ordner unter dem Zeiger — zweimal.
   *
   * Im Zustand, damit die Spalte aufleuchtet. Und zusaetzlich in einem Ref,
   * weil das Loslassen ihn lesen muss: Zustandsaenderungen werden gebuendelt
   * und koennen noch anstehen, wenn kurz nach der letzten Bewegung schon
   * losgelassen wird. Das Loslassen laese dann den vorletzten Ordner — oder
   * gar keinen, wenn die Geste kurz war. Wer zuegig zieht, bekaeme sein
   * Ergebnis nur manchmal, und niemand kaeme darauf, woran es liegt.
   */
  const [ziel, setZiel] = useState<StatusId | null>(null);
  const zielRef = useRef<StatusId | null>(null);

  /**
   * Die Fahne mit Name und Zweck des Ordners, auf den gerade gezeigt wird.
   *
   * Warum `fixed` und eigener Zustand statt eines aufklappenden Kastens in der
   * Spalte: Das Brett rollt seitlich, traegt also `overflow-x`, und das
   * beschneidet alles, was ueber seinen Rand hinausragt — auch nach oben und
   * unten. Eine Fahne in der Spalte waere an der ersten und letzten Spalte
   * abgeschnitten, also genau dort, wo man sie am ehesten braucht. Fest am
   * Fenster haengt sie ausserhalb dieses Rahmens und bleibt ganz.
   */
  const [fahne, setFahne] = useState<{
    name: string;
    beschreibung: string;
    stillgelegt: boolean;
    offen: boolean;
    x: number;
    y: number;
  } | null>(null);

  const brett = useRef<HTMLDivElement>(null);
  const start = useRef<{
    id: string;
    status: StatusId;
    name: string;
    x: number;
    y: number;
    laeuft: boolean;
  } | null>(null);

  /* ---------------------------------------------------------------- */
  /* Mitrollen am Rand                                                 */
  /* ---------------------------------------------------------------- */

  /**
   * Vierzehn Spalten passen auf keinen Bildschirm. Ohne Mitrollen liesse sich
   * eine Karte nur in die Ordner ziehen, die gerade zu sehen sind — und "On
   * Hold" waere von "Neu" aus unerreichbar.
   */
  const richtung = useRef(0);
  const rahmen = useRef<number | null>(null);

  // Gewoehnliche Funktionen, kein useCallback: Sie fassen ausser Refs nichts
  // an, haengen also an keinem Zustand, und die Schleife ruft sich selbst auf.
  function rollSchritt() {
    const kasten = brett.current;
    if (!kasten || richtung.current === 0) {
      rahmen.current = null;
      return;
    }
    kasten.scrollLeft += richtung.current * ROLLSCHRITT;
    rahmen.current = requestAnimationFrame(rollSchritt);
  }

  function setzeRichtung(x: number) {
    const kasten = brett.current;
    if (!kasten) return;
    const rand = kasten.getBoundingClientRect();
    const neu =
      x < rand.left + RANDZONE ? -1 : x > rand.right - RANDZONE ? 1 : 0;
    richtung.current = neu;
    if (neu !== 0 && rahmen.current === null) {
      rahmen.current = requestAnimationFrame(rollSchritt);
    }
  }

  function haltAn() {
    richtung.current = 0;
    if (rahmen.current !== null) cancelAnimationFrame(rahmen.current);
    rahmen.current = null;
  }

  // Wird das Brett mitten im Zug ausgetauscht — Filter geaendert, Seite
  // verlassen —, liefe die Schleife sonst weiter und griffe ins Leere.
  useEffect(() => {
    return () => {
      if (rahmen.current !== null) cancelAnimationFrame(rahmen.current);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Ziehen                                                            */
  /* ---------------------------------------------------------------- */

  /** Welcher Ordner liegt unter diesem Punkt? */
  function ordnerUnter(x: number, y: number): StatusId | null {
    // Das Schattenbild am Zeiger traegt `pointer-events-none`, sonst faende
    // `elementFromPoint` immer nur sich selbst.
    const element = document.elementFromPoint(x, y);
    const spalte = element?.closest<HTMLElement>("[data-station]");
    return (spalte?.dataset.station as StatusId | undefined) ?? null;
  }

  function verschiebe(id: string, nach: StatusId) {
    setFehler(null);
    startTransition(async () => {
      zeigeVerschoben({ id, nach });
      const ergebnis = await fallVerschieben(id, nach);
      if (!ergebnis.ok) setFehler(ergebnis.fehler);
    });
  }

  function greifen(e: ZeigerEreignis<HTMLElement>, fall: BrettFall) {
    if (!darfSchieben) return;
    // Nur die linke Maustaste. Rechtsklick oeffnet das Menue des Browsers,
    // und eine Karte, die daran haengen bliebe, klebte am Zeiger fest.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = {
      id: fall.id,
      status: fall.status,
      name: fall.name,
      x: e.clientX,
      y: e.clientY,
      laeuft: false,
    };
  }

  function bewegen(e: ZeigerEreignis<HTMLElement>) {
    const s = start.current;
    if (!s) return;
    if (!s.laeuft) {
      // Erst ab ein paar Pixeln. Sonst waere jeder Tipper auf den Griff schon
      // ein Zug, und ein leichtes Zittern verschoebe Faelle.
      if (Math.hypot(e.clientX - s.x, e.clientY - s.y) < SCHWELLE) return;
      s.laeuft = true;
    }
    setZug({ id: s.id, name: s.name, x: e.clientX, y: e.clientY });
    zielRef.current = ordnerUnter(e.clientX, e.clientY);
    setZiel(zielRef.current);
    setzeRichtung(e.clientX);
  }

  function loslassen() {
    const s = start.current;
    const nach = zielRef.current;
    start.current = null;
    zielRef.current = null;
    setZug(null);
    setZiel(null);
    haltAn();

    if (!s?.laeuft || !nach || nach === s.status) return;
    verschiebe(s.id, nach);
  }

  /**
   * Wird der Zug abgebrochen — Geste vom System abgefangen, Fenster verliert
   * den Zeiger —, darf keine Karte hinterherfliegen. Ohne diesen Fall bliebe
   * das Schattenbild stehen und der naechste Loslasser verschoebe den Fall
   * irgendwohin.
   */
  function abbrechen() {
    start.current = null;
    zielRef.current = null;
    setZug(null);
    setZiel(null);
    haltAn();
  }

  const nachOrdner = (id: StatusId) => ansicht.filter((f) => f.status === id);

  /* ---------------------------------------------------------------- */
  /* Die Fahne ueber der Spalte                                        */
  /* ---------------------------------------------------------------- */

  /** Halbe Breite der Fahne — fuer das Ausrichten und das Anstossen am Rand. */
  const FAHNE_HALB = 112;

  function zeigeFahne(el: HTMLElement, station: BrettStation) {
    const rand = el.getBoundingClientRect();
    // Ohne Anstossen haengt die Fahne der ersten Spalte halb links neben dem
    // Fenster und die der letzten halb rechts daneben.
    const mitte = rand.left + rand.width / 2;
    const x = Math.min(
      Math.max(mitte, FAHNE_HALB + 10),
      window.innerWidth - FAHNE_HALB - 10
    );
    setFahne({
      name: station.name,
      beschreibung: station.beschreibung,
      stillgelegt: Boolean(station.stillgelegt),
      offen: gewaehlt === station.id,
      x,
      y: rand.bottom + 6,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {fehler && (
        <p
          role="alert"
          className="rounded-[14px] border border-red-400/40 bg-red-400/[0.08] px-4 py-2.5 text-xs text-red-200"
        >
          Verschieben nicht möglich: {fehler}
        </p>
      )}

      <div
        ref={brett}
        /**
         * `items-start`: Jede Spalte ist so hoch wie ihr Inhalt.
         *
         * Ohne das zieht die vollste Spalte alle uebrigen auf ihre Hoehe —
         * bei zwoelf Karten in "Neu" standen dreizehn leere Spalten tausend
         * Pixel hoch daneben. Das Brett sah aus wie eine Wand und die Liste
         * darunter war zwei Bildschirme entfernt.
         */
        className="grid items-start gap-2 overflow-x-auto pb-3"
        /**
         * Gitter statt Reihe, und die Spalten nicht fest, sondern
         * `minmax(120px, 1fr)`.
         *
         * Feste Breiten koennen nur eins von beidem: Auf einem breiten Schirm
         * lassen sie rechts Platz liegen, auf einem schmalen laufen sie
         * hinaus. `1fr` verteilt die vorhandene Breite gleichmaessig auf alle
         * Ordner — auf einem 24-Zoll-Schirm werden daraus rund 160 Pixel je
         * Spalte, auf einem Notebook rund 120. Die Untergrenze ist der Punkt,
         * an dem eine Karte noch lesbar ist; darunter faengt das Brett wieder
         * an zu rollen, statt die Karten zu zerdruecken.
         */
        style={{
          gridTemplateColumns: `repeat(${stationen.length}, minmax(120px, 1fr))`,
        }}
        // Beim Ziehen bewegt sich der Zeiger auch ueber Zwischenraeume. Die
        // Ereignisse landen dank Zeigerfang trotzdem am Griff — hier stehen
        // sie nur, damit ein Loslassen ausserhalb einer Karte sauber endet.
        onPointerUp={loslassen}
        onPointerCancel={abbrechen}
      >
        {stationen.map((station) => {
          const karten = nachOrdner(station.id);
          const ton = TON_KLASSEN[station.ton];
          const aktiv = ziel === station.id && zug !== null;
          const offen = gewaehlt === station.id;
          const Zeichen = stationIcon(station.id);
          return (
            <section
              key={station.id}
              data-station={station.id}
              // Die Mindesthoehe haelt die Unterkante der leeren Spalten auf
              // einer Linie — ohne sie franst das Brett unten aus.
              className={`flex min-h-36 min-w-0 flex-col rounded-[16px] border transition-colors duration-150 ${
                aktiv
                  ? "border-accent/60 bg-accent/[0.06]"
                  : offen
                    ? // Der aufgeschlagene Ordner. Ohne diese Markierung
                      // stuende unten eine gefilterte Liste, ohne dass oben zu
                      // sehen waere, welcher Ordner sie fuellt.
                      "border-accent/50 bg-accent/[0.04] ring-1 ring-accent/25"
                    : station.abseits
                      ? "border-dashed border-border bg-surface/60"
                      : "border-border bg-surface"
              }`}
            >
              {/**
               * Der Kopf traegt nur noch Zeichen und Anzahl — und er ist ein
               * Verweis: Ein Klick schlaegt den Ordner in der Liste unter dem
               * Brett auf, ein zweiter klappt ihn wieder zu.
               *
               * Ein echter Verweis und kein Knopf mit Skript, aus demselben
               * Grund, aus dem die Suche darunter ein gewoehnliches Formular
               * ist: Der aufgeschlagene Ordner steht danach in der Adresse.
               * Er laesst sich als Lesezeichen ablegen, weitergeben und mit
               * dem Zurueck-Knopf verlassen.
               *
               * Die Fokus-Ereignisse sind kein Beiwerk: Ein Hinweis, den es
               * nur beim Zeigen mit der Maus gibt, gibt es fuer die Tastatur
               * gar nicht. So laesst sich das Brett durchtabben und jeder
               * Ordner sagt seinen Namen — sichtbar in der Fahne, vorgelesen
               * ueber `aria-label`.
               */}
              <Link
                href={station.href}
                // Ein <a> laesst sich vom Browser von Haus aus ziehen. Bliebe
                // das an, zoege ein Griff neben dem Kopf gelegentlich den
                // Verweis statt der Karte.
                draggable={false}
                aria-label={`${station.name}: ${karten.length} ${
                  karten.length === 1 ? "Fall" : "Fälle"
                }. ${station.beschreibung} ${
                  offen
                    ? "Ordner ist unten aufgeschlagen — klicken zeigt wieder alle Fälle."
                    : "Klicken zeigt diesen Ordner in der Liste unten."
                }`}
                className="flex items-center justify-center gap-1.5 rounded-t-[15px] px-2 py-2.5 transition-colors duration-150 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40"
                onPointerEnter={(e) => zeigeFahne(e.currentTarget, station)}
                onPointerLeave={() => setFahne(null)}
                onFocus={(e) => zeigeFahne(e.currentTarget, station)}
                onBlur={() => setFahne(null)}
              >
                {/* 22 statt 20 Pixel: Die drei Kalenderblaetter unterscheiden
                    sich nur durch die Ziffer darin, und die faellt bei 20
                    Pixeln unter die Groesse, bei der sie noch sicher zu lesen
                    ist. */}
                <Zeichen className={`size-[22px] shrink-0 ${ton.zeichen}`} />
                <span
                  className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                    karten.length === 0 ? "text-muted/50" : "text-foreground"
                  }`}
                >
                  {karten.length}
                </span>
              </Link>

              {/* Die Mindesthoehe haelt leere Ordner als Ziel offen: Eine
                  Spalte ohne Karten waere sonst nur der Kopf hoch, und dorthin
                  zu treffen waere Zielschiessen. Die Hoechsthoehe deckelt die
                  vollste Spalte — sie rollt dann in sich, statt die Liste
                  darunter einen Bildschirm weit wegzuschieben. */}
              <ul className="flex min-h-16 max-h-[46vh] flex-col gap-1.5 overflow-y-auto px-1.5 pb-1.5">
                {karten.map((fall) => (
                  <Karte
                    key={fall.id}
                    fall={fall}
                    stationen={stationen}
                    darfSchieben={darfSchieben}
                    inDerLuft={zug?.id === fall.id}
                    onGreifen={greifen}
                    onBewegen={bewegen}
                    onLoslassen={loslassen}
                    onAbbrechen={abbrechen}
                    onWaehlen={verschiebe}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Die Fahne. Waehrend eines Zugs bleibt sie weg — dann zaehlt, welche
          Spalte aufleuchtet, und ein Kasten ueber dem Ziel stuende im Weg. */}
      {fahne && !zug && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 w-max max-w-[224px] -translate-x-1/2 rounded-[12px] border border-border bg-surface-2 px-3 py-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.7)]"
          style={{ left: fahne.x, top: fahne.y }}
        >
          <p className="text-xs font-semibold">
            {fahne.name}
            {fahne.stillgelegt && (
              <span className="ml-1.5 font-normal text-muted">(stillgelegt)</span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            {fahne.beschreibung}
          </p>
          <p className="mt-1.5 text-[11px] font-medium text-accent">
            {fahne.offen
              ? "Klicken zeigt wieder alle Fälle"
              : "Klicken öffnet den Ordner unten"}
          </p>
        </div>
      )}

      {/* Das Schattenbild am Zeiger. Ohne es zieht man beim Finger unter der
          eigenen Hand und sieht nicht, was man gerade traegt. */}
      {zug && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-accent/60 bg-surface-2 px-3 py-2 text-xs font-semibold shadow-lg"
          style={{ left: zug.x, top: zug.y }}
        >
          {zug.name}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Karte({
  fall,
  stationen,
  darfSchieben,
  inDerLuft,
  onGreifen,
  onBewegen,
  onLoslassen,
  onAbbrechen,
  onWaehlen,
}: {
  fall: BrettFall;
  stationen: BrettStation[];
  darfSchieben: boolean;
  inDerLuft: boolean;
  onGreifen: (e: ZeigerEreignis<HTMLElement>, fall: BrettFall) => void;
  onBewegen: (e: ZeigerEreignis<HTMLElement>) => void;
  onLoslassen: () => void;
  onAbbrechen: () => void;
  onWaehlen: (id: string, nach: StatusId) => void;
}) {
  return (
    // `relative` ist hier kein Schmuck, sondern noetig — und das gilt genauso
    // fuer das `relative` am Auswahlfeld weiter unten: Dessen Beschriftung
    // steht als `sr-only` da, und das heisst in Tailwind `position: absolute`.
    // Ohne einen positionierten Vorfahren haengt sie nicht an der Karte,
    // sondern am Dokument — an der Stelle, an der die Karte laege, wenn das
    // Brett nicht seitlich gerollt waere. Bei vierzehn Spalten sind das ein
    // paar tausend Pixel weit rechts, und weil ein absolut positioniertes
    // Element nicht vom `overflow` eines beliebigen Vorfahren beschnitten
    // wird, sondern nur innerhalb seines Enthaeltnisblocks, zog es die ganze
    // Seite in die Breite: Das CRM liess sich am Telefon seitlich
    // wegschieben, obwohl das Brett fuer sich sauber rollte.
    <li
      className={`relative flex gap-0.5 rounded-[14px] border border-border bg-surface-2 transition-opacity duration-150 ${
        inDerLuft ? "opacity-40" : ""
      }`}
    >
      {darfSchieben && (
        <span
          // `touch-action: none` nur hier: Der Browser soll diese Geste nicht
          // als Blaettern an sich ziehen. Die Karte daneben bleibt scrollbar.
          // Die Breite bleibt bei 24 Pixeln, obwohl der Platz in einer
          // schmalen Spalte knapp ist: Das ist das Mindestmass fuer eine
          // Flaeche, die man treffen soll (WCAG 2.5.8). Schmaler getestet
          // liess sich zwar noch ziehen, aber nur mit ruhiger Hand — und der
          // Griff ist der einzige Weg, eine Karte mit der Maus zu bewegen.
          className="flex w-6 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-l-[13px] text-muted/50 hover:bg-surface hover:text-muted active:cursor-grabbing"
          onPointerDown={(e) => onGreifen(e, fall)}
          onPointerMove={onBewegen}
          onPointerUp={onLoslassen}
          onPointerCancel={onAbbrechen}
          aria-hidden
        >
          {/* Sechs Punkte — das uebliche Zeichen fuer "hier anfassen". */}
          <svg viewBox="0 0 10 16" className="h-3.5 w-2 fill-current">
            <circle cx="3" cy="3" r="1.2" />
            <circle cx="7" cy="3" r="1.2" />
            <circle cx="3" cy="8" r="1.2" />
            <circle cx="7" cy="8" r="1.2" />
            <circle cx="3" cy="13" r="1.2" />
            <circle cx="7" cy="13" r="1.2" />
          </svg>
        </span>
      )}

      {/**
       * Vier Zeilen statt drei, und das Auswahlfeld unten statt oben rechts.
       *
       * In einer 120 Pixel breiten Spalte bleiben nach Griff und Rand rund
       * neunzig fuer den Inhalt. Sass das Feld oben in der Ecke, nahm es davon
       * ein Viertel weg — und zwar in der einen Zeile, in der es am meisten
       * weh tut, naemlich beim Namen. Unten teilt es sich die Zeile mit der
       * Wiedervorlage, die ohnehin nur selten da ist.
       */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 py-1.5 pr-1.5">
        <Link
          href={`/crm/antrag/${fall.id}`}
          title={fall.name}
          className="truncate text-[11px] font-semibold leading-snug hover:text-accent"
        >
          {fall.name}
        </Link>
        <div className="flex items-baseline justify-between gap-1.5 text-[10px] text-muted">
          <span className="truncate">{fall.ort || "—"}</span>
          <span className="shrink-0 tabular-nums">{fall.betrag}</span>
        </div>
        <div className="flex items-baseline justify-between gap-1.5 text-[10px] text-muted/70">
          <span className="truncate" title={fall.art ?? undefined}>
            {fall.art ?? fall.laufzeit}
          </span>
          <span className="shrink-0 tabular-nums">{fall.eingang}</span>
        </div>

        <div className="mt-0.5 flex min-h-6 items-center justify-between gap-1.5">
          {fall.wiedervorlage ? (
            <span
              className={`truncate rounded-full border px-1.5 py-0.5 text-[10px] tabular-nums ${
                fall.faellig
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                  : "border-border text-muted"
              }`}
            >
              {fall.faellig ? "fällig " : "WV "}
              {fall.wiedervorlage}
            </span>
          ) : (
            <span />
          )}

          {darfSchieben && (
            /**
             * Der Weg ohne Ziehen — fuer die Tastatur, fuer Vorleseprogramme
             * und fuer alle, denen eine Geste ueber vierzehn Spalten zu
             * fummelig ist.
             *
             * Klein und ohne sichtbaren Text: Welcher Ordner das ist, sagt
             * schon die Spalte, und ein Feld, das ihn auf jeder Karte
             * wiederholt, macht aus einem Brett eine Formularwand. Die Auswahl
             * selbst klappt vom Betriebssystem mit voller Beschriftung auf.
             */
            <label className="relative shrink-0">
              <span className="sr-only">
                {fall.name} in anderen Ordner legen
              </span>
              {/* `key` haengt am Status: Nach einem Zug baut React das Feld neu
                  auf, sonst behielte es seinen alten Eintrag — `defaultValue`
                  wirkt nur beim ersten Rendern. */}
              <select
                key={fall.status}
                defaultValue={fall.status}
                title="In anderen Ordner legen"
                onChange={(e) => onWaehlen(fall.id, e.target.value as StatusId)}
                className="size-6 cursor-pointer appearance-none rounded-[6px] border border-border bg-surface text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {/* Stillgelegte Ordner stehen nicht zur Wahl — man soll da
                    heraus und nicht hinein. Der eigene bleibt drin, sonst
                    zeigte das Feld einen fremden Ordner an. */}
                {stationen
                  .filter((s) => !s.stillgelegt || s.id === fall.status)
                  .map((s) => (
                    <option key={s.id} value={s.id} className="text-foreground">
                      {s.name}
                    </option>
                  ))}
              </select>
              {/* Zwei Pfeile hinter dem Feld. `pointer-events-none`, damit der
                  Klick beim Auswahlfeld darunter ankommt. */}
              <svg
                viewBox="0 0 10 10"
                aria-hidden
                className="pointer-events-none absolute inset-0 m-auto size-3 fill-muted"
              >
                <path d="M5 0.6 7.2 3.4H2.8zM5 9.4 2.8 6.6h4.4z" />
              </svg>
            </label>
          )}
        </div>
      </div>
    </li>
  );
}
