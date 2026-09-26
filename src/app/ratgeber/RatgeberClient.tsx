"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Fussbereich from "@/components/Fussbereich";
import KreditartenRaster from "@/components/KreditartenRaster";
import Reveal from "@/components/Reveal";
import { KREDITARTEN } from "@/lib/kreditarten";
import { useLanguage } from "@/lib/language-context";

/**
 * Der Ratgeber.
 *
 * Bewusst kein neuer Text, sondern eine zweite Tuer zu dem, was die Seite
 * schon weiss: die fuenf Grundfragen, die auf der Startseite ganz unten unter
 * "Kurz beantwortet" stehen, und die sechzehn Seiten zu den einzelnen
 * Verwendungszwecken, die jede fuer sich erklaeren, worauf es ankommt.
 *
 * Wer im Menue "Ratgeber" liest, erwartet Erklaerung statt Verkauf. Beides
 * neu zu schreiben hiesse, es zweimal zu pflegen und beim naechsten Mal nur
 * an einer Stelle — und die Antwort auf "Schadet die Anfrage meiner Schufa?"
 * darf an zwei Stellen nicht verschieden lauten.
 */
export default function RatgeberClient() {
  const { t } = useLanguage();
  const r = t.ratgeber;
  const l = t.landing;

  return (
    <>
      <Header />

      <main id="inhalt" className="flex-1">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10 lg:pt-16 lg:pb-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {r.eyebrow}
            </span>
            <h1 className="text-[2.6rem] lg:text-5xl font-bold leading-[1.05] tracking-[-0.03em]">
              {r.titel}{" "}
              <span className="italic text-accent">{r.titelHighlight}</span>
            </h1>
            <p className="text-lg text-muted leading-relaxed">{r.intro}</p>
          </div>
        </section>

        {/* Die Grundlagen. Dieselben Fragen wie auf der Startseite, aus
            derselben Quelle — als natives details/summary, das ohne
            JavaScript aufklappt, über die Tastatur bedienbar ist und von der
            Seitensuche des Browsers gefunden wird. */}
        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 lg:py-20 flex flex-col gap-8">
            <Reveal className="flex flex-col gap-3">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em]">
                {r.grundlagenTitel}
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                {r.grundlagenText}
              </p>
            </Reveal>
            <div className="flex flex-col gap-3">
              {l.faq.map((eintrag, i) => (
                <Reveal key={eintrag.frage} delay={i * 90}>
                  <details className="group rounded-[16px] border border-border bg-surface px-5 py-4 transition-all duration-300 hover:border-border-strong">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
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

        {/* Nach Verwendungszweck. Dasselbe Kachelraster wie auf der
            Startseite und unter /kredit — hier vollständig. */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-14 lg:py-20 flex flex-col gap-10">
          <Reveal className="flex flex-col gap-3 max-w-2xl">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em]">
              {r.zweckeTitel}
            </h2>
            <p className="text-sm text-muted leading-relaxed">{r.zweckeText}</p>
          </Reveal>

          <KreditartenRaster />

          <Reveal>
            <Link
              href="/kredit"
              className="group inline-flex w-fit items-center gap-2 rounded-[16px] border border-border px-5 py-3.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {r.alleAnsehen.replace("{n}", String(KREDITARTEN.length))}
              <span
                aria-hidden="true"
                className="text-accent transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </Reveal>
        </section>

        {/* Weiter zum Rechner. Ein Ratgeber, der nur erklärt und nirgendwo
            hinführt, lässt den Leser am Ende allein. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 lg:py-20">
            <Reveal className="rounded-[24px] border border-accent/25 bg-accent/[0.06] ring-1 ring-white/5 px-6 py-10 lg:px-12 lg:py-12 flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em] max-w-xl leading-[1.15]">
                {r.rechnerTitel}
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-md">
                {r.rechnerText}
              </p>
              <Link
                href="/rechner"
                className="mt-2 rounded-[16px] bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_rgba(52,211,153,0.55)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {r.rechnerCta} →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <Fussbereich />
    </>
  );
}
