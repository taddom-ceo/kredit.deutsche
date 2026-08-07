import { NextResponse } from "next/server";
import {
  SITE_GATE_COOKIE,
  checkPassword,
  expectedGateToken,
} from "@/lib/site-gate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || !checkPassword(password)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = expectedGateToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SITE_GATE_COOKIE, token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Kein maxAge und kein expires: Damit ist das hier ein reines
    // Sitzungscookie. Der Browser legt es nur im Arbeitsspeicher ab und
    // wirft es weg, sobald er geschlossen wird — beim naechsten Start steht
    // das Passwort wieder an. Vorher galt es dreissig Tage, ein einmal
    // eingegebenes Passwort liess das Geraet also einen Monat lang offen.
  });
  return response;
}
