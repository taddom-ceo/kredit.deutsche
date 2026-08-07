import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_GATE_COOKIE, expectedGateToken } from "@/lib/site-gate";
import { CRM_SITZUNG_COOKIE, sitzungLesen } from "@/lib/crm/sitzung";

/**
 * Zwei Zaeune, hintereinander.
 *
 * Der aeussere ist das geteilte Seitenpasswort: Es entscheidet, wer die Seite
 * ueberhaupt sieht, und darf weitergegeben werden. Der innere schuetzt `/crm`
 * und fragt nach einer Person — wer nur das Seitenpasswort kennt, kommt an
 * Kundendaten nicht heran.
 *
 * Was hier passiert, ist bewusst nur die schnelle Vorpruefung: Der Proxy
 * laeuft bei jedem Aufruf und schaut deshalb allein auf die Unterschrift des
 * Sitzungscookies, ohne die Kontenliste zu befragen. Die verbindliche
 * Pruefung steht in `lib/crm/zugang.ts` und laeuft in jeder CRM-Seite. Beides
 * zusammen, weil ein Zaun vor dem Rendern kein Ersatz fuer eine Pruefung an
 * den Daten ist — Server Actions und Endpunkte koennen an ihm vorbeifuehren.
 */

function zurAnmeldung(request: NextRequest, pfad: string) {
  const url = request.nextUrl.clone();
  url.pathname = pfad;
  // Vorhandene Parameter fallen weg; nur das Ziel wird mitgegeben, damit
  // nichts aus der urspruenglichen Adresse in der Anmeldeadresse landet.
  url.search = "";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SITE_GATE_COOKIE)?.value;
  const expected = expectedGateToken();
  // Ohne gesetztes SITE_PASSWORD ist `expected` null und niemand kommt
  // durch. Das ist die richtige Richtung: Eine fehlende Konfiguration darf
  // die Tuer nicht oeffnen.
  if (!expected || token !== expected) {
    return zurAnmeldung(request, "/login");
  }

  if (pathname === "/crm" || pathname.startsWith("/crm/")) {
    // Die Anmeldemaske selbst muss offen bleiben, sonst dreht sich die
    // Weiterleitung im Kreis.
    if (pathname !== "/crm/login") {
      const sitzung = sitzungLesen(
        request.cookies.get(CRM_SITZUNG_COOKIE)?.value
      );
      if (!sitzung) return zurAnmeldung(request, "/crm/login");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/site-login|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
