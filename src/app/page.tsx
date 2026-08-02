"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import VisibilityGate from "@/components/VisibilityGate";
import PartnerLaufband from "@/components/PartnerLaufband";
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
        {/* Deutlich knapper als zuvor, damit das Partnerband schon beim
            Oeffnen der Seite im Bild steht — aber luftig genug, dass der
            Aufmacher nicht gequetscht wirkt. */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-8 lg:pt-14 lg:pb-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-12 items-stretch">
          <div className="flex flex-col gap-7">
            <span className="auftakt inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-foreground">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
              {l.badge}
            </span>
            {/* Die zweite Zeile kursiv und in der Akzentfarbe: Sie trägt die
                Aussage und hebt sich dadurch ab, ohne dass die Überschrift
                zwei Größen bräuchte. */}
            {/* Unter 390px faellt die Ueberschrift kleiner aus: "Bank-Marathon."
                ist bei 2,9rem kursiv 354px breit und ragte auf einem 360px
                schmalen Bildschirm 10px ueber den Rand. break-words ist der
                Rueckhalt fuer noch schmalere Geraete und andere Sprachen. */}
            <h1
              className="auftakt text-[2.9rem] max-[389px]:text-[2.35rem] lg:text-[4.1rem] font-bold leading-[1.02] tracking-[-0.035em] break-words"
              style={{ animationDelay: "140ms" }}
            >
              {l.titleLine1}
              <br />
              <span className="italic text-accent">{l.titleHighlight}</span>
            </h1>
            <p
              className="auftakt text-lg lg:text-xl text-muted leading-relaxed max-w-xl"
              style={{ animationDelay: "280ms" }}
            >
              {l.subtitle}
            </p>

            <div
              className="auftakt flex flex-wrap items-center gap-3 mt-2"
              style={{ animationDelay: "420ms" }}
            >
              <Link
                href="/rechner"
                // Weißer Rahmen als Hervorhebung. Als ring statt border, weil
                // ring außerhalb des Kastens gezeichnet wird und die Größe der
                // Schaltfläche damit unverändert bleibt.
                className="rounded-[16px] bg-accent px-7 py-4 text-[15px] font-semibold text-accent-foreground ring-2 ring-white shadow-[0_10px_34px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px hover:shadow-[0_16px_40px_-8px_rgba(52,211,153,0.65)] active:translate-y-0 focus-visible:ring-4 focus-visible:ring-white"
              >
                <span className="group inline-flex items-center gap-2">
                  {l.ctaPrimary}
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
              <a
                href="#ablauf"
                className="rounded-[16px] border border-border px-7 py-4 text-[15px] font-semibold text-muted transition-all duration-200 hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {l.ctaSecondary}
              </a>
            </div>

            {/* Vertrauenszeichen statt Fließtext: vier Haken werden im
                Vorbeisehen erfasst, ein Satz muss gelesen werden.
                Als getragene Plaketten sind sie das zweite Ziel fuers Auge
                nach dem Handlungsaufruf — deshalb Rand und Flaeche statt
                Akzentgruen, das allein der Schaltflaeche gehoert. */}
            <ul
              // Die Breitenbegrenzung bricht die vier Plaketten am PC in einen
              // Block von zwei mal zwei. Ohne sie passten drei in die erste
              // Zeile und die vierte staende allein darunter — das liest sich
              // als Umbruchunfall statt als gesetzter Block. Ein festes Raster
              // waere hier falsch: Auf schmalen Handys waeren die Spalten
              // enger als die laengste Plakette und sie liefen ueber.
              className="auftakt flex flex-wrap gap-2.5 lg:max-w-[400px]"
              style={{ animationDelay: "560ms" }}
            >
              {l.trustBadges.map((badge, i) => (
                <li
                  key={badge}
                  className="vertrauen-plakette flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 px-4 py-2.5 text-[15px] font-semibold text-foreground/90"
                  // Der Schimmer laeuft als Welle durch die Reihe. Der Versatz
                  // muss ueber eine Variable kommen: Er gehoert zum ::after,
                  // und das erbt keine Animationsangaben vom Element.
                  style={{ "--schimmer-versatz": `${i * 220}ms` } as CSSProperties}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent"
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className="size-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      focusable="false"
                    >
                      <path d="M2.6 6.2 L4.9 8.5 L9.4 3.7" />
                    </svg>
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          {/* Ab lg liegt das Bild absolut in seiner Spalte. Dadurch bestimmt
              der Text die Zeilenhoehe und das Bild passt sich an — vorher war
              es umgekehrt: Das Bild erzwang ueber sein Seitenverhaeltnis 715px
              Hoehe, und kuerzere Abstaende im Text aenderten daran nichts. */}
          <VisibilityGate className="relative w-full max-w-[560px] justify-self-center lg:max-w-none lg:h-full lg:justify-self-end">
            {/* Das ganze Handybild ist anklickbar und fuehrt zum selben Ziel
                wie der Hauptknopf — der Zeiger wird ueberall darauf zum
                Pointer, nicht nur ueber einzelnen Formen darin. */}
            <Link
              href="/rechner"
              aria-label={l.ctaPrimary}
              className="auftakt block w-full h-full cursor-pointer lg:absolute lg:inset-0 [animation-delay:340ms]"
            >
              <HeroIllustration
                angebote={l.heroAngebote}
                proMonat={l.heroProMonat}
                ersparnis={l.heroErsparnis}
                beispielHinweis={l.heroBeispielHinweis}
                szenen={l.heroSzenen}
                className="w-full h-full"
              />
            </Link>
          </VisibilityGate>
        </section>

        {/* Partnerbanken als durchlaufendes Band ueber die volle Breite.
            Die laufende Schrift am rechten Bildrand passte zur alten Seite,
            die auf einen Bildschirm ging — hier schwebte sie ueber der
            gesamten Laenge und lenkte ab. */}
        <section>
          <PartnerLaufband label={l.partnerLabel} />
        </section>

        {/* Kennzahlen als eigene Karten mit Symbol — als schlichte Zeile gingen
            sie zwischen den Abschnitten unter. */}
        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {l.kennzahlen.map((k, i) => {
              const Symbol = KENNZAHL_SYMBOLE[i];
              return (
                // Reveal traegt nur das Einblenden. Die Karte behaelt ihre
                // eigene, schnellere Uebergangszeit fuers Ueberfahren — beides
                // auf einem Element wuerde sich in die Quere kommen.
                <Reveal key={k.label} delay={i * 110} className="h-full">
                  <div className="group h-full rounded-[18px] border border-border bg-background ring-1 ring-white/5 p-5 lg:p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/[0.12] text-accent transition-all duration-500 group-hover:bg-accent/20 group-hover:scale-105">
                      <Symbol className="h-5 w-5" />
                    </span>
                    <span className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] text-accent">
                      {k.wert}
                    </span>
                    <span className="text-xs text-muted leading-relaxed">
                      {k.label}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Ablauf */}
        <section id="ablauf" className="scroll-mt-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 flex flex-col gap-12">
            <Reveal className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.ablaufEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {l.ablaufTitle}
              </h2>
              <p className="text-muted leading-relaxed">{l.ablaufSubtitle}</p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {l.schritte.map((schritt, i) => {
                const Bild = SCHRITT_BILDER[i];
                return (
                  <Reveal key={schritt.titel} delay={i * 130} className="h-full">
                    <div className="group relative h-full rounded-[20px] border border-border bg-surface ring-1 ring-white/5 p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong">
                    <span className="absolute top-5 right-6 text-4xl font-bold leading-none text-foreground/[0.07]">
                      {i + 1}
                    </span>
                    <Bild className="h-14 w-14 transition-transform duration-500 group-hover:scale-105" />
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-semibold tracking-[-0.01em]">
                        {schritt.titel}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {schritt.text}
                      </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Warum vergleichen */}
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Reveal className="flex flex-col gap-5">
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
            </Reveal>

            <Reveal delay={180} className="rounded-[24px] border border-border bg-surface ring-1 ring-white/5 p-6 lg:p-8 flex flex-col gap-4">
              <CompareIllustration className="w-full" />
              <div className="grid grid-cols-2 gap-4 text-center">
                <span className="text-xs text-muted leading-relaxed">
                  {l.vergleichOhne}
                </span>
                <span className="text-xs font-semibold text-accent leading-relaxed">
                  {l.vergleichMit}
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Kundenstimmen */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24 flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.stimmenEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {l.stimmenTitle}
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {l.stimmen.map((stimme, i) => (
                <Reveal key={stimme.name} delay={i * 130} className="h-full">
                  <figure className="h-full rounded-[20px] border border-border bg-surface ring-1 ring-white/5 p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong">
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Häufige Fragen. Als natives details/summary: Das klappt ohne
            JavaScript auf, ist über die Tastatur bedienbar und wird von der
            Seitensuche des Browsers gefunden. */}
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 lg:py-24 flex flex-col gap-8">
            <Reveal className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {l.faqEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {l.faqTitle}
              </h2>
            </Reveal>
            <div className="flex flex-col gap-3">
              {l.faq.map((eintrag, i) => (
                <Reveal key={eintrag.frage} delay={i * 90}>
                  <details className="group rounded-[16px] border border-border bg-surface px-5 py-4 transition-all duration-300 hover:border-border-strong hover:-translate-y-0.5">
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
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Abschließender Aufruf */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20">
            <Reveal className="rounded-[24px] border border-accent/25 bg-accent/[0.06] ring-1 ring-white/5 px-6 py-10 lg:px-12 lg:py-12 flex flex-col items-center gap-4 text-center">
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
            </Reveal>
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
