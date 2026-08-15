"use client";

import Link from "next/link";
import {
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ZeigerEreignis,
  type ReactNode,
} from "react";
import { faelleVerschieben, fallVerschieben } from "@/app/crm/aktionen";
import { stationIcon } from "@/components/crm/StationIcons";
import { ZweckZeichen } from "@/components/illustrations/ZweckIcons";
import {
  nachGruppen,
  SPAETE_ORDNER,
  TON_KLASSEN,
  type BrettId,
  type StatusId,
  type Ton,
} from "@/lib/crm/pipeline";

/**
 * Die Pipeline als Brett: die Ordner nebeneinander, die Faelle als Karten
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
 * Gezogen wird die ganze Karte, an jeder Stelle. Frueher gab es dafuer einen
 * Griff aus sechs Punkten am linken Rand — 24 Pixel, die man treffen musste,
 * bevor sich etwas bewegte. Auf einem Brett, auf dem man den ganzen Tag Karten
 * verschiebt, ist das vierundzwanzigmal zielen statt einmal greifen.
 *
 * Ein Klick bleibt trotzdem ein Klick: Gezogen wird erst ab ein paar Pixeln
 * Bewegung, und bis dahin kommt der Klick beim Namen an und oeffnet den Fall.
 * Am Finger traegt die Karte `touch-action: pan-y` — der Browser behaelt das
 * senkrechte Blaettern, sonst liesse sich eine volle Spalte nicht mehr rollen.
 *
 * Wer nicht ziehen kann oder will — Tastatur, Vorleseprogramm, ruhige Hand —
 * markiert Karten und nimmt das Auswahlfeld in der Leiste ueber dem Brett,
 * oder oeffnet den Fall und aendert den Ordner dort. Auf der Karte selbst
 * steht dafuer nichts mehr: Ein Auswahlfeld auf jeder einzelnen machte aus
 * einem Brett eine Formularwand und nahm dem Inhalt noch einmal 24 Pixel.
 *
 * Mehrere auf einmal: Strg oder Cmd und ein Klick markiert eine Karte, ein
 * zweiter nimmt die Markierung wieder weg. Zieht man danach eine markierte
 * Karte, gehen alle markierten mit — auch aus verschiedenen Ordnern. Wer eine
 * unmarkierte zieht, meint diese eine; eine vergessene Markierung soll nicht
 * Faelle verschieben, an die gerade niemand denkt. Ohne Maus fuehrt das
 * Auswahlfeld in der Leiste ueber dem Brett zum selben Ergebnis.
 *
 * Die Karten tragen dieselbe Sparsamkeit wie die Spalten: der Betrag gross,
 * der Name klein darunter, der Verwendungszweck als Zeichen statt als Wort.
 * Ort, Datum, Laufzeit und der ausgeschriebene Zweck stehen beim Zeigen
 * darunter — die Karte waechst dann in der Reihe, statt einen Kasten
 * einzublenden. Das Brett bleibt ueberschaubar, ohne dass etwas verloren
 * geht: Was vorher auf jeder Karte stand, ist eine Mausbewegung entfernt.
 */

export type BrettStation = {
  id: StatusId;
  name: string;
  beschreibung: string;
  ton: Ton;
  /** Ueberordner, unter dem er in der Auswahl steht. */
  gruppe?: string;
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
  /** Der ausgeschriebene Verwendungszweck — fuer Text und Vorleseprogramm. */
  art: string | null;
  /** Dessen Kennung — dafuer, welches Zeichen die Karte traegt. */
  kreditart: string | null;
  /** Und dessen Farbe, dieselbe wie in der Antragsstrecke. */
  farbe: string | null;
};

/** Wie weit der Zeiger wandern muss, bis aus einem Klick ein Zug wird. */
const SCHWELLE = 6;

/** Ab diesem Abstand zum Rand rollt das Brett beim Ziehen mit. */
const RANDZONE = 90;
const ROLLSCHRITT = 16;

/** Ein Reiter: ein Brett mit seinen Spalten und der Adresse dorthin. */
export type BrettReiter = {
  id: BrettId;
  name: string;
  href: string;
  stationen: BrettStation[];
};

export default function PipelineBrett({
  bretter,
  aktivesBrett,
  hinweis,
  faelle,
  darfSchieben,
  gewaehlt,
}: {
  bretter: BrettReiter[];
  /** Welcher Reiter aus der Adresse kommt. */
  aktivesBrett: BrettId;
  /** Der Erklaertext rechts neben den Reitern. */
  hinweis: ReactNode;
  faelle: BrettFall[];
  darfSchieben: boolean;
  /** Der Ordner, auf den die Liste unten gerade eingeschraenkt ist. */
  gewaehlt: StatusId | null;
}) {
  /**
   * Der Reiter, der gerade offen ist.
   *
   * Ein eigener Zustand neben der Adresse, und zwar aus genau einem Grund:
   * Wer eine Karte auf den anderen Reiter zieht, soll dort abladen koennen.
   * Eine Navigation mitten im Zug wuerde die Geste abbrechen — der Zeiger
   * haelt dann eine Karte, die es nicht mehr gibt.
   *
   * Die Adresse bleibt trotzdem die Wahrheit: Ein Klick auf einen Reiter ist
   * ein Verweis, und die Seite gibt diesem Brett beim Wechsel einen neuen
   * `key`, sodass dieser Zustand mit dem richtigen Wert neu anfaengt.
   */
  const [brettId, setBrettId] = useState<BrettId>(aktivesBrett);
  const diesesBrett = bretter.find((b) => b.id === brettId) ?? bretter[0];
  const stationen = diesesBrett.stationen;
  /**
   * Alle Ordner beider Bretter — fuer das Auswahlfeld in der Leiste.
   *
   * Verschieben per Tastatur darf nicht am Reiter enden: Wer markierte Faelle
   * aus der Pipeline nach "In Prüfung" legen will, soll das tun koennen, ohne
   * vorher das Brett zu wechseln.
   */
  const alleStationen = bretter.flatMap((b) => b.stationen);
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
    (jetzt: BrettFall[], zug: { ids: string[]; nach: StatusId }) =>
      jetzt.map((f) =>
        zug.ids.includes(f.id) ? { ...f, status: zug.nach } : f
      )
  );

  const [fehler, setFehler] = useState<string | null>(null);
  /**
   * Die markierten Karten.
   *
   * Strg oder Cmd und ein Klick markiert eine Karte; zieht man danach eine
   * markierte, gehen alle mit. Der Zustand liegt hier und nicht in der Karte,
   * weil er ueber Karten hinweg gilt — und er verschwindet mit dem naechsten
   * Neuladen. Eine Markierung, die einen Seitenwechsel ueberlebt, waere eine
   * Falle: Man kaeme zurueck, zoege eine Karte und verschoebe zwanzig, an die
   * man nicht mehr gedacht hat.
   */
  const [markiert, setMarkiert] = useState<Set<string>>(new Set());
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

  /**
   * Ob die hinteren Ordner ausgeklappt sind.
   *
   * Zugeklappt teilen sich neun statt fuenfzehn Spalten dieselbe Breite, und
   * aus 120 Pixel je Spalte werden 176 — genug fuer das Zeichen neben dem
   * Betrag statt nur unter ihm. Ist einer der zugeklappten Ordner gerade
   * aufgeschlagen, sind sie von Anfang an offen: Sonst zeigte die Liste unten
   * die Faelle eines Ordners, den es oben scheinbar nicht gibt.
   */
  const [spaeteOffen, setSpaeteOffen] = useState(
    gewaehlt !== null && SPAETE_ORDNER.includes(gewaehlt)
  );

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

  /** Steht der Zeiger ueber dem Knopf fuer die zugeklappten Ordner? */
  function ueberKnopf(x: number, y: number): boolean {
    const element = document.elementFromPoint(x, y);
    return Boolean(element?.closest("[data-spaete-knopf]"));
  }

  /** Ueber welchem Reiter steht der Zeiger — oder ueber keinem? */
  function reiterUnter(x: number, y: number): BrettId | null {
    const element = document.elementFromPoint(x, y);
    const reiter = element?.closest<HTMLElement>("[data-brett]");
    return (reiter?.dataset.brett as BrettId | undefined) ?? null;
  }

  function verschiebe(id: string, nach: StatusId) {
    setFehler(null);
    startTransition(async () => {
      zeigeVerschoben({ ids: [id], nach });
      const ergebnis = await fallVerschieben(id, nach);
      if (!ergebnis.ok) setFehler(ergebnis.fehler);
    });
  }

  /**
   * Alle markierten Karten auf einmal.
   *
   * Die Markierung wird erst nach der Antwort geleert. Ginge sie sofort weg
   * und der Server sagte nein, staenden die Karten wieder in ihren alten
   * Ordnern — ohne dass noch zu sehen waere, welche man gerade zusammen
   * hatte.
   */
  function verschiebeMarkierte(nach: StatusId) {
    const ids = [...markiert];
    if (ids.length === 0) return;
    setFehler(null);
    startTransition(async () => {
      zeigeVerschoben({ ids, nach });
      const ergebnis = await faelleVerschieben(ids, nach);
      if (!ergebnis.ok) {
        setFehler(ergebnis.fehler);
        return;
      }
      setMarkiert(new Set());
    });
  }

  /** Strg-Klick auf eine Karte: markieren oder Markierung wieder wegnehmen. */
  function markiereUm(id: string) {
    setMarkiert((vorher) => {
      const naechste = new Set(vorher);
      if (naechste.has(id)) naechste.delete(id);
      else naechste.add(id);
      return naechste;
    });
  }

  function greifen(e: ZeigerEreignis<HTMLElement>, fall: BrettFall) {
    if (!darfSchieben) return;
    // Nur die linke Maustaste. Rechtsklick oeffnet das Menue des Browsers,
    // und eine Karte, die daran haengen bliebe, klebte am Zeiger fest.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    /**
     * Bewusst kein `setPointerCapture`.
     *
     * Solange nur der Griff am linken Rand die Ereignisse bekam, war das
     * noetig: Ohne Fang endeten sie, sobald der Zeiger die 24 Pixel verliess.
     * Jetzt haengen die Behandler an der ganzen Karte, und waehrend eines Zugs
     * hoert zusaetzlich das Fenster mit — der Fang bringt nichts mehr und
     * kostet etwas: Er verschiebt das Ziel des folgenden `click` auf das
     * fangende Element, und damit gingen Klicks auf den Namen ins Leere. Ein
     * Brett, auf dem man Faelle nicht mehr oeffnen kann, waere ein teurer
     * Preis fuer eine Geste.
     */
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
    bewegenBei(e.clientX, e.clientY);
  }

  function bewegenBei(x: number, y: number) {
    const s = start.current;
    if (!s) return;
    if (!s.laeuft) {
      // Erst ab ein paar Pixeln. Sonst waere jeder Tipper auf den Griff schon
      // ein Zug, und ein leichtes Zittern verschoebe Faelle.
      if (Math.hypot(x - s.x, y - s.y) < SCHWELLE) return;
      s.laeuft = true;
    }
    setZug({
      id: s.id,
      name:
        markiert.has(s.id) && markiert.size > 1
          ? `${markiert.size} Fälle`
          : s.name,
      x,
      y,
    });
    // Eine Karte ueber dem Knopf klappt die zugeklappten Ordner auf. Sonst
    // muesste man den Zug abbrechen, klicken und noch einmal greifen — und
    // zwar genau dann, wenn man schon weiss, wohin die Karte soll. Nur
    // aufklappen, nie zu: Zuklappen mitten im Zug zoege dem Zeiger das Ziel
    // unter der Hand weg.
    if (!spaeteOffen && ueberKnopf(x, y)) setSpaeteOffen(true);
    // Dasselbe fuer die Reiter: Eine Karte auf "Erledigt" gezogen schaltet
    // dorthin um, ohne dass man loslassen muss. Ohne das waere jeder Weg vom
    // einen Brett zum anderen ein Abbruch, ein Klick und ein neues Greifen —
    // und zwar genau dann, wenn man schon weiss, wohin die Karte soll.
    // Umgeschaltet wird hier und nicht ueber die Adresse: Eine Navigation
    // mitten im Zug nimmt dem Zeiger die Karte aus der Hand.
    const reiter = reiterUnter(x, y);
    if (reiter && reiter !== brettId) setBrettId(reiter);
    zielRef.current = ordnerUnter(x, y);
    setZiel(zielRef.current);
    setzeRichtung(x);
  }

  function loslassen() {
    const s = start.current;
    const nach = zielRef.current;
    start.current = null;
    zielRef.current = null;
    setZug(null);
    setZiel(null);
    haltAn();

    if (!s?.laeuft || !nach) return;

    /**
     * Gezogen wird die Markierung, wenn die gezogene Karte dazugehoert.
     *
     * Wer eine unmarkierte Karte zieht, meint diese eine — auch dann, wenn
     * anderswo noch eine Markierung steht. Sonst verschoebe eine vergessene
     * Markierung Faelle, an die gerade niemand denkt.
     *
     * Der Vergleich mit dem alten Ordner faellt bei mehreren weg: In der
     * Markierung koennen Karten aus verschiedenen Ordnern liegen, und dass
     * die gezogene schon dort liegt, heisst nichts fuer die uebrigen.
     */
    if (markiert.has(s.id) && markiert.size > 1) {
      verschiebeMarkierte(nach);
      return;
    }
    if (nach === s.status) return;
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

  /**
   * Waehrend eines Zugs hoert auch das Fenster mit.
   *
   * Der Grund ist der Reiterwechsel: Wer eine Karte auf das andere Brett
   * zieht, laesst die Spalte verschwinden, in der die gezogene Karte steckt —
   * und mit ihr das Element, das den Zeiger gefangen hat. Ab da kaeme kein
   * `pointermove` und kein `pointerup` mehr an, die Karte klebte am Zeiger und
   * das Loslassen bliebe folgenlos. Am Fenster kann das nicht passieren: Es
   * verschwindet nicht.
   *
   * Die Behandler an der Karte bleiben trotzdem stehen. Sie greifen im
   * Normalfall zuerst, und beide tun dasselbe — `loslassen` raeumt beim
   * zweiten Aufruf nichts mehr auf, weil es beim ersten schon alles
   * zurueckgesetzt hat.
   *
   * Die Funktionen liegen in einem Ref, das ein zweiter Effekt nach jedem
   * Rendern nachzieht: Sonst haetten die Behandler den Zustand vom Anfang des
   * Zugs in der Hand — welcher Reiter offen ist, was markiert war — und
   * arbeiteten mit Angaben von vor der Bewegung.
   */
  const behandler = useRef({ bewegenBei, loslassen, abbrechen });
  useEffect(() => {
    behandler.current = { bewegenBei, loslassen, abbrechen };
  });

  const zieht = zug !== null;
  useEffect(() => {
    if (!zieht) return;
    const bewegt = (e: PointerEvent) =>
      behandler.current.bewegenBei(e.clientX, e.clientY);
    const los = () => behandler.current.loslassen();
    const weg = () => behandler.current.abbrechen();
    window.addEventListener("pointermove", bewegt);
    window.addEventListener("pointerup", los);
    window.addEventListener("pointercancel", weg);
    return () => {
      window.removeEventListener("pointermove", bewegt);
      window.removeEventListener("pointerup", los);
      window.removeEventListener("pointercancel", weg);
    };
  }, [zieht]);

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

  /**
   * Welche Ordner das Brett gerade zeigt.
   *
   * Die hinteren fallen nur weg, solange sie zugeklappt sind. Stillgelegte
   * Ordner bleiben immer stehen: Sie tauchen ohnehin nur auf, wenn Faelle
   * darin liegen, und die sollen herausgezogen werden.
   */
  const sichtbar = spaeteOffen
    ? stationen
    : stationen.filter((s) => !SPAETE_ORDNER.includes(s.id));
  const versteckt = stationen.filter(
    (s) => !spaeteOffen && SPAETE_ORDNER.includes(s.id)
  );
  const verstecktesGewicht = versteckt.reduce(
    (summe, s) => summe + nachOrdner(s.id).length,
    0
  );
  /** Ob dieses Brett ueberhaupt Ordner hat, die sich zuklappen lassen. */
  const hatSpaete = stationen.some((s) => SPAETE_ORDNER.includes(s.id));

  return (
    <div className="flex flex-col gap-3">
      {/**
       * Die Reiter.
       *
       * Verweise und keine Schaltflaechen: Welches Brett offen ist, steht in
       * der Adresse, laesst sich als Lesezeichen ablegen und ueberlebt jeden
       * Klick auf einen Ordner. Der offene Reiter leuchtet in der
       * Betonungsfarbe und traegt einen Strich darunter — Farbe allein
       * genuegt nicht, wenn jemand sie nicht unterscheiden kann.
       *
       * `data-brett` ist zugleich das Ziel beim Ziehen, siehe `bewegen`.
       */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border">
        <div className="flex items-end gap-1">
          {bretter.map((b) => {
            const offen = b.id === brettId;
            const anzahl = b.stationen.reduce(
              (summe, s) => summe + nachOrdner(s.id).length,
              0
            );
            return (
              <Link
                key={b.id}
                href={b.href}
                data-brett={b.id}
                aria-current={offen ? "page" : undefined}
                title={
                  zug
                    ? `Karte hierher ziehen öffnet ${b.name}`
                    : `${b.name} zeigen`
                }
                className={`-mb-px flex items-center gap-2 rounded-t-[10px] border-b-2 px-3 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  offen
                    ? "border-accent text-accent"
                    : zug
                      ? // Waehrend eines Zugs ist der andere Reiter ein Ziel
                        // und sieht auch so aus.
                        "border-accent/40 bg-accent/[0.06] text-foreground"
                      : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {b.name}
                <span
                  className={`rounded-full border px-1.5 text-[11px] tabular-nums font-medium ${
                    offen
                      ? "border-accent/40 bg-accent/10"
                      : "border-border text-muted"
                  }`}
                >
                  {anzahl}
                </span>
              </Link>
            );
          })}
        </div>
        <span className="pb-2 text-xs text-muted">{hinweis}</span>
      </div>

      {fehler && (
        <p
          role="alert"
          className="rounded-[14px] border border-red-400/40 bg-red-400/[0.08] px-4 py-2.5 text-xs text-red-200"
        >
          Verschieben nicht möglich: {fehler}
        </p>
      )}

      {/**
       * Die Leiste der Markierung.
       *
       * Sie steht nur da, wenn etwas markiert ist — und sie sagt drei Dinge:
       * wie viele es sind, wie man sie loswird und wie man sie ohne Maus
       * verschiebt. Das Auswahlfeld ist kein Beiwerk: Strg-Klick und Ziehen
       * gibt es nur mit Maus, und ein Brett, das sich ohne Maus nicht
       * bedienen laesst, ist fuer manche gar kein Brett.
       */}
      {markiert.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-accent/40 bg-accent/[0.06] px-3 py-2 text-xs">
          <span className="font-semibold text-accent">
            {markiert.size}{" "}
            {markiert.size === 1 ? "Fall markiert" : "Fälle markiert"}
          </span>
          <span className="text-muted">
            Karte ziehen verschiebt alle markierten.
          </span>

          <label className="ml-auto flex items-center gap-2">
            <span className="text-muted">In Ordner legen</span>
            <select
              // Der Wert wird nach jedem Zug zurueckgesetzt: Das Feld ist ein
              // Befehl, kein Zustand. Ohne `value` staende dort danach der
              // zuletzt gewaehlte Ordner, als laege die Markierung dort.
              value=""
              onChange={(e) => {
                const ziel = e.target.value;
                if (ziel) verschiebeMarkierte(ziel as StatusId);
              }}
              className="rounded-[10px] border border-border bg-surface-2 px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <option value="">Ordner wählen…</option>
              {nachGruppen(alleStationen.filter((x) => !x.stillgelegt)).map(
                (buendel) =>
                  buendel.gruppe ? (
                    <optgroup key={buendel.gruppe} label={buendel.gruppe}>
                      {buendel.ordner.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    buendel.ordner.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))
                  )
              )}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setMarkiert(new Set())}
            className="rounded-full border border-border px-3 py-1 text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            Markierung aufheben
          </button>
        </div>
      )}

      {/**
       * Der Knopf fuer die hinteren Ordner.
       *
       * Er nennt sie beim Namen und sagt, wie viele Faelle darin liegen —
       * beides, damit "zugeklappt" nicht mit "leer" verwechselt wird. Liegt
       * dort etwas, steht die Zahl deutlich da; liegt nichts dort, steht es
       * ebenso deutlich.
       *
       * Nur auf Brettern, die ueberhaupt zugeklappte Ordner haben. "Erledigt"
       * hat sieben Spalten, die alle nebeneinander passen — ein Knopf, der
       * "0 weitere Ordner" anbietet, waere dort nur eine Frage, auf die man
       * keine Antwort braucht.
       */}
      {hatSpaete && (
      <div className="flex justify-end">
        <button
          type="button"
          // Der Griff fuer das Ziehen: `bewegen` sucht diese Kennung unter dem
          // Zeiger und klappt auf, sobald eine Karte darueber steht.
          data-spaete-knopf
          onClick={() => setSpaeteOffen((a) => !a)}
          aria-expanded={spaeteOffen}
          title={
            spaeteOffen
              ? undefined
              : `${versteckt.map((s) => s.name).join(", ")} — beim Ziehen einer Karte hierher klappen sie von selbst auf`
          }
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition-colors duration-150 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
            zug && !spaeteOffen
              ? // Waehrend eines Zugs ist der Knopf ein Ziel und sieht auch so
                // aus — sonst waere er die einzige Flaeche des Bretts, die
                // etwas tut, ohne es zu zeigen.
                "border-accent/60 bg-accent/[0.08] text-foreground"
              : "border-border text-muted"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={`size-3 transition-transform duration-150 ${
              spaeteOffen ? "rotate-90" : ""
            }`}
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
          {spaeteOffen ? (
            <>Weitere Ordner ausblenden</>
          ) : (
            <>
              {versteckt.length} weitere Ordner
              <span className="tabular-nums text-foreground">
                {verstecktesGewicht}
              </span>
              {verstecktesGewicht === 1 ? "Fall" : "Fälle"}
            </>
          )}
        </button>
      </div>
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
         * `minmax(176px, 1fr)`.
         *
         * Feste Breiten koennen nur eins von beidem: Auf einem breiten Schirm
         * lassen sie rechts Platz liegen, auf einem schmalen laufen sie
         * hinaus. `1fr` verteilt die vorhandene Breite gleichmaessig auf alle
         * Ordner; die Untergrenze ist der Punkt, an dem eine Karte noch
         * traegt, was sie tragen soll, und darunter faengt das Brett an zu
         * rollen, statt die Karten zu zerdruecken.
         *
         * Woher die 176: "92.000 €" braucht neben dem 32 Pixel breiten Zeichen
         * 65 Pixel, und bei 150 stand der hoechste Betrag abgeschnitten da —
         * also gerade der, den man auf einem Brett zuerst sucht. 164 reichte
         * dafuer; seit nur noch neun Ordner nebeneinander stehen, ist Platz
         * fuer etwas mehr Luft, und die Namen brechen seltener ab.
         */
        style={{
          gridTemplateColumns: `repeat(${sichtbar.length}, minmax(176px, 1fr))`,
        }}
        // Beim Ziehen bewegt sich der Zeiger auch ueber Zwischenraeume. Die
        // Ereignisse landen dank Zeigerfang trotzdem am Griff — hier stehen
        // sie nur, damit ein Loslassen ausserhalb einer Karte sauber endet.
        onPointerUp={loslassen}
        onPointerCancel={abbrechen}
      >
        {sichtbar.map((station) => {
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
                    darfSchieben={darfSchieben}
                    markiert={markiert.has(fall.id)}
                    onMarkieren={markiereUm}
                    inDerLuft={
                      zug !== null &&
                      (zug.id === fall.id ||
                        (markiert.has(zug.id) &&
                          markiert.size > 1 &&
                          markiert.has(fall.id)))
                    }
                    onGreifen={greifen}
                    onBewegen={bewegen}
                    onLoslassen={loslassen}
                    onAbbrechen={abbrechen}
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
  darfSchieben,
  markiert,
  onMarkieren,
  inDerLuft,
  onGreifen,
  onBewegen,
  onLoslassen,
  onAbbrechen,
}: {
  fall: BrettFall;
  darfSchieben: boolean;
  markiert: boolean;
  onMarkieren: (id: string) => void;
  inDerLuft: boolean;
  onGreifen: (e: ZeigerEreignis<HTMLElement>, fall: BrettFall) => void;
  onBewegen: (e: ZeigerEreignis<HTMLElement>) => void;
  onLoslassen: () => void;
  onAbbrechen: () => void;
}) {
  /**
   * Ob die Vorschau offen ist.
   *
   * Aufgeklappt wird sie ueber dem Betrag, zugeklappt beim Verlassen der
   * ganzen Karte — und dazu ueber die Tastatur, sobald irgendetwas auf der
   * Karte den Fokus hat. Eine Auskunft, die es nur mit der Maus gibt, gibt es
   * fuer die Tastatur gar nicht.
   */
  const [offen, setOffen] = useState(false);

  return (
    // `relative` ist hier kein Schmuck, sondern noetig: Die `sr-only`-Texte
    // auf der Karte sind in Tailwind `position: absolute`. Ohne einen
    // positionierten Vorfahren haengen sie nicht an der Karte, sondern am
    // Dokument — an der Stelle, an der die Karte laege, wenn das Brett nicht
    // seitlich gerollt waere. Bei vierzehn Spalten sind das ein paar tausend
    // Pixel weit rechts, und weil ein absolut positioniertes Element nicht vom
    // `overflow` eines beliebigen Vorfahren beschnitten wird, sondern nur
    // innerhalb seines Enthaeltnisblocks, zog es die ganze Seite in die
    // Breite: Das CRM liess sich am Telefon seitlich wegschieben, obwohl das
    // Brett fuer sich sauber rollte.
    <li
      /**
       * Strg oder Cmd und ein Klick markiert die Karte.
       *
       * `preventDefault` haelt den Browser davon ab, den Namen als Verweis in
       * einem neuen Tab zu oeffnen — auf einem Brett ist Strg-Klick die Geste
       * fuers Markieren, nicht fuers Oeffnen. Ohne Strg bleibt alles, wie es
       * war: Der Name fuehrt zum Fall, der Rest der Karte tut nichts.
       */
      onClick={(e) => {
        if (!darfSchieben || !(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        onMarkieren(fall.id);
      }}
      /**
       * Angefasst wird die ganze Karte.
       *
       * Vorher gab es dafuer einen Griff aus sechs Punkten am linken Rand: 24
       * Pixel, die man treffen musste, bevor sich etwas bewegte. Auf einem
       * Brett, auf dem man den ganzen Tag Karten verschiebt, ist das
       * vierundzwanzigmal zielen statt einmal greifen — und die 24 Pixel
       * fehlten dem Inhalt in jeder Spalte.
       *
       * Ein Klick bleibt ein Klick: Gezogen wird erst ab ein paar Pixeln
       * Bewegung (siehe SCHWELLE), und bis dahin kommt der Klick beim Namen
       * an und oeffnet den Fall.
       *
       * `touch-action: pan-y` statt `none`: Der Browser behaelt das
       * senkrechte Blaettern — sonst liesse sich die Spalte am Finger nicht
       * mehr rollen, sobald sie mehr Karten hat als Platz. Waagerechte
       * Bewegung bleibt uns, und das ist die Richtung, in die eine Karte
       * ohnehin geht. Entscheidet der Browser sich fuer das Blaettern, kommt
       * `pointercancel` — und der angefangene Zug wird sauber abgeraeumt.
       */
      onPointerDown={darfSchieben ? (e) => onGreifen(e, fall) : undefined}
      onPointerMove={darfSchieben ? onBewegen : undefined}
      onPointerUp={darfSchieben ? onLoslassen : undefined}
      onPointerCancel={darfSchieben ? onAbbrechen : undefined}
      onPointerLeave={() => setOffen(false)}
      onFocus={() => setOffen(true)}
      // `relatedTarget` ist das Element, das den Fokus bekommt. Bleibt er auf
      // der Karte, bleibt die Vorschau offen.
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOffen(false);
        }
      }}
      className={`relative flex select-none rounded-[14px] border bg-surface-2 transition-[opacity,border-color,box-shadow] duration-150 focus-within:border-border-strong ${
        darfSchieben ? "cursor-grab touch-pan-y active:cursor-grabbing" : ""
      } ${
        markiert
          ? "border-accent/70 ring-1 ring-accent/40"
          : "border-border hover:border-border-strong"
      } ${offen ? "shadow-[0_10px_24px_-14px_rgba(0,0,0,0.9)]" : ""} ${
        inDerLuft ? "opacity-40" : ""
      }`}
    >
      {/* Ein Haken in der Ecke sagt, dass die Karte mitgeht — der Rahmen
          allein ist auf einem Brett aus vierzig Karten zu leise, und Farbe
          allein liest niemand vor. */}
      {markiert && (
        <span
          aria-label="markiert"
          // `pointer-events-none`: Sonst schluckte der Haken dort die
          // Zeigerereignisse, und die obere linke Ecke der Karte waere tot —
          // ausgerechnet an einer markierten Karte, die man gleich ziehen
          // will.
          // Innerhalb der Karte statt ueber ihrer Ecke: Die Spalte rollt in
          // sich und schneidet ab, was oben hinausragt — gemessen sechs Pixel
          // an der ersten Karte, also genau der halbe Haken.
          className="pointer-events-none absolute left-0.5 top-0.5 z-10 grid size-4 place-items-center rounded-full bg-accent text-accent-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-2.5"
          >
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col items-center px-2 pb-2 pt-1.5 text-center">
        {/* Das Datum klein oben rechts: Es beantwortet "seit wann liegt das
            hier", und das ist eine Frage, die man an eine Karte stellt,
            nachdem man sie gefunden hat. In eigener Zeile, damit es dem
            Betrag darunter keine Breite wegnimmt. */}
        <span className="self-end text-[10px] leading-none text-muted/60 tabular-nums">
          {fall.eingang}
        </span>

        {/**
         * Zeichen und Betrag untereinander, mittig, und beide gross.
         *
         * Seit Griff und Auswahlfeld weg sind, gehoert die ganze Breite dem
         * Inhalt — vorher gingen links 24 und rechts noch einmal 24 Pixel
         * weg, und der Betrag drueckte sich in den Rest. Nebeneinander waere
         * der gewonnene Platz gleich wieder verteilt; untereinander bekommt
         * jedes von beidem die volle Spalte.
         *
         * Das Zeichen ist dasselbe wie in der Antragsstrecke, mit derselben
         * Farbe und derselben getoenten Flaeche darunter (`zweck-zeichen`).
         * Der Kunde hat es angeklickt, hier steht es wieder — zwei Ansichten
         * derselben Sache sollen auch gleich aussehen.
         */}
        <span
          className="zweck-zeichen mt-0.5 grid size-11 shrink-0 place-items-center rounded-[13px]"
          style={{ "--zweck": fall.farbe ?? "var(--muted)" } as CSSProperties}
          title={fall.art ?? undefined}
        >
          <ZweckZeichen id={fall.kreditart ?? ""} className="size-7" />
          <span className="sr-only">{fall.art ?? "Verwendung offen"}</span>
        </span>

        {/**
         * Der Betrag ist der Schalter fuer die Vorschau.
         *
         * Nicht die ganze Karte: Wer den Zeiger ueber das Brett fuehrt, um
         * eine Karte zu greifen, streift dabei ein Dutzend andere, und jede
         * davon klappte auf und schob die darunter weg. Der Betrag ist klein
         * genug, dass man ihn absichtlich ansteuert.
         *
         * Zugeklappt wird erst, wenn der Zeiger die ganze Karte verlaesst
         * (siehe `onPointerLeave` am `li`). Sonst fiele die Vorschau in dem
         * Moment zu, in dem man sie zu lesen beginnt.
         */}
        <span
          data-betrag
          onPointerEnter={() => setOffen(true)}
          className="mt-1.5 max-w-full truncate text-[19px] font-semibold leading-tight tabular-nums"
        >
          {fall.betrag}
        </span>

        {/* Ruhend abgeschnitten, beim Zeigen ausgeschrieben: In einer schmalen
            Spalte hat "Philippa-Charlotte Dummy" keinen Platz, und drei Punkte
            sind ehrlicher als eine zerquetschte Zeile. */}
        <Link
          href={`/crm/antrag/${fall.id}`}
          title={fall.name}
          className={`mt-0.5 max-w-full text-[12px] leading-snug text-muted hover:text-accent ${
            offen ? "" : "truncate"
          }`}
        >
          {fall.name}
        </Link>

        {/**
         * Die Vorschau: was die Karte sonst weglaesst.
         *
         * Kein eingeblendeter Kasten am Zeiger, sondern die Karte selbst wird
         * hoeher. Ein Kasten muesste `fixed` liegen und von Hand ausgerichtet
         * werden — die Spalte rollt in sich und beschneidet alles, was
         * darueber hinausragt (dasselbe Problem wie bei der Fahne ueber den
         * Ordnern). Waechst die Karte in der Reihe, rollt die Spalte einfach
         * mit.
         *
         * Ohne Ort: Ein Brett haengt offen im Buero, wird geteilt und
         * abfotografiert. Der Betrag sagt nichts ueber eine Person, eine
         * Adresse schon. Wer sie braucht, oeffnet den Fall.
         */}
        {offen && (
          <div
            lang="de"
            /* `hyphens-auto` vor `break-words`: Ein Wort, das nicht in die
               Spalte passt, wird sonst irgendwo zerschnitten —
               "Zahnbehandlu/ng". Mit Silbentrennung bricht es dort, wo es ein
               Mensch auch braeche. Kennt der Browser die deutschen
               Trennregeln nicht, bleibt der harte Umbruch als Rueckfall. */
            className="mt-1 flex flex-col gap-0.5 hyphens-auto break-words text-[11px] leading-snug text-muted"
          >
            <span>{fall.art ?? "—"}</span>
            <span className="tabular-nums">{fall.laufzeit}</span>
          </div>
        )}

        {fall.wiedervorlage && (
          <span
            className={`mt-1.5 max-w-full truncate rounded-full border px-2 py-0.5 text-[11px] tabular-nums ${
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
    </li>
  );
}
