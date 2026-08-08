"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Fussbereich from "@/components/Fussbereich";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/language-context";
import { angeboteTexte, type AngeboteTexte } from "@/lib/angebote-i18n";
import {
  BETRAG_MAX,
  BETRAG_MIN,
  LAUFZEITEN,
  LEERER_FILTER,
  filtere,
  gesamtbetrag,
  monatsrate,
  sollzins,
  sortiere,
  type Angebot,
  type Filter,
  type Sortierung,
} from "@/lib/angebote";
import { gruppiere, nurZiffern } from "@/lib/betrag";
import type { Language } from "@/lib/i18n";

/**
 * Wie lange die vorgetäuschte Abfrage dauert.
 *
 * Es ist noch keine Bank angebunden, die Liste steht also sofort fest. Die
 * Wartezeit ist trotzdem da, weil die Seite damit schon jetzt das Verhalten
 * zeigt, das sie später hat: Wer Betrag oder Laufzeit ändert, sieht die
 * Abfrage laufen, und die Platzhalter halten die Höhe der späteren Zeilen.
 * Sobald eine Schnittstelle da ist, tritt an die Stelle des Timers ihr
 * Ladezustand — sonst ändert sich nichts.
 */
const ABFRAGE_DAUER = 1400;

/** Die vier Spalten der Liste. Kopfzeile und Zeilen teilen sich das Raster. */
const RASTER =
  "lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,9.5rem)_minmax(0,11.5rem)]";

function euro(wert: number, lang: Language, stellen = 2): string {
  return new Intl.NumberFormat(lang, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  }).format(wert);
}

function prozent(wert: number, lang: Language): string {
  return `${new Intl.NumberFormat(lang, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(wert)} %`;
}

function zahl(wert: number, lang: Language, stellen = 1): string {
  return new Intl.NumberFormat(lang, {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
  }).format(wert);
}

/** Platzhalter der Form {name} in einer Textvorlage ersetzen. */
function fuelle(vorlage: string, werte: Record<string, string | number>): string {
  return vorlage.replace(/\{(\w+)\}/g, (treffer, schluessel) =>
    schluessel in werte ? String(werte[schluessel]) : treffer
  );
}

/**
 * Fester Farbton je Bank, damit die Kacheln unterscheidbar sind, ohne dass
 * jede Bank eine eigene Grafik braucht. Der Wertebereich ist bewusst eng auf
 * Grün bis Blau begrenzt: Ein freier Farbkreis brächte Senfgelb und Rosa in
 * eine Liste, die ruhig bleiben soll.
 */
function farbton(name: string): number {
  let summe = 0;
  for (let i = 0; i < name.length; i++) {
    summe = (summe * 31 + name.charCodeAt(i)) % 997;
  }
  return 150 + (summe % 76);
}

function BankZeichen({ name }: { name: string }) {
  const h = farbton(name);
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-[12px] border text-[13px] font-bold tracking-[-0.02em]"
      style={{
        background: `linear-gradient(145deg, hsl(${h} 44% 21%), hsl(${h} 40% 13%))`,
        borderColor: `hsl(${h} 45% 36% / 0.5)`,
        color: `hsl(${h} 68% 74%)`,
      }}
    >
      {name.slice(0, 2)}
    </span>
  );
}

/**
 * Bewertung als Sternreihe. Zwei deckungsgleiche Lagen: unten die leeren
 * Sterne, darüber dieselben in Akzentfarbe, auf den Anteil beschnitten. Das
 * trifft auch halbe Sterne genau, ohne ein zweites Zeichen zu brauchen.
 */
function Sterne({ wert, lang, texte }: { wert: number; lang: Language; texte: AngeboteTexte }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap text-[12px] leading-none tracking-[0.06em]"
      role="img"
      aria-label={fuelle(texte.sterneAria, { n: zahl(wert, lang) })}
    >
      <span aria-hidden className="text-[rgba(148,163,196,0.3)]">
        ★★★★★
      </span>
      <span
        aria-hidden
        className="absolute inset-0 overflow-hidden text-accent"
        style={{ width: `${(wert / 5) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

function Haken({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <path
        d="M3.5 8.4 6.4 11.3 12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Ausrufe({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 5v3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.1" r="0.85" fill="currentColor" />
    </svg>
  );
}

function Blitz({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <path
        d="M9 1.5 3.8 9h3.4l-.6 5.5L12.2 7H8.8L9 1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Schild({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none">
      <path
        d="M8 1.6 13 3.5v4.2c0 3.1-2.1 5.6-5 6.7-2.9-1.1-5-3.6-5-6.7V3.5L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M5.6 7.9 7.3 9.6l3.1-3.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ein Feld der Suchleiste — Beschriftung, Eingabe und Erläuterung. */
function SuchFeld({
  id,
  label,
  hinweis,
  children,
}: {
  id: string;
  label: string;
  hinweis: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
      >
        {label}
      </label>
      {children}
      <span className="text-[11px] text-muted/80">{hinweis}</span>
    </div>
  );
}

const FELD_KLASSEN =
  "w-full rounded-[14px] border border-border bg-surface-2 px-3.5 py-3 text-[15px] font-semibold tracking-[-0.01em] text-foreground transition-colors duration-200 hover:border-border-strong focus:border-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

function FilterChip({
  aktiv,
  onToggle,
  children,
}: {
  aktiv: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={aktiv}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
        aktiv
          ? "border-accent/50 bg-accent/12 text-accent"
          : "border-border bg-surface-2 text-muted hover:border-border-strong hover:text-foreground"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-3.5 items-center justify-center rounded-[5px] border transition-colors duration-200 ${
          aktiv ? "border-accent bg-accent text-accent-foreground" : "border-border-strong"
        }`}
      >
        {aktiv && <Haken className="size-2.5" />}
      </span>
      {children}
    </button>
  );
}

function AngebotZeile({
  angebot,
  betrag,
  monate,
  ersparnis,
  versatz,
  texte,
  lang,
}: {
  angebot: Angebot;
  betrag: number;
  monate: number;
  /** Wie viel günstiger als das teuerste Angebot der Liste, in Euro im Monat. */
  ersparnis: number;
  versatz: number;
  texte: AngeboteTexte;
  lang: Language;
}) {
  const [offen, setOffen] = useState(false);

  const rate = monatsrate(betrag, monate, angebot.zinsAb);
  const gesamt = gesamtbetrag(betrag, monate, angebot.zinsAb);

  const auszahlung =
    angebot.auszahlungTage <= 1
      ? texte.auszahlungHeute
      : fuelle(texte.auszahlungTage, { n: angebot.auszahlungTage });

  return (
    <article
      className={`angebot-einlauf relative rounded-[22px] border bg-surface p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] transition-colors duration-250 lg:p-6 ${
        angebot.empfohlen
          ? "border-accent/45 ring-1 ring-accent/15"
          : "border-border ring-1 ring-white/5 hover:border-border-strong"
      }`}
      style={{ "--zeilen-versatz": `${versatz}ms` } as CSSProperties}
    >
      {angebot.empfohlen && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2.5 py-1 text-[9px] font-bold uppercase leading-none tracking-[0.14em] text-accent-foreground shadow-[0_6px_18px_-6px_rgba(52,211,153,0.6)]">
          {texte.empfohlen}
        </span>
      )}

      <div className={`grid grid-cols-1 gap-5 ${RASTER} lg:items-start lg:gap-6`}>
        {/* Spalte 1: wer das Angebot macht */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <BankZeichen name={angebot.bank} />
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="truncate text-[15px] font-semibold leading-none tracking-[-0.01em]">
                {angebot.bank}
              </span>
              <span className="flex items-center gap-1.5">
                <Sterne wert={angebot.sterne} lang={lang} texte={texte} />
                <span className="text-[11px] leading-none text-muted">
                  {zahl(angebot.sterne, lang)} ·{" "}
                  {gruppiere(String(angebot.bewertungen), lang)}
                </span>
              </span>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-muted">
            <Blitz className="size-3 text-accent" />
            {auszahlung}
          </span>
        </div>

        {/* Spalte 2: was das Angebot ausmacht — Vorteile und Einschränkungen
            stehen bewusst nebeneinander. Eine Liste, die nur Häkchen zeigt,
            ist Werbung und kein Vergleich. */}
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold leading-tight tracking-[-0.01em]">
            {angebot.merkmal}
          </span>
          <span className="text-[12px] leading-relaxed text-muted">
            {angebot.merkmalText}
          </span>
          <ul className="mt-0.5 flex flex-col gap-1.5">
            {angebot.plus.map((p) => (
              <li key={p} className="flex items-start gap-2 text-[12px] text-foreground/85">
                <Haken className="mt-px size-3.5 shrink-0 text-accent" />
                {p}
              </li>
            ))}
            {angebot.minus.map((m) => (
              <li key={m} className="flex items-start gap-2 text-[12px] text-muted">
                <Ausrufe className="mt-px size-3.5 shrink-0 text-muted/70" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Spalte 3: die Zahl, nach der die meisten entscheiden */}
        <div className="flex flex-col gap-1 lg:items-end lg:text-right">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted lg:hidden">
            {texte.spalteRate}
          </span>
          <span className="text-[26px] font-bold leading-none tracking-[-0.03em] tabular-nums">
            {euro(rate, lang)}
          </span>
          <span className="text-[11px] text-muted">{texte.proMonat}</span>
          {ersparnis >= 1 && (
            <span className="mt-1.5 inline-flex w-fit items-center rounded-full bg-accent/12 px-2.5 py-1 text-[11px] font-semibold leading-none text-accent">
              {fuelle(texte.sparen, { n: euro(ersparnis, lang, 0) })}
            </span>
          )}
        </div>

        {/* Spalte 4: Zins und der Weg weiter */}
        <div className="flex flex-col gap-1 lg:items-end lg:text-right">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted lg:hidden">
            {texte.spalteZins}
          </span>
          <span className="text-[22px] font-bold leading-none tracking-[-0.02em] text-accent tabular-nums">
            {prozent(angebot.zinsAb, lang)}
          </span>
          <span className="text-[11px] leading-snug text-muted">
            {texte.effJahreszins}
            <br />
            {texte.bis} {prozent(angebot.zinsBis, lang)}
          </span>
          <Link
            href="/antrag"
            className="mt-2.5 w-full rounded-[14px] bg-accent px-5 py-2.5 text-center text-[13px] font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(52,211,153,0.5)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            {texte.weiter} →
          </Link>
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-muted">
            <Schild className="size-3.5 text-accent/80" />
            {texte.schufaNeutral}
          </span>
        </div>
      </div>

      {/* Kreditdetails: alles, was der Vertrag nennen muss, aber nicht die
          erste Entscheidung trägt. Eingeklappt, damit die Liste überschaubar
          bleibt. */}
      <div className="mt-4 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setOffen((v) => !v)}
          aria-expanded={offen}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors duration-200 hover:text-foreground"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            fill="none"
            className={`size-3.5 transition-transform duration-300 ${offen ? "rotate-180" : ""}`}
          >
            <path
              d="M4 6.2 8 10.2l4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {offen ? texte.detailsZu : texte.details}
        </button>

        <div
          className="ausklapp grid"
          style={{ gridTemplateRows: offen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <dl
              inert={!offen}
              className={`mt-3 grid grid-cols-2 gap-x-6 gap-y-3 rounded-[16px] border border-border bg-surface-2 p-4 sm:grid-cols-4 ${
                offen ? "opacity-100" : "opacity-0"
              }`}
            >
              {(
                [
                  [texte.gesamtbetrag, euro(gesamt, lang)],
                  [texte.laufzeitDetail, `${monate} ${texte.monate}`],
                  [texte.sollzins, prozent(sollzins(angebot.zinsAb), lang)],
                  [texte.spalteZins, prozent(angebot.zinsAb, lang)],
                ] as [string, string][]
              ).map(([label, wert]) => (
                <div key={label} className="flex flex-col gap-1">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {label}
                  </dt>
                  <dd className="text-[13px] font-semibold tabular-nums">{wert}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Ein Platzhalter in der Form einer Angebotszeile. */
function SkelettZeile({ versatz }: { versatz: number }) {
  const stil = { "--skelett-versatz": `${versatz}ms` } as CSSProperties;
  return (
    <div
      aria-hidden
      className="rounded-[22px] border border-border bg-surface p-5 ring-1 ring-white/5 lg:p-6"
    >
      <div className={`grid grid-cols-1 gap-5 ${RASTER} lg:items-start lg:gap-6`}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="skelett size-10 shrink-0 rounded-[12px]" style={stil} />
            <div className="flex w-full flex-col gap-2">
              <div className="skelett h-3 w-24" style={stil} />
              <div className="skelett h-2.5 w-32" style={stil} />
            </div>
          </div>
          <div className="skelett h-6 w-40 rounded-full" style={stil} />
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="skelett h-3 w-36" style={stil} />
          <div className="skelett h-2.5 w-full max-w-[16rem]" style={stil} />
          <div className="skelett h-2.5 w-44" style={stil} />
          <div className="skelett h-2.5 w-36" style={stil} />
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <div className="skelett h-6 w-28" style={stil} />
          <div className="skelett h-2.5 w-16" style={stil} />
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <div className="skelett h-5 w-20" style={stil} />
          <div className="skelett h-2.5 w-28" style={stil} />
          <div className="skelett mt-1 h-10 w-full rounded-[14px]" style={stil} />
        </div>
      </div>
    </div>
  );
}

function LadeAnsicht({ texte }: { texte: AngeboteTexte }) {
  return (
    <div className="flex flex-col gap-4" aria-live="polite" aria-busy="true">
      <div className="flex flex-col gap-4 rounded-[22px] border border-accent/25 bg-surface p-5 ring-1 ring-accent/10 lg:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
            {texte.ladeTitel}
          </h2>
          <p className="text-[12px] text-muted">{texte.ladeText}</p>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-surface-2">
          <div className="lade-balken h-full w-[28%] rounded-full bg-accent" />
        </div>

        <ul className="flex flex-col gap-2 sm:flex-row sm:gap-7">
          {texte.ladeSchritte.map((schritt, i) => (
            <li
              key={schritt}
              className="lade-schritt flex items-center gap-2 text-[12px] text-muted"
              style={{ "--schritt-versatz": `${i * 420}ms` } as CSSProperties}
            >
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {schritt}
            </li>
          ))}
        </ul>
      </div>

      {[0, 1, 2].map((i) => (
        <SkelettZeile key={i} versatz={i * 160} />
      ))}
    </div>
  );
}

/** Der Block zwischen den Zeilen: eine Anfrage, mehrere Banken. */
function BuendelBlock({
  texte,
  besteRate,
  lang,
}: {
  texte: AngeboteTexte;
  besteRate: number;
  lang: Language;
}) {
  return (
    <section className="rounded-[22px] border border-accent/25 bg-[linear-gradient(135deg,rgba(52,211,153,0.10),rgba(52,211,153,0.02)_55%,transparent)] p-5 ring-1 ring-accent/10 lg:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex flex-col gap-2 lg:max-w-md">
          <h2 className="text-[17px] font-bold tracking-[-0.02em]">
            {texte.buendelTitel}
          </h2>
          <p className="text-[12px] leading-relaxed text-muted">
            {texte.buendelText}
          </p>
        </div>

        <ol className="flex flex-col gap-2.5 lg:flex-1">
          {texte.buendelSchritte.map((schritt, i) => (
            <li key={schritt} className="flex items-center gap-2.5 text-[12px]">
              <span
                aria-hidden
                className="flex size-5 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-[10px] font-bold text-accent"
              >
                {i + 1}
              </span>
              {schritt}
            </li>
          ))}
        </ol>

        <div className="flex flex-col items-start gap-2 lg:items-end">
          <span className="text-[11px] text-muted">
            {texte.buendelAb}{" "}
            <span className="text-[15px] font-bold text-foreground tabular-nums">
              {euro(besteRate, lang)}
            </span>{" "}
            {texte.proMonat}
          </span>
          <Link
            href="/antrag"
            className="w-full rounded-[14px] bg-accent px-6 py-3 text-center text-[13px] font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(52,211,153,0.5)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 lg:w-auto"
          >
            {texte.weiter} →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function AngeboteClient({
  startBetrag,
  startMonate,
}: {
  startBetrag?: number;
  startMonate?: number;
}) {
  const { lang } = useLanguage();
  const texte = angeboteTexte[lang];

  // Der Betrag steht als Ziffernfolge im Zustand, nicht als Zahl: So bleibt
  // eine halb getippte Eingabe erhalten, statt beim ersten Zeichen auf einen
  // Mindestwert zu springen.
  const [betragZiffern, setBetragZiffern] = useState(() =>
    String(startBetrag ?? 20000)
  );
  const [monate, setMonate] = useState(() =>
    LAUFZEITEN.includes(startMonate ?? 0) ? (startMonate as number) : 72
  );
  const [zweck, setZweck] = useState(0);
  const [nach, setNach] = useState<Sortierung>("zins");
  const [filter, setFilter] = useState<Filter>(LEERER_FILTER);
  const [laedt, setLaedt] = useState(true);

  // Gerechnet wird immer mit einem Betrag im zulässigen Bereich. Der Kunde
  // darf trotzdem alles eintippen — beim Verlassen des Feldes wird der Wert
  // sichtbar zurechtgerückt, statt ihn während des Tippens umzuschreiben.
  const betrag = Math.min(
    BETRAG_MAX,
    Math.max(BETRAG_MIN, Number(betragZiffern) || 0)
  );

  // Jede Änderung an den Eckdaten startet die Abfrage neu. Beim Tippen setzt
  // der Timer immer wieder zurück — das wirkt wie eine Entprellung und ist
  // genau das, was später auch passieren soll: Erst wenn die Eingabe steht,
  // steht das Ergebnis.
  useEffect(() => {
    setLaedt(true);
    const nummer = window.setTimeout(() => setLaedt(false), ABFRAGE_DAUER);
    return () => window.clearTimeout(nummer);
  }, [betrag, monate, zweck]);

  const gefiltert = useMemo(
    () => sortiere(filtere(texte.angebote, filter), nach),
    [texte.angebote, filter, nach]
  );

  // Bezugspunkt der Ersparnis ist das teuerste Angebot der Liste. Ein
  // erfundener „Marktdurchschnitt“ wäre eine Zahl, die niemand nachrechnen
  // kann; so steht der Vergleich vollständig auf dem Bildschirm.
  const teuersteRate = useMemo(() => {
    if (gefiltert.length === 0) return 0;
    return Math.max(...gefiltert.map((a) => monatsrate(betrag, monate, a.zinsAb)));
  }, [gefiltert, betrag, monate]);

  const besteRate = useMemo(() => {
    if (gefiltert.length === 0) return 0;
    return Math.min(...gefiltert.map((a) => monatsrate(betrag, monate, a.zinsAb)));
  }, [gefiltert, betrag, monate]);

  const filterAktiv = filter.sofort || filter.sondertilgung;

  // Das repräsentative Beispiel gehört zum hervorgehobenen Angebot: Zwei
  // Drittel der Kundschaft erhalten dort höchstens den oberen Satz.
  const beispiel = texte.angebote.find((a) => a.empfohlen) ?? texte.angebote[0];
  const beispielRate = monatsrate(betrag, monate, beispiel.zinsBis);
  const beispielGesamt = gesamtbetrag(betrag, monate, beispiel.zinsBis);

  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:py-14">
          {/* Kopf */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-[-0.02em] lg:text-4xl">
              {texte.titel}
            </h1>
            <p className="max-w-xl leading-relaxed text-muted">
              {texte.untertitel}
            </p>
          </div>

          {/* Hinweis, dass hier noch keine echten Angebote stehen. Er steht
              ganz oben und nicht im Kleingedruckten — die Liste sieht aus wie
              ein Vergleich, also muss sofort klar sein, dass sie keiner ist. */}
          <div className="flex items-start gap-3 rounded-[16px] border border-border bg-surface-2 p-4">
            <span
              aria-hidden
              className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full border border-border-strong text-[11px] font-bold text-muted"
            >
              i
            </span>
            <p className="text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground">
                {texte.musterTitel}
              </span>{" "}
              — {texte.musterText}
            </p>
          </div>

          {/* Suchleiste */}
          <section className="rounded-[22px] border border-border bg-surface p-5 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {texte.suchTitel}
            </span>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SuchFeld
                id="angebote-betrag"
                label={texte.betragLabel}
                hinweis={`${texte.betragHinweis} · ${gruppiere(String(BETRAG_MIN), lang)} – ${gruppiere(String(BETRAG_MAX), lang)} €`}
              >
                <div className="relative">
                  <input
                    id="angebote-betrag"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={gruppiere(betragZiffern, lang)}
                    onChange={(e) => setBetragZiffern(nurZiffern(e.target.value))}
                    onBlur={() => setBetragZiffern(String(betrag))}
                    className={`${FELD_KLASSEN} pr-9 tabular-nums`}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-muted"
                  >
                    €
                  </span>
                </div>
              </SuchFeld>

              <SuchFeld
                id="angebote-laufzeit"
                label={texte.laufzeitLabel}
                hinweis={texte.laufzeitHinweis}
              >
                <select
                  id="angebote-laufzeit"
                  value={monate}
                  onChange={(e) => setMonate(Number(e.target.value))}
                  className={FELD_KLASSEN}
                >
                  {LAUFZEITEN.map((m) => (
                    <option key={m} value={m}>
                      {m} {texte.monate}
                    </option>
                  ))}
                </select>
              </SuchFeld>

              <SuchFeld
                id="angebote-zweck"
                label={texte.zweckLabel}
                hinweis={texte.zweckHinweis}
              >
                <select
                  id="angebote-zweck"
                  value={zweck}
                  onChange={(e) => setZweck(Number(e.target.value))}
                  className={FELD_KLASSEN}
                >
                  {texte.zwecke.map((z, i) => (
                    <option key={z} value={i}>
                      {z}
                    </option>
                  ))}
                </select>
              </SuchFeld>
            </div>
          </section>

          {/* Werkzeugleiste: Anzahl, Sortierung, Filter */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Während der Abfrage steht hier ein Platzhalter derselben Höhe
                statt einer leeren Zeile — sonst rutscht die ganze Liste nach
                oben, sobald die Zahl erscheint. */}
            {laedt ? (
              <div className="skelett h-4 w-44" aria-hidden />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-semibold tracking-[-0.01em]">
                  {gefiltert.length === 1
                    ? texte.trefferEins
                    : fuelle(texte.trefferViele, { n: gefiltert.length })}
                </span>
                <span className="text-[12px] text-muted">
                  {fuelle(texte.vonBanken, { n: texte.angebote.length })}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                aktiv={filter.sofort}
                onToggle={() => setFilter((f) => ({ ...f, sofort: !f.sofort }))}
              >
                {texte.filterSofort}
              </FilterChip>
              <FilterChip
                aktiv={filter.sondertilgung}
                onToggle={() =>
                  setFilter((f) => ({ ...f, sondertilgung: !f.sondertilgung }))
                }
              >
                {texte.filterSondertilgung}
              </FilterChip>

              <label className="ml-auto flex items-center gap-2 lg:ml-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {texte.sortierenLabel}
                </span>
                <select
                  value={nach}
                  onChange={(e) => setNach(e.target.value as Sortierung)}
                  className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-[12px] font-medium transition-colors duration-200 hover:border-border-strong focus:border-accent/60 focus:outline-none"
                >
                  {texte.sortierung.map((s) => (
                    <option key={s.wert} value={s.wert}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Spaltenköpfe — nur am Rechner, auf dem Handy stehen die
              Beschriftungen in den Zeilen selbst. */}
          {(laedt || gefiltert.length > 0) && (
            <div
              aria-hidden
              className={`hidden gap-6 px-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted lg:grid ${RASTER}`}
            >
              <span>{texte.spalteBank}</span>
              <span>{texte.spalteMerkmale}</span>
              <span className="text-right">{texte.spalteRate}</span>
              <span className="text-right">{texte.spalteZins}</span>
            </div>
          )}

          {/* Liste */}
          {laedt ? (
            <LadeAnsicht texte={texte} />
          ) : gefiltert.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-[22px] border border-border bg-surface p-6 ring-1 ring-white/5">
              <p className="text-[13px] text-muted">{texte.keineTreffer}</p>
              <button
                type="button"
                onClick={() => setFilter(LEERER_FILTER)}
                className="rounded-[14px] border border-border px-4 py-2.5 text-[12px] font-medium transition-colors duration-200 hover:border-border-strong hover:text-accent"
              >
                {texte.filterZuruecksetzen}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {gefiltert.map((angebot, i) => (
                <div key={angebot.id} className="contents">
                  <AngebotZeile
                    angebot={angebot}
                    betrag={betrag}
                    monate={monate}
                    ersparnis={
                      teuersteRate - monatsrate(betrag, monate, angebot.zinsAb)
                    }
                    versatz={i * 90}
                    texte={texte}
                    lang={lang}
                  />
                  {/* Der Bündelblock steht nach den ersten beiden Zeilen:
                      weit genug oben, um gelesen zu werden, und weit genug
                      unten, um den Vergleich nicht zu unterbrechen. */}
                  {i === 1 && (
                    <BuendelBlock
                      texte={texte}
                      besteRate={besteRate}
                      lang={lang}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {filterAktiv && !laedt && gefiltert.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter(LEERER_FILTER)}
              className="w-fit text-[12px] font-medium text-muted underline underline-offset-4 transition-colors duration-200 hover:text-accent"
            >
              {texte.filterZuruecksetzen}
            </button>
          )}

          {/* Repräsentatives Beispiel und Fußnote */}
          <section className="mt-2 flex flex-col gap-2 rounded-[18px] border border-border bg-surface-2 p-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              {texte.beispielTitel}
            </span>
            <p className="text-[12px] leading-relaxed text-muted">
              {fuelle(texte.beispielText, {
                zins: zahl(beispiel.zinsBis, lang, 2),
                sollzins: zahl(sollzins(beispiel.zinsBis), lang, 2),
                betrag: euro(betrag, lang, 0),
                monate,
                rate: euro(beispielRate, lang),
                gesamt: euro(beispielGesamt, lang),
              })}
            </p>
            <p className="text-[11px] leading-relaxed text-muted/70">
              {texte.fussnote}
            </p>
          </section>

          <Link
            href="/antrag"
            className="w-fit text-[12px] font-medium text-muted transition-colors duration-200 hover:text-accent"
          >
            ← {texte.zurueck}
          </Link>
        </div>
      </main>
      <Fussbereich />
    </>
  );
}
