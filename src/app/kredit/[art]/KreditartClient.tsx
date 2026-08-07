"use client";

import Link from "next/link";
import CreditCalculator from "@/components/CreditCalculator";
import Header from "@/components/Header";
import MitlaufenderCta from "@/components/MitlaufenderCta";
import Reveal from "@/components/Reveal";
import {
  StepPayoutIllustration,
  StepShieldIllustration,
  StepSliderIllustration,
} from "@/components/illustrations/Illustrations";
import { useLanguage } from "@/lib/language-context";
import {
  KREDITART_TEXTE,
  andereKreditarten,
  findeKreditart,
  kreditartPfad,
} from "@/lib/kreditarten";

const SCHRITT_BILDER = [
  StepSliderIllustration,
  StepShieldIllustration,
  StepPayoutIllustration,
];

/**
 * Die Seite zu einer einzelnen Kreditart.
 *
 * Aufbau und Gestaltung folgen der Startseite — dieselben Karten, dieselben
 * Abstände, dasselbe Einblenden beim Scrollen. Neu ist nur, dass der Rechner
 * hier oben steht statt neben einer Zeichnung: Wer über eine Suche nach
 * "Autokredit" hereinkommt, will als Erstes eine Rate sehen.
 *
 * Der Inhalt kommt aus KREDITARTEN und ist zweisprachig hinterlegt, damit der
 * Schalter im Kopf auch hier greift. Die Metadaten dagegen entstehen auf dem
 * Server und bleiben deutsch — sie hängen an der Adresse, nicht am Schalter.
 *
 * Übergeben wird nur die Adresse, nicht die ganze Kreditart: Der Inhalt steht
 * in beiden Sprachen im Browser-Bündel und müsste sonst ein zweites Mal über
 * die Leitung. Nachgeschlagen wird er hier.
 */
export default function KreditartClient({ slug }: { slug: string }) {
  const { lang, t } = useLanguage();
  const art = findeKreditart(slug);
  const x = KREDITART_TEXTE[lang];
  const l = t.landing;

  // Kann nicht eintreten: Der Server hat die Adresse geprüft und liefert für
  // unbekannte bereits 404 aus. Die Abfrage steht hier nur, weil der Typ es
  // sonst nicht zulässt.
  if (!art) return null;

  const inhalt = art[lang];
  const andere = andereKreditarten(art);

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Aufmacher: Aussage links, Rechner rechts. Auf dem Handy rutscht der
            Rechner darunter — die Überschrift muss zuerst klarmachen, worum
            es geht, sonst rechnet man etwas aus, ohne es einordnen zu
            können. */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-12 lg:pt-10 lg:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col gap-6">
            {/* Brotkrumen. Sie zeigen die Ebene, auf der man gelandet ist —
                und geben Suchmaschinen dieselbe Struktur, die weiter unten
                als strukturierte Daten mitgeliefert wird. */}
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
                <li>
                  <Link
                    href="/kredit"
                    className="transition-colors duration-200 hover:text-foreground"
                  >
                    {x.brotkrumeKredite}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-foreground/80">
                  {inhalt.name}
                </li>
              </ol>
            </nav>

            <h1 className="auftakt text-[2.4rem] max-[389px]:text-[2rem] lg:text-[3.4rem] font-bold leading-[1.05] tracking-[-0.03em] break-words">
              {inhalt.h1}{" "}
              <span className="italic text-accent">{inhalt.h1Highlight}</span>
            </h1>

            <p
              className="auftakt text-lg text-muted leading-relaxed max-w-xl"
              style={{ animationDelay: "140ms" }}
            >
              {inhalt.intro}
            </p>

            <ul
              className="auftakt flex flex-wrap gap-2.5"
              style={{ animationDelay: "280ms" }}
            >
              {l.trustBadges.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 px-4 py-2.5 text-sm font-semibold text-foreground/90"
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

            {/* Der Aufruf in der Textspalte. Rechts steht zwar der Rechner mit
                eigenem Knopf, aber der liegt auf dem Handy erst weit unter
                dem Text — bis dorthin gab es hier keinen Weg weiter. Auf
                breiten Schirmen füllt er zugleich die Spalte, die vorher
                nach den Plaketten leer auslief.
                Er führt dorthin, wohin auch der Rechner führt: in den
                Antrag mit dem Zweck und den Werten dieser Kreditart. */}
            <Link
              href={`/antrag?amount=${art.betrag}&months=${art.monate}&zweck=${art.id}`}
              className="auftakt group inline-flex w-fit items-center gap-2 rounded-[16px] bg-accent px-7 py-4 text-[15px] font-semibold text-accent-foreground ring-2 ring-white shadow-[0_10px_34px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px focus-visible:ring-4 focus-visible:ring-white"
              style={{ animationDelay: "420ms" }}
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

          {/* Auf dieser Seite ist der Rechner der Hauptaufruf. Er traegt
              deshalb die Marke, an der der mitlaufende Aufruf haengt: Sobald
              er nach oben aus dem Bild gewandert ist, bleibt der Weg zum
              Antrag trotzdem in Reichweite. */}
          <div data-haupt-cta className="flex flex-col gap-4 lg:items-end">
            <div className="flex w-full max-w-md flex-col gap-1.5 lg:self-end">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {x.rechnerEyebrow}
              </span>
              <h2 className="text-xl font-bold tracking-[-0.01em]">
                {x.rechnerTitel}
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                {x.rechnerText}
              </p>
            </div>
            {/* Vorbelegt mit einem für diesen Zweck üblichen Betrag, und der
                Zweck wandert über die Adresse in den Antrag — dort ist der
                erste Schritt damit schon beantwortet. */}
            <CreditCalculator
              zweck={art.id}
              startBetrag={art.betrag}
              startMonate={art.monate}
            />
          </div>
        </section>

        {/* Worauf es ankommt */}
        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {x.punkteEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {x.punkteTitel}
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {inhalt.punkte.map((punkt, i) => (
                <Reveal key={punkt.titel} delay={i * 110} className="h-full">
                  <div className="group h-full rounded-[20px] border border-border bg-background ring-1 ring-white/5 p-6 flex gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent/[0.12] text-accent transition-colors duration-300 group-hover:bg-accent/20"
                    >
                      <svg
                        viewBox="0 0 12 12"
                        className="size-3.5"
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
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <h3 className="text-base font-semibold tracking-[-0.01em]">
                        {punkt.titel}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {punkt.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Ablauf. Die drei Schritte sind für jede Kreditart dieselben und
            kommen deshalb aus den Texten der Startseite, statt elfmal
            nebeneinander gepflegt zu werden. */}
        <section>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {x.ablaufEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {x.ablaufTitel}
              </h2>
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

        {/* Häufige Fragen. Wie auf der Startseite als natives details/summary:
            ohne JavaScript aufklappbar, über die Tastatur bedienbar und für
            die Seitensuche des Browsers auffindbar. */}
        <section className="border-t border-border bg-surface/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-8">
            <Reveal className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {x.faqEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {x.faqTitel}
              </h2>
            </Reveal>
            <div className="flex flex-col gap-3">
              {inhalt.faq.map((eintrag, i) => (
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

        {/* Querverweise. Sie helfen zweifach: Wer auf der falschen Seite
            gelandet ist, kommt weiter — und die Seiten verweisen
            untereinander, statt jede für sich zu stehen. */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-8">
            <Reveal className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {x.andereEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {x.andereTitel}
              </h2>
              <p className="text-muted leading-relaxed">{x.andereText}</p>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {andere.map((weitere, i) => (
                <Reveal key={weitere.slug} delay={i * 90} className="h-full">
                  <Link
                    href={kreditartPfad(weitere)}
                    className="group h-full rounded-[18px] border border-border bg-surface ring-1 ring-white/5 p-5 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:border-border-strong focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="text-sm font-semibold tracking-[-0.01em]">
                      {weitere[lang].name}
                    </span>
                    <span className="text-xs text-muted leading-relaxed">
                      {weitere[lang].teaser}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-auto pt-2 text-accent transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <Link
                href="/kredit"
                className="inline-flex w-fit items-center gap-2 rounded-[16px] border border-border px-5 py-3 text-sm font-medium text-muted transition-all duration-200 hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {x.brotkrumeKredite}
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Abschließender Aufruf */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20">
            <Reveal
              data-schluss-cta
              className="rounded-[24px] border border-accent/25 bg-accent/[0.06] ring-1 ring-white/5 px-6 py-10 lg:px-12 lg:py-12 flex flex-col items-center gap-4 text-center"
            >
              <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em] max-w-xl leading-[1.15]">
                {x.schlussTitel}
              </h2>
              <p className="text-muted text-sm leading-relaxed max-w-md">
                {x.schlussText}
              </p>
              <Link
                href={`/antrag?amount=${art.betrag}&months=${art.monate}&zweck=${art.id}`}
                className="mt-2 rounded-[16px] bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_rgba(52,211,153,0.55)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {x.schlussCta} →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Fuehrt dorthin, wohin auch der Schlussaufruf dieser Seite fuehrt:
          in den Antrag mit dem Zweck und den Werten dieser Kreditart. */}
      <MitlaufenderCta
        beobachte="[data-haupt-cta]"
        bisZu="[data-schluss-cta]"
        href={`/antrag?amount=${art.betrag}&months=${art.monate}&zweck=${art.id}`}
        label={t.landing.mitlaufCta}
        hinweis={t.landing.mitlaufNote}
      />

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted tracking-wide">
          <span>© {new Date().getFullYear()} cresolu.de</span>
          <Link
            href="/"
            className="transition-colors duration-200 hover:text-foreground"
          >
            {x.zurStartseite}
          </Link>
        </div>
      </footer>
    </>
  );
}
