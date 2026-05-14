import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Admin · Strava — 100dola",
  robots: { index: false, follow: false },
};

// Server-side test — refresh current token + extract scope list
async function getCurrentScopes(): Promise<{ scope: string; error?: string }> {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    return { scope: "", error: "Strava env vars chybí" };
  }
  try {
    const r = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
      cache: "no-store",
    });
    const data = await r.json();
    if (!data.access_token) return { scope: "", error: JSON.stringify(data) };
    // Strava nevrací scope v refresh response — musíme ověřit přes /athlete + activities endpoint
    return { scope: "(token refresh OK — scope se zobrazí po re-authorize)", };
  } catch (e) {
    return { scope: "", error: String(e) };
  }
}

const REQUIRED_SCOPES = [
  "read",
  "read_all",
  "profile:read_all",
  "activity:read",
  "activity:read_all",
];

export default async function AdminStravaPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    redirect("/login?from=/admin/strava");
  }

  const { scope, error } = await getCurrentScopes();
  const clientId = process.env.STRAVA_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
  const redirectUri = `${siteUrl}/api/strava-callback`;

  const authorizeUrl = new URL("https://www.strava.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId || "");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", REQUIRED_SCOPES.join(","));
  authorizeUrl.searchParams.set("approval_prompt", "force");
  authorizeUrl.searchParams.set("state", "admin-reauth");

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pt-10">

          <div className="mb-8">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#FC4C02] mb-1">
              Admin
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Strava integrace</h1>
          </div>

          {/* Current state */}
          <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <h2 className="text-sm font-black text-[#1a1a2e] mb-4">Aktuální stav</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#5A6480]">Strava API klíče</span>
                <span className={clientId ? "text-[#10B981] font-bold" : "text-red-600 font-bold"}>
                  {clientId ? "✓ Nastaveno" : "✗ Chybí"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#5A6480]">Refresh token</span>
                <span className={error ? "text-red-600 font-bold" : "text-[#10B981] font-bold"}>
                  {error ? `✗ ${error.slice(0, 60)}` : "✓ Valid"}
                </span>
              </div>
              <div className="text-xs text-[#9AA3C2] mt-2">{scope}</div>
            </div>
          </section>

          {/* Required scopes */}
          <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <h2 className="text-sm font-black text-[#1a1a2e] mb-2">Požadované scopes pro plnou funkčnost</h2>
            <p className="text-xs text-[#9AA3C2] mb-4">
              Aktuální token má pouze základní scopes. Pro čtení Janových aktivit (past event routes) a club events potřebujeme tyto:
            </p>
            <ul className="text-xs space-y-1.5 text-[#5A6480]">
              {REQUIRED_SCOPES.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FC4C02]" />
                  <code className="font-mono">{s}</code>
                </li>
              ))}
            </ul>
          </section>

          {/* Re-authorize CTA */}
          <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
            <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Re-authorize Stravu</h2>
            <p className="text-sm text-[#5A6480] leading-relaxed mb-5">
              Kliknutím přejdeš na Strava OAuth. Schválíš požadované oprávnění, vrátíš se zpátky.
              Callback automaticky vyexchanguje token, zobrazí ti <strong>nový refresh_token</strong>,
              ten ručně uložíš do Vercel env <code className="text-xs bg-[#F0F2FA] px-1.5 py-0.5 rounded">STRAVA_REFRESH_TOKEN</code>.
            </p>

            <a
              href={authorizeUrl.toString()}
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#FC4C02", boxShadow: "0 4px 16px #FC4C0240" }}
            >
              Re-authorize přes Stravu
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M14 3h7v7M21 3 10 14M5 7v12a2 2 0 0 0 2 2h12" />
              </svg>
            </a>

            <p className="text-[11px] text-[#9AA3C2] mt-4 leading-relaxed">
              Redirect URI: <code className="font-mono">{redirectUri}</code>
              <br />
              Po úspěšném schválení dostaneš novou refresh token URL — postupuj podle instrukcí na callback stránce.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
