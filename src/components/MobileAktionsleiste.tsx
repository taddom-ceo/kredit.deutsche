"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { ANBIETER } from "@/lib/anbieter";

/**
 * Feste Leiste am unteren Rand — nur auf dem Handy.
 *
 * Auf dem Handy ist die Kopfzeile nach dem ersten Wischen weg, und der Weg zum
 * Anruf oder zum Antrag fuehrt ueber ein Menue, das erst geoeffnet werden
 * muss. Die beiden Wege, die wirklich zaehlen, stehen deshalb dauerhaft
 * unten: anrufen oder anfangen.
 *
 * Am PC gibt es sie nicht. Dort steht die Kopfzeile mit derselben
 * Schaltflaeche ohnehin im Bild, sobald man nach oben scrollt, und eine Leiste
 * am unteren Rand eines 1440 Pixel breiten Fensters saehe aus wie ein
 * Bedienfehler.
 *
 * ---------------------------------------------------------------------
 * Die Telefonnummer
 *
 * "Anrufen" erscheint nur, wenn in `src/lib/anbieter.ts` eine Nummer steht.
 * Ein `tel:`-Verweis ohne Nummer oeffnet das Waehlfeld leer — das ist
 * schlimmer als keine Schaltflaeche, weil es wie ein Fehler der Seite
 * aussieht und nicht wie eine fehlende Angabe. Solange nichts eingetragen
 * ist, nimmt "Anfrage starten" die ganze Breite ein.
 *
 * Anders als im Impressum steht hier kein sichtbarer Hinweis auf die fehlende
 * Angabe: Das Impressum richtet sich an den Betreiber und an die Aufsicht,
 * diese Leiste an den Kunden.
 */

/**
 * Wo die Leiste nichts zu suchen hat.
 *
 * In der Antragsstrecke und in der Angebotsliste ist die Anfrage bereits
 * gestartet — "Anfrage starten" waere dort ein Rueckschritt, und die Leiste
 * laege ausserdem ueber dem Weiter-Knopf, den die Strecke selbst unten
 * fuehrt.
 */
const OHNE_LEISTE = ["/antrag", "/angebote"];

/** Was in einem `tel:`-Verweis stehen darf: Ziffern, Plus, sonst nichts. */
function telNummer(roh: string): string {
  return roh.replace(/[^\d+]/g, "");
}

export default function MobileAktionsleiste() {
  const { t } = useLanguage();
  const n = t.navigation;
  const pfad = usePathname();
  const nummer = telNummer(ANBIETER.telefon);

  if (OHNE_LEISTE.includes(pfad)) return null;

  return (
    <>
      <nav
        aria-label={n.schnellzugriff}
        // z-40 haelt sie unter dem geoeffneten Hauptmenue (z-30 am Header,
        // aber das klappt nach unten auf und beginnt oben), und ueber dem
        // Seiteninhalt. Der Sicherheitsabstand unten ist fuer die Geraete mit
        // Gestenbalken — ohne ihn liegt die Leiste darunter.
        className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom,0px)]"
      >
        <div className="flex items-stretch gap-2 px-3 py-2.5">
          {nummer && (
            <a
              href={`tel:${nummer}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border border-border-strong bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-200 active:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0 text-accent"
              >
                <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
              </svg>
              {n.anrufen}
            </a>
          )}
          <Link
            href="/antrag"
            className="flex flex-[1.4] items-center justify-center gap-2 rounded-[14px] bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-[0_8px_24px_-8px_rgba(52,211,153,0.6)] transition-colors duration-200 active:bg-accent-strong focus-visible:ring-2 focus-visible:ring-white"
          >
            {n.anfrageStarten}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>

      {/* Platzhalter in der normalen Anordnung: Die Leiste schwebt und nimmt
          deshalb keinen Platz ein — ohne diesen Block lägen die letzten Zeilen
          des Fußbereichs dauerhaft darunter. Die Höhe ist gemessen, nicht
          geschätzt: 2 x 0,625rem Innenabstand plus 3rem Schaltfläche. */}
      <div
        aria-hidden="true"
        className="md:hidden h-[calc(4.25rem+env(safe-area-inset-bottom,0px))]"
      />
    </>
  );
}
