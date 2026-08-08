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

export const metadata: Metadata = {
  title: "Impressum — cresolu.de",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumSeite() {
  return (
    <>
      <Header />
      <RechtstextSeite titel="Impressum">
        {anbieterUnvollstaendig() && <UnvollstaendigHinweis />}

        <Abschnitt titel="Anbieter">
          <p className="whitespace-pre-line">
            <Angabe wert={ANBIETER.name} feld="Firma" />
            {"\n"}
            <Angabe wert={ANBIETER.strasse} feld="Straße und Hausnummer" />
            {"\n"}
            <Angabe wert={ANBIETER.plzOrt} feld="PLZ und Ort" />
            {"\n"}
            {ANBIETER.land}
          </p>
          <p>
            Vertreten durch:{" "}
            <Angabe
              wert={ANBIETER.vertreten}
              feld="Vertretungsberechtigte Person"
            />
          </p>
        </Abschnitt>

        <Abschnitt titel="Kontakt">
          <p>
            Telefon: <Angabe wert={ANBIETER.telefon} feld="Telefonnummer" />
            <br />
            E-Mail: <Angabe wert={ANBIETER.email} feld="E-Mail-Adresse" />
          </p>
        </Abschnitt>

        <Abschnitt titel="Registereintrag und Umsatzsteuer">
          <p>
            Registergericht und -nummer:{" "}
            <Angabe wert={ANBIETER.register} feld="Registereintrag" />
          </p>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:{" "}
            <Angabe wert={ANBIETER.ustId} feld="USt-IdNr." />
          </p>
        </Abschnitt>

        <Abschnitt titel="Erlaubnis und Aufsicht">
          <p>
            Die Vermittlung von Darlehen ist erlaubnispflichtig nach § 34c
            Abs. 1 Satz 1 Nr. 2 der Gewerbeordnung.
          </p>
          <p>
            Erteilte Erlaubnis:{" "}
            <Angabe wert={ANBIETER.erlaubnis} feld="Erlaubnis nach § 34c GewO" />
            <br />
            Erteilt durch:{" "}
            <Angabe
              wert={ANBIETER.erlaubnisBehoerde}
              feld="erteilende Behörde"
            />
            <br />
            Zuständige Aufsichtsbehörde:{" "}
            <Angabe wert={ANBIETER.aufsicht} feld="Aufsichtsbehörde" />
          </p>
          <p>
            Das Vermittlerregister ist einsehbar unter{" "}
            <a
              href="https://www.vermittlerregister.info"
              className="text-accent underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noreferrer"
            >
              vermittlerregister.info
            </a>
            .
          </p>
        </Abschnitt>

        <Abschnitt titel="Streitbeilegung">
          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung bereit:{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              className="text-accent underline underline-offset-2 hover:opacity-80"
              target="_blank"
              rel="noreferrer"
            >
              ec.europa.eu/consumers/odr
            </a>
            .
          </p>
          <p>
            Wir sind nicht bereit und nicht verpflichtet, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>
        </Abschnitt>

        <Abschnitt titel="Datenschutz">
          <p>
            Wie wir mit personenbezogenen Daten umgehen, steht in der{" "}
            <AndereSeite ziel="/datenschutz" text="Datenschutzerklärung" />.
          </p>
        </Abschnitt>
      </RechtstextSeite>
      <Fussbereich />
    </>
  );
}
