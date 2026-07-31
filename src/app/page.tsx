"use client";

import CreditCalculator from "@/components/CreditCalculator";
import Header from "@/components/Header";
import BankMarquee from "@/components/BankMarquee";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage();

  return (
    <>
      <Header />
      <BankMarquee />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.08] tracking-[-0.02em]">
              {t.hero.titleLine1}
              <br />
              {t.hero.titleLine2}
            </h1>
            <p className="text-lg text-muted leading-relaxed max-w-lg">
              {t.hero.subtitle}
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <CreditCalculator />
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[20px] border border-border bg-surface ring-1 ring-white/5 p-6 flex flex-col gap-2.5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)] transition-all duration-250 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_14px_36px_-16px_rgba(0,0,0,0.65)]"
              >
                <h3 className="text-base font-semibold tracking-[-0.01em]">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted tracking-wide">
          © {new Date().getFullYear()} kredit.deutsche
        </div>
      </footer>
    </>
  );
}
