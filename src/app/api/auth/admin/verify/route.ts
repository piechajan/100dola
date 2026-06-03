import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyLoginTokenAndStart,
  logAdminAction,
  COOKIE_NAMES,
  SESSION_TTL_SECONDS,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/admin/verify?token=<rawToken>
 * Magic link verifier. Při úspěchu set cookie admin_session + redirect na from
 * (default /admin/orders).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const from = searchParams.get("from") || "/admin/orders";

  if (!token) return errorHtml("Chybí token.");

  const ua = request.headers.get("user-agent");
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const result = await verifyLoginTokenAndStart(token, ua, ip).catch((e) => {
    console.error("[admin/verify] failed:", e);
    return null;
  });

  if (!result) return errorHtml("Odkaz je neplatný nebo už byl použit.");

  // Set cookie + redirect
  const jar = await cookies();
  jar.set(COOKIE_NAMES.session, result.sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    expires: result.expiresAt,
  });

  // Audit log login
  await logAdminAction(
    { email: result.email, role: "admin", via: "session" },
    { action: "login", metadata: { method: "magic_link" } },
    ip,
    ua,
  );

  return NextResponse.redirect(new URL(from, request.url));
}

function errorHtml(msg: string): Response {
  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>Přihlášení</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:480px;margin:80px auto;padding:0 16px;text-align:center;">
  <h2 style="font-size:18px;">Přihlášení selhalo</h2>
  <p style="color:#5A6480;">${msg}</p>
  <p style="margin-top:24px;">
    <a href="/login" style="color:#3B7CF4;">Zkus to znova</a>
  </p>
</body></html>`;
  return new Response(html, { status: 401, headers: { "content-type": "text/html; charset=utf-8" } });
}
