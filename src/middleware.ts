import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PASSWORD = "100dola2025";
const COOKIE = "preview_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pustit login stránku a API bez kontroly
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Zkontrolovat cookie
  const auth = request.cookies.get(COOKIE);
  if (auth?.value === PASSWORD) {
    return NextResponse.next();
  }

  // Přesměrovat na login
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo\\.png|logo-malaga\\.png|logo-sport-box\\.png).*)"],
};
