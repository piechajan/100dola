import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Admin · Vrácení — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  order_id: string;
  customer_email: string;
  return_type: string;
  items_description: string;
  reason: string;
  status: string;
  refund_amount: number | null;
  refunded_at: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  withdrawal: "Odstoupení",
  warranty: "Reklamace",
  damaged: "Poškozeno",
  other: "Jiné",
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  requested: { bg: "#FEF3C7", fg: "#92400E" },
  approved: { bg: "#D6E1FB", fg: "#1E3A8A" },
  received: { bg: "#F0F2FA", fg: "#5A6480" },
  refunded: { bg: "#D1FAE5", fg: "#065F46" },
  rejected: { bg: "#FEE2E2", fg: "#991B1B" },
};

function fmt(d: string): string {
  return new Date(d).toLocaleString("cs-CZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminReturnsPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/returns");

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
    .from("returns")
    .select("*")
    .neq("honeypot_caught", true)
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as Row[];

  const pending = rows.filter((r) => r.status === "requested" || r.status === "approved" || r.status === "received").length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e]">Vrácení & reklamace</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            {pending} aktivních · {rows.length} celkem
          </p>

          {rows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center text-sm text-[#5A6480]">
              Žádné žádosti o vrácení.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((r) => {
                const s = STATUS_STYLE[r.status] ?? { bg: "#F0F2FA", fg: "#5A6480" };
                return (
                  <Link
                    key={r.id}
                    href={`/admin/returns/${r.id}`}
                    className="block bg-white rounded-xl border border-[#E2E6F3] p-4 hover:border-[#3B7CF4]/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                            {TYPE_LABELS[r.return_type] ?? r.return_type}
                          </span>
                          <span
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: s.bg, color: s.fg }}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div className="font-bold text-[#1a1a2e] text-sm">{r.customer_email}</div>
                        <div className="text-[11px] text-[#9AA3C2] font-mono">
                          Objednávka {r.order_id}
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-[#9AA3C2] tabular-nums shrink-0">
                        <div>{fmt(r.created_at)}</div>
                        {r.refunded_at && (
                          <div className="text-[#065F46] font-bold mt-1">
                            Vráceno {fmt(r.refunded_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#5A6480] line-clamp-2 mt-2">
                      📦 {r.items_description}
                    </p>
                    <p className="text-xs text-[#5A6480] line-clamp-2 mt-1 italic">
                      &bdquo;{r.reason}&ldquo;
                    </p>
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
