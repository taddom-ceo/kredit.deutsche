import { NextResponse } from "next/server";
import {
  aktualisiereAntrag,
  nimmAntragAn,
  pruefeAntrag,
} from "@/lib/crm/antraege";

/**
 * Eingang der Antragsstrecke.
 *
 * Der Endpunkt liegt hinter dem Seitenpasswort — der Proxy laesst ihn nicht
 * daran vorbei — aber nicht hinter der CRM-Anmeldung: Absender ist der Kunde,
 * nicht ein Mitarbeiter.
 *
 * Er wird zweimal benutzt. Einmal fuer den Zwischenstand, sobald jemand seine
 * persoenlichen Daten hinterlassen hat: Der Fall landet als "Abbrecher" im
 * CRM, damit ein Kontakt, der sonst verloren waere, wenigstens angerufen
 * werden kann. Und einmal am Ende der Strecke fuer den fertigen Antrag.
 *
 * Damit daraus nicht zwei Faelle werden, gibt die Antwort eine Kennung
 * zurueck, die der Browser beim naechsten Mal mitschickt.
 */
export async function POST(request: Request) {
  const typ = request.headers.get("content-type") ?? "";
  if (!typ.includes("application/json")) {
    return NextResponse.json({ ok: false, grund: "format" }, { status: 415 });
  }

  const koerper = await request.json().catch(() => null);
  const daten = (koerper ?? {}) as Record<string, unknown>;

  // Ohne ausdrueckliches Kennzeichen gilt der Antrag als abgeschickt. So
  // bleibt ein Aufruf ohne das neue Feld das, was er vorher war.
  const abgeschlossen = daten.abgeschlossen !== false;
  const kennung = typeof daten.id === "string" ? daten.id : null;

  const ergebnis = pruefeAntrag(koerper, abgeschlossen);

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
    if (kennung) {
      const aktualisiert = await aktualisiereAntrag(
        kennung,
        ergebnis.antrag,
        abgeschlossen
      );
      // Kennt die Ablage die Kennung nicht mehr — geloescht, oder aus einer
      // Sitzung von vor dem letzten Neustart —, wird neu angelegt statt die
      // Angaben wegzuwerfen.
      if (aktualisiert) {
        return NextResponse.json({ ok: true, id: aktualisiert.id });
      }
    }

    const antrag = await nimmAntragAn(
      ergebnis.antrag,
      abgeschlossen ? "neu" : "abbrecher"
    );
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
