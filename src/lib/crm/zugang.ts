import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  findeBenutzer,
  ohnePasswort,
  passwortKennung,
  type BenutzerAnzeige,
} from "./benutzer";
import { CRM_SITZUNG_COOKIE, sitzungLesen } from "./sitzung";

/**
 * Die verbindliche Zugriffspruefung.
 *
 * Der Zaun im Proxy schaut nur auf die Unterschrift des Cookies. Das ist
 * schnell und fuer eine Weiterleitung genug, aber es ist nicht die Stelle,
 * an der ueber Daten entschieden werden darf: Der Proxy laeuft vor dem
 * Rendern, und Server Actions oder Endpunkte koennen an ihm vorbeifuehren.
 *
 * Deshalb fragt jede Seite und jeder Endpunkt im CRM zusaetzlich hier nach —
 * so nah wie moeglich an den Daten. Erst hier wird geprueft, ob es das Konto
 * ueberhaupt noch gibt und ob sein Passwort seit der Anmeldung gewechselt hat.
 *
 * Nur aus Server-Komponenten, Server Actions und Endpunkten aufrufen. Das
 * Paket `server-only`, das genau diesen Irrtum zum Baufehler machen wuerde,
 * ist bewusst nicht installiert — dieses Projekt kommt ohne zusaetzliche
 * Abhaengigkeiten aus.
 */

/**
 * `cache` von React: Waehrend eines Renderdurchgangs fragen mehrere
 * Komponenten nach dem angemeldeten Konto. Ohne die Merkfunktion liefe die
 * Pruefung je Komponente erneut — spaetestens mit der Datenbank waere das
 * eine Abfrage pro Aufruf.
 */
export const angemeldeterBenutzer = cache(
  async (): Promise<BenutzerAnzeige | null> => {
    const speicher = await cookies();
    const sitzung = sitzungLesen(speicher.get(CRM_SITZUNG_COOKIE)?.value);
    if (!sitzung) return null;

    const benutzer = findeBenutzer(sitzung.benutzer);
    if (!benutzer) return null;

    // Passwort gewechselt oder Konto neu angelegt: Die alte Sitzung gilt
    // nicht mehr.
    if (passwortKennung(benutzer.passwort) !== sitzung.kennung) return null;

    // Ohne Passworthash hinaus. Von hier geht es weiter in Seiten, und von
    // dort schnell in eine Client-Komponente — was als Eigenschaft an eine
    // solche uebergeben wird, steht im ausgelieferten HTML. Der Hash darf
    // diese Datei deshalb gar nicht erst verlassen.
    //
    // Die Rolle kommt dabei aus dem Konto, nicht aus dem Cookie. Sonst
    // behielte eine herabgestufte Person ihre alten Rechte bis zum Ablauf.
    return ohnePasswort(benutzer);
  }
);

/**
 * Wie oben, leitet aber zur Anmeldung um, statt null zu liefern. Das ist der
 * uebliche Weg am Anfang einer CRM-Seite.
 */
export async function verlangeAnmeldung(
  ziel?: string
): Promise<BenutzerAnzeige> {
  const benutzer = await angemeldeterBenutzer();
  if (!benutzer) {
    // Zur gemeinsamen Maske: Sie traegt Seitenpasswort und CRM-Zugang und
    // blendet aus, was schon vorliegt.
    const nach = ziel ? `?from=${encodeURIComponent(ziel)}` : "";
    redirect(`/login${nach}`);
  }
  return benutzer;
}
