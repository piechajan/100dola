import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import { formatCzk } from "@/lib/pricing/comparator";

export const metadata: Metadata = {
  title: "Admin · Pricing — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type WatchRow = {
  id: string;
  product_kind: string;
  product_id: string;
  product_name: string;
  competitor_url: string;
  competitor_label: string;
  parser_strategy: string;
  last_seen_price_minor: number | null;
  last_checked_at: string | null;
  last_error: string | null;
  is_active: boolean;
};

type ProposalRow = {
  id: string;
  watchlist_id: string;
  ran_at: string;
  our_price_minor: number;
  competitor_price_minor: number | null;
  suggested_price_minor: number | null;
  suggested_action: string;
  reason: string | null;
  status: string;
};

type ChangeRow = {
  id: string;
  product_kind: string;
  product_id: string;
  old_price_minor: number | null;
  new_price_minor: number;
  source: string;
  changed_at: string;
};

export default async function AdminPricingPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    redirect("/login?from=/admin/pricing");
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Pricing watch</h1>
            <p className="text-sm text-red-600">Supabase env chybí.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });

  const [watchRes, proposalRes, changeRes] = await Promise.all([
    sb
      .from("price_watchlist")
      .select(
        "id, product_kind, product_id, product_name, competitor_url, competitor_label, parser_strategy, last_seen_price_minor, last_checked_at, last_error, is_active",
      )
      .order("product_name"),
    sb
      .from("price_proposals")
      .select(
        "id, watchlist_id, ran_at, our_price_minor, competitor_price_minor, suggested_price_minor, suggested_action, reason, status",
      )
      .order("ran_at", { ascending: false })
      .limit(50),
    sb
      .from("price_changes")
      .select("id, product_kind, product_id, old_price_minor, new_price_minor, source, changed_at")
      .order("changed_at", { ascending: false })
      .limit(30),
  ]);

  const watches = (watchRes.data ?? []) as WatchRow[];
  const proposals = (proposalRes.data ?? []) as ProposalRow[];
  const changes = (changeRes.data ?? []) as ChangeRow[];

  const flagEnabled = process.env.ENABLE_PRICE_WATCHLIST === "true";
  const secretSet = !!process.env.PRICING_APPROVAL_SECRET && process.env.PRICING_APPROVAL_SECRET.length >= 32;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Pricing watch</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Denní monitoring konkurenčních cen → návrhy → e-mail Janovi → schválení magic linkem.{" "}
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${flagEnabled ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"}`}
            >
              ENABLE_PRICE_WATCHLIST={String(flagEnabled)}
            </span>{" "}
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${secretSet ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"}`}
            >
              PRICING_APPROVAL_SECRET {secretSet ? "set" : "MISSING"}
            </span>
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Watchlist ({watches.length})</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Produkt</th>
                    <th className="text-left p-3 font-bold">Konkurent</th>
                    <th className="text-left p-3 font-bold">Parser</th>
                    <th className="text-right p-3 font-bold">Naposled viděno</th>
                    <th className="text-left p-3 font-bold">Kontrola</th>
                    <th className="text-left p-3 font-bold">Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {watches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#9AA3C2]">
                        Žádné položky. Insert přes SQL Editor (Phase 2c admin UI).
                      </td>
                    </tr>
                  ) : (
                    watches.map((w) => (
                      <tr key={w.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3">
                          <div className="font-bold">{w.product_name}</div>
                          <div className="text-[10px] text-[#9AA3C2] font-mono">{w.product_kind}:{w.product_id.slice(0, 8)}</div>
                        </td>
                        <td className="p-3">
                          <a href={w.competitor_url} target="_blank" rel="noreferrer" className="text-[#3B7CF4] hover:underline">
                            {w.competitor_label}
                          </a>
                        </td>
                        <td className="p-3 font-mono text-xs">{w.parser_strategy}</td>
                        <td className="p-3 text-right font-variant-numeric tabular-nums">
                          {formatCzk(w.last_seen_price_minor)}
                        </td>
                        <td className="p-3 text-xs text-[#5A6480]">
                          {w.last_checked_at ? new Date(w.last_checked_at).toLocaleString("cs-CZ") : "—"}
                          {w.last_error && (
                            <div className="text-[10px] text-[#991B1B] mt-0.5">{w.last_error}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${w.is_active ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#F7F9FF] text-[#5A6480]"}`}>
                            {w.is_active ? "aktivní" : "vyp."}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Návrhy (50 posledních)</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Datum</th>
                    <th className="text-right p-3 font-bold">Naše</th>
                    <th className="text-right p-3 font-bold">Konkurent</th>
                    <th className="text-right p-3 font-bold">Návrh</th>
                    <th className="text-left p-3 font-bold">Akce</th>
                    <th className="text-left p-3 font-bold">Důvod</th>
                    <th className="text-left p-3 font-bold">Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[#9AA3C2]">
                        Cron ještě neběžel. Manuálně: GET /api/cron/price-watchlist s Bearer CRON_SECRET.
                      </td>
                    </tr>
                  ) : (
                    proposals.map((p) => (
                      <tr key={p.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 text-xs">{new Date(p.ran_at).toLocaleString("cs-CZ")}</td>
                        <td className="p-3 text-right font-variant-numeric tabular-nums">{formatCzk(p.our_price_minor)}</td>
                        <td className="p-3 text-right font-variant-numeric tabular-nums">{formatCzk(p.competitor_price_minor)}</td>
                        <td className="p-3 text-right font-variant-numeric tabular-nums font-bold">{formatCzk(p.suggested_price_minor)}</td>
                        <td className="p-3 font-mono text-xs">{p.suggested_action}</td>
                        <td className="p-3 text-xs text-[#5A6480]">{p.reason ?? "—"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.status === "approved" ? "bg-[#D1FAE5] text-[#065F46]" :
                            p.status === "rejected" ? "bg-[#FEE2E2] text-[#991B1B]" :
                            p.status === "expired" ? "bg-[#F7F9FF] text-[#9AA3C2]" :
                            "bg-[#FEF3C7] text-[#92400E]"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Audit log změn (30 posledních)</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Kdy</th>
                    <th className="text-left p-3 font-bold">Produkt</th>
                    <th className="text-right p-3 font-bold">Z</th>
                    <th className="text-right p-3 font-bold">Na</th>
                    <th className="text-left p-3 font-bold">Zdroj</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-[#9AA3C2]">Žádné změny zatím.</td></tr>
                  ) : (
                    changes.map((c) => (
                      <tr key={c.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 text-xs">{new Date(c.changed_at).toLocaleString("cs-CZ")}</td>
                        <td className="p-3 font-mono text-xs">{c.product_kind}:{c.product_id.slice(0, 8)}</td>
                        <td className="p-3 text-right font-variant-numeric tabular-nums">{formatCzk(c.old_price_minor)}</td>
                        <td className="p-3 text-right font-variant-numeric tabular-nums font-bold">{formatCzk(c.new_price_minor)}</td>
                        <td className="p-3 text-xs">{c.source}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
