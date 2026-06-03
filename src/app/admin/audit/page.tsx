import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Admin · Audit log — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface AuditRow {
  id: string;
  actor_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export default async function AdminAuditPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/audit");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-red-600">Supabase env chybí.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: events } = await sb
    .from("admin_audit")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (events ?? []) as AuditRow[];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Audit log</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Posledních 200 akcí v administraci. Přihlášen jako{" "}
            <strong>{ctx.email}</strong> ({ctx.via}).
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                <tr>
                  <th className="text-left p-3 font-bold">Kdy</th>
                  <th className="text-left p-3 font-bold">Kdo</th>
                  <th className="text-left p-3 font-bold">Akce</th>
                  <th className="text-left p-3 font-bold">Resource</th>
                  <th className="text-left p-3 font-bold">Metadata</th>
                  <th className="text-left p-3 font-bold">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#9AA3C2]">
                      Zatím žádné záznamy.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-[#E2E6F3]">
                      <td className="p-3 text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString("cs-CZ")}
                      </td>
                      <td className="p-3 text-xs">
                        {r.actor_email ?? <span className="text-[#9AA3C2]">legacy</span>}
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-mono font-bold text-[#1a1a2e]">
                          {r.action}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-[#5A6480]">
                        {r.resource_type && r.resource_id
                          ? `${r.resource_type}/${r.resource_id.slice(0, 12)}`
                          : "—"}
                      </td>
                      <td className="p-3 text-[10px] font-mono text-[#5A6480] max-w-[200px] truncate">
                        {r.metadata ? JSON.stringify(r.metadata) : "—"}
                      </td>
                      <td className="p-3 text-[10px] font-mono text-[#9AA3C2]">
                        {r.ip_address ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
