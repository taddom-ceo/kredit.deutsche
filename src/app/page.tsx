"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { PARTNERS } from "@/components/BankMarquee";
import {
  CompareIllustration,
  HeroIllustration,
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
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center rounded-full border border-accent/30 bg-accent/[0.08] px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-accent">
              {l.badge}
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold leading-[1.08] tracking-[-0.025em] text-balance">
              {l.titleLine1}
              <br />
              <span className="text-accent">{l.titleHighlight}</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-lg">
              {l.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/rechner"
                className="rounded-[16px] bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_rgba(52,211,153,0.55)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px hover:shadow-[0_14px_36px_-8px_rgba(52,211,153,0.6)] active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {l.ctaPrimary} →
              </Link>
              <a
                href="#ablauf"
                className="rounded-[16px] border border-border px-6 py-3.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {l.ctaSecondary}
              </a>
            </div>
            <span className="text-xs text-muted">{l.ctaNote}</span>
          </div>

          <HeroIllustration className="w-full max-w-[520px] justify-self-center lg:justify-self-end" />
        </section>

        {/* Kennzahlen: die vier Angaben, nach denen sonst gesucht werden müsste. */}
        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {l.kennzahlen.map((k) => (
              <div key={k.label} className="flex flex-col gap-1">
                <span className="text-2xl lg:text-3xl font-bold tracking-tight text-accent">
                  {k.wert}
                </span>
                <span className="text-xs text-muted leading-relaxed">
                  {k.label}
                </span>
              </div>
            ))}
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
