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
import { TON_KLASSEN, type StatusId, type Ton } from "@/lib/crm/pipeline";

/**
 * Die Pipeline als Brett: vierzehn Ordner nebeneinander, die Faelle als Karten
 * darin, und jede Karte laesst sich von Ordner zu Ordner ziehen.
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
  /** Nicht mehr Teil der Pipeline, nur noch da, weil Faelle darin liegen. */
  stillgelegt?: boolean;
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
}: {
  stationen: BrettStation[];
  faelle: BrettFall[];
  darfSchieben: boolean;
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
        className="flex gap-3 overflow-x-auto pb-3"
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
          return (
            <section
              key={station.id}
              data-station={station.id}
              className={`flex w-64 shrink-0 flex-col rounded-[20px] border transition-colors duration-150 ${
                aktiv
                  ? "border-accent/60 bg-accent/[0.06]"
                  : station.stillgelegt
                    ? "border-dashed border-border bg-surface/60"
                    : "border-border bg-surface"
              }`}
            >
              <header className="flex items-center gap-2 px-4 py-3">
                <span className={`size-2 shrink-0 rounded-full ${ton.punkt}`} />
                <h3 className="min-w-0 flex-1 truncate text-xs font-semibold">
                  {station.name}
                </h3>
                <span className="shrink-0 text-xs text-muted tabular-nums">
                  {karten.length}
                </span>
              </header>

              <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-2 pb-2">
                {karten.length === 0 ? (
                  <li className="px-2 py-3 text-[11px] leading-relaxed text-muted/70">
                    {station.beschreibung}
                  </li>
                ) : (
                  karten.map((fall) => (
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
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>

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
    // `relative` ist hier kein Schmuck, sondern noetig: Die Beschriftung des
    // Auswahlfelds steht als `sr-only` da, und das heisst in Tailwind
    // `position: absolute`. Ohne einen positionierten Vorfahren haengt sie
    // nicht an der Karte, sondern am Dokument — an der Stelle, an der die
    // Karte laege, wenn das Brett nicht seitlich gerollt waere. Bei vierzehn
    // Spalten sind das ein paar tausend Pixel weit rechts, und weil ein
    // absolut positioniertes Element nicht vom `overflow` eines beliebigen
    // Vorfahren beschnitten wird, sondern nur innerhalb seines
    // Enthaeltnisblocks, zog es die ganze Seite in die Breite: Das CRM liess
    // sich am Telefon seitlich wegschieben, obwohl das Brett fuer sich
    // sauber rollte.
    <li
      className={`relative flex gap-1 rounded-[14px] border border-border bg-surface-2 transition-opacity duration-150 ${
        inDerLuft ? "opacity-40" : ""
      }`}
    >
      {darfSchieben && (
        <span
          // `touch-action: none` nur hier: Der Browser soll diese Geste nicht
          // als Blaettern an sich ziehen. Die Karte daneben bleibt scrollbar.
          className="flex w-6 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-l-[14px] text-muted/50 hover:bg-surface hover:text-muted active:cursor-grabbing"
          onPointerDown={(e) => onGreifen(e, fall)}
          onPointerMove={onBewegen}
          onPointerUp={onLoslassen}
          onPointerCancel={onAbbrechen}
          aria-hidden
        >
          {/* Sechs Punkte — das uebliche Zeichen fuer "hier anfassen". */}
          <svg viewBox="0 0 10 16" className="size-3 fill-current">
            <circle cx="3" cy="3" r="1.2" />
            <circle cx="7" cy="3" r="1.2" />
            <circle cx="3" cy="8" r="1.2" />
            <circle cx="7" cy="8" r="1.2" />
            <circle cx="3" cy="13" r="1.2" />
            <circle cx="7" cy="13" r="1.2" />
          </svg>
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1 py-2 pr-7">
        <Link
          href={`/crm/antrag/${fall.id}`}
          className="truncate text-xs font-semibold hover:text-accent"
        >
          {fall.name}
        </Link>
        <div className="flex items-baseline justify-between gap-2 text-[11px] text-muted">
          <span className="truncate">{fall.ort || "—"}</span>
          <span className="shrink-0 tabular-nums">{fall.betrag}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted/70">
          <span className="truncate">{fall.art ?? fall.laufzeit}</span>
          <span className="shrink-0 tabular-nums">{fall.eingang}</span>
        </div>

        {fall.wiedervorlage && (
          <span
            className={`self-start rounded-full border px-2 py-0.5 text-[10px] tabular-nums ${
              fall.faellig
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                : "border-border text-muted"
            }`}
          >
            {fall.faellig ? "fällig " : "WV "}
            {fall.wiedervorlage}
          </span>
        )}

      </div>

      {darfSchieben && (
        /**
         * Der Weg ohne Ziehen — fuer die Tastatur, fuer Vorleseprogramme und
         * fuer alle, denen eine Geste ueber vierzehn Spalten zu fummelig ist.
         *
         * Klein in der Ecke und ohne sichtbaren Text: Der aktuelle Ordner
         * steht schon ueber der Spalte, und ein Feld, das ihn auf jeder Karte
         * wiederholt, macht aus einem Brett eine Formularwand. Die Auswahl
         * selbst klappt vom Betriebssystem mit voller Beschriftung auf.
         */
        <label className="absolute right-1.5 top-1.5">
          <span className="sr-only">{fall.name} in anderen Ordner legen</span>
          {/* `key` haengt am Status: Nach einem Zug baut React das Feld neu
              auf, sonst behielte es seinen alten Eintrag — `defaultValue`
              wirkt nur beim ersten Rendern. */}
          <select
            key={fall.status}
            defaultValue={fall.status}
            title="In anderen Ordner legen"
            onChange={(e) => onWaehlen(fall.id, e.target.value as StatusId)}
            className="size-5 cursor-pointer appearance-none rounded-[6px] border border-border bg-surface text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
    </li>
  );
}
