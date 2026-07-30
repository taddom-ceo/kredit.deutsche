import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-5xl px-6 py-24 flex flex-col gap-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Finanzen, neu gedacht.
        </h1>
        <p className="text-lg text-black/70 dark:text-white/70 max-w-2xl">
          Wir bauen die nächste Generation digitaler Finanzprodukte – sicher,
          transparent und made in Germany.
        </p>
      </section>

      <section
        id="kontakt"
        className="mx-auto max-w-5xl px-6 py-16 border-t border-black/10 dark:border-white/10 flex flex-col gap-6"
      >
        <h2 className="text-2xl font-semibold">Kontakt aufnehmen</h2>
        <ContactForm />
      </section>
    </main>
  );
}
