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
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
