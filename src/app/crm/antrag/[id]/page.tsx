import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findeAntrag, vollerName } from "@/lib/crm/antraege";
import { findeStation } from "@/lib/crm/pipeline";
import { verlangeAnmeldung } from "@/lib/crm/zugang";
import { findeKreditartNachId } from "@/lib/kreditarten";
import { formatEuro, monthlyPayment } from "@/lib/loan-calc";

export const metadata: Metadata = {
  title: "Fall",
  robots: { index: false, follow: false },
};

/** Eine Zeile im Datenblatt. Leere Angaben stehen als Gedankenstrich da,
    damit sichtbar bleibt, was der Kunde ausgelassen hat. */
function Feld({ name, wert }: { name: string; wert: string | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <dt className="text-xs text-muted shrink-0">{name}</dt>
      <dd className="text-sm text-right break-words">{wert?.trim() || "—"}</dd>
    </div>
  );
}

function Block({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-border bg-surface p-5 flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-muted tracking-wide">{titel}</h2>
      <dl className="flex flex-col">{children}</dl>
    </section>
  );
}

function jaNein(wert: string): string {
  if (wert === "ja") return "Ja";
  if (wert === "nein") return "Nein";
  return "—";
}

/** Aus JJJJ-MM wird MM/JJJJ, aus JJJJ-MM-TT wird TT.MM.JJJJ. */
function datum(wert: string): string {
  const teile = wert.split("-");
  if (teile.length === 3) return `${teile[2]}.${teile[1]}.${teile[0]}`;
  if (teile.length === 2) return `${teile[1]}/${teile[0]}`;
  return wert;
}

export default async function AntragSeite({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await verlangeAnmeldung(`/crm/antrag/${id}`);

  const antrag = findeAntrag(id);
  // Auch ein Fall, der es nie gab, und einer, der mit der Instanz
  // verschwunden ist, landen hier — von aussen sind sie nicht zu
  // unterscheiden.
  if (!antrag) notFound();

  const art = antrag.kreditart
    ? findeKreditartNachId(antrag.kreditart)?.de.name
    : undefined;
  const station = findeStation(antrag.status);
  const rate = monthlyPayment(antrag.amount, antrag.months);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between gap-6">
          <Link
            href="/crm"
            className="text-xs text-muted hover:text-foreground transition-colors duration-200"
          >
            ← Eingang
          </Link>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] text-accent">
            {station?.name ?? antrag.status}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-[-0.02em]">
            {vollerName(antrag)}
          </h1>
          <p className="text-xs text-muted">
            Eingegangen am{" "}
            {new Date(antrag.eingang).toLocaleString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Block titel="Kreditwunsch">
            <Feld name="Verwendung" wert={art} />
            <Feld name="Betrag" wert={formatEuro(antrag.amount)} />
            <Feld name="Laufzeit" wert={`${antrag.months} Monate`} />
            <Feld name="Rate (Beispiel)" wert={formatEuro(rate)} />
            <Feld
              name="Antragsteller"
              wert={antrag.personCount === 2 ? "Zwei Personen" : "Eine Person"}
            />
          </Block>

          <Block titel="Person">
            <Feld
              name="Vorname"
              wert={[antrag.vorname, antrag.zweiterVorname]
                .filter(Boolean)
                .join(" ")}
            />
            <Feld name="Nachname" wert={antrag.nachname} />
            <Feld name="Geburtsdatum" wert={datum(antrag.geburtsdatum)} />
            <Feld name="E-Mail" wert={antrag.email} />
            <Feld
              name="Telefon"
              wert={[antrag.telefonVorwahl, antrag.telefon]
                .filter(Boolean)
                .join(" ")}
            />
          </Block>

          <Block titel="Anschrift">
            <Feld
              name="Straße"
              wert={[antrag.strasse, antrag.hausnummer].filter(Boolean).join(" ")}
            />
            <Feld name="PLZ" wert={antrag.plz} />
            <Feld name="Ort" wert={antrag.ort} />
          </Block>

          <Block titel="Beschäftigung">
            <Feld name="Art" wert={antrag.beschaeftigungsart} />
            <Feld name="Arbeitgeber" wert={antrag.arbeitgeber} />
            <Feld
              name="Beschäftigt seit"
              wert={datum(antrag.beschaeftigtSeit)}
            />
          </Block>

          <Block titel="Einkommen und Ausgaben">
            <Feld name="Nettoeinkommen" wert={antrag.nettoeinkommen} />
            <Feld name="Mieteinnahmen" wert={jaNein(antrag.mieteinnahmen)} />
            <Feld name="davon monatlich" wert={antrag.mieteinnahmenBetrag} />
            <Feld name="Wohnnebenkosten" wert={antrag.wohnnebenkosten} />
            <Feld
              name="Krankenversicherung"
              wert={antrag.krankenversicherung}
            />
            <Feld name="Unterhalt" wert={antrag.unterhalt} />
          </Block>

          <Block titel="Bankverbindung">
            <Feld name="IBAN" wert={antrag.iban} />
            <Feld name="Bank" wert={antrag.bankname} />
            <Feld name="Kontoinhaber" wert={antrag.kontoinhaber} />
          </Block>
        </div>

        <section className="rounded-[20px] border border-border bg-surface p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-muted tracking-wide">
            Laufende Kredite
          </h2>
          {antrag.hatKredite !== "ja" || antrag.kredite.length === 0 ? (
            <p className="text-sm text-muted">
              {antrag.hatKredite === "nein"
                ? "Keine angegeben."
                : "Keine Angabe."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-[11px] text-muted">
                    <th className="text-left font-semibold py-2 pr-4">Art</th>
                    <th className="text-left font-semibold py-2 pr-4">Bank</th>
                    <th className="text-right font-semibold py-2 pr-4">Rate</th>
                    <th className="text-right font-semibold py-2 pr-4">
                      Restschuld
                    </th>
                    <th className="text-right font-semibold py-2">Zins</th>
                  </tr>
                </thead>
                <tbody>
                  {antrag.kredite.map((kredit, i) => (
                    <tr
                      key={i}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2 pr-4">{kredit.art || "—"}</td>
                      <td className="py-2 pr-4 text-muted">
                        {kredit.bank || "—"}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {kredit.rate || "—"}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {kredit.restschuld || "—"}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {kredit.zins || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="text-xs text-muted leading-relaxed">
          Statuswechsel, Notiz und Wiedervorlage kommen mit der Datenbank —
          ohne sie überlebt keine Änderung den nächsten Neustart des Servers.
        </p>
      </div>
    </main>
  );
}
