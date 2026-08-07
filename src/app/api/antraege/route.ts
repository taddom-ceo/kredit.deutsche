import { NextResponse } from "next/server";
import { nimmAntragAn, pruefeAntrag } from "@/lib/crm/antraege";

/**
 * Eingang der Antragsstrecke.
 *
 * Der Endpunkt liegt hinter dem Seitenpasswort — der Proxy laesst ihn nicht
 * daran vorbei — aber nicht hinter der CRM-Anmeldung: Absender ist der Kunde,
 * nicht ein Mitarbeiter.
 */
export async function POST(request: Request) {
  const typ = request.headers.get("content-type") ?? "";
  if (!typ.includes("application/json")) {
    return NextResponse.json({ ok: false, grund: "format" }, { status: 415 });
  }

  const koerper = await request.json().catch(() => null);
  const ergebnis = pruefeAntrag(koerper);

  if (!ergebnis.ok) {
    // Welche Felder fehlen, steht in der Antwort. Das ist keine Preisgabe:
    // Der Absender hat sie selbst geschickt, und ohne die Angabe suchte er
    // im Dunkeln, warum sein Antrag nicht durchgeht.
    return NextResponse.json(
      { ok: false, grund: "unvollstaendig", fehlend: ergebnis.fehlend },
      { status: 400 }
    );
  }

  try {
    const antrag = await nimmAntragAn(ergebnis.antrag);
    return NextResponse.json({ ok: true, id: antrag.id });
  } catch (fehler) {
    // Die Ablage hat nicht angenommen — Datenbank nicht erreichbar, Schema
    // nicht anlegbar, was auch immer. Entscheidend ist, dass der Kunde davon
    // erfaehrt: Die Strecke bleibt dann stehen und zeigt einen Fehler, statt
    // eine Bestaetigung fuer einen Antrag zu zeigen, den niemand hat.
    console.error("Antrag konnte nicht abgelegt werden:", fehler);
    return NextResponse.json({ ok: false, grund: "speicher" }, { status: 500 });
  }
}
