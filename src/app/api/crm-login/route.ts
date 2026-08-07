import { NextResponse } from "next/server";
import { alleBenutzer, findeBenutzer } from "@/lib/crm/benutzer";
import { hashePasswort, passwortStimmt } from "@/lib/crm/passwort";
import {
  CRM_SITZUNG_COOKIE,
  cookieEinstellungen,
  sitzungErstellen,
} from "@/lib/crm/sitzung";

/**
 * An- und Abmeldung am CRM.
 *
 * Der Endpunkt liegt ausserhalb von `/crm`, weil der Zaun im Proxy alles
 * unter `/crm` sperrt — wer sich anmelden will, ist ja noch nicht angemeldet.
 * Das Seitenpasswort muss trotzdem vorliegen: Der Proxy laesst diesen Pfad
 * nicht am aeusseren Zaun vorbei.
 */

/**
 * Bremse gegen das Durchprobieren von Passwoertern.
 *
 * Ehrlich gesagt eine halbe Sache, und das mit Absicht: Auf Vercel laeuft
 * jede Anfrage moeglicherweise in einer anderen Instanz, der Zaehler steht
 * also nicht fuer alle gemeinsam und ist nach einer Ruhephase wieder leer.
 * Er kostet nichts und faengt den einfachen Fall ab; die belastbare Bremse
 * kommt mit der Datenbank, wo die Fehlversuche am Konto stehen.
 *
 * Die eigentliche Huerde ist ohnehin scrypt: Jeder Versuch kostet den Server
 * eine Zehntelsekunde, ein Wortlistenangriff ueber HTTP wird dadurch selbst
 * ohne Zaehler unpraktikabel.
 */
const VERSUCHE_MAX = 5;
const SPERRE_MS = 5 * 60 * 1000;
const fehlversuche = new Map<string, { anzahl: number; letzter: number }>();

function istGesperrt(name: string): boolean {
  const eintrag = fehlversuche.get(name);
  if (!eintrag) return false;
  if (Date.now() - eintrag.letzter > SPERRE_MS) {
    fehlversuche.delete(name);
    return false;
  }
  return eintrag.anzahl >= VERSUCHE_MAX;
}

function merkeFehlversuch(name: string) {
  const eintrag = fehlversuche.get(name);
  const anzahl = eintrag && Date.now() - eintrag.letzter <= SPERRE_MS
    ? eintrag.anzahl + 1
    : 1;
  fehlversuche.set(name, { anzahl, letzter: Date.now() });
}

export async function POST(request: Request) {
  // Nur JSON annehmen. Ein fremdes Formular kann ohne Zustimmung des
  // Browsers kein `application/json` senden — zusammen mit SameSite=Lax am
  // Cookie ist das die einfache Absicherung gegen untergeschobene Anfragen.
  const typ = request.headers.get("content-type") ?? "";
  if (!typ.includes("application/json")) {
    return NextResponse.json({ ok: false, grund: "falsch" }, { status: 415 });
  }

  const koerper = await request.json().catch(() => null);
  const name = typeof koerper?.benutzer === "string" ? koerper.benutzer.trim() : "";
  const passwort = typeof koerper?.passwort === "string" ? koerper.passwort : "";

  if (!name || !passwort) {
    return NextResponse.json({ ok: false, grund: "falsch" }, { status: 401 });
  }

  if (istGesperrt(name.toLowerCase())) {
    return NextResponse.json({ ok: false, grund: "gesperrt" }, { status: 429 });
  }

  // Kein einziges Konto eingerichtet: Das ist ein Einrichtungsfehler und
  // keine falsche Eingabe. Ohne diese Unterscheidung meldet ein frisch
  // aufgesetzter Server "Passwort falsch", und man sucht den Fehler beim
  // Passwort statt bei den fehlenden Umgebungsvariablen. Verraten wird damit
  // nichts, was nicht ohnehin jeder Anmeldeversuch zeigen wuerde.
  if (alleBenutzer().length === 0) {
    return NextResponse.json(
      { ok: false, grund: "nicht_eingerichtet" },
      { status: 500 }
    );
  }

  const benutzer = findeBenutzer(name);

  if (!benutzer) {
    // Trotzdem einmal scrypt rechnen und das Ergebnis wegwerfen. Ohne das
    // waere die Antwort fuer einen unbekannten Namen spuerbar schneller als
    // fuer einen bekannten mit falschem Passwort — und damit liesse sich von
    // aussen herausfinden, welche Konten es gibt.
    await hashePasswort(passwort);
    merkeFehlversuch(name.toLowerCase());
    return NextResponse.json({ ok: false, grund: "falsch" }, { status: 401 });
  }

  if (!(await passwortStimmt(passwort, benutzer.passwort))) {
    merkeFehlversuch(name.toLowerCase());
    return NextResponse.json({ ok: false, grund: "falsch" }, { status: 401 });
  }

  const sitzung = sitzungErstellen(benutzer);
  if (!sitzung) {
    // Konto stimmt, aber der Server hat kein Sitzungsgeheimnis. Das ist ein
    // Einrichtungsfehler und keine falsche Eingabe — die Anmeldemaske sagt
    // das deutlich, sonst sucht man den Fehler beim Passwort.
    return NextResponse.json(
      { ok: false, grund: "nicht_eingerichtet" },
      { status: 500 }
    );
  }

  fehlversuche.delete(name.toLowerCase());

  const antwort = NextResponse.json({ ok: true });
  antwort.cookies.set(CRM_SITZUNG_COOKIE, sitzung, cookieEinstellungen());
  return antwort;
}

/** Abmelden: Cookie loeschen. */
export async function DELETE() {
  const antwort = NextResponse.json({ ok: true });
  antwort.cookies.set(CRM_SITZUNG_COOKIE, "", {
    ...cookieEinstellungen(),
    maxAge: 0,
  });
  return antwort;
}
