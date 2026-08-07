import { createHash, timingSafeEqual } from "crypto";

export const SITE_GATE_COOKIE = "site_access";

function hash(value: string) {
  return createHash("sha256").update(value).digest();
}

/** Cookie-Wert bei erfolgreichem Login — ein Hash statt des Passworts selbst,
    damit im Klartext-Cookie nichts Wiederverwendbares steht. */
export function expectedGateToken(): string | null {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  return hash(password).toString("hex");
}

export function checkPassword(candidate: string): boolean {
  const password = process.env.SITE_PASSWORD;
  if (!password) return false;
  // Beide Seiten sind gleich lange Hashes, damit der zeitkonstante Vergleich
  // nicht an unterschiedlichen Laengen scheitert.
  return timingSafeEqual(hash(candidate), hash(password));
}
