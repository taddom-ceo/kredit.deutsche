import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Der Passwortzaun deckt die ganze Seite ab — und soll das bleiben.
 *
 * Das Muster in `config.matcher` ist eine Ausschlussliste: geschuetzt ist
 * alles, was nicht ausdruecklich ausgenommen ist. Diese Richtung ist die
 * sichere, denn eine neue Seite ist damit von selbst geschuetzt, statt
 * vergessen zu werden. Nur faellt genau deshalb auch nicht auf, wenn jemand
 * die Ausnahmeliste erweitert: Die Seite laedt danach munter weiter, sie ist
 * bloss offen.
 *
 * Dieser Test liest das Muster aus dem Quelltext und prueft, welche Adressen
 * es trifft. Gelesen und nicht importiert, weil `proxy.ts` `next/server`
 * hereinzieht und mit dem `@/`-Kuerzel arbeitet — beides braucht der
 * Testlaeufer nicht zu koennen, um eine Zeichenkette zu pruefen. Und das
 * Muster muss dort woertlich stehen bleiben: Next liest es beim Bauen
 * statisch aus und kann keinem Aufruf und keiner Konstante folgen.
 *
 *   npm test
 */

const QUELLE = new URL("./proxy.ts", import.meta.url);

/** Das Muster aus `config.matcher`, so wie Next es sieht. */
function muster(): RegExp {
  const text = readFileSync(QUELLE, "utf8");
  const treffer = text.match(/matcher:\s*\[\s*"([^"]+)"/);
  assert.ok(treffer, "config.matcher nicht gefunden — steht es noch in proxy.ts?");
  // Next setzt das Muster als vollstaendigen Pfadausdruck ein.
  return new RegExp(`^${treffer[1]}$`);
}

/**
 * Jede Adresse der Seite, die hinter dem Passwort liegen muss.
 *
 * Neue Seiten gehoeren hier dazu. Nicht, weil der Zaun sie sonst nicht
 * traefe — er trifft alles —, sondern damit dieser Test es merkt, falls die
 * Ausnahmeliste eines Tages zu weit wird.
 */
const GESCHUETZT = [
  "/",
  "/v2",
  "/v2-1",
  "/antrag",
  "/angebote",
  "/rechner",
  "/kredit",
  "/kredit/umschuldung",
  "/impressum",
  "/datenschutz",
  "/crm",
  "/crm/antrag/11111111-1111-4111-8111-111111111111",
  "/crm/protokoll",
  "/api/antraege",
  "/api/crm-export",
  "/api/crm-login",
  "/api/plz",
];

/**
 * Was ausgenommen sein muss, damit die Anmeldung ueberhaupt stattfinden kann.
 *
 * Mehr als diese Liste darf offen sein — jede weitere Zeile hier ist ein
 * Stueck Seite, das ohne Passwort erreichbar ist.
 */
const OFFEN = [
  "/login",
  "/api/site-login",
  "/_next/static/chunk.js",
  "/_next/image",
  "/favicon.ico",
  "/sitemap.xml",
  "/robots.txt",
];

test("der Passwortzaun deckt jede Seite ab", () => {
  const zaun = muster();
  for (const pfad of GESCHUETZT) {
    assert.equal(
      zaun.test(pfad),
      true,
      `${pfad} liegt nicht hinter dem Seitenpasswort`
    );
  }
});

test("nur die Anmeldung selbst steht offen", () => {
  const zaun = muster();
  for (const pfad of OFFEN) {
    assert.equal(zaun.test(pfad), false, `${pfad} sollte ausgenommen sein`);
  }
});

test("ohne SITE_PASSWORD kommt niemand durch", async () => {
  // Der Zaun haengt an `expectedGateToken()`: Ohne gesetztes Passwort gibt es
  // keinen gueltigen Cookie-Wert, und der Vergleich im Proxy kann nicht
  // aufgehen. Eine fehlende Konfiguration darf die Tuer nicht oeffnen.
  const vorher = process.env.SITE_PASSWORD;
  delete process.env.SITE_PASSWORD;
  const { expectedGateToken, checkPassword } = await import("./lib/site-gate");
  assert.equal(expectedGateToken(), null);
  assert.equal(checkPassword(""), false);
  assert.equal(checkPassword("irgendwas"), false);
  if (vorher !== undefined) process.env.SITE_PASSWORD = vorher;
});
