/**
 * Von der IBAN zum Namen der Bank.
 *
 * Eine deutsche IBAN ist zusammengesetzt: "DE", zwei Prüfziffern, dann die
 * achtstellige Bankleitzahl, dann die zehnstellige Kontonummer. Die
 * Bankleitzahl steht also schon da, sobald zwölf Zeichen getippt sind — der
 * Name der Bank muss nicht noch einmal erfragt werden.
 *
 * Das Verzeichnis liegt unter public/blz, gebündelt nach den ersten beiden
 * Ziffern (siehe scripts/blz-index.mjs). Geladen wird immer nur das eine
 * Bündel, im Median 1,2 KB.
 *
 * Nur für deutsche IBANs. Andere Länder bauen ihre IBAN anders auf; dort steht
 * an derselben Stelle etwas anderes, und ein Nachschlag in einem deutschen
 * Verzeichnis brächte im besten Fall nichts und im schlechteren den Namen
 * einer Bank, mit der der Antragsteller nichts zu tun hat.
 */

/**
 * Die Bankleitzahl aus einer IBAN — oder null.
 *
 * Kommt mit unfertigen Eingaben zurecht: Es zählt nur, dass die ersten zwölf
 * Zeichen dastehen. Wer noch bei der Kontonummer ist, hat die Bankleitzahl
 * längst vollständig getippt, und auf die letzte Ziffer der Kontonummer zu
 * warten hieße, den Namen erst dann zu zeigen, wenn niemand mehr hinsieht.
 */
export function blzAusIban(iban: string): string | null {
  const sauber = iban.replace(/\s+/g, "").toUpperCase();
  if (!sauber.startsWith("DE")) return null;
  const blz = sauber.slice(4, 12);
  return /^\d{8}$/.test(blz) ? blz : null;
}

/** Die Adresse des Bündels, in dem diese Bankleitzahl steht. */
export function blzBundUrl(blz: string): string {
  return `/blz/${blz.slice(0, 2)}.json`;
}

/** Der Name zur Bankleitzahl, oder null, wenn sie nicht vergeben ist. */
export function bankZuBlz(
  bund: Record<string, string>,
  blz: string
): string | null {
  return bund[blz] ?? null;
}
