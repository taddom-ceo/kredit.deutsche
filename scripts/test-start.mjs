/**
 * Hängt den Auflöser aus test-pfade.mjs ein, bevor die Tests geladen werden.
 *
 * Zwei Dateien statt einer, weil Node es so verlangt: Die Haken laufen in
 * einem eigenen Thread und müssen deshalb als eigene Datei angemeldet werden.
 */
import { register } from "node:module";

register("./test-pfade.mjs", import.meta.url);
