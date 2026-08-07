import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SITE_GATE_COOKIE, expectedGateToken } from "@/lib/site-gate";
import { angemeldeterBenutzer } from "@/lib/crm/zugang";
import LoginFormular from "./LoginFormular";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Beide Anmeldungen auf einem Bildschirm: oben das Passwort fuer die Seite,
 * darunter der Zugang fuers CRM.
 *
 * Welche Haelfte gebraucht wird, entscheidet sich hier auf dem Server, damit
 * die Maske nicht nach etwas fragt, was laengst vorliegt: Wer das
 * Seitenpasswort schon eingegeben hat, sieht nur noch den CRM-Teil.
 */
export default async function LoginSeite() {
  const speicher = await cookies();
  const erwartet = expectedGateToken();
  const seiteFrei = Boolean(
    erwartet && speicher.get(SITE_GATE_COOKIE)?.value === erwartet
  );

  const benutzer = await angemeldeterBenutzer();

  return (
    <LoginFormular
      seiteFrei={seiteFrei}
      angemeldetAls={benutzer?.anzeigename ?? null}
    />
  );
}
