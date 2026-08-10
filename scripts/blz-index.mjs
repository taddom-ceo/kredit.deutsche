#!/usr/bin/env node
/**
 * Baut das Verzeichnis: Bankleitzahl → Name der Bank.
 *
 * Eine deutsche IBAN trägt die Bankleitzahl in sich — Stelle 5 bis 12, direkt
 * hinter "DE" und der Prüfziffer. Wer seine IBAN eintippt, hat den Namen
 * seiner Bank damit schon gesagt; er muss nur nachgeschlagen werden.
 *
 * Aufruf:
 *   npm run blz:index
 *
 * ------------------------------------------------------------------
 * Woher die Daten kommen:
 *
 * Aus dem Paket `bankdata-germany`, das die Bankleitzahlendatei der Deutschen
 * Bundesbank aufbereitet. Nicht direkt von der Bundesbank, weil deren Datei
 * vierteljährlich unter einer neuen Adresse erscheint — ein Skript, das sie
 * selbst holt, ginge beim übernächsten Quartal ins Leere. Das Paket wird
 * gepflegt und trägt seine Fassung im Versionsnamen.
 *
 * Es liegt als Entwicklungsabhängigkeit vor und wird nicht mitgeliefert: Die
 * fertigen Bündel unter public/blz sind alles, was die Seite braucht. Der
 * ganze Datensatz wäre sonst im Browser-Bündel gelandet, 136 KB für einen
 * einzigen Nachschlag.
 *
 * Die kommende Fassung wird eingerechnet, die Abgänge nicht. Das Paket führt
 * neben den heute gültigen Leitzahlen die Änderungen des nächsten Quartals.
 * Eine Bank, die demnächst hinzukommt, wird so ein paar Wochen früher erkannt;
 * eine, die demnächst wegfällt, bleibt erkannt, solange sie gültig ist — und
 * darüber hinaus, bis dieses Skript wieder läuft. Beide Abweichungen betreffen
 * einen Vorschlag, den der Antragsteller überschreiben kann.
 *
 * ------------------------------------------------------------------
 * Warum nach den ersten ZWEI Ziffern gebündelt:
 *
 * Die Bankleitzahl ist nach Regionen vergeben, die ersten beiden Ziffern sind
 * der Bereich. Das ergibt 77 Bündel, im Median 1,2 KB, das größte 12 KB.
 * Geladen wird immer nur eines. Eine einzige Datei wären 136 KB — viel für
 * eine Auskunft, die aus einer Zeile besteht.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const hier = dirname(fileURLToPath(import.meta.url));
const ziel = join(hier, "..", "public", "blz");
const lade = createRequire(import.meta.url);

/* Die Rohdaten des Pakets, nicht seine Abfragefunktionen: Gebraucht wird die
   ganze Liste, und die gibt es nur so. Das Paket gibt seine Datendateien nicht
   frei (`exports` lässt nur den Haupteinstieg zu), deshalb werden sie neben
   dem Haupteinstieg gelesen. Der Pfad ist damit an den inneren Aufbau des
   Pakets gebunden — ändert er sich, bricht dieses Skript sichtbar und nicht
   die Seite. */
const paketOrdner = join(dirname(lade.resolve("bankdata-germany")), "..", "..");
const datenOrdner = join(paketOrdner, "dist", "cjs", "data");

function datei(name) {
  try {
    return JSON.parse(readFileSync(join(datenOrdner, name), "utf8"));
  } catch (fehler) {
    console.error(
      `Die Daten von bankdata-germany liegen nicht mehr unter ${datenOrdner}.\n` +
        `Bitte im Paket nachsehen, wo current.json und next.json jetzt stehen.\n` +
        String(fehler)
    );
    process.exit(1);
  }
}

const aktuell = datei("current.json");
const naechst = datei("next.json");

/** Bankleitzahl → Name. Der Datensatz führt daneben die BIC; die braucht hier
    niemand, und weggelassen ist sie die Hälfte der Größe. */
const verzeichnis = {};
for (const [blz, [name]] of Object.entries({
  ...aktuell,
  ...naechst.upsert,
})) {
  if (typeof blz === "string" && /^\d{8}$/.test(blz) && name) {
    verzeichnis[blz] = name;
  }
}

const buendel = new Map();
for (const [blz, name] of Object.entries(verzeichnis)) {
  const bund = blz.slice(0, 2);
  if (!buendel.has(bund)) buendel.set(bund, {});
  buendel.get(bund)[blz] = name;
}

rmSync(ziel, { recursive: true, force: true });
mkdirSync(ziel, { recursive: true });

const groessen = [];
for (const [bund, inhalt] of [...buendel].sort(([a], [b]) => a.localeCompare(b))) {
  // Sortiert, damit dieselben Daten dieselbe Datei ergeben — sonst wechselt
  // bei jedem Lauf die Reihenfolge und der Unterschied im Repository ist
  // riesig, obwohl sich nichts geändert hat.
  const geordnet = {};
  for (const blz of Object.keys(inhalt).sort()) geordnet[blz] = inhalt[blz];
  const text = JSON.stringify(geordnet);
  writeFileSync(join(ziel, `${bund}.json`), text);
  groessen.push(text.length);
}

groessen.sort((a, b) => a - b);
const median = groessen[Math.floor(groessen.length / 2)];
const gesamt = groessen.reduce((a, b) => a + b, 0);

console.log(`Bankleitzahlen: ${Object.keys(verzeichnis).length}`);
console.log(`  davon aus der kommenden Fassung: ${Object.keys(naechst.upsert).length}`);
console.log(
  `Stand des Pakets: ${JSON.parse(readFileSync(join(paketOrdner, "package.json"), "utf8")).version}`
);
console.log(
  `Dateien: ${buendel.size} · Median ${(median / 1024).toFixed(1)} KB · ` +
    `größte ${(groessen[groessen.length - 1] / 1024).toFixed(0)} KB · ` +
    `zusammen ${(gesamt / 1024).toFixed(0)} KB`
);
console.log(`Geschrieben nach public/blz/`);
