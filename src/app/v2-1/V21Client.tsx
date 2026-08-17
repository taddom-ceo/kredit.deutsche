"use client";

import Link from "next/link";
import AufmacherRechner from "@/components/AufmacherRechner";
import Fussbereich from "@/components/Fussbereich";
import Header from "@/components/Header";
import KreditartenRaster from "@/components/KreditartenRaster";
import MitlaufenderCta from "@/components/MitlaufenderCta";
import Reveal from "@/components/Reveal";
import VersionsWechsel from "@/components/VersionsWechsel";
import VisibilityGate from "@/components/VisibilityGate";
import { HeroIllustration } from "@/components/illustrations/Illustrations";
import { ANSPRECHPARTNER, ansprechpartnerVorhanden } from "@/lib/anbieter";
import { useLanguage } from "@/lib/language-context";
import { translations } from "@/lib/i18n";
import {
  beispielMitZahlen,
  V2_BEISPIEL,
  V2_TEXTE,
} from "@/lib/i18n-v2";
import {
  formatEuro,
  monthlyPayment,
  monthlyRate,
  SAMPLE_ANNUAL_RATE,
} from "@/lib/loan-calc";
import { KREDITARTEN } from "@/lib/kreditarten";

/**
 * Die dritte Fassung der Startseite — die Mitte zwischen den ersten beiden.
 *
 * Die erste hatte im Aufmacher ein gezeichnetes Handy, das ein Formular
 * nachspielte, waehrend das echte Formular dreitausend Pixel weiter unten lag.
 * Die zweite stellte den Rechner nach oben und liess das Handy weg. Hier steht
 * beides, und zwar so, dass jedes das tut, was es kann:
 *
 *  · Im Aufmacher ist das Handy der Rahmen und der Rechner sein Inhalt. Das
 *    Geraet behaelt seinen Platz, die Eingabe funktioniert wirklich, und die
 *    Plakette daneben rechnet mit, waehrend man den Regler zieht. Aus einer
 *    Schleife, die unabhaengig vom Betrachter laeuft, wird eine Antwort auf
 *    das, was er gerade getan hat.
 *
 *  · Die drei Szenen — "Daten eingeben", "Angebote erhalten", "Zinsen
 *    gespart" — sind woertlich der Abschnitt "Drei Schritte". Dorthin sind
 *    sie gewandert. Sie erklaeren jetzt, was danebensteht, statt den Platz zu
 *    besetzen, an dem die Eingabe hingehoert.
 *
 * Alles Uebrige ist die zweite Fassung: ein Aufruf statt zwei, der
 * Vertrauensblock mit den vier Fragen, das repraesentative Beispiel beim Zins,
 * keine erfundenen Partnerbanken und Kundenstimmen, sieben Abschnitte statt
 * zehn.
 */
export default function V21Client() {
  const { lang } = useLanguage();
  const v = V2_TEXTE[lang];
  const l = translations[lang].landing;
  const berater = ansprechpartnerVorhanden();

  /**
   * Die Zahlen des repraesentativen Beispiels, aus derselben Formel wie der
   * Rechner darueber.
   *
   * Von Hand eingetragen waeren sie beim ersten geaenderten Zinssatz falsch,
   * und ein falsches Pflichtbeispiel ist schlimmer als keines. Der gebundene
   * Sollzins ergibt sich aus dem effektiven: zwoelf mal der Monatszins, der
   * sich ueber zwoelf Monate zum effektiven aufzinst.
   */
  const { betrag, monate } = V2_BEISPIEL;
  const rate = monthlyPayment(betrag, monate);
  const prozent = (wert: number) =>
    `${(wert * 100).toFixed(2).replace(".", lang === "de" ? "," : ".")} %`;
  const beispiel = beispielMitZahlen(v.beispielText, {
    betrag: formatEuro(betrag),
    monate: String(monate),
    sollzins: prozent(monthlyRate() * 12),
    effektiv: prozent(SAMPLE_ANNUAL_RATE),
    rate: formatEuro(rate),
    gesamt: formatEuro(rate * monate),
  });

  return (
    <>
      <Header />
      <VersionsWechsel />

      <main className="flex-1">
        {/**
         * Aufmacher. Links die Aussage, rechts der Rechner.
         *
         * `items-center` und nicht `items-stretch`: Der Rechner hat eine feste
         * Hoehe, die Textspalte nicht, und ein Rechner, der sich auf die
         * Hoehe einer dreizeiligen Ueberschrift streckt, sieht aus wie ein
         * Fehler. Auf dem Handy rutscht er unter den Text — dort zaehlt, dass
         * die Aussage zuerst kommt, aber der Rechner noch auf denselben
         * Bildschirm gehoert.
         */}
        <section
          id="rechner"
          /**
           * Drei Bloecke in einem Raster, damit die Reihenfolge auf dem Handy
           * eine andere sein kann als am Schreibtisch.
           *
           * Am Schreibtisch: links Aussage und Zusagen untereinander, rechts
           * der Rechner ueber beide Zeilen. Auf dem Handy: Aussage, dann der
           * Rechner, dann die Zusagen. Gemessen war der Rechner sonst erst bei
           * 700 Pixeln zu sehen — auf einem 844 Pixel hohen Bildschirm also
           * gerade noch, und das bei der einen Sache, um die es hier geht.
           */
          className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-12 lg:pt-14 lg:pb-16 grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[auto_auto] gap-y-8 gap-x-10 lg:gap-x-12 scroll-mt-8"
        >
          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[11px] font-semibold text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              {v.badge}
            </span>

            <h1 className="text-4xl lg:text-[3.4rem] font-bold leading-[1.05] tracking-[-0.03em]">
              {v.titel}{" "}
              <span className="text-accent">{v.titelHervor}</span>
            </h1>

            <p className="max-w-xl text-muted leading-relaxed">
              {v.untertitel}
            </p>

          </div>

          <div className="flex flex-col items-center gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:items-end lg:self-center">
            {/* Nur am Schreibtisch: Auf dem Handy steht der Rechner ohnehin
                fuer sich, und die Zeile kostete dort dreissig Pixel ueber der
                Falz — genau die, die der Aufruf darunter braucht. */}
            <span className="hidden w-full max-w-md text-[11px] font-semibold uppercase tracking-[0.18em] text-accent lg:block">
              {v.rechnerUeber}
            </span>
            <AufmacherRechner
              ctaText={v.rechnerCta}
              ersparnisLabel={v.ersparnisLabel}
              ersparnisFuss={v.ersparnisFuss}
            />
          </div>

          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-2">
            {/* Die vier Zusagen als Liste und nicht als Plaketten: Plaketten
                tragen ein Wort, hier steht in jeder Zeile eine ganze Aussage.
                "Kostenlos" ist eine Behauptung, "für Sie kostenlos, wir werden
                von der Bank vergütet" ist eine Erklaerung. */}
            <ul className="flex flex-col gap-2.5">
              {v.zusagen.map((zusage) => (
                <li key={zusage} className="flex items-start gap-2.5 text-sm">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent">
                    ✓
                  </span>
                  <span className="text-muted leading-relaxed">{zusage}</span>
                </li>
              ))}
            </ul>

            {/* Der zweite Weg, als Verweis. Wer erst lesen will, findet ihn;
                wer rechnen will, sieht rechts den Rechner und wird von hier
                nicht abgelenkt. */}
            <Link
              href="#ablauf"
              className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
            >
              {v.ablaufVerweis}
              <span
                aria-hidden="true"
                className="text-accent transition-transform duration-200 group-hover:translate-y-0.5"
              >
                ↓
              </span>
            </Link>
          </div>
        </section>

        {/**
         * Das repraesentative Beispiel.
         *
         * Steht direkt unter dem Rechner, weil dort der Zins beworben wird.
         * § 6a PAngV verlangt es an dieser Stelle und nicht im Fussbereich —
         * und wer nachrechnen will, sucht es genau hier. Klein gesetzt, aber
         * lesbar: Ein Pflichttext, den man nicht lesen kann, erfuellt die
         * Pflicht nicht.
         */}
        <section className="border-y border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
            <p className="text-[11px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground/80">
                {v.beispielTitel}:{" "}
              </span>
              {beispiel}
            </p>
          </div>
        </section>

        {/* Vertrauen. Vier Fragen, vier Antworten — und zwar die Fragen, die
            jemand wirklich hat, nicht die, die sich gut beantworten lassen. */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-10">
          <Reveal className="flex flex-col gap-3 max-w-2xl">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {v.vertrauenEyebrow}
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
              {v.vertrauenTitel}
            </h2>
            <p className="text-muted leading-relaxed">{v.vertrauenText}</p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {v.vertrauen.map((eintrag, i) => (
              <Reveal key={eintrag.titel} delay={i * 90} className="h-full">
                <div className="h-full rounded-[20px] border border-border bg-surface ring-1 ring-white/5 p-6 flex flex-col gap-2.5">
                  <h3 className="text-base font-semibold">{eintrag.titel}</h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {eintrag.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Die Erlaubnis nach § 34c GewO stand bisher nur im Impressum —
              dort, wo sie niemand liest. Sie ist das einzige Vertrauensmerkmal
              auf dieser Seite, das eine Behoerde vergeben hat. */}
          <Reveal>
            <div className="flex flex-col gap-2 rounded-[20px] border border-accent/25 bg-accent/[0.05] p-6 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-accent">
                  {v.erlaubnisTitel}
                </span>
                <p className="text-sm text-muted leading-relaxed">
                  {v.erlaubnisText}
                </p>
              </div>
              <Link
                href="/impressum"
                className="shrink-0 rounded-[14px] border border-border px-4 py-2.5 text-xs font-semibold text-muted transition-colors duration-150 hover:border-border-strong hover:text-foreground sm:ml-auto"
              >
                {lang === "de" ? "Impressum ansehen" : "View imprint"}
              </Link>
            </div>
          </Reveal>
        </section>

        {/**
         * Der Ansprechpartner.
         *
         * Nur, wenn er wirklich eingetragen ist. Ein ausgedachter Berater mit
         * ausgedachter Durchwahl waere genau die Art Vertrauen, die beim
         * ersten Anruf zusammenfaellt — und dieselbe Sorte Fehler wie
         * erfundene Partnerbanken.
         */}
        {berater && (
          <section className="border-y border-border bg-surface/40">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 lg:py-16 flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
              <Reveal className="flex flex-col gap-3 max-w-xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {v.beraterEyebrow}
                </span>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-[-0.02em]">
                  {v.beraterTitel}
                </h2>
                <p className="text-muted leading-relaxed">{v.beraterText}</p>
              </Reveal>

              <Reveal delay={140} className="md:ml-auto">
                <div className="flex items-center gap-4 rounded-[20px] border border-border bg-background p-5 ring-1 ring-white/5">
                  {/* Anfangsbuchstaben statt Foto: Ein Platzhalterbild waere
                      ein zweites Versprechen, das niemand eingeloest hat. */}
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-accent/[0.12] text-lg font-bold text-accent">
                    {ANSPRECHPARTNER.name
                      .split(" ")
                      .map((teil) => teil[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">
                      {ANSPRECHPARTNER.name}
                    </span>
                    {ANSPRECHPARTNER.rolle && (
                      <span className="text-xs text-muted">
                        {ANSPRECHPARTNER.rolle}
                      </span>
                    )}
                    <a
                      href={`tel:${ANSPRECHPARTNER.telefon.replace(/[^\d+]/g, "")}`}
                      className="mt-1 text-sm font-semibold text-accent hover:underline"
                    >
                      {ANSPRECHPARTNER.telefon}
                    </a>
                    {ANSPRECHPARTNER.zeiten && (
                      <span className="text-[11px] text-muted/70">
                        {ANSPRECHPARTNER.zeiten}
                      </span>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* Ablauf */}
        <section id="ablauf" className="scroll-mt-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3 max-w-xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {v.ablaufEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {v.ablaufTitel}
              </h2>
              <p className="text-muted leading-relaxed">{v.ablaufUnter}</p>
            </Reveal>

            {/**
              * Links die drei Schritte, rechts die Zeichnung, die sie
              * durchspielt.
              *
              * Hierher gehoert sie: Ihre drei Szenen heissen "Daten eingeben",
              * "Angebote erhalten" und "Zinsen gespart" — das sind woertlich
              * die drei Kacheln daneben. Im Aufmacher war sie eine Attrappe
              * des Formulars, das eine Bildschirmhoehe weiter unten stand;
              * hier ist sie die Illustration einer Aussage.
              *
              * Ohne Verweis: Der Aufruf steht oben im Geraet und unten im
              * Schlussblock. Eine dritte Stelle, die dorthin fuehrt, waere
              * eine zu viel.
              */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-12">
              <div className="flex flex-col gap-4">
                {v.schritte.map((schritt, i) => (
                  <Reveal key={schritt.titel} delay={i * 120}>
                    <div className="flex gap-4 rounded-[20px] border border-border bg-surface p-5 ring-1 ring-white/5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/[0.12] text-sm font-bold text-accent">
                        {i + 1}
                      </span>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-base font-semibold">
                          {schritt.titel}
                        </h3>
                        <p className="text-sm text-muted leading-relaxed">
                          {schritt.text}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={180} className="flex flex-col items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {v.ablaufBildTitel}
                </span>
                {/* VisibilityGate haelt die Bewegung an, solange die Zeichnung
                    nicht im Bild steht — sie laeuft in einer Schleife und
                    haette sonst auf jeder Seite Rechenzeit gekostet, die
                    niemand sieht. */}
                <VisibilityGate className="w-full max-w-[420px]">
                  <HeroIllustration
                    angebote={l.heroAngebote}
                    proMonat={l.heroProMonat}
                    ersparnis={l.heroErsparnis}
                    beispielHinweis={l.heroBeispielHinweis}
                    szenen={l.heroSzenen}
                  />
                </VisibilityGate>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Kreditarten */}
        <section
          id="kreditarten"
          className="border-y border-border bg-surface/40 scroll-mt-8"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-10">
            <Reveal className="flex flex-col gap-3 max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                {v.kreditartenEyebrow}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
                {v.kreditartenTitel}
              </h2>
              <p className="text-muted leading-relaxed">{v.kreditartenText}</p>
            </Reveal>

            <KreditartenRaster anzahl={6} />

            <Reveal>
              <Link
                href="/kredit"
                className="group inline-flex w-fit items-center gap-2 rounded-[16px] border border-border px-5 py-3.5 text-sm font-semibold text-muted transition-all duration-200 hover:border-border-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {v.kreditartenAlle.replace("16", String(KREDITARTEN.length))}
                <span
                  aria-hidden="true"
                  className="text-accent transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Fragen */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 lg:py-20 flex flex-col gap-8">
          <Reveal className="flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              {v.faqEyebrow}
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em]">
              {v.faqTitel}
            </h2>
          </Reveal>

          <div className="flex flex-col gap-3">
            {v.faq.map((eintrag, i) => (
              <Reveal key={eintrag.frage} delay={i * 70}>
                {/* `details` statt eines nachgebauten Aufklappers: Der Browser
                    kann das, es funktioniert ohne Skript, und die Suche des
                    Browsers findet auch den zugeklappten Text. */}
                <details className="group rounded-[16px] border border-border bg-surface px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                    {eintrag.frage}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-accent transition-transform duration-200 group-open:rotate-180"
                    >
                      ⌄
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-muted leading-relaxed">
                    {eintrag.antwort}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Abschluss */}
        <section id="schluss" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-20">
            <Reveal className="rounded-[28px] border border-accent/25 bg-accent/[0.06] p-8 lg:p-12 flex flex-col items-center gap-5 text-center">
              <h2 className="max-w-2xl text-3xl lg:text-4xl font-bold tracking-[-0.02em] leading-[1.15]">
                {v.schlussTitel}
              </h2>
              <p className="max-w-xl text-muted leading-relaxed">
                {v.schlussText}
              </p>
              <Link
                href="/antrag"
                className="rounded-[16px] bg-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_rgba(52,211,153,0.6)] transition-all duration-200 hover:bg-accent-strong hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {v.schlussCta} →
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Der mitlaufende Aufruf erscheint, sobald der Rechner oben aus dem
          Bild ist, und tritt am Schlussaufruf wieder ab. */}
      <MitlaufenderCta
        beobachte="#rechner"
        bisZu="#schluss"
        href="/antrag"
        label={v.mitlaufCta}
        hinweis={v.mitlaufNote}
      />

      <Fussbereich />
    </>
  );
}
