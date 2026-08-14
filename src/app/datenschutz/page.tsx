import type { Metadata } from "next";
import Header from "@/components/Header";
import Fussbereich from "@/components/Fussbereich";
import {
  Abschnitt,
  Angabe,
  AndereSeite,
  RechtstextSeite,
  UnvollstaendigHinweis,
} from "@/components/Rechtstext";
import { ANBIETER, anbieterUnvollstaendig } from "@/lib/anbieter";

/**
 * Die Datenschutzerklaerung beschreibt, was diese Anwendung tatsaechlich tut —
 * nicht, was ueblicherweise in solchen Texten steht.
 *
 * Jede Aussage hier ist an einer Stelle im Code nachpruefbar: die Felder aus
 * `antragNutzlast`, die beiden Cookies aus `site-gate.ts` und
 * `crm/sitzung.ts`, die Verschluesselung der IBAN aus
 * `crm/verschluesselung.ts`, die Ablage aus `crm/db.ts`. Wer den Code
 * aendert, aendert damit auch diese Seite — deshalb stehen die Verweise in
 * den Kommentaren.
 *
 * Was hier bewusst NICHT steht: Analyse-Werkzeuge, Einwilligungsbanner,
 * Social-Plugins, Kartendienste, externe Schriften. Es gibt sie nicht, und
 * ein Text, der sie vorsorglich erwaehnt, waere falsch.
 *
 * Offen: Die Fristen unter Punkt 8 sind eine Zusage, die die Software noch
 * nicht selbst einhaelt — es gibt keinen Auftrag, der abgelaufene Faelle
 * automatisch loescht. Bis es ihn gibt, muss der Betreiber die Faelle von
 * Hand loeschen; im CRM geht das in der Fallakte. Wer diesen Auftrag
 * nachruestet, sollte hier nichts aendern muessen: Die Fristen im Text sind
 * die Vorgabe dafuer.
 */

const STAND = "August 2026";

export const metadata: Metadata = {
  title: "Datenschutzerklärung — cresolu.de",
  description:
    "Welche personenbezogenen Daten wir erheben, wozu, auf welcher Rechtsgrundlage und wie lange wir sie speichern.",
  alternates: { canonical: "/datenschutz" },
};

/** Eine Zeile in einer der beiden Übersichtstabellen. */
function Zeile({ zellen }: { zellen: React.ReactNode[] }) {
  return (
    <tr className="border-t border-border align-top">
      {zellen.map((zelle, i) => (
        <td key={i} className="px-3 py-2.5">
          {zelle}
        </td>
      ))}
    </tr>
  );
}

function Tabelle({
  kopf,
  children,
}: {
  kopf: string[];
  children: React.ReactNode;
}) {
  return (
    // Rechtstexte werden oft auf dem Handy gelesen. Eine Tabelle, die dort
    // die Seite breiter macht als den Bildschirm, verschiebt den ganzen
    // Fliesstext — deshalb rollt sie in ihrem eigenen Rahmen.
    <div className="overflow-x-auto rounded-[16px] border border-border bg-surface">
      <table className="w-full min-w-[34rem] text-left text-xs">
        <thead>
          <tr className="text-foreground">
            {kopf.map((titel) => (
              <th key={titel} className="px-3 py-2.5 font-semibold">
                {titel}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Aufzählung der erhobenen Felder, damit sie nicht als Fließtext untergehen. */
function Felder({ punkte }: { punkte: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5 pl-4">
      {punkte.map((punkt) => (
        <li key={punkt} className="list-disc marker:text-accent">
          {punkt}
        </li>
      ))}
    </ul>
  );
}

export default function DatenschutzSeite() {
  return (
    <>
      <Header />
      <RechtstextSeite titel="Datenschutzerklärung" stand={STAND}>
        {anbieterUnvollstaendig() && <UnvollstaendigHinweis />}

        <Abschnitt titel="Kurz vorweg">
          <p>
            Diese Seite erhebt nur die Daten, die für eine Kreditanfrage nötig
            sind. Es gibt <strong>keine Analyse-Werkzeuge</strong>, keine
            Werbenetzwerke, keine Social-Media-Plugins und keine
            Inhalte, die von fremden Servern nachgeladen werden. Schriften
            liegen auf unserem eigenen Server. Deshalb gibt es hier auch kein
            Einwilligungsbanner: Es gibt nichts, wozu Sie einwilligen müssten.
          </p>
          <p>
            Wir setzen genau zwei Cookies, beide technisch notwendig, beide
            ohne Ablaufdatum im Browserspeicher — sie verschwinden, sobald Sie
            den Browser schließen.
          </p>
        </Abschnitt>

        <Abschnitt titel="1. Verantwortlicher">
          <p className="whitespace-pre-line">
            Verantwortlich für die Verarbeitung im Sinne von Art. 4 Nr. 7 DSGVO
            ist:
            {"\n\n"}
            <Angabe wert={ANBIETER.name} feld="Firma" />
            {"\n"}
            <Angabe wert={ANBIETER.strasse} feld="Straße und Hausnummer" />
            {"\n"}
            <Angabe wert={ANBIETER.plzOrt} feld="PLZ und Ort" />
            {"\n"}
            {ANBIETER.land}
          </p>
          <p>
            Telefon: <Angabe wert={ANBIETER.telefon} feld="Telefonnummer" />
            <br />
            E-Mail: <Angabe wert={ANBIETER.email} feld="E-Mail-Adresse" />
          </p>
          <p>
            Weitere Angaben zum Anbieter stehen im{" "}
            <AndereSeite ziel="/impressum" text="Impressum" />.
          </p>
        </Abschnitt>

        <Abschnitt titel="2. Datenschutzbeauftragter">
          <p>
            <Angabe
              wert={ANBIETER.datenschutzKontakt}
              feld="Datenschutzbeauftragter oder Hinweis, dass keiner benannt ist"
            />
          </p>
          <p>
            Ein Datenschutzbeauftragter ist nach § 38 BDSG unter anderem dann
            zu benennen, wenn in der Regel mindestens zwanzig Personen ständig
            mit der automatisierten Verarbeitung personenbezogener Daten
            beschäftigt sind oder eine Datenschutz-Folgenabschätzung
            erforderlich ist.
          </p>
        </Abschnitt>

        <Abschnitt titel="3. Beim Aufruf der Seite">
          <p>
            Unser Hoster erstellt bei jedem Aufruf automatisch ein Protokoll.
            Darin stehen:
          </p>
          <Felder
            punkte={[
              "IP-Adresse des anfragenden Geräts",
              "Datum und Uhrzeit der Anfrage",
              "aufgerufene Adresse und übertragene Datenmenge",
              "Statusmeldung des Servers",
              "Browser, Version und Betriebssystem",
              "die zuvor besuchte Seite, sofern der Browser sie übermittelt",
            ]}
          />
          <p>
            Diese Daten sind nötig, damit die Seite ausgeliefert werden kann,
            und sie helfen uns, Störungen und Angriffe zu erkennen.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; unser berechtigtes
            Interesse ist der sichere und störungsfreie Betrieb. Eine
            Zusammenführung dieser Daten mit Ihrer Kreditanfrage findet nicht
            statt.
          </p>
        </Abschnitt>

        <Abschnitt titel="4. Passwortgeschützter Zugang">
          <p>
            Die Seite befindet sich im Aufbau und ist derzeit nur mit einem
            Passwort erreichbar. Nach der Eingabe setzen wir ein Cookie, das
            belegt, dass das Passwort stimmte — das Passwort selbst wird nicht
            gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse daran, eine unfertige Seite nicht
            öffentlich zu zeigen), für die Speicherung auf Ihrem Gerät § 25
            Abs. 2 Nr. 2 TDDDG, weil das Cookie für den von Ihnen gewünschten
            Zugang unbedingt erforderlich ist.
          </p>
        </Abschnitt>

        <Abschnitt titel="5. Ihre Kreditanfrage">
          <p>
            Der Antrag führt in acht Schritten durch die Angaben, die eine Bank
            für eine Kreditentscheidung benötigt. Wir erheben:
          </p>
          <Felder
            punkte={[
              "Verwendungszweck, Kreditbetrag, Laufzeit und Anzahl der Antragsteller",
              "Vorname, weiterer Vorname, Nachname und Geburtsdatum",
              "E-Mail-Adresse und Telefonnummer",
              "Straße, Hausnummer, Postleitzahl und Ort",
              "Beschäftigungsart, Arbeitgeber und Beschäftigungsbeginn",
              "monatliches Nettoeinkommen, Mieteinnahmen, Wohnnebenkosten, Beitrag zur Krankenversicherung und Unterhaltszahlungen",
              "bestehende Kredite mit Restschuld, Rate und Laufzeit",
              "IBAN, Bankname und Kontoinhaber",
            ]}
          />
          <p>
            Diese Angaben verarbeiten wir, um Ihre Anfrage zu bearbeiten, Sie
            zu beraten und ein passendes Finanzierungsangebot zu vermitteln.
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO — die Verarbeitung
            erfolgt auf Ihre Anfrage hin und dient der Anbahnung eines
            Vertrags. Ohne diese Angaben können wir keine Anfrage bearbeiten;
            Sie sind weder gesetzlich noch vertraglich verpflichtet, sie zu
            machen, aber ohne sie kommt keine Vermittlung zustande.
          </p>
          <p>
            <strong>Wir fragen derzeit keine Auskunftei ab.</strong> Es findet
            keine SCHUFA-Anfrage statt, weder eine Konditionenanfrage noch eine
            Kreditanfrage. Es findet auch keine automatisierte Entscheidung
            einschließlich Profiling nach Art. 22 DSGVO statt: Über Ihre
            Anfrage entscheidet ein Mensch.
          </p>
          <p>
            Eine Weitergabe an Banken erfolgt erst, wenn Sie einer konkreten
            Anfrage bei einem konkreten Institut zustimmen. Zum jetzigen
            Zeitpunkt werden Ihre Daten an keine Bank übermittelt.
          </p>
        </Abschnitt>

        <Abschnitt titel="6. Abgebrochene Anfragen">
          <p>
            Wenn Sie den Antrag ab dem Schritt mit den persönlichen Daten
            ausfüllen und eine E-Mail-Adresse oder eine Telefonnummer
            eingetragen haben, speichern wir den bis dahin erreichten Stand
            auch dann, wenn Sie den Antrag nicht abschließen. Der Fall wird
            intern als <em>Abbrecher</em> geführt, damit wir Sie fragen können,
            ob Sie Hilfe beim Ausfüllen brauchen oder das Angebot nicht mehr
            benötigen.
          </p>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
            Interesse besteht darin, eine begonnene Anfrage nicht verfallen zu
            lassen, sondern nachzufassen.{" "}
            <strong>
              Gegen diese Verarbeitung können Sie jederzeit Widerspruch
              einlegen
            </strong>{" "}
            — formlos an die oben genannte Adresse. Nach einem Widerspruch
            löschen wir den Datensatz, sofern keine gesetzliche
            Aufbewahrungspflicht entgegensteht. Näheres unter Punkt 12.
          </p>
        </Abschnitt>

        <Abschnitt titel="7. Wer die Daten erhält">
          <p>
            Innerhalb unseres Hauses erhalten nur die Mitarbeiterinnen und
            Mitarbeiter Zugriff, die ihn für die Bearbeitung Ihrer Anfrage
            brauchen. Der Zugang zu unserem internen System ist
            passwortgeschützt und personengebunden; jede Statusänderung, jede
            Notiz und jeder Abruf Ihrer Bankverbindung wird mit Person und
            Zeitpunkt protokolliert.
          </p>
          <p>
            Darüber hinaus setzen wir folgende Dienstleister als
            Auftragsverarbeiter nach Art. 28 DSGVO ein:
          </p>
          <Tabelle kopf={["Dienstleister", "Aufgabe", "Ort der Verarbeitung"]}>
            <Zeile
              zellen={[
                "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA",
                "Betrieb und Auslieferung der Website, Server-Protokolle",
                "Europäische Union (Region Frankfurt)",
              ]}
            />
            <Zeile
              zellen={[
                "Neon Inc., 209 Orange St, Wilmington, DE 19801, USA",
                "Datenbank, in der die Anfragen gespeichert werden",
                "Europäische Union",
              ]}
            />
          </Tabelle>
          <p>
            Beide Anbieter sind US-amerikanische Unternehmen, betreiben die von
            uns genutzten Systeme aber in Rechenzentren innerhalb der EU. Für
            den Fall, dass es zu einem Zugriff aus den USA kommt, stützen wir
            die Übermittlung auf die Standardvertragsklauseln der Europäischen
            Kommission nach Art. 46 Abs. 2 lit. c DSGVO in Verbindung mit den
            Auftragsverarbeitungsverträgen der Anbieter.
          </p>
          <p>
            Eine Übermittlung an weitere Empfänger — insbesondere an Banken —
            findet nur statt, wenn Sie zustimmen, oder wenn wir gesetzlich dazu
            verpflichtet sind, etwa gegenüber Finanzbehörden oder
            Strafverfolgungsbehörden.
          </p>
        </Abschnitt>

        <Abschnitt titel="8. Wie lange wir speichern">
          <Tabelle kopf={["Daten", "Dauer"]}>
            <Zeile
              zellen={[
                "Server-Protokolle",
                "wenige Tage beim Hoster, danach automatische Löschung",
              ]}
            />
            <Zeile
              zellen={[
                "Abgebrochene Anfragen",
                "spätestens sechs Monate nach der letzten Änderung — früher, wenn Sie widersprechen",
              ]}
            />
            <Zeile
              zellen={[
                "Anfragen ohne Vertragsabschluss",
                "bis zum Ende des dritten Jahres nach Abschluss der Bearbeitung (Verjährung nach §§ 195, 199 BGB)",
              ]}
            />
            <Zeile
              zellen={[
                "Unterlagen zu vermittelten Verträgen",
                "sechs bzw. zehn Jahre nach § 257 HGB und § 147 AO",
              ]}
            />
          </Tabelle>
          <p>
            Wir löschen früher, sobald der Zweck entfällt und keine
            Aufbewahrungspflicht mehr besteht.
          </p>
        </Abschnitt>

        <Abschnitt titel="9. Cookies">
          <p>
            Wir verwenden zwei Cookies. Beide sind für den Betrieb notwendig,
            beide sind <em>HttpOnly</em> — Skripte im Browser können sie nicht
            lesen —, und beide sind reine Sitzungscookies ohne Ablaufdatum: Der
            Browser löscht sie, sobald er geschlossen wird.
          </p>
          <Tabelle kopf={["Name", "Zweck", "Dauer"]}>
            <Zeile
              zellen={[
                <code key="n">site_access</code>,
                "belegt, dass das Seitenpasswort eingegeben wurde",
                "bis zum Schließen des Browsers",
              ]}
            />
            <Zeile
              zellen={[
                <code key="n">crm_sitzung</code>,
                "Anmeldung im internen Bearbeitungssystem — wird nur bei Mitarbeitenden gesetzt, nie bei Besuchern",
                "bis zum Schließen des Browsers, längstens acht Stunden",
              ]}
            />
          </Tabelle>
          <p>
            Beide fallen unter § 25 Abs. 2 Nr. 2 TDDDG und sind deshalb nicht
            einwilligungspflichtig. Weitere Cookies setzen wir nicht, und wir
            verwenden weder Zählpixel noch Fingerprinting noch andere
            Wiedererkennungsverfahren.
          </p>
          <p>
            Zusätzlich legt die Antragsstrecke Ihre Eingaben im lokalen Speicher
            Ihres Browsers ab (<em>localStorage</em>, Eintrag{" "}
            <code>cresolu.antrag.stand</code>), damit sie beim Neuladen oder
            beim späteren Aufruf noch da sind und Sie nicht von vorn anfangen
            müssen. Diese Daten verlassen Ihr Gerät nicht — sie werden nicht an
            uns übertragen und nicht ausgewertet. Ihre Bankverbindung wird
            dabei ausdrücklich nicht abgelegt. Der Eintrag wird nach sieben
            Tagen verworfen und gelöscht, sobald Sie den Antrag abgeschickt
            haben; über die Schaltfläche „Verwerfen und neu anfangen&ldquo; oben
            in der Antragsstrecke können Sie ihn jederzeit selbst entfernen.
            Rechtsgrundlage der Speicherung auf Ihrem Gerät ist § 25 Abs. 2
            Nr. 2 TDDDG: Sie ist erforderlich, um Ihnen den ausdrücklich
            gewünschten Dienst — das Ausfüllen des Antrags — bereitzustellen.
          </p>
        </Abschnitt>

        <Abschnitt titel="10. Sicherheit">
          <p>
            Die Verbindung zu dieser Seite ist durchgehend mit TLS
            verschlüsselt; erkennbar am Schloss in der Adresszeile. Ihre
            Angaben werden nur über diese verschlüsselte Verbindung übertragen.
          </p>
          <p>
            Ihre <strong>Bankverbindung wird zusätzlich verschlüsselt in der
            Datenbank abgelegt</strong> (AES-256-GCM). Wer Zugriff auf die
            Datenbank hätte, ohne den Schlüssel zu kennen, sieht dort keine
            IBAN. In der Übersichtsliste unseres internen Systems steht die
            IBAN nur verkürzt; vollständig wird sie erst in der einzelnen Akte
            angezeigt, und jeder Abruf wird protokolliert.
          </p>
          <p>
            Passwörter unserer Mitarbeitenden speichern wir nicht im Klartext,
            sondern als Streuwert mit Zufallsanteil (scrypt).
          </p>
        </Abschnitt>

        <Abschnitt titel="11. Ihre Rechte">
          <p>Sie haben uns gegenüber folgende Rechte:</p>
          <Felder
            punkte={[
              "Auskunft darüber, ob und welche Daten wir zu Ihnen verarbeiten (Art. 15 DSGVO)",
              "Berichtigung unrichtiger und Vervollständigung unvollständiger Daten (Art. 16 DSGVO)",
              "Löschung Ihrer Daten, soweit keine Aufbewahrungspflicht entgegensteht (Art. 17 DSGVO)",
              "Einschränkung der Verarbeitung (Art. 18 DSGVO)",
              "Herausgabe Ihrer Daten in einem gängigen Format oder Übertragung an einen anderen Anbieter (Art. 20 DSGVO)",
              "Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)",
            ]}
          />
          <p>
            Eine formlose Nachricht an{" "}
            <Angabe wert={ANBIETER.email} feld="E-Mail-Adresse" /> genügt.
          </p>
        </Abschnitt>

        <Abschnitt titel="12. Widerspruchsrecht nach Art. 21 DSGVO">
          <div className="rounded-[16px] border border-border-strong bg-surface p-5">
            <p className="text-foreground">
              Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen
              Situation ergeben, jederzeit gegen die Verarbeitung Ihrer Daten
              Widerspruch einzulegen, soweit wir sie auf Art. 6 Abs. 1 lit. f
              DSGVO stützen. Das betrifft insbesondere die Speicherung
              abgebrochener Anfragen (Punkt 6). Wir verarbeiten die Daten dann
              nicht mehr, es sei denn, wir können zwingende schutzwürdige
              Gründe nachweisen, die Ihre Interessen überwiegen, oder die
              Verarbeitung dient der Geltendmachung oder Verteidigung von
              Rechtsansprüchen.
            </p>
            <p className="mt-3 text-foreground">
              Verarbeiten wir Ihre Daten für Direktwerbung, können Sie
              jederzeit ohne Angabe von Gründen widersprechen; danach
              verarbeiten wir sie zu diesem Zweck nicht mehr.
            </p>
          </div>
        </Abschnitt>

        <Abschnitt titel="13. Beschwerde bei einer Aufsichtsbehörde">
          <p>
            Unabhängig von anderen Rechtsbehelfen können Sie sich bei einer
            Datenschutz-Aufsichtsbehörde beschweren, wenn Sie der Ansicht sind,
            dass wir Ihre Daten rechtswidrig verarbeiten (Art. 77 DSGVO). Für
            uns zuständig ist:
          </p>
          <p>
            <Angabe
              wert={ANBIETER.datenschutzAufsicht}
              feld="zuständige Datenschutz-Aufsichtsbehörde"
            />
          </p>
          <p>
            Sie können sich auch an die Aufsichtsbehörde Ihres Wohnsitzes oder
            Arbeitsplatzes wenden.
          </p>
        </Abschnitt>

        <Abschnitt titel="14. Änderungen dieser Erklärung">
          <p>
            Wir passen diese Erklärung an, wenn sich die Verarbeitung ändert —
            etwa sobald Anfragen an Banken übermittelt oder Auskunfteien
            eingebunden werden. Es gilt jeweils die hier veröffentlichte
            Fassung. Stand: {STAND}.
          </p>
        </Abschnitt>
      </RechtstextSeite>
      <Fussbereich />
    </>
  );
}
