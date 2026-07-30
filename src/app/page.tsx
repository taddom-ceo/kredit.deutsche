import CreditCalculator from "@/components/CreditCalculator";
import ContactForm from "@/components/ContactForm";

const FEATURES = [
  {
    title: "100 % transparent",
    description:
      "Keine versteckten Kosten. Jede Rate, jeder Zins ist von Anfang an klar.",
  },
  {
    title: "Schufa-neutrale Anfrage",
    description:
      "Ein unverbindliches Angebot anzufragen wirkt sich nicht auf deine Bonität aus.",
  },
  {
    title: "Made in Germany",
    description:
      "Entwickelt und gehostet nach deutschen und europäischen Datenschutzstandards.",
  },
];

export default function Home() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            kredit.deutsche
          </span>
          <a
            href="#kontakt"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface transition-colors"
          >
            Kontakt
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Dein Kredit.
              <br />
              Fair. Transparent. Digital.
            </h1>
            <p className="text-lg text-muted max-w-lg">
              Berechne in Sekunden deine monatliche Rate und erhalte ein
              unverbindliches, Schufa-neutrales Angebot – ganz ohne
              Papierkram.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <CreditCalculator />
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2">
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="kontakt"
          className="border-t border-border"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">Kontakt aufnehmen</h2>
            <ContactForm />
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
