// Straßenverzeichnis je Postleitzahl.
// Quelle: OpenStreetMap, aufbereitet über openpotato/openplzapi.data (ODbL).
// Die Daten liegen als statische Bündel unter /public/streets, gruppiert nach
// den ersten drei Ziffern der Postleitzahl, damit pro Eingabe nur wenige
// Kilobyte geladen werden statt des gesamten Verzeichnisses.

export function streetChunkUrl(plz: string) {
  return `/streets/${plz.slice(0, 3)}.json`;
}

// Vergleichsform eines Straßennamens.
//
// Nötig, weil die Quelldaten "straße" grundsätzlich zu "str." kürzen, während
// Antragsteller sie ausschreiben. Ohne diese Angleichung würde ausgerechnet
// die natürliche Schreibweise "Invalidenstraße" gegen den Datenbestand
// "Invalidenstr." als unbekannt gelten. Zusätzlich fallen Groß-/Klein-
// schreibung, Punkte, Bindestriche und Leerzeichen weg.
export function normalizeStreet(value: string) {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/strasse/g, "str")
    .replace(/[^a-z0-9äöü]/g, "");
}

export function streetMatches(input: string, known: string[]) {
  const needle = normalizeStreet(input);
  if (needle === "") return false;
  return known.some((street) => normalizeStreet(street) === needle);
}
