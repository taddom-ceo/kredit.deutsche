"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { zweckIcon } from "@/components/illustrations/ZweckIcons";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import {
  KREDITARTEN,
  SICHTBAR_ANZAHL,
  findeKreditartNachId,
  ganzerWunsch,
  type Kreditart,
} from "@/lib/kreditarten";
import WizardStepLayout from "./WizardStepLayout";

export default function StepArt() {
  const { lang } = useLanguage();
  const wt = wizardTranslations[lang];
  const { data, update, goNext } = useWizard();

  // Der Hinweis wird über seine Zweck-Kennung geführt, nicht über den Text:
  // So bleibt er beim Sprachwechsel richtig. offen steuert die Bewegung,
  // gezeigt hält den Inhalt auch während des Einfahrens noch fest — sonst
  // wäre das Feld beim Schließen sofort leer.
  const [offen, setOffen] = useState<string | null>(null);
  const [gezeigt, setGezeigt] = useState<string | null>(null);
  // Zwei Höhen: Auf Desktop steht der Hinweis neben der Kachel, auf dem Handy
  // darunter. Dort läge er sonst über dem ⓘ und verdeckte den eigenen
  // Schalter. Beide Werte gehen als CSS-Variablen raus, damit der Umbruch am
  // Breakpoint hängt und nicht an einer Messung in JavaScript.
  const [oben, setOben] = useState(0);
  const [obenMobil, setObenMobil] = useState(0);
  const ausfahrerRef = useRef<HTMLDivElement>(null);

  const sichtbare = KREDITARTEN.slice(0, SICHTBAR_ANZAHL);
  const weitere = KREDITARTEN.slice(SICHTBAR_ANZAHL);

  // Wer über die Fortschrittsleiste zurückkommt und einen der hinteren Zwecke
  // gewählt hat, soll ihn auch sehen — sonst wirkte die Auswahl verloren.
  const [mehrOffen, setMehrOffen] = useState(() =>
    weitere.some((a) => a.id === data.kreditart)
  );
  // Beschneiden nur während der Bewegung, siehe Kommentar am Ausklappbereich.
  const [ausklappFertig, setAusklappFertig] = useState(() =>
    weitere.some((a) => a.id === data.kreditart)
  );

  const schliessen = useCallback(() => setOffen(null), []);

  function umschalten(id: string, ausloeser: HTMLElement) {
    if (offen === id) {
      schliessen();
      return;
    }
    // Die Karte liegt im Fenster, der Ausfahrer daneben — beide teilen sich
    // die obere Kante. offsetTop misst in Layout-Pixeln und ist deshalb
    // unabhängig von der Skalierung der Bühne.
    const karte = ausloeser.closest<HTMLElement>("[data-zweck-karte]");
    if (karte) {
      setOben(karte.offsetTop);
      setObenMobil(karte.offsetTop + karte.offsetHeight + 12);
    }
    setGezeigt(id);
    setOffen(id);
  }

  // Schließen bei Klick daneben und bei Escape — das erwartet man von einem
  // Einblender, der nicht die ganze Seite sperrt.
  useEffect(() => {
    if (!offen) return;
    function beiKlick(e: MouseEvent) {
      const ziel = e.target as HTMLElement;
      if (ausfahrerRef.current?.contains(ziel)) return;
      if (ziel.closest("[data-hinweis-knopf]")) return;
      schliessen();
    }
    function beiTaste(e: KeyboardEvent) {
      if (e.key === "Escape") schliessen();
    }
    document.addEventListener("pointerdown", beiKlick);
    document.addEventListener("keydown", beiTaste);
    return () => {
      document.removeEventListener("pointerdown", beiKlick);
      document.removeEventListener("keydown", beiTaste);
    };
  }, [offen, schliessen]);

  // Beide Schritte verwenden dieselben Werte, deshalb ist der
  // Verwendungszweck schlicht die hier gewählte Art. Wer sie nachträglich
  // ändert, bekommt den Zweck entsprechend mitgeführt.
  function select(id: string) {
    update({ kreditart: id, purpose: id });
    goNext();
  }

  const gezeigterZweck = gezeigt ? findeKreditartNachId(gezeigt) : undefined;

  // Der Ausfahrer liegt als Geschwister hinter dem Hauptfenster. Geschlossen
  // steht er per translate-x-full genau darin verborgen; geöffnet fährt er
  // nach links heraus. Auf schmalen Geräten ist links kein Platz, dort legt
  // er sich stattdessen über die Kacheln — deshalb z-30 und erst ab lg
  // wieder z-auto, damit ihn das Fenster dort verdecken kann.
  const ausfahrer = (
    <div
      ref={ausfahrerRef}
      id="zweck-hinweis"
      role="dialog"
      aria-label={gezeigterZweck?.[lang].name}
      aria-hidden={!offen}
      style={
        {
          "--hinweis-oben": `${oben}px`,
          "--hinweis-oben-mobil": `${obenMobil}px`,
        } as CSSProperties
      }
      className={`hinweis-ausfahrer absolute z-30 lg:z-auto top-[var(--hinweis-oben-mobil)] lg:top-[var(--hinweis-oben)] inset-x-4 lg:inset-x-auto lg:right-full lg:w-80 rounded-[18px] border border-accent/30 bg-surface p-4 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.75)] ring-1 ring-white/5 ${
        offen
          ? "translate-x-0 opacity-100"
          : "-translate-x-6 lg:translate-x-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold">
          {gezeigterZweck?.[lang].name}
        </span>
        <button
          type="button"
          onClick={schliessen}
          tabIndex={offen ? 0 : -1}
          aria-label={wt.step1.hinweisSchliessen}
          className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-muted transition-colors duration-200 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          ✕
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-foreground/85">
        {gezeigterZweck?.[lang].hinweis}
      </p>
    </div>
  );

  function karte(art: Kreditart) {
    const inhalt = art[lang];
    const active = data.kreditart === art.id;
    const Zeichen = zweckIcon(art.id);
    return (
      <div
        key={art.id}
        data-zweck-karte
        style={{ "--zweck": art.farbe } as CSSProperties}
        // Weiß ist die Farbe der Auswahl. Beim Überfahren erscheint sie
        // bereits, damit vorab erkennbar ist, was ein Klick auswählt; der Ring
        // bleibt dem tatsächlich gewählten Zweck vorbehalten, sodass beides
        // unterscheidbar bleibt. Sonst sehen alle Kacheln gleich aus.
        className={`relative rounded-[16px] border bg-surface-2 transition-all duration-200 hover:border-foreground hover:-translate-y-px ${
          active
            ? "border-foreground ring-1 ring-foreground/30"
            : "border-border"
        }`}
      >
        {/* Die Auswahlfläche liegt als eigene Schaltfläche unter dem Inhalt
            und deckt die ganze Karte ab. Nötig, weil das ⓘ eine echte
            Schaltfläche sein muss: Eine Schaltfläche in einer Schaltfläche
            ist als Markup nicht zulässig. */}
        <button
          type="button"
          onClick={() => select(art.id)}
          aria-label={`${ganzerWunsch(inhalt)} – ${inhalt.name}`}
          className="absolute inset-0 rounded-[16px] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        />
        {/* Der Inhalt liegt darüber, lässt Klicks aber durch — nur das ⓘ
            nimmt sie wieder an.
            pr-11 hält die rechte Spalte frei: Dort steht das ⓘ, der Text soll
            nicht darunter laufen. */}
        <span className="pointer-events-none relative flex gap-3 p-4 pr-11">
          {/* Dasselbe Zeichen und dieselbe Farbe wie auf der Kachel der
              Startseite — wer von dort kommt, erkennt seinen Zweck wieder. */}
          <span className="zweck-zeichen grid size-12 shrink-0 place-items-center rounded-[13px]">
            <Zeichen className="size-7" />
          </span>
          {/* min-w-0 hebt die Standard-Mindestbreite von Flex-Elementen auf,
              sonst schrumpft der Textblock nicht unter seine Inhaltsbreite und
              lange Zeilen ragen über die Karte hinaus. */}
          <span className="flex min-w-0 flex-col">
            {/* Derselbe Aufbau wie auf der Kachel der Startseite: Anlauf
                klein, Kernaussage groß. Wer von dort kommt, sucht denselben
                Satz und findet ihn an derselben Stelle. */}
            <span className="text-[11px] font-medium leading-none text-muted break-words">
              {inhalt.wunschVor}
            </span>
            <span className="mt-1 text-[1.05rem] font-bold leading-[1.2] tracking-[-0.015em] break-words">
              {inhalt.wunschKern}
            </span>
            <span className="mt-1.5 text-xs text-muted break-words">
              {inhalt.teaser}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-accent">
              <svg
                aria-hidden="true"
                viewBox="0 0 12 12"
                className="size-2.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                <path d="M2.6 6.2 L4.9 8.5 L9.4 3.7" />
              </svg>
              {inhalt.vorteil}
            </span>
          </span>
        </span>

        {inhalt.hinweis && (
          <button
            type="button"
            data-hinweis-knopf
            onClick={(e) => umschalten(art.id, e.currentTarget)}
            aria-expanded={offen === art.id}
            aria-controls="zweck-hinweis"
            aria-label={`${wt.step1.hinweisOeffnen}: ${inhalt.name}`}
            // Sichtbar 1,5rem, damit es die 24px Mindestgröße für Tippziele
            // erreicht. Die Fläche, die tatsächlich annimmt, geht über ::after
            // noch einmal 6px darüber hinaus — man trifft es also auch knapp
            // daneben.
            className={`absolute top-3 right-3 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200 after:absolute after:-inset-1.5 after:content-[''] focus-visible:ring-2 focus-visible:ring-accent/40 ${
              offen === art.id
                ? "border-accent bg-accent text-accent-foreground"
                : "border-accent/50 text-accent hover:bg-accent/15"
            }`}
          >
            {/* Das i als Zeichnung statt als Buchstabe. Zentriert wird sonst
                die Zeilenbox, nicht die Tinte — und weil das i keine
                Unterlänge hat, saß es gemessen 4,5px über der Kreismitte.
                Wie stark, hinge zudem an der jeweils geladenen Schrift und
                fiele auf anderen Geräten wieder anders aus. Hier liegt die
                Tinte per Konstruktion genau in der Mitte. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <circle cx="12" cy="7.6" r="1.7" />
              <rect x="10.5" y="11" width="3" height="7" rx="1.5" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <WizardStepLayout
      eyebrow={wt.step1.eyebrow}
      title={wt.step1.title}
      highlight={wt.step1.highlight}
      subtitle={wt.step1.subtitle}
      trust={wt.step1.trust}
      showNav={false}
      ausfahrer={ausfahrer}
    >
      {/* Eine Spalte, nicht zwei. Das Antragsfenster ist nur halb so breit wie
          die Seite, und nach Bildzeichen und ⓘ blieben je Kachel keine 180px
          für den Text — "Ich möchte bestehende Kredite zusammenfassen" brach
          dort mitten im Wort um. Untereinander gelesen ist die Liste ohnehin
          näher an der Frage, die sie stellt: Welcher Satz bin ich? */}
      <div className="flex flex-col">
        <div className="grid grid-cols-1 gap-3">
          {sichtbare.map(karte)}
          <button
            type="button"
            onClick={() => {
              if (mehrOffen) setAusklappFertig(false);
              setMehrOffen((v) => !v);
            }}
            aria-expanded={mehrOffen}
            aria-controls="weitere-zwecke"
            className="relative rounded-[16px] border border-dashed border-border bg-surface-2/50 p-4 flex items-center justify-between gap-3 text-left transition-all duration-200 hover:border-foreground hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold break-words">
                {wt.step1.sonstigeLabel}
              </span>
              <span className="text-xs text-muted break-words">
                {weitere.length} {wt.step1.sonstigeAnzahl}
              </span>
            </span>
            {/* Als Zeichnung statt als Schriftzeichen: Der Winkel liegt in
                den Systemschriften uneinheitlich vor und säße mal zu hoch,
                mal zu tief. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 shrink-0 text-accent transition-transform duration-300 ${
                mehrOffen ? "rotate-180" : ""
              }`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Ausklappbereich. Die äußere Ebene wächst über die Rasterzeile,
            die mittlere schneidet währenddessen ab. Nach dem Ausfahren wird
            das Abschneiden aufgehoben, sonst beschnitte es den Fokusrahmen
            und das leichte Anheben beim Überfahren.

            inert im zugeklappten Zustand: Die Kacheln sind zwar abgeschnitten
            und nicht zu sehen, behalten aber einen Kasten im Layout und wären
            sonst mit der Tabulatortaste erreichbar — bei elf verborgenen
            Zwecken sind das fünfzehn Halte auf dem Weg zum nächsten Feld.
            inert nimmt den Teilbaum aus Fokusfolge und Vorlesehilfe zugleich. */}
        <div
          id="weitere-zwecke"
          inert={!mehrOffen}
          className={`ausklapp grid ${
            mehrOffen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          onTransitionEnd={(e) => {
            if (e.propertyName === "grid-template-rows" && mehrOffen) {
              setAusklappFertig(true);
            }
          }}
        >
          <div className={ausklappFertig ? "overflow-visible" : "overflow-hidden"}>
            <div
              className={`grid grid-cols-1 gap-3 pt-3 ${
                mehrOffen ? "opacity-100" : "opacity-0 -translate-y-2"
              }`}
            >
              {weitere.map(karte)}
            </div>
          </div>
        </div>
      </div>
    </WizardStepLayout>
  );
}
