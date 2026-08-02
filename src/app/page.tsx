"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { PARTNERS } from "@/components/BankMarquee";
import {
  CompareIllustration,
  HeroIllustration,
  IconBanks,
  IconClock,
  IconPercent,
  IconWallet,
  StepPayoutIllustration,
  StepShieldIllustration,
  StepSliderIllustration,
} from "@/components/illustrations/Illustrations";
import { useLanguage } from "@/lib/language-context";

const SCHRITT_BILDER = [
  StepSliderIllustration,
  StepShieldIllustration,
  StepPayoutIllustration,
];

const KENNZAHL_SYMBOLE = [IconBanks, IconPercent, IconClock, IconWallet];

export default function Home() {
  const { t } = useLanguage();
  const l = t.landing;

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero. Der Aufruf steht über der Falz und wird auf dem Handy zuerst
            gezeigt — die Illustration rutscht dort darunter, weil sie die
            Aussage begleitet und nicht trägt. */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-foreground">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              {l.badge}
            </span>

            {/* Die zweite Zeile kursiv und in der Akzentfarbe: Sie traegt die
                Aussage und hebt sich dadurch ab, ohne dass die Ueberschrift
                zwei Groessen braeuchte. */}
            <h1 className="text-[2.9rem] lg:text-[4.1rem] font-bold leading-[1.02] tracking-[-0.035em]">
              {l.titleLine1}
              <br />
              <span className="italic text-accent">{l.titleHighlight}</span>
            </h1>

            <p className="text-lg text-muted leading-relaxed max-w-md">
              {l.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-1">
              <Link
                href="/rechner"
                // Weisser Rahmen als Hervorhebung. Als ring statt border, weil
                // ring ausserhalb des Kastens gezeichnet wird und die Groesse
                // der Schaltflaeche damit unveraendert bleibt.
                className="rounded-full bg-accent px-7 py-4 text-[15px] font-semibold text-accent-foreground ring-2 ring-white shadow-[0_10px_34px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-4 focus-visible:ring-white"
              >
                {l.ctaPrimary} →
              </Link>
              <a
                href="#ablauf"
                className="rounded-full border border-border bg-surface px-7 py-4 text-[15px] font-semibold text-foreground transition-all duration-200 hover:border-border-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {l.ctaSecondary}
              </a>
            </div>

            {/* Bewertung und Sicherheit nebeneinander: zwei Belege, die
                unterschiedliche Zweifel ausraeumen. */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-2">
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="text-[15px] tracking-tight text-amber-400">
                  ★★★★★
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold">
                    {l.bewertungTitel}
                  </span>
                  <span className="text-[11px] text-muted">
                    {l.bewertungZusatz}
                  </span>
                </span>
              </div>
              <span aria-hidden="true" className="hidden sm:block h-9 w-px bg-border" />
              <div className="flex items-center gap-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  className="h-5 w-5 shrink-0 text-accent"
                >
                  <path d="M12 3 20 6v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6Z" />
                  <path d="m8.5 12 2.5 2.5 4.5-5" strokeLinecap="round" />
                </svg>
                <span className="flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold">{l.siegelTitel}</span>
                  <span className="text-[11px] text-muted">{l.siegelZusatz}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bildseite: eine grosse Flaeche mit eigener Farbstimmung, darauf
              eine helle Karte, die darueber hinausragt. Der Versatz gibt der
              Gruppe Tiefe und loest sie vom flachen Seitenhintergrund. */}
          <div className="w-full max-w-[540px] justify-self-center lg:justify-self-end">
            {/* Nur die Flaeche ist der Bezugspunkt der schwebenden Karte —
                laege der Bezug auf der ganzen Spalte, haenge sie unter dem
                Hinweistext und wuerde ihn verdecken. */}
            <div className="relative">
              <div className="rounded-[28px] ring-1 ring-white/10 p-6 lg:p-8 bg-[radial-gradient(120%_100%_at_70%_0%,rgba(52,211,153,0.28),rgba(12,32,28,0.9)_55%,rgba(7,12,24,0.95))] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
                <HeroIllustration
                  angebote={l.heroAngebote}
                  proMonat={l.heroProMonat}
                  ersparnis={l.heroErsparnis}
                  ersparnisZusatz={l.heroErsparnisZusatz}
                  className="w-full"
                />
              </div>

              <div className="absolute -bottom-6 left-2 lg:-left-8 flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.65)]">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground text-lg font-bold"
                >
                  ✓
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[10px] font-bold tracking-[0.14em] text-slate-500">
                    {l.panelGenehmigtLabel}
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {l.panelGenehmigtWert}
                  </span>
                </span>
              </div>
            </div>

            {/* Grundlage der Beispielrechnung. Steht als Text unter der Flaeche
                statt in der Zeichnung: So bricht er von selbst um und bleibt in
                jeder Sprache lesbar. Der Abstand haelt die schwebende Karte
                frei, die 24px ueber den unteren Rand hinausragt. */}
            <p className="mt-12 text-[11px] leading-relaxed text-muted/70">
              {l.heroBeispielHinweis.join(" ")}
            </p>
          </div>
        </section>

        {/* Kennzahlen als eigene Karten mit Symbol — als schlichte Zeile gingen
            sie zwischen den Abschnitten unter. */}
        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {l.kennzahlen.map((k, i) => {
              const Symbol = KENNZAHL_SYMBOLE[i];
              return (
                <div
                  key={k.label}
                  className="rounded-[18px] border border-border bg-background ring-1 ring-white/5 p-5 lg:p-6 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/[0.12] text-accent">
                    <Symbol className="h-5 w-5" />
                  </span>
                  <span className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-accent">
                    {k.wert}
                  </span>
                  <span className="text-xs text-muted leading-relaxed">
                    {k.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Partnerbanken als feste Zeile. Die laufende Schrift am Bildrand
            passte zur alten Seite, die auf einen Bildschirm ging — hier
            schwebte sie über der gesamten Länge und lenkte ab. */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {l.partnerLabel}
            </span>
            {PARTNERS.map((name) => (
              <span
                key={name}
                className="text-sm font-semibold tracking-wide text-muted/60"
              >
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* Ablauf */}
        <section id="ablauf" className="scroll-mt-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 flex flex-col gap-12">
            <div className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.ablaufEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {l.ablaufTitle}
              </h2>
              <p className="text-muted leading-relaxed">{l.ablaufSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {l.schritte.map((schritt, i) => {
                const Bild = SCHRITT_BILDER[i];
                return (
                  <div
                    key={schritt.titel}
                    className="relative rounded-[20px] border border-border bg-surface ring-1 ring-white/5 p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong"
                  >
                    <span className="absolute top-5 right-6 text-4xl font-bold leading-none text-foreground/[0.07]">
                      {i + 1}
                    </span>
                    <Bild className="h-14 w-14" />
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-semibold tracking-[-0.01em]">
                        {schritt.titel}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {schritt.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Warum vergleichen */}
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.vergleichEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] leading-[1.1]">
                {l.vergleichTitle}
              </h2>
              <p className="text-muted leading-relaxed">{l.vergleichText}</p>
              <ul className="flex flex-col gap-2.5 mt-1">
                {l.vergleichPunkte.map((punkt) => (
                  <li key={punkt} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 text-accent shrink-0">✓</span>
                    <span className="text-muted leading-relaxed">{punkt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-border bg-surface ring-1 ring-white/5 p-6 lg:p-8 flex flex-col gap-4">
              <CompareIllustration className="w-full" />
              <div className="grid grid-cols-2 gap-4 text-center">
                <span className="text-xs text-muted leading-relaxed">
                  {l.vergleichOhne}
                </span>
                <span className="text-xs font-semibold text-accent leading-relaxed">
                  {l.vergleichMit}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Kundenstimmen */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 flex flex-col gap-10">
            <div className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.stimmenEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {l.stimmenTitle}
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {l.stimmen.map((stimme) => (
                <figure
                  key={stimme.name}
                  className="rounded-[20px] border border-border bg-surface ring-1 ring-white/5 p-6 flex flex-col gap-4"
                >
                  <span aria-hidden="true" className="text-accent text-sm">
                    ★★★★★
                  </span>
                  <blockquote className="text-sm leading-relaxed text-foreground/85">
                    {stimme.text}
                  </blockquote>
                  <figcaption className="text-xs text-muted mt-auto">
                    {stimme.name} · {stimme.ort}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Häufige Fragen. Als natives details/summary: Das klappt ohne
            JavaScript auf, ist über die Tastatur bedienbar und wird von der
            Seitensuche des Browsers gefunden. */}
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 lg:py-24 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.faqEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {l.faqTitle}
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {l.faq.map((eintrag) => (
                <details
                  key={eintrag.frage}
                  className="group rounded-[16px] border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:border-border-strong"
                >
                  <summary className="flex items-center justify-between gap-4 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
                    {eintrag.frage}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0 text-accent transition-transform duration-300 group-open:rotate-180"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    {eintrag.antwort}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Abschließender Aufruf */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20">
            <div className="rounded-[24px] border border-accent/25 bg-accent/[0.06] ring-1 ring-white/5 px-6 py-10 lg:px-12 lg:py-12 flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em] max-w-xl leading-[1.15]">
                {l.schlussTitle}
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-md">
                {l.schlussText}
              </p>
              <Link
                href="/rechner"
                className="mt-2 rounded-[16px] bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_rgba(52,211,153,0.55)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {l.schlussCta} →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-xs text-muted tracking-wide">
          © {new Date().getFullYear()} cresolu.de
        </div>
      </footer>
    </>
  );
}
