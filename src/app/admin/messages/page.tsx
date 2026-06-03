import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Admin · Inbox — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  page_url: string | null;
  product_slug: string | null;
  ai_draft: string | null;
  ai_error: string | null;
  status: "new" | "replied" | "spam" | "archived";
  notification_sent_at: string | null;
  auto_reply_sent_at: string | null;
  replied_at: string | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  new: { bg: "#FEF3C7", fg: "#92400E", label: "new" },
  replied: { bg: "#D1FAE5", fg: "#065F46", label: "replied" },
  spam: { bg: "#FEE2E2", fg: "#991B1B", label: "spam" },
  archived: { bg: "#F0F2FA", fg: "#5A6480", label: "archived" },
};

function fmt(d: string): string {
  return new Date(d).toLocaleString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminMessagesPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/messages");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1100px] mx-auto px-6">
            <p className="text-red-600">Supabase env chybí.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb
    .from("contact_messages")
    .select("*")
    .neq("status", "spam")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-black text-[#1a1a2e]">Inbox</h1>
              <p className="text-sm text-[#5A6480]">
                {newCount} nových · {rows.length} celkem (bez spamu)
              </p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center text-sm text-[#5A6480]">
              Žádné zprávy. Zatím klid 🙂
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => {
                const s = STATUS_STYLE[r.status];
                return (
                  <Link
                    key={r.id}
                    href={`/admin/messages/${r.id}`}
                    className="block bg-white rounded-xl border border-[#E2E6F3] p-4 hover:border-[#3B7CF4]/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="font-bold text-[#1a1a2e] text-sm">{r.name}</div>
                        <div className="text-[11px] text-[#9AA3C2] font-mono">{r.email}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: s.bg, color: s.fg }}
                        >
                          {s.label}
                        </span>
                        <span className="text-[10px] text-[#9AA3C2] tabular-nums">{fmt(r.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#5A6480] line-clamp-2">{r.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9AA3C2]">
                      {r.product_slug && <span>🛍 {r.product_slug}</span>}
                      {r.ai_draft && <span className="text-[#3B7CF4]">✦ AI návrh připraven</span>}
                      {r.replied_at && <span>↩ Odpověděno {fmt(r.replied_at)}</span>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
