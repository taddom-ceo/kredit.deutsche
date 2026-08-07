import { createHmac, timingSafeEqual } from "crypto";
import { passwortKennung, type Benutzer, type Rolle } from "./benutzer";

/**
 * Die CRM-Sitzung.
 *
 * Sie steckt in einem eigenen Cookie, getrennt vom Seitenpasswort: Das eine
 * sagt "darf die Seite sehen", das andere "ist ein bestimmter Mitarbeiter".
 * Wer nur das Seitenpasswort kennt, kommt damit nicht ins CRM.
 *
 * Der Inhalt ist lesbar, aber signiert — verschluesselt waere er nur dann
 * noetig, wenn darin etwas Vertrauliches staende. Es stehen bewusst nur
 * Anmeldename, Rolle, Passwortkennzeichen und Ablauf darin, nichts von einem
 * Kunden.
 *
 * Solange die Datenbank fehlt, ist die Sitzung zustandslos: Es gibt keine
 * Liste offener Sitzungen, die man einzeln beenden koennte. Ein Cookie gilt
 * also bis zum Ablauf — es sei denn, das Passwort des Kontos aendert sich,
 * dann passt das Kennzeichen nicht mehr. Mit der Tabelle `sitzung` in
 * Postgres kommt spaeter das sofortige Widerrufen dazu; die Schnittstelle
 * dieses Moduls bleibt dabei dieselbe.
 */

export const CRM_SITZUNG_COOKIE = "crm_sitzung";

/** Acht Stunden — ein Arbeitstag, danach neu anmelden. */
export const SITZUNGSDAUER_SEKUNDEN = 60 * 60 * 8;

export type Sitzung = {
  benutzer: string;
  rolle: Rolle;
  /** Kennzeichen des Passworts zum Zeitpunkt der Anmeldung. */
  kennung: string;
  /** Ablauf als Unixzeit in Sekunden. */
  ablauf: number;
};

function geheimnis(): string | null {
  const wert = process.env.CRM_SESSION_SECRET;
  // Ein zu kurzes Geheimnis ist so gut wie keines. Lieber gar keine
  // Anmeldung als eine Signatur, die sich durchprobieren laesst.
  if (!wert || wert.length < 32) return null;
  return wert;
}

function signiere(nutzlast: string, schluessel: string): string {
  return createHmac("sha256", schluessel).update(nutzlast).digest("base64url");
}

/** Cookie-Wert fuer ein angemeldetes Konto. Null, wenn kein Geheimnis gesetzt ist. */
export function sitzungErstellen(benutzer: Benutzer): string | null {
  const schluessel = geheimnis();
  if (!schluessel) return null;

  const sitzung: Sitzung = {
    benutzer: benutzer.name,
    rolle: benutzer.rolle,
    kennung: passwortKennung(benutzer.passwort),
    ablauf: Math.floor(Date.now() / 1000) + SITZUNGSDAUER_SEKUNDEN,
  };

  const nutzlast = Buffer.from(JSON.stringify(sitzung)).toString("base64url");
  return `${nutzlast}.${signiere(nutzlast, schluessel)}`;
}

/**
 * Cookie pruefen: Signatur und Ablauf.
 *
 * Bewusst ohne Blick auf die Kontenliste — das reicht fuer die schnelle
 * Vorpruefung im Proxy, die bei jedem Seitenaufruf laeuft. Die verbindliche
 * Pruefung samt Konto und Passwortkennzeichen steht in `zugang.ts` und
 * laeuft dort, wo die Daten liegen.
 */
export function sitzungLesen(wert: string | undefined): Sitzung | null {
  const schluessel = geheimnis();
  if (!schluessel || !wert) return null;

  const trenner = wert.lastIndexOf(".");
  if (trenner <= 0) return null;

  const nutzlast = wert.slice(0, trenner);
  const unterschrift = wert.slice(trenner + 1);
  const erwartet = signiere(nutzlast, schluessel);

  const a = Buffer.from(unterschrift);
  const b = Buffer.from(erwartet);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  let gelesen: unknown;
  try {
    gelesen = JSON.parse(Buffer.from(nutzlast, "base64url").toString());
  } catch {
    return null;
  }

  if (typeof gelesen !== "object" || gelesen === null) return null;
  const satz = gelesen as Record<string, unknown>;
  if (
    typeof satz.benutzer !== "string" ||
    typeof satz.rolle !== "string" ||
    typeof satz.kennung !== "string" ||
    typeof satz.ablauf !== "number"
  ) {
    return null;
  }

  if (satz.ablauf * 1000 <= Date.now()) return null;

  return {
    benutzer: satz.benutzer,
    rolle: satz.rolle as Rolle,
    kennung: satz.kennung,
    ablauf: satz.ablauf,
  };
}

/** Einstellungen des Cookies — an einer Stelle, damit An- und Abmeldung nicht auseinanderlaufen. */
export function cookieEinstellungen() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SITZUNGSDAUER_SEKUNDEN,
  };
}
