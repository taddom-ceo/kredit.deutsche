import Startseite from "@/components/Startseite";

/**
 * Fassung 1 — der Stand von heute, unveraendert.
 *
 * Die Seite selbst steht in `src/components/Startseite.tsx`; hier liegt nur
 * noch die Adresse. Dadurch kann diese Datei ein Serverbauteil bleiben und
 * spaeter eigene Angaben fuer die Vorschau setzen, waehrend die Seite ihren
 * Sprachumschalter behaelt.
 */
export default function Home() {
  return <Startseite fassung="v1" />;
}
