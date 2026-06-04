import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Admin · Newsletter subscribers — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  email: string;
  name: string | null;
  source: string;
  consent: boolean;
  confirmed: boolean;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  unsubscribe_reason: string | null;
  registered_at: string;
  send_count: number | null;
  open_count: number | null;
  last_sent_at: string | null;
}

const SOURCE_LABEL: Record<string, string> = {
  community: "Community",
  shop: "Shop",
  malaga: "Malaga",
  lab: "Lab",
};

function fmt(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminSubscribersPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter/subscribers");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1100px] mx-auto px-6"><p className="text-red-600">Supabase env chybí.</p></div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb
    .from("newsletter_subscribers")
    .select("*")
    .order("registered_at", { ascending: false })
    .limit(500);
  const rows = (data ?? []) as Row[];

  const confirmed = rows.filter((r) => r.confirmed && !r.unsubscribed_at);
  const pending = rows.filter((r) => !r.confirmed && !r.unsubscribed_at);
  const unsubscribed = rows.filter((r) => r.unsubscribed_at);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <Link href="/admin/newsletter" className="text-xs text-[#5A6480] hover:underline">
            ← Zpět na kampaně
          </Link>
          <h1 className="text-3xl font-black text-[#1a1a2e] mt-1 mb-2">Newsletter subscribers</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            {rows.length} celkem · {confirmed.length} confirmed · {pending.length} pending · {unsubscribed.length} unsubscribed
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Tile label="Confirmed" value={confirmed.length} tone="green" />
            <Tile label="Pending opt-in" value={pending.length} tone="amber" />
            <Tile label="Unsubscribed" value={unsubscribed.length} tone="neutral" />
            <Tile label="Celkem" value={rows.length} tone="neutral" />
          </div>

          {rows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center text-sm text-[#5A6480]">
              Žádní subscribeři. První přijde po nasazení signup formu.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">E-mail</th>
                    <th className="text-left p-3 font-bold">Jméno</th>
                    <th className="text-left p-3 font-bold">Zdroj</th>
                    <th className="text-left p-3 font-bold">Stav</th>
                    <th className="text-left p-3 font-bold">Registrován</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    let statusStr: { label: string; bg: string; fg: string };
                    if (r.unsubscribed_at) statusStr = { label: "Odhlášen", bg: "#F0F2FA", fg: "#5A6480" };
                    else if (r.confirmed) statusStr = { label: "✓ Confirmed", bg: "#D1FAE5", fg: "#065F46" };
                    else statusStr = { label: "Pending", bg: "#FEF3C7", fg: "#92400E" };
                    return (
                      <tr key={r.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 font-mono text-xs">{r.email}</td>
                        <td className="p-3 text-xs">{r.name ?? "—"}</td>
                        <td className="p-3 text-xs">{SOURCE_LABEL[r.source] ?? r.source}</td>
                        <td className="p-3">
                          <span
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: statusStr.bg, color: statusStr.fg }}
                          >
                            {statusStr.label}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-[#5A6480]">{fmt(r.registered_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "neutral" }) {
  const color = tone === "green" ? "#065F46" : tone === "amber" ? "#92400E" : "#1a1a2e";
  return (
    <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
      <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">{label}</div>
      <div className="text-2xl font-black tabular-nums" style={{ color }}>{value}</div>
    </div>
  );
}
