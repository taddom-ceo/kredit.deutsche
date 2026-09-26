import Startseite from "@/components/Startseite";

/**
 * Die Startseite.
 *
 * Der Inhalt steht in `src/components/Startseite.tsx`; hier liegt nur die
 * Adresse. Dadurch bleibt diese Datei ein Serverbauteil und kann eigene
 * Angaben fuer die Vorschau setzen, waehrend die Seite selbst ihren
 * Sprachumschalter behaelt.
 */
export default function Home() {
  return <Startseite />;
}
