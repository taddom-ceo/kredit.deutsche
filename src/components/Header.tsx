"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { useLanguage } from "@/lib/language-context";
import { KREDITARTEN, kreditartPfad } from "@/lib/kreditarten";
import type { Language } from "@/lib/i18n";

/**
 * Die Kopfzeile jeder oeffentlichen Seite.
 *
 * Bisher stand dort nur das Logo und der Sprachumschalter — wer auf einer
 * Unterseite landete, kam von dort nirgendwo hin ausser zurueck zur
 * Startseite. Jetzt tragen vier Wege die Seite:
 *
 *   Kredite ▾ · Kreditrechner · Ratgeber · Über uns   [ Konditionen prüfen ]
 *
 * "Kredite" als Klappmenue, weil es sechzehn Verwendungszwecke sind: Sie alle
 * nebeneinander zu stellen sprengt jede Kopfzeile, und nur die vier
 * haeufigsten zu zeigen liesse die uebrigen unauffindbar. Das Menue zeigt die
 * ersten acht und fuehrt darunter auf die vollstaendige Uebersicht.
 *
 * Die Schaltflaeche rechts ist der einzige gruene Punkt in der Kopfzeile. Sie
 * fuehrt dorthin, wo auch der Aufruf im Aufmacher hinfuehrt — zwei Farben und
 * zwei Ziele waeren zwei Entscheidungen, wo eine gemeint ist.
 */

/** So viele Kreditarten stehen im Klappmenue, bevor der Verweis auf alle kommt. */
const IM_MENUE = 8;

function LangButton({
  value,
  label,
  active,
  onSelect,
}: {
  value: Language;
  label: string;
  active: boolean;
  onSelect: (value: Language) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "bg-accent text-accent-foreground shadow-sm shadow-black/20"
          : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

/** Ein Weg in der Kopfzeile. Der gerade offene ist hervorgehoben. */
function NavVerweis({
  href,
  aktiv,
  children,
}: {
  href: string;
  aktiv: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      // `aria-current` sagt Vorlesehilfen, wo man ist. Die Farbe allein sagt
      // es ihnen nicht.
      aria-current={aktiv ? "page" : undefined}
      className={`rounded-[10px] px-2 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        aktiv ? "text-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const { lang, t, setLang } = useLanguage();
  const n = t.navigation;
  const pfad = usePathname();

  const [menueOffen, setMenueOffen] = useState(false);
  const [klappeOffen, setKlappeOffen] = useState(false);
  const klappeId = useId();
  const klappeRef = useRef<HTMLDivElement>(null);

  // Ein Klappmenue, das nur beim Klick auf den Knopf wieder zugeht, bleibt
  // offen stehen, waehrend man laengst woanders liest. Escape und ein Klick
  // daneben schliessen es deshalb auch.
  //
  // Die Zustandsaenderung steht in den Rueckrufen und nicht im Rumpf des
  // Effekts — dort waere sie eine Kaskade von Renderdurchlaeufen, und die
  // Regel `react-hooks/set-state-in-effect` verbietet sie in diesem Projekt.
  useEffect(() => {
    if (!klappeOffen) return;

    function beiTaste(e: KeyboardEvent) {
      if (e.key === "Escape") setKlappeOffen(false);
    }
    function beiKlick(e: MouseEvent) {
      if (!klappeRef.current?.contains(e.target as Node)) setKlappeOffen(false);
    }

    document.addEventListener("keydown", beiTaste);
    document.addEventListener("mousedown", beiKlick);
    return () => {
      document.removeEventListener("keydown", beiTaste);
      document.removeEventListener("mousedown", beiKlick);
    };
  }, [klappeOffen]);

  const wege = [
    { href: "/rechner", text: n.kreditrechner },
    { href: "/ratgeber", text: n.ratgeber },
    { href: "/ueber-uns", text: n.ueberUns },
  ];
  const aufKrediten = pfad === "/kredit" || pfad.startsWith("/kredit/");

  return (
    // Bewusst ohne eigene Flaeche: Der Seitenhintergrund traegt oben einen
    // Farbverlauf (globals.css, zwei radiale Verlaeufe am oberen Rand). Eine
    // eigene Hintergrundfarbe uebermalt ihn genau dort, wo er am staerksten
    // ist — die Kopfzeile saehe dann als dunkler Kasten aus, der auf der
    // Seite liegt, statt zu ihr zu gehoeren.
    //
    // `relative z-30` bleibt: Es traegt keine Farbe, sondern haelt das
    // Klappmenue ueber dem Inhalt darunter. Das Menue selbst ist deckend
    // (bg-surface), ein durchsichtiges Menue ueber Text waere unlesbar.
    <header className="relative z-30 border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 lg:py-5 flex items-center justify-between gap-4">
        {/* Der Schriftzug ist echter Text und keine Grafik: Er nutzt damit die
            Hausschrift, bleibt bei jeder Zoomstufe scharf und ist für
            Suchmaschinen und Vorlesehilfen lesbar. Nur die Bildmarke ist eine
            Zeichnung. */}
        <Link
          href="/"
          aria-label="cresolu.de — clever finanzieren"
          className="flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
        >
          <LogoMark className="h-9 w-9 shrink-0 lg:h-10 lg:w-10" />
          <span className="flex flex-col">
            <span className="text-lg lg:text-xl font-semibold leading-none tracking-[-0.01em]">
              cresolu<span className="text-accent">.de</span>
            </span>
            <span className="mt-1.5 text-[9px] lg:text-[10px] font-medium uppercase leading-none tracking-[0.2em] text-muted">
              Clever finanzieren
            </span>
          </span>
        </Link>

        {/* Ab 1024px die ausgeschriebene Leiste. Darunter ist kein Platz für
            vier Wege neben Logo und Schaltfläche, dort trägt sie das
            Klappmenü weiter unten. */}
        <nav
          aria-label={n.hauptmenue}
          className="hidden lg:flex items-center gap-1"
        >
          <div ref={klappeRef} className="relative">
            <button
              type="button"
              onClick={() => setKlappeOffen((offen) => !offen)}
              aria-expanded={klappeOffen}
              aria-controls={klappeId}
              className={`flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                aufKrediten || klappeOffen
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {n.kredite}
              <span
                aria-hidden="true"
                className={`text-[10px] text-accent transition-transform duration-200 ${
                  klappeOffen ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {/* Zwei Spalten: Acht Zwecke untereinander wären eine Liste, die
                über den halben Bildschirm reicht. */}
            <div
              id={klappeId}
              // Beim Klick auf einen Verweis geht das Menue zu. Ueber einen
              // Effekt auf den Pfad waere das eine Zustandsaenderung im Rumpf
              // eines Effekts — in diesem Projekt ein Fehler, und
              // ueberfluessig, denn der Klick ist ohnehin schon da.
              onClick={() => setKlappeOffen(false)}
              // Ausgeblendet gehört es aus Fokusfolge und Vorlesehilfe heraus,
              // sonst führt die Tabulatortaste in ein unsichtbares Menü.
              inert={!klappeOffen}
              hidden={!klappeOffen}
              className="absolute left-0 top-[calc(100%+0.75rem)] w-[30rem] rounded-[20px] border border-border-strong bg-surface p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/5"
            >
              <ul className="grid grid-cols-2 gap-1">
                {KREDITARTEN.slice(0, IM_MENUE).map((art) => (
                  <li key={art.id}>
                    <Link
                      href={kreditartPfad(art)}
                      className="group flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      {/* Derselbe Farbpunkt wie auf den Kacheln — er sagt die
                          Art schon, bevor der Name gelesen ist. */}
                      <span
                        aria-hidden="true"
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: art.farbe }}
                      />
                      <span className="font-medium text-muted transition-colors duration-200 group-hover:text-foreground">
                        {art[lang].name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/kredit"
                className="mt-1 flex items-center justify-between gap-2 rounded-[12px] border-t border-border px-3 pb-1 pt-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {n.alleKreditarten}
                <span aria-hidden="true" className="text-accent">
                  →
                </span>
              </Link>
            </div>
          </div>

          {wege.map((weg) => (
            <NavVerweis key={weg.href} href={weg.href} aktiv={pfad === weg.href}>
              {weg.text}
            </NavVerweis>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <LangButton
              value="de"
              label="DE"
              active={lang === "de"}
              onSelect={setLang}
            />
            <LangButton
              value="en"
              label="ENG"
              active={lang === "en"}
              onSelect={setLang}
            />
          </div>

          {/* Der einzige grüne Punkt in der Kopfzeile. Auf schmalen Handys
              tritt er zurück — dort trägt die feste Leiste unten den Aufruf,
              und zwei Aufrufe übereinander wären einer zu viel. */}
          <Link
            href="/rechner"
            className="hidden sm:inline-flex items-center rounded-[14px] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(52,211,153,0.55)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {n.cta}
          </Link>

          <button
            type="button"
            onClick={() => setMenueOffen((offen) => !offen)}
            aria-expanded={menueOffen}
            aria-controls="hauptmenue-handy"
            aria-label={menueOffen ? n.menueSchliessen : n.menueOeffnen}
            className="lg:hidden grid size-10 place-items-center rounded-[12px] border border-border bg-surface text-foreground transition-colors duration-200 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-5"
            >
              {menueOffen ? (
                <>
                  <path d="m6 6 12 12" />
                  <path d="M18 6 6 18" />
                </>
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Das Menü auf dem Handy. Es klappt die Kopfzeile auf, statt über die
          Seite zu legen: So bleibt sichtbar, wo man ist, und ein Tippen
          daneben scrollt weiter, statt nur das Menü zu schließen. */}
      <nav
        id="hauptmenue-handy"
        aria-label={n.hauptmenue}
        // Dasselbe wie beim Klappmenue: Der Klick auf einen Verweis schliesst
        // es. Der Sprachumschalter darunter liegt ebenfalls darin — dort ist
        // Zugehen genau das, was man erwartet, weil die Seite sich sichtbar
        // aendert.
        onClick={() => setMenueOffen(false)}
        inert={!menueOffen}
        hidden={!menueOffen}
        className="lg:hidden border-t border-border bg-surface/60"
      >
        <ul className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex flex-col">
          <li>
            <Link
              href="/kredit"
              aria-current={aufKrediten ? "page" : undefined}
              className="flex items-center justify-between gap-2 border-b border-border py-3 text-[15px] font-medium text-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              {n.kredite}
              <span aria-hidden="true" className="text-accent">
                →
              </span>
            </Link>
          </li>
          {wege.map((weg) => (
            <li key={weg.href}>
              <Link
                href={weg.href}
                aria-current={pfad === weg.href ? "page" : undefined}
                className="flex items-center justify-between gap-2 border-b border-border py-3 text-[15px] font-medium text-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {weg.text}
                <span aria-hidden="true" className="text-accent">
                  →
                </span>
              </Link>
            </li>
          ))}
          {/* Der Sprachumschalter steht ab sm oben. Auf dem schmalsten Handy
              ist dort kein Platz mehr, deshalb hier. */}
          <li className="sm:hidden flex items-center gap-1 self-start rounded-full border border-border bg-surface p-1 mt-3">
            <LangButton
              value="de"
              label="DE"
              active={lang === "de"}
              onSelect={setLang}
            />
            <LangButton
              value="en"
              label="ENG"
              active={lang === "en"}
              onSelect={setLang}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
}
