"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Fussbereich from "@/components/Fussbereich";
import Reveal from "@/components/Reveal";
import { Angabe } from "@/components/Rechtstext";
import { ANBIETER } from "@/lib/anbieter";
import { useLanguage } from "@/lib/language-context";

/**
 * Über uns.
 *
 * Hier steht nichts, was die Seite nicht ohnehin schon behauptet: dass
 * cresolu.de vermittelt und nicht selbst verleiht (Fussbereich), dass die
 * Anfrage Schufa-neutral, kostenlos und unverbindlich ist (Aufmacher), und
 * dass die Verguetung von der Bank kommt (die Grundfragen). Eine
 * "Über uns"-Seite ist die Stelle, an der man das zusammen liest — sie ist
 * nicht die Stelle, an der neue Zusagen entstehen.
 *
 * Firma, Anschrift und Erlaubnis kommen aus `src/lib/anbieter.ts` und stehen
 * hier mit demselben `Angabe`-Baustein wie im Impressum: Fehlt etwas, steht
 * ein sichtbarer Hinweis statt einer Luecke. Erfundene Angaben waeren hier
 * besonders heikel — wer auf "Über uns" geht, sucht genau danach, wer
 * dahintersteht.
 */
export default function UeberUnsClient() {
  const { t } = useLanguage();
  const u = t.ueberUns;

  return (
    <>
      <Header />

      <main id="inhalt" className="flex-1">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10 lg:pt-16 lg:pb-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {u.eyebrow}
            </span>
            <h1 className="text-[2.6rem] lg:text-5xl font-bold leading-[1.05] tracking-[-0.03em]">
              {u.titel}{" "}
              <span className="italic text-accent">{u.titelHighlight}</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed">{u.intro}</p>
          </div>
        </section>

        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 lg:py-20 grid grid-cols-1 md:grid-cols-2 gap-5">
            {u.punkte.map((punkt, i) => (
              <Reveal key={punkt.titel} delay={i * 110} className="h-full">
                <div className="h-full rounded-[20px] border border-border bg-background ring-1 ring-white/5 p-6 flex flex-col gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/[0.12] text-sm font-bold text-accent"
                  >
                    {i + 1}
                  </span>
                  <h2 className="text-base font-semibold tracking-[-0.01em]">
                    {punkt.titel}
                  </h2>
                  <p className="text-sm text-muted leading-relaxed">
                    {punkt.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Womit wir Geld verdienen. Bewusst als eigener Abschnitt und nicht
            als Fussnote: Es ist die Frage, die hinter "kostenlos" steht, und
            wer sie nicht beantwortet findet, beantwortet sie sich selbst —
            meistens zu unseren Ungunsten. */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-14 lg:py-20 flex flex-col gap-10">
          <Reveal className="flex flex-col gap-3">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em]">
              {u.geldTitel}
            </h2>
            <p className="text-muted leading-relaxed">{u.geldText}</p>
          </Reveal>

          <Reveal className="flex flex-col gap-3 rounded-[20px] border border-border bg-surface p-6 ring-1 ring-white/5">
            <h2 className="text-base font-semibold tracking-[-0.01em]">
              {u.anbieterTitel}
            </h2>
            <p className="whitespace-pre-line text-sm text-muted leading-relaxed">
              <Angabe wert={ANBIETER.name} feld="Firma" />
              {"\n"}
              <Angabe wert={ANBIETER.strasse} feld="Straße und Hausnummer" />
              {"\n"}
              <Angabe wert={ANBIETER.plzOrt} feld="PLZ und Ort" />
              {"\n"}
              {ANBIETER.land}
            </p>
            <p className="text-sm text-muted leading-relaxed">
              {u.anbieterText}
            </p>
            <Link
              href="/impressum"
              className="w-fit text-sm text-accent underline underline-offset-2 transition-opacity duration-200 hover:opacity-80"
            >
              Impressum
            </Link>
          </Reveal>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 lg:py-20">
            <Reveal className="rounded-[24px] border border-accent/25 bg-accent/[0.06] ring-1 ring-white/5 px-6 py-10 lg:px-12 lg:py-12 flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em] max-w-xl leading-[1.15]">
                {u.ctaTitel}
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-md">
                {u.ctaText}
              </p>
              <Link
                href="/rechner"
                className="mt-2 rounded-[16px] bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_rgba(52,211,153,0.55)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {u.cta} →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Fussbereich />
    </>
  );
}
