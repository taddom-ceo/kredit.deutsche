import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  aktivitaeten,
  findeAntrag,
  gehaltsliste,
  geldbetrag,
  kundennummer,
  niedrigsterGehaltIndex,
  unvollstaendig,
  type ZweitePersonEingang,
  vollerName,
  type Aktivitaet,
} from "@/lib/crm/antraege";
import {
  findeStation,
  imPapierkorb,
  nachGruppen,
  stationOderErsatz,
  STATIONEN,
  TON_KLASSEN,
} from "@/lib/crm/pipeline";
import { LOESCHGRUENDE } from "@/lib/crm/loeschprotokoll";
import { verlangeAnmeldung } from "@/lib/crm/zugang";
import { schluesselVorhanden } from "@/lib/crm/verschluesselung";
import Datenblatt from "@/components/crm/Datenblatt";
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
  /**
   * Die letzten Gehaltseingänge und der niedrigste darunter.
   *
   * Hervorgehoben wird der niedrigste, weil er die Zahl ist, mit der eine Bank
   * rechnet — nicht der zuletzt ausgezahlte. Fälle von vor der Umstellung
   * haben nur einen Monat; dort steht wie bisher schlicht "Nettoeinkommen" und
   * nichts ist markiert.
   */
  const gehaelter = gehaltsliste(antrag);
  const niedrigsterIndex = niedrigsterGehaltIndex(antrag);
  /**
   * Eine Angabe des zweiten Kreditnehmers fuer die rechte Haelfte der Zeile.
   *
   * Gibt es keinen zweiten, kommt `undefined` zurueck und die Haelfte bleibt
   * leer. Der Schluessel bekommt die Vorsilbe "zweite.", damit die Pruefung
   * am Telefon beide auseinanderhaelt — ohne sie bestaetigte ein Haken am
   * Nachnamen beide Personen zugleich.
   */
  const zweiteAngabe = (
    schluessel: string,
    lies: (person: ZweitePersonEingang) => string
  ) =>
    antrag.zweitePerson
      ? {
          schluessel: `zweite.${schluessel}`,
          wert: lies(antrag.zweitePerson),
          ...pruefstand(`zweite.${schluessel}`),
        }
      : undefined;

  /** Was zu einem Schluessel schon geprueft wurde. */
  const pruefstand = (schluessel: string) => ({
    korrektur: antrag.pruefung[schluessel]?.wert,
    bestaetigt: antrag.pruefung[schluessel]?.ok,
  });

  /** Steht ausgeschrieben da, wo der zweite die Angabe des ersten teilt. */
  const WIE_ERSTER = "wie erster Kreditnehmer";

  const zweiteGehaelter = antrag.zweitePerson
    ? gehaltsliste(antrag.zweitePerson)
    : [];
  const zweiteNiedrigster = antrag.zweitePerson
    ? niedrigsterGehaltIndex(antrag.zweitePerson)
    : -1;
  /* So viele Zeilen, wie die laengere der beiden Listen hat. Sonst fiele der
     dritte Monat des zweiten Kreditnehmers weg, nur weil der erste nur einen
     angegeben hat. */
  const gehaltsZeilen = Array.from(
    { length: Math.max(gehaelter.length, zweiteGehaelter.length) },
    (_, i) => i
  );
  const gehaltsNamen =
    gehaelter.length > 1
      ? ["Gehalt · zuletzt", "Gehalt · Vormonat", "Gehalt · davor"]
      : ["Nettoeinkommen"];
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
          {/* Die Kundennummer steht im Kopf und nicht zwischen den Feldern:
              Sie ist das, was man am Telefon als Erstes nennt, und was man
              sucht, wenn man die Akte offen hat und jemand danach fragt. */}
          <span className="rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold tabular-nums">
            {kundennummer(antrag)}
          </span>
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

      {/**
        * Zwei Spalten statt einer Kolonne aus Kästen.
        *
        * Vorher stand alles untereinander: Bearbeitung, sechs Datenblöcke,
        * laufende Kredite, Löschen, Verlauf. Wer eine Telefonnummer suchte,
        * scrollte daran vorbei; wer eine Notiz schreiben wollte, scrollte
        * wieder hoch. Die beiden Dinge, die man am Telefon gleichzeitig
        * braucht — die Angaben des Kunden und das, was zuletzt besprochen
        * wurde — lagen am weitesten auseinander.
        *
        * Jetzt links die Akte, rechts das Journal. Die rechte Spalte bleibt
        * beim Blättern stehen, damit das Notizfeld immer erreichbar ist. Auf
        * schmalen Geräten fällt sie darunter; `lg:` schaltet die zweite Spalte
        * erst ab der Breite frei, ab der beide nebeneinander lesbar sind.
        */}
      <div className="w-full px-6 lg:px-10 py-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] xl:grid-cols-[minmax(0,1fr)_26rem] items-start">
        <div className="flex flex-col gap-5 min-w-0">
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

          {/* Die vier Zahlen, um die es geht, als eigene Zeile. Sie standen
              vorher als vier Zeilen in einem Kasten zwischen zwanzig anderen
              Zeilen — richtig abgelegt, aber nicht zu sehen. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: "Verwendung", wert: art ?? "—" },
              { name: "Betrag", wert: formatEuro(antrag.amount) },
              { name: "Laufzeit", wert: `${antrag.months} Mon.` },
              { name: "Rate (Beispiel)", wert: formatEuro(rate) },
            ].map((k) => (
              <div
                key={k.name}
                className="rounded-[16px] border border-border bg-surface px-4 py-3 flex flex-col gap-0.5"
              >
                <span className="text-[11px] text-muted">{k.name}</span>
                <span
                  className={`font-semibold tracking-[-0.01em] ${
                    k.name === "Verwendung"
                      ? "text-sm leading-snug"
                      : "text-lg tabular-nums"
                  }`}
                >
                  {k.wert}
                </span>
              </div>
            ))}
          </div>
          {/**
            * Die Angaben des Kunden, Zeile für Zeile prüfbar.
            *
            * Aus den festen Kästen ist ein Datenblatt geworden: Jede Zeile
            * trägt neben der Angabe des Kunden ein Feld für die
            * Richtigstellung und einen Haken zum Bestätigen. Gedacht für das
            * Telefonat — vorlesen, abhaken, bei Bedarf danebenschreiben.
            *
            * Was der Kunde abgeschickt hat, wird dabei nie überschrieben. Es
            * steht in `rohdaten`, die Prüfung in einer eigenen Spalte; wer
            * später fragt, ob eine Nummer von Anfang an so lautete, findet
            * beides nebeneinander.
            */}
          <Datenblatt
            antragId={antrag.id}
            darfBearbeiten={darfBearbeiten}
            /* Ueber jeder Haelfte steht, wessen Angaben dort stehen. Der
               Vorname genuegt: Der Nachname ist bei zwei Kreditnehmern meist
               derselbe und traegt zur Unterscheidung nichts bei. */
            namen={
              antrag.zweitePerson
                ? [
                    antrag.vorname || "Erster Kreditnehmer",
                    antrag.zweitePerson.vorname || "Zweiter Kreditnehmer",
                  ]
                : [antrag.vorname]
            }
            bloecke={[
              {
                titel: "Person",
                zeilen: [
                  {
                    schluessel: "vorname",
                    name: "Vorname",
                    wert: [antrag.vorname, antrag.zweiterVorname]
                      .filter(Boolean)
                      .join(" "),
                    zweite: zweiteAngabe("vorname", (p) =>
                      [p.vorname, p.zweiterVorname].filter(Boolean).join(" ")
                    ),
                  },
                  {
                    schluessel: "nachname",
                    name: "Nachname",
                    wert: antrag.nachname,
                    zweite: zweiteAngabe("nachname", (p) => p.nachname),
                  },
                  {
                    schluessel: "geburtsdatum",
                    name: "Geburtsdatum",
                    wert: datum(antrag.geburtsdatum),
                    zweite: zweiteAngabe("geburtsdatum", (p) =>
                      datum(p.geburtsdatum)
                    ),
                  },
                  {
                    schluessel: "email",
                    name: "E-Mail",
                    wert: antrag.email,
                    // Bei "kein eigener Kontakt" steht ausgeschrieben, was
                    // gilt. Ein Gedankenstrich liesse offen, ob niemand
                    // gefragt hat oder ob es dieselbe Adresse ist.
                    zweite: zweiteAngabe("email", (p) =>
                      p.eigenerKontakt === "ja" ? p.email : WIE_ERSTER
                    ),
                  },
                  {
                    schluessel: "telefon",
                    name: "Telefon",
                    wert: [antrag.telefonVorwahl, antrag.telefon]
                      .filter(Boolean)
                      .join(" "),
                    zweite: zweiteAngabe("telefon", (p) =>
                      p.eigenerKontakt === "ja"
                        ? [p.telefonVorwahl, p.telefon].filter(Boolean).join(" ")
                        : WIE_ERSTER
                    ),
                  },
                  {
                    schluessel: "personCount",
                    name: "Antragsteller",
                    wert:
                      antrag.personCount === 2 ? "Zwei Personen" : "Eine Person",
                  },
                ],
              },
              {
                titel: "Anschrift",
                zeilen: [
                  {
                    schluessel: "strasse",
                    name: "Straße",
                    wert: [antrag.strasse, antrag.hausnummer]
                      .filter(Boolean)
                      .join(" "),
                    zweite: zweiteAngabe("strasse", (p) =>
                      p.gleicheAnschrift === "ja"
                        ? WIE_ERSTER
                        : [p.strasse, p.hausnummer].filter(Boolean).join(" ")
                    ),
                  },
                  {
                    schluessel: "plz",
                    name: "PLZ",
                    wert: antrag.plz,
                    zweite: zweiteAngabe("plz", (p) =>
                      p.gleicheAnschrift === "ja" ? WIE_ERSTER : p.plz
                    ),
                  },
                  {
                    schluessel: "ort",
                    name: "Ort",
                    wert: antrag.ort,
                    zweite: zweiteAngabe("ort", (p) =>
                      p.gleicheAnschrift === "ja" ? WIE_ERSTER : p.ort
                    ),
                  },
                ],
              },
              {
                titel: "Beschäftigung",
                zeilen: [
                  {
                    schluessel: "beschaeftigungsart",
                    name: "Art",
                    wert: antrag.beschaeftigungsart,
                    zweite: zweiteAngabe(
                      "beschaeftigungsart",
                      (p) => p.beschaeftigungsart
                    ),
                  },
                  {
                    schluessel: "arbeitgeber",
                    name: "Arbeitgeber",
                    wert: antrag.arbeitgeber,
                    zweite: zweiteAngabe("arbeitgeber", (p) => p.arbeitgeber),
                  },
                  {
                    schluessel: "beschaeftigtSeit",
                    name: "Beschäftigt seit",
                    wert: datum(antrag.beschaeftigtSeit),
                    zweite: zweiteAngabe("beschaeftigtSeit", (p) =>
                      datum(p.beschaeftigtSeit)
                    ),
                  },
                ],
              },
              {
                titel: "Einkommen und Ausgaben",
                zeilen: [
                  /* Die drei Monate einzeln, damit jeder für sich geprüft
                     und richtiggestellt werden kann. Der niedrigste ist
                     markiert — das ist die Zahl, mit der gerechnet wird.
                     Der erste Monat behält den alten Schlüssel: Fälle von
                     vor der Umstellung haben ihre Prüfung unter
                     "nettoeinkommen" abgelegt, und die soll nicht verloren
                     gehen, nur weil das Feld jetzt dreigeteilt ist. */
                  ...gehaltsZeilen.map((i) => ({
                    schluessel: i === 0 ? "nettoeinkommen" : `gehalt${i}`,
                    name: gehaltsNamen[i] ?? `Gehalt ${i + 1}`,
                    wert: geldbetrag(gehaelter[i] ?? ""),
                    hervorgehoben: i === niedrigsterIndex,
                    hinweis:
                      i === niedrigsterIndex
                        ? "niedrigster der drei Monate"
                        : undefined,
                    zweite: antrag.zweitePerson
                      ? {
                          schluessel: `zweite.gehalt${i}`,
                          wert: geldbetrag(zweiteGehaelter[i] ?? ""),
                          hervorgehoben: i === zweiteNiedrigster,
                          hinweis:
                            i === zweiteNiedrigster
                              ? "niedrigster der drei Monate"
                              : undefined,
                          ...pruefstand(`zweite.gehalt${i}`),
                        }
                      : undefined,
                  })),
                  {
                    schluessel: "mieteinnahmen",
                    name: "Mieteinnahmen",
                    wert: jaNein(antrag.mieteinnahmen),
                  },
                  {
                    schluessel: "mieteinnahmenBetrag",
                    name: "davon monatlich",
                    wert: geldbetrag(antrag.mieteinnahmenBetrag),
                  },
                  {
                    schluessel: "wohnnebenkosten",
                    name: "Wohnnebenkosten",
                    wert: geldbetrag(antrag.wohnnebenkosten),
                  },
                  {
                    schluessel: "krankenversicherung",
                    name: "Krankenversicherung",
                    wert: geldbetrag(antrag.krankenversicherung),
                  },
                  {
                    schluessel: "unterhalt",
                    name: "Unterhalt",
                    wert: geldbetrag(antrag.unterhalt),
                  },
                ],
              },
              {
                titel: "Kreditwunsch",
                zeilen: [
                  {
                    schluessel: "kreditart",
                    name: "Verwendung",
                    wert: art ?? "",
                  },
                  {
                    schluessel: "amount",
                    name: "Betrag",
                    wert: formatEuro(antrag.amount),
                  },
                  {
                    schluessel: "months",
                    name: "Laufzeit",
                    wert: `${antrag.months} Monate`,
                  },
                ],
              },
            ].map((block) => ({
              ...block,
              // Die zweite Haelfte bringt ihren Pruefstand schon mit; hier
              // kommt der der ersten dazu, fuer jede Zeile auf dieselbe Weise.
              zeilen: block.zeilen.map((z) => ({
                ...z,
                ...pruefstand(z.schluessel),
              })),
            }))}
          />

          {/* Die Bankverbindung bleibt für sich: Sie hat einen eigenen
              Kopierknopf, der jedes Mitnehmen im Verlauf vermerkt, und einen
              Hinweis darauf, wie sie abgelegt ist. Beides passt in keine
              Prüfzeile. */}
          <section className="rounded-[20px] border border-border bg-surface px-5 py-4 flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-muted tracking-wide">
              Bankverbindung
            </h2>
            <dl className="flex flex-col">
              {/* Seit die IBAN in der Strecke freiwillig ist, fehlt sie
                  regelmäßig. Ein Gedankenstrich sähe aus wie jedes andere
                  leere Feld; hier ist er aber eine Aufgabe fürs Telefonat,
                  weil ohne IBAN nichts ausgezahlt wird. */}
              <div
                className={`flex items-baseline justify-between gap-3 border-b border-border/60 py-2 ${
                  antrag.iban ? "" : "-mx-2 rounded-[10px] bg-amber-400/[0.07] px-2"
                }`}
              >
                <dt className="text-xs text-muted shrink-0">
                  IBAN
                  {!antrag.iban && (
                    <span className="block text-[10px] leading-tight text-amber-200/70">
                      im Gespräch erfragen
                    </span>
                  )}
                </dt>
                <dd className="flex items-center gap-2">
                  <span
                    className={`text-sm text-right tabular-nums break-all ${
                      antrag.iban ? "" : "font-semibold text-amber-200"
                    }`}
                  >
                    {antrag.iban || "fehlt"}
                  </span>
                  {antrag.iban && (
                    <IbanKopieren antragId={antrag.id} iban={antrag.iban} />
                  )}
                </dd>
              </div>
              <Feld name="Bank" wert={antrag.bankname} />
              <Feld name="Kontoinhaber" wert={antrag.kontoinhaber} />
            </dl>
            {/* Der Zustand steht am Feld selbst und nicht nur in der
                Uebersicht: Hier sieht man die Bankverbindung, hier gehoert
                die Auskunft hin, wie sie abgelegt ist. */}
            <p className="pt-2 text-[11px] leading-relaxed text-muted">
              {schluesselVorhanden() ? (
                <>
                  Verschlüsselt gespeichert. Sie steht nur hier, nicht in der
                  Fallliste; jedes Kopieren wird im Verlauf vermerkt.
                </>
              ) : (
                <span className="text-amber-200/80">
                  Unverschlüsselt gespeichert — es fehlt{" "}
                  <code>CRM_DATEN_SCHLUESSEL</code>. Ein Auszug der Tabelle
                  liest sich im Klartext.
                </span>
              )}
            </p>
          </section>

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
                        {geldbetrag(kredit.rate)}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {geldbetrag(kredit.restschuld)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {kredit.zins.trim() ? `${kredit.zins} %` : "—"}
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

        </div>

        {/**
          * Das Journal: rechts, gestapelt, und beim Blättern stehenbleibend.
          *
          * Oben die zwei Entscheidungen, die man am Telefon trifft — in
          * welchen Ordner der Fall gehört und wann er wieder auf den Tisch
          * soll. Darunter das Feld für die Notiz und darunter, was bisher
          * geschah. In dieser Reihenfolge, weil man schreibt, während man
          * spricht, und erst danach nachliest.
          *
          * `sticky` mit `max-h` und eigenem Rollbereich: Ohne die Höhengrenze
          * wächst die Spalte mit dem Journal, und ein Fall mit dreißig
          * Einträgen schöbe die linke Spalte auseinander.
          */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] min-w-0">
          {darfBearbeiten ? (
            <>
              <section className="rounded-[20px] border border-border bg-surface p-4 flex flex-col gap-4 shrink-0">
                <form action={statusAendern} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={antrag.id} />
                  <label htmlFor="status" className="text-[11px] text-muted">
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
                      className="min-w-0 flex-1 rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    >
                      {/* Steht der Fall auf einem Ordner, der nicht in der
                          Pipeline steht — stillgelegt oder im Papierkorb —,
                          kommt der als erster Eintrag dazu. Ohne ihn faende
                          `defaultValue` keine Entsprechung, das Feld zeigte
                          stumm "Neu", und wer dann "Setzen" drueckt, ohne
                          hinzusehen, verschoebe den Fall, statt ihn zu
                          bestaetigen. */}
                      {nachGruppen(
                        STATIONEN.some((s) => s.id === antrag.status)
                          ? STATIONEN
                          : [station, ...STATIONEN]
                      ).map((buendel) =>
                        buendel.gruppe ? (
                          <optgroup key={buendel.gruppe} label={buendel.gruppe}>
                            {buendel.ordner.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </optgroup>
                        ) : (
                          buendel.ordner.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))
                        )
                      )}
                    </select>
                    <button
                      type="submit"
                      className="shrink-0 rounded-[12px] bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-colors duration-200 hover:bg-accent-strong"
                    >
                      Setzen
                    </button>
                  </div>
                </form>

                <form action={wiedervorlageSetzen} className="flex flex-col gap-2">
                  <input type="hidden" name="id" value={antrag.id} />
                  <label htmlFor="tag" className="text-[11px] text-muted">
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
                      className="min-w-0 flex-1 rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-[12px] border border-border-strong bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface"
                    >
                      Merken
                    </button>
                  </div>
                </form>
              </section>
            </>
          ) : (
            <p className="rounded-[20px] border border-border bg-surface px-4 py-3 text-xs text-muted shrink-0">
              Dieses Konto darf Fälle ansehen, aber nicht bearbeiten.
            </p>
          )}

          <section className="rounded-[20px] border border-border bg-surface flex flex-col min-h-0 flex-1">
            <div className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3 shrink-0">
              <h2 className="text-xs font-semibold text-muted tracking-wide">
                Journal
              </h2>
              <span className="text-[11px] text-muted tabular-nums">
                {verlauf.length}{" "}
                {verlauf.length === 1 ? "Eintrag" : "Einträge"}
              </span>
            </div>

            {darfBearbeiten && (
              <form
                action={notizSchreiben}
                className="flex flex-col gap-2 border-b border-border px-4 pb-4 shrink-0"
              >
                <input type="hidden" name="id" value={antrag.id} />
                <label htmlFor="text" className="sr-only">
                  Notiz
                </label>
                <textarea
                  id="text"
                  name="text"
                  rows={3}
                  placeholder="Was besprochen wurde, was fehlt, was als Nächstes ansteht."
                  className="rounded-[12px] border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                />
                <button
                  type="submit"
                  className="self-start rounded-[12px] border border-border-strong bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground transition-colors duration-200 hover:bg-surface"
                >
                  Notiz speichern
                </button>
              </form>
            )}

            {/* Eigener Rollbereich: Das Journal darf lang werden, ohne die
                Spalte in die Länge zu ziehen. */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              {verlauf.length === 0 ? (
                <p className="text-xs text-muted leading-relaxed">
                  Noch nichts geschehen. Jeder Statuswechsel, jede Notiz und
                  jede Wiedervorlage steht ab jetzt hier — mit Zeitpunkt und
                  Namen.
                </p>
              ) : (
                <ol className="flex flex-col">
                  {verlauf.map((eintrag) => (
                    <li
                      key={eintrag.id}
                      className="flex flex-col gap-1 border-b border-border/60 py-3 first:pt-0 last:border-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        {/* Eine Notiz ist das, was jemand geschrieben hat, und
                            steht deshalb als Text da. Alles andere ist ein
                            Vorgang und darf blasser sein — sonst schreien
                            fünfzehn Ordnerwechsel die eine Notiz nieder, um
                            die es geht. */}
                        <span
                          className={`text-sm leading-snug break-words ${
                            eintrag.art === "notiz"
                              ? "text-foreground"
                              : "text-muted"
                          }`}
                        >
                          {beschreibe(eintrag)}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted/70 tabular-nums">
                          {new Date(eintrag.zeit).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted/70">
                        {eintrag.benutzer}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </aside>

      </div>
    </main>
  );
}
