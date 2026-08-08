"use client";

import Link from "next/link";
import Fussbereich from "@/components/Fussbereich";
import Header from "@/components/Header";
import KreditartenRaster from "@/components/KreditartenRaster";
import MitlaufenderCta from "@/components/MitlaufenderCta";
import Reveal from "@/components/Reveal";
import { KREDITART_TEXTE } from "@/lib/kreditarten";
import { useLanguage } from "@/lib/language-context";

/**
 * Übersicht über alle Kreditarten.
 *
 * Sie ist die Ebene zwischen Startseite und Einzelseite: Von hier führt je ein
 * Verweis zu den elf Zwecken, und die Brotkrume auf den Einzelseiten hat damit
 * ein Ziel, das es wirklich gibt.
 */
export default function KreditUebersichtClient() {
  const { lang, t } = useLanguage();
  const x = KREDITART_TEXTE[lang];
  const l = t.landing;

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-12 lg:pt-10 lg:pb-16 flex flex-col gap-10">
          <div className="flex flex-col gap-5 max-w-2xl">
            <nav aria-label={x.brotkrumeKredite}>
              <ol className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <li>
                  <Link
                    href="/"
                    className="transition-colors duration-200 hover:text-foreground"
                  >
                    {x.brotkrumeStart}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground/80">
                  {x.brotkrumeKredite}
                </li>
              </ol>
            </nav>

            <h1 className="auftakt text-[2.4rem] max-[389px]:text-[2rem] lg:text-[3.4rem] font-bold leading-[1.05] tracking-[-0.03em] break-words">
              {x.uebersichtTitel}{" "}
              <span className="italic text-accent">
                {x.uebersichtHighlight}
              </span>
            </h1>
            <p
              className="auftakt text-lg text-muted leading-relaxed"
              style={{ animationDelay: "140ms" }}
            >
              {x.uebersichtText}
            </p>

            {/* Bisher führte von hier oben gar nichts weiter: Wer schon weiß,
                was er will, musste erst an sechzehn Kacheln vorbei. Der
                Aufruf ist zugleich die Marke, an der der mitlaufende
                hängt. */}
            <Link
              href="/rechner"
              data-haupt-cta
              className="auftakt group inline-flex w-fit items-center gap-2 rounded-[16px] bg-accent px-7 py-4 text-[15px] font-semibold text-accent-foreground ring-2 ring-white shadow-[0_10px_34px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px focus-visible:ring-4 focus-visible:ring-white"
              style={{ animationDelay: "280ms" }}
            >
              {l.ctaPrimary}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>

          <KreditartenRaster />
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20">
            <Reveal
              data-schluss-cta
              className="rounded-[24px] border border-accent/25 bg-accent/[0.06] ring-1 ring-white/5 px-6 py-10 lg:px-12 lg:py-12 flex flex-col items-center gap-4 text-center"
            >
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

      <MitlaufenderCta
        beobachte="[data-haupt-cta]"
        bisZu="[data-schluss-cta]"
        href="/rechner"
        label={l.mitlaufCta}
        hinweis={l.mitlaufNote}
      />

      <Fussbereich />
    </>
  );
}
