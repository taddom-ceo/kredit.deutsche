#!/usr/bin/env node
/**
 * Baut das Rückwärtsverzeichnis: Straßenname → Postleitzahlen.
 *
 * Das vorhandene Verzeichnis unter public/streets geht den anderen Weg — es
 * ordnet jeder Postleitzahl ihre Straßen zu. Das genügt, solange die
 * Postleitzahl zuerst eingegeben wird. Steht die Straße vorn, braucht es die
 * Umkehrung, und die lässt sich aus denselben Daten erzeugen.
 *
 * Aufruf:
 *   npm run plz:index
 *
 * ------------------------------------------------------------------
 * Zwei Entscheidungen, die die Größe bestimmen:
 *
 * Nach den ersten DREI Zeichen aufgeteilt. Alle drei Aufteilungen gemessen,
 * jeweils gepackt: Bei zwei Zeichen wären es 732 Dateien, aber das größte
 * Bündel 233 KB und jedes zehnte über 13 KB — zu viel für ein Adressfeld,
 * das jemand am Telefon ausfüllt. Bei vier Zeichen wären es 20.960 Dateien
 * im Repository. Drei Zeichen sind der Punkt dazwischen: 5.293 Dateien, im
 * Median 0,1 KB, neun von zehn unter 1 KB, nur das größte Bündel 95 KB.
 *
 * Namen in mehr als VIER Postleitzahlen fallen heraus. "Bismarckstraße" gibt
 * es in 518 Postleitzahlen, "Hohe Straße" in 454; eine Liste davon hilft
 * niemandem. Wer dort wohnt, tippt seine Postleitzahl eben selbst.
 *
 * Wie oft die Suche damit greift, ist die ehrliche Kennzahl — und sie ist
 * kleiner, als die Namensstatistik vermuten lässt. Von den 418.793
 * verschiedenen Namen bleiben 94,3 Prozent übrig, aber gerechnet über die
 * 1.165.126 tatsächlichen Straßen-Orte sind es nur 42,3 Prozent: Die
 * häufigen Namen decken eben viele Orte ab. Für gut vier von zehn Adressen
 * springt die Postleitzahl von selbst, für die übrigen bleibt alles beim
 * Alten. Wer sie eintippt, verliert nichts.
 */

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const hier = dirname(fileURLToPath(import.meta.url));
const quelle = join(hier, "..", "public", "streets");
const ziel = join(hier, "..", "public", "plz-index");

/** Höchstens so viele Postleitzahlen je Name — darüber ist der Name wertlos. */
const HOECHSTENS = 4;

/** Nach so vielen Zeichen wird gebündelt. */
const SCHERBE = 3;

/**
 * Der Dateiname eines Bündels.
 *
 * Die Vergleichsform behält Umlaute — "kröpelinerstr" bleibt so. Als
 * Dateiname taugt das schlecht: Ein Pfad mit Umlaut muss auf dem Weg durchs
 * Netz kodiert werden, und je nach Dateisystem steht das "ö" mal als ein
 * Zeichen, mal als zwei. Für den Namen der Datei werden sie deshalb
 * umgeschrieben; die Schlüssel darin bleiben unverändert.
 */
function bundName(vergleichsform) {
  return (vergleichsform + "___")
    .slice(0, SCHERBE)
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
}

/**
 * Dieselbe Vergleichsform wie `normalizeStreet` in src/lib/streets.ts.
 *
 * Sie steht hier ein zweites Mal, weil dieses Skript ohne TypeScript-Aufbau
 * laufen soll — dafür wird sie unten gegen ein paar bekannte Paare geprüft.
 * Läuft die eine Fassung der anderen davon, fällt es beim Erzeugen auf und
 * nicht erst im Formular.
 */
function vergleichsform(wert) {
  return wert
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/strasse/g, "str")
    .replace(/[^a-z0-9äöü]/g, "");
}

/* Kurze Selbstprüfung. Was hier nicht zusammenfällt, findet das Formular
   später auch nicht zusammen. */
const proben = [
  ["Invalidenstraße", "Invalidenstr."],
  ["Hohe Straße", "Hohe Str."],
  ["Kröpeliner Straße", "Kröpeliner Str."],
];
for (const [a, b] of proben) {
  if (vergleichsform(a) !== vergleichsform(b)) {
    console.error(`Vergleichsform stimmt nicht: "${a}" ≠ "${b}"`);
    process.exit(1);
  }
}

const verzeichnis = new Map();

for (const datei of readdirSync(quelle)) {
  if (!datei.endsWith(".json")) continue;
  const inhalt = JSON.parse(readFileSync(join(quelle, datei), "utf8"));
  for (const [plz, strassen] of Object.entries(inhalt)) {
    for (const strasse of strassen) {
      const schluessel = vergleichsform(strasse);
      if (!schluessel) continue;
      if (!verzeichnis.has(schluessel)) verzeichnis.set(schluessel, new Set());
      verzeichnis.get(schluessel).add(plz);
    }
  }
}

const scherben = new Map();
let behalten = 0;
let verworfen = 0;

for (const [name, plzs] of verzeichnis) {
  if (plzs.size > HOECHSTENS) {
    verworfen++;
    continue;
  }
  behalten++;
  const bund = bundName(name);
  if (!scherben.has(bund)) scherben.set(bund, {});
  // Sortiert, damit dieselben Daten dieselbe Datei ergeben — sonst wechselt
  // bei jedem Lauf die Reihenfolge und der Unterschied im Repository ist
  // riesig, obwohl sich nichts geändert hat.
  scherben.get(bund)[name] = [...plzs].sort();
}

rmSync(ziel, { recursive: true, force: true });
mkdirSync(ziel, { recursive: true });

let bytes = 0;
for (const [bund, inhalt] of [...scherben].sort(([a], [b]) => a.localeCompare(b))) {
  const geordnet = {};
  for (const name of Object.keys(inhalt).sort()) geordnet[name] = inhalt[name];
  const text = JSON.stringify(geordnet);
  writeFileSync(join(ziel, `${bund}.json`), text);
  bytes += text.length;
}

console.log(`Straßennamen gelesen: ${verzeichnis.size}`);
console.log(
  `  aufgenommen: ${behalten} · übergangen (mehr als ${HOECHSTENS} PLZ): ${verworfen}`
);
console.log(
  `Dateien: ${scherben.size} · zusammen ${(bytes / 1024 / 1024).toFixed(1)} MB`
);
console.log(`Geschrieben nach public/plz-index/`);
