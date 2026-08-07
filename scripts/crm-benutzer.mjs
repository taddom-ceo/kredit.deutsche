#!/usr/bin/env node
/**
 * Legt ein CRM-Konto an und gibt die Zeile aus, die in die Umgebung gehoert.
 *
 * Solange keine Datenbank steht, ist das der Weg, Konten zu verwalten — und
 * zwar bewusst als Skript und nicht als Selbstregistrierung: Wer ins CRM
 * darf, entscheidet ein Mensch mit Zugriff auf die Umgebungsvariablen.
 *
 * Aufruf:
 *   npm run crm:benutzer -- --name crm_admin --rolle admin
 *   npm run crm:benutzer -- --name lena --rolle berater --anzeigename "Lena Vogt"
 *
 * Das Passwort wird abgefragt, wenn es nicht als --passwort mitgegeben wird.
 * Auf der Kommandozeile landet es in der Verlaufsdatei der Shell — bei einem
 * echten Konto also besser eingeben lassen.
 *
 * Ein vorhandenes CRM_BENUTZER aus der Umgebung wird uebernommen und
 * ergaenzt; ein gleicher Name wird ersetzt.
 */
import { randomBytes } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { hashePasswort } from "../src/lib/crm/passwort.ts";

const ROLLEN = ["admin", "berater", "lesen"];

function argumente(argv) {
  const werte = {};
  for (let i = 0; i < argv.length; i += 1) {
    const teil = argv[i];
    if (!teil.startsWith("--")) continue;
    const schluessel = teil.slice(2);
    const naechster = argv[i + 1];
    if (naechster && !naechster.startsWith("--")) {
      werte[schluessel] = naechster;
      i += 1;
    } else {
      werte[schluessel] = "true";
    }
  }
  return werte;
}

function abbrechen(meldung) {
  console.error(`Fehler: ${meldung}`);
  process.exit(1);
}

/**
 * Passwort abfragen. Die Eingabe ist dabei auf dem Bildschirm zu sehen — das
 * Verstecken der Eingabe waere hier mehr Bastelei als Nutzen. Wer in einer
 * geteilten Sitzung arbeitet, gibt das Passwort besser ueber eine Pipe:
 *   echo 'Passwort' | npm run crm:benutzer -- --name lena --rolle berater
 *
 * Die Ausgabe geht auf stderr, damit sich die eigentliche Ausgabe des Skripts
 * weiterhin sauber in eine Datei umleiten laesst.
 */
async function passwortEinlesen() {
  const leser = createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  const wert = await leser.question("Passwort: ");
  leser.close();
  return wert.trim();
}

const args = argumente(process.argv.slice(2));

const name = (args.name ?? "").trim();
if (!/^[a-zA-Z0-9._-]{3,32}$/.test(name)) {
  abbrechen(
    "--name fehlt oder ist unzulaessig (3 bis 32 Zeichen, Buchstaben, Ziffern, . _ -)"
  );
}

const rolle = args.rolle ?? "admin";
if (!ROLLEN.includes(rolle)) {
  abbrechen(`--rolle muss eine von ${ROLLEN.join(", ")} sein`);
}

const anzeigename = (args.anzeigename ?? name).trim();

const passwort = args.passwort ?? (await passwortEinlesen());
if (passwort.length < 8) {
  abbrechen("Das Passwort muss mindestens 8 Zeichen haben");
}

// Vorhandene Konten uebernehmen, damit ein zweites Konto das erste nicht
// stillschweigend loescht.
let bestand = [];
if (process.env.CRM_BENUTZER) {
  try {
    const gelesen = JSON.parse(process.env.CRM_BENUTZER);
    if (Array.isArray(gelesen)) bestand = gelesen;
  } catch {
    abbrechen(
      "CRM_BENUTZER steht in der Umgebung, ist aber kein gueltiges JSON — bitte erst berichtigen"
    );
  }
}

const eintrag = {
  name,
  anzeigename,
  rolle,
  passwort: await hashePasswort(passwort),
};

const liste = [
  ...bestand.filter((b) => b?.name?.toLowerCase() !== name.toLowerCase()),
  eintrag,
];

const ersetzt = liste.length === bestand.length;

console.log("");
console.log(
  `${ersetzt ? "Ersetzt" : "Angelegt"}: ${name} (${anzeigename}, ${rolle})`
);
console.log("");
console.log("In .env.local und in die Projekteinstellungen bei Vercel:");
console.log("");
console.log(`CRM_BENUTZER=${JSON.stringify(liste)}`);

if (!process.env.CRM_SESSION_SECRET) {
  console.log("");
  console.log(
    "Dazu ein Sitzungsgeheimnis — ohne das ist keine Anmeldung moeglich:"
  );
  console.log("");
  console.log(`CRM_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
}

console.log("");
