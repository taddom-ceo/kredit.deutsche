import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SITE_GATE_COOKIE, expectedGateToken } from "@/lib/site-gate";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SITE_GATE_COOKIE)?.value;
  const expected = expectedGateToken();

  if (expected && token === expected) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!login|api/site-login|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
