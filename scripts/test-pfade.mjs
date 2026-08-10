/**
 * Auflöser für die Tests: hängt an relative Importe die Endung an.
 *
 * Der Quelltext des Projekts importiert ohne Endung — `./antraege`, nicht
 * `./antraege.ts`. Das ist die Schreibweise, die Next erwartet, und sie soll
 * nicht wegen der Tests geändert werden. Node dagegen löst ESM-Importe streng
 * auf und findet ohne Endung nichts.
 *
 * Diese Haken schließen genau diese Lücke: Trifft ein relativer Import ohne
 * Endung auf keine Datei, wird `.ts` und `.tsx` probiert. Alles andere geht
 * unverändert an die nächste Stufe.
 *
 * Eingehängt wird das über scripts/test-start.mjs, siehe `npm test`.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ENDUNGEN = [".ts", ".tsx", "/index.ts"];

export async function resolve(spezifizierer, kontext, naechster) {
  const relativ = spezifizierer.startsWith("./") || spezifizierer.startsWith("../");
  const hatEndung = /\.[cm]?[jt]sx?$/.test(spezifizierer);

  if (relativ && !hatEndung && kontext.parentURL) {
    for (const endung of ENDUNGEN) {
      const kandidat = new URL(spezifizierer + endung, kontext.parentURL);
      if (existsSync(fileURLToPath(kandidat))) {
        return naechster(spezifizierer + endung, kontext);
      }
    }
  }

  return naechster(spezifizierer, kontext);
}
