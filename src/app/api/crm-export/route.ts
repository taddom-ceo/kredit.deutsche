import { NextResponse } from "next/server";
import {
  alleAntraege,
  gehaltsliste,
  ibanVerkuerzt,
  niedrigstesGehalt,
  schrittName,
} from "@/lib/crm/antraege";
import {
  alsFilter,
  angezeigteFaelle,
  leseAnsicht,
} from "@/lib/crm/ansicht";
import { findeStation } from "@/lib/crm/pipeline";
import { angemeldeterBenutzer } from "@/lib/crm/zugang";
import { findeKreditartNachId } from "@/lib/kreditarten";

/**
 * Die Fallliste als Tabelle zum Herunterladen.
 *
 * CSV und nicht xlsx: Eine echte Excel-Datei braucht ein zusaetzliches Paket,
 * und dieses Projekt kommt bisher ohne aus. Die drei Kunstgriffe unten sorgen
 * dafuer, dass deutsches Excel die Datei trotzdem ohne Nachfrage richtig
 * oeffnet — mit Umlauten und in Spalten statt in einer Zelle.
 */

/**
 * Excel liest CSV in deutscher Einstellung mit Semikolon, nicht mit Komma.
 * Ohne das steht die ganze Zeile in einer einzigen Zelle.
 */
const TRENNER = ";";

/**
 * Das Byte-Order-Mark am Anfang. Ohne es haelt Excel die Datei fuer
 * Westeuropaeisch und macht aus "Müller" ein "MÃ¼ller".
 */
const BOM = "﻿";

function zelle(wert: string | number | null | undefined): string {
  const text = String(wert ?? "");
  // Anfuehrungszeichen verdoppeln und das Ganze einpacken, sonst zerreisst
  // ein Semikolon oder Zeilenumbruch im Text die Zeile.
  return `"${text.replace(/"/g, '""')}"`;
}

const SPALTEN = [
  "Eingang",
  "Station",
  "Vorname",
  "Nachname",
  "E-Mail",
  "Telefon",
  "PLZ",
  "Ort",
  "Verwendung",
  "Betrag",
  "Laufzeit (Monate)",
  "Wiedervorlage",
  "IBAN",
  "Bank",
  "Beschäftigung",
  // Nur der Name. Wer mehr ueber den zweiten Kreditnehmer wissen will, oeffnet
  // den Fall — eine Tabelle mit zwei vollstaendigen Personensaetzen je Zeile
  // liest niemand mehr.
  "2. Kreditnehmer",
  // Die drei Monate einzeln und die Zahl, mit der gerechnet wird. Sie steht
  // ausgerechnet daneben, weil eine Tabelle sortiert und gefiltert wird — wer
  // nach tragfaehigem Einkommen sortieren will, soll das nicht erst mit einer
  // Formel ueber drei Spalten nachbauen muessen.
  "Gehalt zuletzt",
  "Gehalt Vormonat",
  "Gehalt davor",
  "Niedrigstes Gehalt",
  // Der weiteste erreichte Schritt der Strecke. In der Oberflaeche steht er
  // nur dort, wo er zaehlt — hier steht er an jeder Zeile, weil eine Tabelle
  // gerade dafuer da ist: Wer die Absprungpunkte ueber Wochen vergleichen
  // will, braucht die Rohzahl und keine Zusammenfassung.
  "Erreichter Schritt",
];

export async function GET(request: Request) {
  // Auch dieser Weg fuehrt an Kundendaten — er braucht dieselbe Pruefung wie
  // die Seiten. Ohne Anmeldung gibt es hier nichts, auch nicht mit der
  // richtigen Adresse.
  const benutzer = await angemeldeterBenutzer();
  if (!benutzer) {
    return new NextResponse("Nicht angemeldet", { status: 401 });
  }

  // Dieselbe Ansicht wie die Liste, aus derselben Adresse gelesen. Der Verweis
  // auf diesen Endpunkt traegt alle Suchparameter mit — die Datei enthaelt
  // damit genau die Faelle, die man vor dem Klick vor sich hatte, in derselben
  // Reihenfolge. Alles andere waere eine Tabelle, die richtig aussieht und
  // etwas anderes zeigt.
  const adresse = new URL(request.url);
  const ansicht = leseAnsicht(
    (name) => adresse.searchParams.get(name) ?? ""
  );

  let antraege;
  try {
    antraege = await alleAntraege(alsFilter(ansicht));
  } catch {
    return new NextResponse("Die Datenbank antwortet nicht", { status: 500 });
  }
  antraege = angezeigteFaelle(antraege, ansicht, new Date());

  const zeilen = [SPALTEN.map(zelle).join(TRENNER)];
  for (const antrag of antraege) {
    const gehaelter = gehaltsliste(antrag);
    zeilen.push(
      [
        new Date(antrag.eingang).toLocaleString("de-DE"),
        findeStation(antrag.status)?.name ?? antrag.status,
        antrag.vorname,
        antrag.nachname,
        antrag.email,
        [antrag.telefonVorwahl, antrag.telefon].filter(Boolean).join(" "),
        antrag.plz,
        antrag.ort,
        antrag.kreditart
          ? (findeKreditartNachId(antrag.kreditart)?.de.name ?? "")
          : "",
        antrag.amount,
        antrag.months,
        antrag.wiedervorlage ?? "",
        // Verkuerzt, nicht vollstaendig. Eine Tabelle wandert per Mail weiter,
        // liegt im Downloads-Ordner und wird herumgereicht — die
        // vollstaendige Bankverbindung gehoert in die Fallakte, wo das
        // Ansehen nachvollziehbar bleibt, nicht in eine Datei ohne Gedaechtnis.
        ibanVerkuerzt(antrag.iban),
        antrag.bankname,
        antrag.beschaeftigungsart,
        antrag.zweitePerson
          ? [antrag.zweitePerson.vorname, antrag.zweitePerson.nachname]
              .filter(Boolean)
              .join(" ")
          : "",
        gehaelter[0] ?? "",
        gehaelter[1] ?? "",
        gehaelter[2] ?? "",
        niedrigstesGehalt(antrag) ?? "",
        schrittName(antrag.erreichterSchritt) ?? "",
      ]
        .map(zelle)
        .join(TRENNER)
    );
  }

  const tag = new Date().toISOString().slice(0, 10);
  return new NextResponse(BOM + zeilen.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="crm-faelle-${tag}.csv"`,
      // Nicht zwischenspeichern: Die Datei enthaelt Kundendaten und wechselt
      // mit jedem neuen Fall.
      "Cache-Control": "no-store",
    },
  });
}
