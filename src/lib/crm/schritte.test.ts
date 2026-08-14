import test from "node:test";
import assert from "node:assert/strict";
import type { Antrag } from "./antraege";
import { absprungVerteilung, SCHRITTE, schrittName } from "./antraege";

/**
 * Tests des erreichten Schritts.
 *
 * Der Punkt, auf den es hier ankommt: "unbekannt" darf nicht zu "Schritt 1"
 * werden. Faelle von vor dieser Aenderung haben keine Angabe, und wenn die
 * unter den ersten Schritt gezaehlt wird, zeigt die Auswertung eine Spitze am
 * Anfang der Strecke, die es nie gab — und jemand faengt an, ein Problem zu
 * loesen, das nicht existiert.
 *
 *   npm test
 */

function fall(erreichterSchritt: number | null, id = "x"): Antrag {
  return { id, erreichterSchritt } as Antrag;
}

test("der Name eines Schritts", () => {
  assert.equal(schrittName(1), "Schritt 1 (Kreditart)");
  assert.equal(schrittName(6), "Schritt 6 (Beruf)");
  assert.equal(schrittName(SCHRITTE.length), "Schritt 8 (Bankverbindung)");
});

test("was kein Schritt ist, bekommt keinen Namen", () => {
  assert.equal(schrittName(null), null);
  assert.equal(schrittName(0), null);
  assert.equal(schrittName(9), null);
  assert.equal(schrittName(-3), null);
});

test("die Verteilung zählt je Schritt und steht in der Reihenfolge der Strecke", () => {
  const faelle = [
    fall(6, "a"),
    fall(4, "b"),
    fall(6, "c"),
    fall(8, "d"),
    fall(6, "e"),
  ];
  assert.deepEqual(absprungVerteilung(faelle), [
    { schritt: 4, anzahl: 1 },
    { schritt: 6, anzahl: 3 },
    { schritt: 8, anzahl: 1 },
  ]);
});

test("Fälle ohne Angabe stehen am Ende und nicht bei Schritt 1", () => {
  const faelle = [fall(null, "alt"), fall(1, "neu"), fall(null, "alt2")];
  const verteilung = absprungVerteilung(faelle);
  assert.deepEqual(verteilung, [
    { schritt: 1, anzahl: 1 },
    { schritt: null, anzahl: 2 },
  ]);
  // Und die Zahl bei Schritt 1 ist wirklich nur der eine Fall, der dort war.
  assert.equal(verteilung[0].anzahl, 1);
});

test("eine leere Liste ergibt eine leere Verteilung", () => {
  assert.deepEqual(absprungVerteilung([]), []);
});
