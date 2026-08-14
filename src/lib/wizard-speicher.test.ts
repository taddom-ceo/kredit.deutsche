import test from "node:test";
import assert from "node:assert/strict";
import type { WizardData } from "./wizard-context";
import {
  liesStand,
  seitdem,
  sichereStand,
  verwirfStand,
} from "./wizard-speicher";

/**
 * Tests der Ablage im Browser.
 *
 * Zwei Dinge muessen hier stimmen, und beide sind keine Geschmacksfrage:
 *
 *   · Die Bankverbindung darf nicht auf der Platte landen. Ein Test dafuer,
 *     weil es die Art von Zusage ist, die beim naechsten Umbau still
 *     verlorengeht — ein Feld umbenannt, und die IBAN liegt wieder drin.
 *   · Ein abgelaufener oder kaputter Eintrag muss null ergeben und
 *     verschwinden, nicht die Strecke anhalten.
 *
 * `localStorage` gibt es in Node nicht. Der Ersatz unten ist die kleinste
 * Nachbildung, die reicht — mehr braucht dieser Test nicht, und ein Paket
 * dafuer waere ein Paket zu viel.
 *
 *   npm test
 */

class Speicher {
  private daten = new Map<string, string>();
  getItem(k: string) {
    return this.daten.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.daten.set(k, v);
  }
  removeItem(k: string) {
    this.daten.delete(k);
  }
  get eintraege() {
    return this.daten.size;
  }
}

function stelleBrowser(): Speicher {
  const speicher = new Speicher();
  (globalThis as { window?: unknown }).window = { localStorage: speicher };
  return speicher;
}

function stand(aenderung: Partial<WizardData> = {}): WizardData {
  return {
    step: 6,
    maxStep: 6,
    vorname: "Anna",
    nachname: "Muster",
    email: "anna@example.de",
    nettoeinkommen: "2850",
    iban: "DE89 3704 0044 0532 0130 00",
    kontoinhaber: "Anna Muster",
    bankname: "Commerzbank",
    kredite: [
      { art: "Autokredit", betrag: "8000", iban: "DE02 1203 0000 0000 2020 51" },
    ],
    ...aenderung,
  } as unknown as WizardData;
}

test("die Bankverbindung wird nicht abgelegt", () => {
  const speicher = stelleBrowser();
  sichereStand(stand(), null);

  const roh = speicher.getItem("cresolu.antrag.stand") ?? "";
  assert.equal(roh.includes("0532 0130 00"), false, "IBAN im Speicher");
  // "Anna Muster" am Stueck steht nur im Kontoinhaber — der faellt weg. Vor-
  // und Nachname stehen getrennt und bleiben: Ohne sie waere die Ablage
  // sinnlos.
  assert.equal(roh.includes("Anna Muster"), false, "Kontoinhaber im Speicher");

  const gelesen = liesStand();
  assert.equal(gelesen?.stand.vorname, "Anna");
  assert.equal(gelesen?.stand.nachname, "Muster");
  assert.equal(gelesen?.stand.nettoeinkommen, "2850");
  assert.equal(gelesen?.stand.iban, undefined);
  assert.equal(gelesen?.stand.kontoinhaber, undefined);
  // Der Name der Bank ist keine Bankverbindung und darf bleiben.
  assert.equal(gelesen?.stand.bankname, "Commerzbank");
});

test("auch die IBAN eines laufenden Kredits faellt heraus", () => {
  const speicher = stelleBrowser();
  sichereStand(stand(), null);
  assert.equal(
    (speicher.getItem("cresolu.antrag.stand") ?? "").includes("2020 51"),
    false
  );
  const gelesen = liesStand();
  assert.equal(gelesen?.stand.kredite?.[0].iban, "");
  // Der Rest des Eintrags bleibt stehen.
  assert.equal(gelesen?.stand.kredite?.[0].betrag, "8000");
});

test("der Schritt und die Fallkennung kommen zurueck", () => {
  stelleBrowser();
  sichereStand(stand(), "abc-123");
  const gelesen = liesStand();
  assert.equal(gelesen?.stand.step, 6);
  assert.equal(gelesen?.stand.maxStep, 6);
  // Ohne die Kennung legte ein Neuladen einen zweiten Fall im CRM an.
  assert.equal(gelesen?.antragId, "abc-123");
});

test("nach sieben Tagen ist der Stand weg", () => {
  const speicher = stelleBrowser();
  sichereStand(stand(), null);

  const roh = JSON.parse(speicher.getItem("cresolu.antrag.stand")!);
  roh.gesichert = new Date(Date.now() - 8 * 86_400_000).toISOString();
  speicher.setItem("cresolu.antrag.stand", JSON.stringify(roh));

  assert.equal(liesStand(), null);
  // Und der abgelaufene Eintrag wird gleich aufgeraeumt.
  assert.equal(speicher.eintraege, 0);
});

test("kurz vor Ablauf ist er noch da", () => {
  const speicher = stelleBrowser();
  sichereStand(stand(), null);
  const roh = JSON.parse(speicher.getItem("cresolu.antrag.stand")!);
  roh.gesichert = new Date(Date.now() - 6 * 86_400_000).toISOString();
  speicher.setItem("cresolu.antrag.stand", JSON.stringify(roh));
  assert.notEqual(liesStand(), null);
});

test("Unlesbares ergibt null und wird weggeraeumt", () => {
  const speicher = stelleBrowser();
  speicher.setItem("cresolu.antrag.stand", "{kaputt");
  assert.equal(liesStand(), null);
  assert.equal(speicher.eintraege, 0);
});

test("eine aeltere Fassung wird nicht gelesen", () => {
  const speicher = stelleBrowser();
  speicher.setItem(
    "cresolu.antrag.stand",
    JSON.stringify({ fassung: 0, gesichert: new Date().toISOString(), stand: {} })
  );
  assert.equal(liesStand(), null);
});

test("verwerfen loescht", () => {
  const speicher = stelleBrowser();
  sichereStand(stand(), null);
  assert.equal(speicher.eintraege, 1);
  verwirfStand();
  assert.equal(speicher.eintraege, 0);
  assert.equal(liesStand(), null);
});

test("ohne Browser geschieht nichts", () => {
  delete (globalThis as { window?: unknown }).window;
  assert.doesNotThrow(() => sichereStand(stand(), null));
  assert.equal(liesStand(), null);
  assert.doesNotThrow(() => verwirfStand());
});

test("wie lange es her ist, in Worten", () => {
  const jetzt = new Date("2026-08-14T12:00:00Z");
  const vor = (ms: number) => new Date(jetzt.getTime() - ms);
  assert.equal(seitdem(vor(30_000), jetzt), "gerade eben");
  assert.equal(seitdem(vor(25 * 60_000), jetzt), "vor 25 Minuten");
  assert.equal(seitdem(vor(3 * 3_600_000), jetzt), "vor 3 Stunden");
  assert.equal(seitdem(vor(1 * 3_600_000), jetzt), "vor 1 Stunde");
  assert.equal(seitdem(vor(30 * 3_600_000), jetzt), "gestern");
  assert.equal(seitdem(vor(4 * 86_400_000), jetzt), "vor 4 Tagen");
  assert.match(seitdem(vor(20 * 86_400_000), jetzt), /^am \d{2}\.\d{2}\.$/);
});
