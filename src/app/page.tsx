"use client";

import CreditCalculator from "@/components/CreditCalculator";
import Header from "@/components/Header";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <Header />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              {t.hero.titleLine1}
              <br />
              {t.hero.titleLine2}
            </h1>
            <p className="text-lg text-muted max-w-lg">{t.hero.subtitle}</p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <CreditCalculator />
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {t.features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted">
          © {new Date().getFullYear()} kredit.deutsche
        </div>
      </footer>
    </>
  );
}
