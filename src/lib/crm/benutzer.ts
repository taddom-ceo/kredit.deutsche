import { createHash } from "crypto";

/**
 * Die CRM-Konten.
 *
 * Bis die Datenbank steht, stehen sie in der Umgebungsvariable
 * `CRM_BENUTZER` — als JSON-Liste, angelegt mit `npm run crm:benutzer`.
 * Absichtlich nicht im Quelltext: Ein Passworthash gehoert in kein
 * oeffentliches Verzeichnis, auch kein gehashter.
 *
 * Diese Datei ist die eine Stelle, die spaeter auf Postgres umgestellt wird.
 * Die Felder heissen deshalb schon so, wie die Spalten heissen werden, und
 * alles Weitere fragt nur ueber `findeBenutzer` nach — der Umbau bleibt damit
 * auf dieses Modul beschraenkt.
 */

export type Rolle = "admin" | "berater" | "lesen";

export const ROLLEN: Rolle[] = ["admin", "berater", "lesen"];

/** Was in der Oberflaeche neben der Rolle steht. */
export const ROLLEN_NAMEN: Record<Rolle, string> = {
  admin: "Administrator",
  berater: "Berater",
  lesen: "Nur Lesen",
};

export type Benutzer = {
  /** Anmeldename, klein geschrieben verglichen. */
  name: string;
  /** Name, der in der Oberflaeche und spaeter am Fallverlauf steht. */
  anzeigename: string;
  rolle: Rolle;
  /** Passwort in der Form aus `passwort.ts`. */
  passwort: string;
};

/** Nur die Felder, die weitergereicht werden duerfen — ohne Passworthash. */
export type BenutzerAnzeige = Pick<Benutzer, "name" | "anzeigename" | "rolle">;

export function ohnePasswort(benutzer: Benutzer): BenutzerAnzeige {
  return {
    name: benutzer.name,
    anzeigename: benutzer.anzeigename,
    rolle: benutzer.rolle,
  };
}

function istRolle(wert: unknown): wert is Rolle {
  return typeof wert === "string" && (ROLLEN as string[]).includes(wert);
}

/**
 * Konten aus der Umgebung lesen.
 *
 * Faellt bei jedem Fehler auf eine leere Liste zurueck — dann ist keine
 * Anmeldung moeglich. Das ist die richtige Richtung: Eine kaputte
 * Konfiguration darf die Tuer nicht oeffnen, sondern muss sie schliessen.
 */
export function alleBenutzer(): Benutzer[] {
  const roh = process.env.CRM_BENUTZER;
  if (!roh) return [];

  let gelesen: unknown;
  try {
    gelesen = JSON.parse(roh);
  } catch {
    console.error("CRM_BENUTZER ist kein gueltiges JSON — keine Anmeldung moeglich.");
    return [];
  }

  if (!Array.isArray(gelesen)) {
    console.error("CRM_BENUTZER muss eine Liste sein — keine Anmeldung moeglich.");
    return [];
  }

  const benutzer: Benutzer[] = [];
  for (const eintrag of gelesen) {
    if (typeof eintrag !== "object" || eintrag === null) continue;
    const satz = eintrag as Record<string, unknown>;
    if (typeof satz.name !== "string" || satz.name.length === 0) continue;
    if (typeof satz.passwort !== "string" || satz.passwort.length === 0) continue;
    if (!istRolle(satz.rolle)) continue;

    benutzer.push({
      name: satz.name,
      anzeigename:
        typeof satz.anzeigename === "string" && satz.anzeigename.length > 0
          ? satz.anzeigename
          : satz.name,
      rolle: satz.rolle,
      passwort: satz.passwort,
    });
  }
  return benutzer;
}

/** Konto zum Anmeldenamen. Gross- und Kleinschreibung spielt keine Rolle. */
export function findeBenutzer(name: string): Benutzer | null {
  const gesucht = name.trim().toLowerCase();
  if (!gesucht) return null;
  return (
    alleBenutzer().find((b) => b.name.toLowerCase() === gesucht) ?? null
  );
}

/**
 * Kurzes Kennzeichen des aktuellen Passworts.
 *
 * Steht in der Sitzung und wird bei jeder Pruefung erneut mit dem Konto
 * verglichen. Dadurch werden alle offenen Sitzungen ungueltig, sobald sich
 * das Passwort aendert oder das Konto entfernt wird — ohne diese Zeile
 * liefe ein gestohlenes Cookie bis zum Ablauf weiter, auch wenn das Passwort
 * laengst gewechselt wurde.
 *
 * Der Hash des Hashes, nicht der Hash selbst: Im Cookie steht damit nichts,
 * was beim Erraten des Passworts hilft.
 */
export function passwortKennung(passwort: string): string {
  return createHash("sha256").update(passwort).digest("base64url").slice(0, 16);
}
