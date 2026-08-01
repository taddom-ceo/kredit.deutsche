"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useLanguage } from "@/lib/language-context";
import { wizardTranslations } from "@/lib/wizard-i18n";
import { useWizard } from "@/lib/wizard-context";
import WizardStepLayout from "./WizardStepLayout";

// Die ersten vier Verwendungszwecke werden hervorgehoben — auf Schritt 1 durch
// einen Akzentrand, auf Schritt 2 durch eine eigene Gruppe im Auswahlfeld.
export const HIGHLIGHTED_COUNT = 4;

// Erlaubt den Zeilenumbruch nach einem Schrägstrich. Ohne diesen Hinweis
// bricht der Browser innerhalb des Wortes ("Baufin|anzierung"); so entsteht
// stattdessen "Modernisierung/" und "Baufinanzierung".
function withBreakAfterSlash(text: string) {
  return text.split("/").map((part, i, parts) => (
    <Fragment key={i}>
      {part}
      {i < parts.length - 1 && (
        <>
          /<wbr />
        </>
      )}
    </Fragment>
  ));
}

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

  const gezeigterZweck = wt.step1.options.find((o) => o.id === gezeigt);

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
      aria-label={gezeigterZweck?.title}
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
        <span className="text-sm font-semibold">{gezeigterZweck?.title}</span>
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
        {gezeigterZweck?.hinweis}
      </p>
    </div>
  );

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {wt.step1.options.map((option, index) => {
          const active = data.kreditart === option.id;
          // Die ersten vier decken den Großteil der Anträge ab und bekommen
          // einen leichten Akzentrand. Bewusst schwächer als der
          // Auswahlzustand, damit beides unterscheidbar bleibt.
          const betont = index < HIGHLIGHTED_COUNT;
          return (
            <div
              key={option.id}
              data-zweck-karte
              // Weiß ist die Farbe der Auswahl. Beim Überfahren erscheint sie
              // bereits, damit vorab erkennbar ist, was ein Klick auswählt;
              // der Ring bleibt dem tatsächlich gewählten Zweck vorbehalten,
              // sodass beides unterscheidbar bleibt.
              className={`relative rounded-[16px] border bg-surface-2 transition-all duration-200 hover:border-foreground hover:-translate-y-px ${
                active
                  ? "border-foreground ring-1 ring-foreground/30"
                  : betont
                    ? // Die vier häufigsten Zwecke bekommen einen ruhigen
                      // Akzentrand mit leichter Tönung.
                      "border-accent/45 bg-accent/[0.07]"
                    : "border-border"
              }`}
            >
              {/* Die Auswahlfläche liegt als eigene Schaltfläche unter dem
                  Inhalt und deckt die ganze Karte ab. Nötig, weil das ⓘ eine
                  echte Schaltfläche sein muss: Eine Schaltfläche in einer
                  Schaltfläche ist als Markup nicht zulässig. */}
              <button
                type="button"
                onClick={() => select(option.id)}
                aria-label={`${option.title} – ${option.description}`}
                className="absolute inset-0 rounded-[16px] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              />
              {/* Der Inhalt liegt darüber, lässt Klicks aber durch — nur das
                  ⓘ nimmt sie wieder an. */}
              <span className="pointer-events-none relative flex items-center justify-between gap-3 p-4">
                {/* min-w-0 hebt die Standard-Mindestbreite von Flex-Elementen
                    auf, sonst schrumpft der Textblock nicht unter seine
                    Inhaltsbreite und lange Bezeichnungen wie
                    "Modernisierung/Baufinanzierung" ragen über die Karte
                    hinaus. break-words erlaubt den Umbruch innerhalb des Wortes. */}
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-semibold break-words">
                    {withBreakAfterSlash(option.title)}
                    {option.hinweis && (
                      <button
                        type="button"
                        data-hinweis-knopf
                        onClick={(e) => umschalten(option.id, e.currentTarget)}
                        aria-expanded={offen === option.id}
                        aria-controls="zweck-hinweis"
                        aria-label={`${wt.step1.hinweisOeffnen}: ${option.title}`}
                        className={`pointer-events-auto ml-1.5 inline-flex h-[1.35em] w-[1.35em] shrink-0 items-center justify-center rounded-full border align-[-0.1em] text-[0.7em] font-bold leading-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 ${
                          offen === option.id
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-accent/50 text-accent hover:bg-accent/15"
                        }`}
                      >
                        i
                      </button>
                    )}
                  </span>
                  <span className="text-xs text-muted break-words">
                    {option.description}
                  </span>
                </span>
                <span className="text-accent shrink-0">→</span>
              </span>
            </div>
          );
        })}
      </div>
    </WizardStepLayout>
  );
}
