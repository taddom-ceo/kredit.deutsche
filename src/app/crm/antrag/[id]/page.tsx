import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  aktivitaeten,
  findeAntrag,
  unvollstaendig,
  vollerName,
  type Aktivitaet,
} from "@/lib/crm/antraege";
import {
  findeStation,
  imPapierkorb,
  stationOderErsatz,
  STATIONEN,
  TON_KLASSEN,
} from "@/lib/crm/pipeline";
import { LOESCHGRUENDE } from "@/lib/crm/loeschprotokoll";
import { verlangeAnmeldung } from "@/lib/crm/zugang";
import { schluesselVorhanden } from "@/lib/crm/verschluesselung";
import IbanKopieren from "@/components/crm/IbanKopieren";
import {
  ausPapierkorb,
  fallLoeschen,
  inPapierkorb,
  notizSchreiben,
  statusAendern,
  wiedervorlageSetzen,
} from "../../aktionen";
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

/** Ein Eintrag des Verlaufs in einem Satz. */
function beschreibe(eintrag: Aktivitaet): string {
  if (eintrag.art === "notiz") return eintrag.text ?? "";
  if (eintrag.art === "wiedervorlage") {
    return eintrag.text
      ? `Wiedervorlage am ${datum(eintrag.text)}`
      : "Wiedervorlage entfernt";
  }
  if (eintrag.art === "einsicht") return "Bankverbindung kopiert";
  const von = eintrag.vonStatus
    ? (findeStation(eintrag.vonStatus)?.name ?? eintrag.vonStatus)
    : "—";
  const nach = eintrag.nachStatus
    ? (findeStation(eintrag.nachStatus)?.name ?? eintrag.nachStatus)
    : "—";
  return `Ordner: ${von} → ${nach}`;
}

export default async function AntragSeite({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const benutzer = await verlangeAnmeldung(`/crm/antrag/${id}`);
  const parameter = await searchParams;
  // Die Rueckfrage vor dem Loeschen steht in der Adresse statt im Zustand
  // einer Client-Komponente: Ein Klick auf "Löschen" fuehrt auf dieselbe
  // Seite mit einem Parameter, und dort steht die Frage. Kein Skript noetig,
  // und ein versehentliches Neuladen loescht nichts.
  const loeschenGefragt = parameter.loeschen === "1";

  const antrag = await findeAntrag(id);
  // Auch ein Fall, der es nie gab, und einer, der mit der Instanz
  // verschwunden ist, landen hier — von aussen sind sie nicht zu
  // unterscheiden.
  if (!antrag) notFound();

  const verlauf = await aktivitaeten(id);
  const darfBearbeiten = benutzer.rolle !== "lesen";
  const art = antrag.kreditart
    ? findeKreditartNachId(antrag.kreditart)?.de.name
    : undefined;
  const station = stationOderErsatz(antrag.status);
  const abgebrochen = unvollstaendig(antrag);
  const liegtImPapierkorb = imPapierkorb(antrag.status);
  const rate = monthlyPayment(antrag.amount, antrag.months);
  const heute = new Date().toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="w-full px-6 lg:px-10 py-5 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/crm"
            className="text-xs text-muted hover:text-foreground transition-colors duration-200"
          >
            ← Eingang
          </Link>
          {/* Schiebt Station und Hinweis nach rechts, laesst sie auf schmalen
              Geraeten aber umbrechen statt ueber den Rand zu draengen. */}
          <span className="ml-auto" />
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] ${
              TON_KLASSEN[station.ton].schild
            }`}
          >
            {station.name}
          </span>
          {/* Haengt an den Daten, nicht am Ordner: Ein vollstaendiger Antrag,
              den jemand nach "Abgebrochen" zieht, hat seine Angaben ja. */}
          {abgebrochen && (
            <span className="text-[11px] text-muted">
              Strecke nicht abgeschlossen — Angaben ab Schritt 5 fehlen
              möglicherweise.
            </span>
          )}
        </div>
      </header>

      <div className="w-full px-6 lg:px-10 py-10 flex flex-col gap-6">
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

        {darfBearbeiten ? (
          <section className="rounded-[20px] border border-border bg-surface p-5 flex flex-col gap-5">
            <h2 className="text-xs font-semibold text-muted tracking-wide">
              Bearbeitung
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <form action={statusAendern} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={antrag.id} />
                <label htmlFor="status" className="text-xs text-muted">
                  Ordner
                </label>
                <div className="flex gap-2">
                  <select
                    id="status"
                    name="status"
                    // Der Schluessel wechselt mit dem Status und zwingt React,
                    // das Feld neu aufzubauen. Ohne ihn behaelt die Auswahl
                    // nach einer Aenderung ihren alten Eintrag — `defaultValue`
                    // wirkt nur beim ersten Rendern. Wer dann "Setzen" drueckt,
                    // ohne hinzusehen, wuerde den Fall auf die alte Station
                    // zurueckwerfen.
                    key={antrag.status}
                    defaultValue={antrag.status}
                    className="flex-1 rounded-[14px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  >
                    {/* Steht der Fall noch auf einem stillgelegten Ordner,
                        kommt der als erster Eintrag dazu. Ohne ihn faende
                        `defaultValue` keine Entsprechung, das Feld zeigte
                        stumm "Neu" — und wer dann "Setzen" drueckt, ohne
                        hinzusehen, verschoebe den Fall, statt ihn zu
                        bestaetigen. */}
                    {(STATIONEN.some((s) => s.id === antrag.status)
                      ? STATIONEN
                      : [station, ...STATIONEN]
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="shrink-0 rounded-[14px] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-strong"
                  >
                    Setzen
                  </button>
                </div>
              </form>

              <form action={wiedervorlageSetzen} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={antrag.id} />
                <label htmlFor="tag" className="text-xs text-muted">
                  Wiedervorlage
                  {antrag.wiedervorlage && antrag.wiedervorlage < heute && (
                    <span className="ml-2 text-amber-300">überfällig</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    id="tag"
                    name="tag"
                    type="date"
                    // Aus demselben Grund wie bei der Station daneben.
                    key={antrag.wiedervorlage ?? "ohne"}
                    defaultValue={antrag.wiedervorlage ?? ""}
                    className="flex-1 rounded-[14px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-[14px] border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface"
                  >
                    Merken
                  </button>
                </div>
              </form>
            </div>

            <form action={notizSchreiben} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={antrag.id} />
              <label htmlFor="text" className="text-xs text-muted">
                Notiz
              </label>
              <textarea
                id="text"
                name="text"
                rows={3}
                placeholder="Was besprochen wurde, was fehlt, was als Nächstes ansteht."
                className="rounded-[14px] border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              />
              <button
                type="submit"
                className="self-start rounded-[14px] border border-border-strong bg-surface-2 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface"
              >
                Notiz speichern
              </button>
            </form>
          </section>
        ) : (
          <p className="rounded-[20px] border border-border bg-surface px-5 py-4 text-xs text-muted">
            Dieses Konto darf Fälle ansehen, aber nicht bearbeiten.
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
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
            <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2">
              <dt className="text-xs text-muted shrink-0">IBAN</dt>
              <dd className="flex items-center gap-2">
                <span className="text-sm text-right tabular-nums break-all">
                  {antrag.iban || "—"}
                </span>
                {antrag.iban && (
                  <IbanKopieren antragId={antrag.id} iban={antrag.iban} />
                )}
              </dd>
            </div>
            <Feld name="Bank" wert={antrag.bankname} />
            <Feld name="Kontoinhaber" wert={antrag.kontoinhaber} />
            {/* Der Zustand steht am Feld selbst und nicht nur in der
                Uebersicht: Hier sieht man die Bankverbindung, hier gehoert
                die Auskunft hin, wie sie abgelegt ist. */}
            <p className="pt-3 text-[11px] leading-relaxed text-muted">
              {schluesselVorhanden() ? (
                <>
                  Verschlüsselt gespeichert. In der Übersicht stehen nur die
                  letzten vier Stellen; jedes Kopieren wird im Verlauf
                  vermerkt.
                </>
              ) : (
                <span className="text-amber-200/80">
                  Unverschlüsselt gespeichert — es fehlt{" "}
                  <code>CRM_DATEN_SCHLUESSEL</code>. Ein Auszug der Tabelle
                  liest sich im Klartext.
                </span>
              )}
            </p>
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

        {/**
         * Löschen in zwei Schritten.
         *
         * Liegt der Fall noch in der Pipeline, gibt es nur einen Weg: in den
         * Papierkorb. Das darf jeder Bearbeiter, denn es ist umkehrbar. Erst
         * im Papierkorb erscheint das endgültige Löschen, und das nur für
         * Administratoren — mit derselben Rückfrage wie vorher.
         *
         * Dass der zweite Knopf woanders steht als der erste, ist der ganze
         * Sinn der Sache: Ein Fall ist eine Person mit Telefonnummer und
         * Bankverbindung. Ein Fehlgriff beim Aufräumen ist damit nicht
         * ärgerlich, sondern unwiederbringlich.
         */}
        {darfBearbeiten && !liegtImPapierkorb && (
          <section className="rounded-[20px] border border-border bg-surface p-5 flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-muted tracking-wide">
              Papierkorb
            </h2>
            <form
              action={inPapierkorb}
              className="flex flex-wrap items-center gap-3"
            >
              <input type="hidden" name="id" value={antrag.id} />
              <p className="text-xs text-muted leading-relaxed">
                Der Fall verschwindet aus Liste, Zählung und Export, bleibt
                aber vollständig erhalten. Zurückholen geht jederzeit.
              </p>
              <button
                type="submit"
                className="ml-auto rounded-[12px] border border-border px-3 py-2 text-xs text-muted transition-colors duration-150 hover:border-red-400/50 hover:text-red-300"
              >
                In den Papierkorb
              </button>
            </form>
          </section>
        )}

        {liegtImPapierkorb && (
          <section className="rounded-[20px] border border-dashed border-red-400/40 bg-red-400/[0.04] p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xs font-semibold text-red-300/90 tracking-wide">
                Im Papierkorb
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                Dieser Fall ist zum Löschen vorgemerkt und taucht in Liste,
                Zählung und Export nicht mehr auf. Gelöscht ist er noch nicht.
              </p>
            </div>

            {darfBearbeiten && (
              <form action={ausPapierkorb} className="flex">
                <input type="hidden" name="id" value={antrag.id} />
                <button
                  type="submit"
                  className="rounded-[12px] border border-border-strong bg-surface-2 px-4 py-2 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-surface"
                >
                  Zurückholen
                </button>
              </form>
            )}

            {benutzer.rolle === "admin" &&
              (loeschenGefragt ? (
                <form
                  action={fallLoeschen}
                  className="flex flex-col gap-3 border-t border-red-400/20 pt-4"
                >
                  <input type="hidden" name="id" value={antrag.id} />
                  <span className="text-sm">
                    Fall und Verlauf endgültig löschen? Das lässt sich nicht
                    rückgängig machen.
                  </span>

                  {/* Der Grund ist Pflicht und eine Auswahl, kein Freitext.
                      In ein Textfeld tippt früher oder später jemand
                      "Löschbegehren Frau Müller vom 3.8." — und damit stünde
                      der Name wieder in der Datenbank, an einer Stelle, an
                      der ihn niemand vermutet und deshalb auch niemand
                      mitlöscht. */}
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="grund" className="text-xs text-muted">
                        Grund — steht später im Löschprotokoll
                      </label>
                      <select
                        id="grund"
                        name="grund"
                        required
                        defaultValue="loeschbegehren"
                        className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                      >
                        {LOESCHGRUENDE.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="rounded-[12px] border border-red-400/50 bg-red-400/10 px-4 py-2 text-xs font-semibold text-red-300 transition-colors duration-150 hover:bg-red-400/20"
                    >
                      Ja, endgültig löschen
                    </button>
                    <Link
                      href={`/crm/antrag/${antrag.id}`}
                      className="pb-2 text-xs text-muted transition-colors duration-150 hover:text-foreground"
                    >
                      Abbrechen
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="flex flex-wrap items-center gap-3 border-t border-red-400/20 pt-4">
                  <p className="text-xs text-muted leading-relaxed">
                    Für ein Löschbegehren nach Art. 17 DSGVO oder den
                    Widerspruch eines Abbrechers. Der Verlauf verschwindet mit;
                    im{" "}
                    <Link
                      href="/crm/protokoll"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Löschprotokoll
                    </Link>{" "}
                    bleibt der Nachweis.
                  </p>
                  <Link
                    href={`/crm/antrag/${antrag.id}?loeschen=1`}
                    className="ml-auto rounded-[12px] border border-border px-3 py-2 text-xs text-muted transition-colors duration-150 hover:border-red-400/50 hover:text-red-300"
                  >
                    Endgültig löschen
                  </Link>
                </div>
              ))}
          </section>
        )}

        <section className="rounded-[20px] border border-border bg-surface p-5 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-muted tracking-wide">
            Verlauf
          </h2>
          {verlauf.length === 0 ? (
            <p className="text-sm text-muted">
              Noch nichts geschehen. Jeder Statuswechsel, jede Notiz und jede
              Wiedervorlage steht ab jetzt hier — mit Zeitpunkt und Namen.
            </p>
          ) : (
            <ol className="flex flex-col">
              {verlauf.map((eintrag) => (
                <li
                  key={eintrag.id}
                  className="flex flex-col gap-1 border-b border-border/60 py-3 first:pt-0 last:border-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm">{beschreibe(eintrag)}</span>
                    <span className="shrink-0 text-[11px] text-muted tabular-nums">
                      {new Date(eintrag.zeit).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted">
                    {eintrag.benutzer}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
