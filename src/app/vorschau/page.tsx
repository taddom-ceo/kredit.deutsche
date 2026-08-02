"use client";

import Link from "next/link";
import Header from "@/components/Header";
import {
  VarianteA,
  VarianteB,
  VarianteC,
  type VariantenProps,
} from "@/components/illustrations/HeroVarianten";
import { useLanguage } from "@/lib/language-context";

/**
 * Nur zur Ansicht: derselbe Aufmacher dreimal, jeweils mit einem anderen
 * Bildentwurf. Diese Seite wird entfernt, sobald eine Fassung gewählt ist.
 */
const VARIANTEN = [
  { name: "Variante A · Gestaffelte Angebotskarten", Bild: VarianteA },
  { name: "Variante B · Ergebnis auf dem Handy", Bild: VarianteB },
  { name: "Variante C · Gesamtkosten als Säulen", Bild: VarianteC },
];

export default function Vorschau() {
  const { t } = useLanguage();
  const l = t.landing;

  const bildProps: Omit<VariantenProps, "className"> = {
    angebote: l.heroAngebote,
    proMonat: l.heroProMonat,
    ersparnis: l.heroErsparnis,
    ersparnisZusatz: l.heroErsparnisZusatz,
    beispielHinweis: l.heroBeispielHinweis,
    gesamtkosten: l.heroGesamtkosten,
    kostenTeuer: l.heroKostenTeuer,
    kostenGuenstig: l.heroKostenGuenstig,
    geprueft: l.heroGeprueft,
    schufaNeutral: l.trustBadges[0],
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        {VARIANTEN.map(({ name, Bild }) => (
          <section key={name} className="border-b border-border">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
              <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/[0.1] px-4 py-1.5 text-xs font-bold tracking-wide text-accent">
                {name}
              </span>
            </div>

            {/* items-stretch statt items-center: Nur so kann das Bild die Höhe
                der Textspalte tatsächlich annehmen. */}
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-12 items-stretch">
              <div className="flex flex-col gap-7">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-foreground">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
                  {l.badge}
                </span>
                <h1 className="text-[2.9rem] lg:text-[4.1rem] font-bold leading-[1.02] tracking-[-0.035em]">
                  {l.titleLine1}
                  <br />
                  <span className="italic text-accent">{l.titleHighlight}</span>
                </h1>
                <p className="text-lg lg:text-xl text-muted leading-relaxed max-w-xl">
                  {l.subtitle}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <Link
                    href="/rechner"
                    className="rounded-[16px] bg-accent px-7 py-4 text-[15px] font-semibold text-accent-foreground ring-2 ring-white shadow-[0_10px_34px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px"
                  >
                    {l.ctaPrimary} →
                  </Link>
                  <span className="rounded-[16px] border border-border px-7 py-4 text-[15px] font-semibold text-muted">
                    {l.ctaSecondary}
                  </span>
                </div>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {l.trustBadges.map((badge) => (
                    <li key={badge} className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
                      <span aria-hidden="true" className="text-accent">✓</span>
                      {badge}
                    </li>
                  ))}
                </ul>
              </div>

              <Bild {...bildProps} className="w-full h-full justify-self-center lg:justify-self-end" />
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
