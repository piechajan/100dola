import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Admin · Stock notifications — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  supplier_product_id: string;
  variant_external_id: string | null;
  customer_email: string;
  notified_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  public_slug: string | null;
}

export default async function AdminStockNotificationsPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/stock-notifications");

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

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: notifs } = await sb
    .from("stock_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = (notifs ?? []) as Row[];

  // Aggregations
  const pending = rows.filter((r) => !r.notified_at && !r.unsubscribed_at);
  const sent = rows.filter((r) => r.notified_at);
  const unsubscribed = rows.filter((r) => r.unsubscribed_at);

  // Group by product (only pending)
  const byProduct = new Map<string, { count: number; emails: Set<string>; variants: Set<string> }>();
  for (const r of pending) {
    if (!byProduct.has(r.supplier_product_id)) {
      byProduct.set(r.supplier_product_id, { count: 0, emails: new Set(), variants: new Set() });
    }
    const entry = byProduct.get(r.supplier_product_id)!;
    entry.count++;
    entry.emails.add(r.customer_email);
    if (r.variant_external_id) entry.variants.add(r.variant_external_id);
  }

  // Fetch product names
  const productIds = Array.from(byProduct.keys());
  const productMap = new Map<string, Product>();
  if (productIds.length > 0) {
    const { data: products } = await sb
      .from("supplier_products")
      .select("id, name, public_slug")
      .in("id", productIds);
    for (const p of products ?? []) productMap.set(p.id, p as Product);
  }

  const sortedProducts = Array.from(byProduct.entries()).sort((a, b) => b[1].count - a[1].count);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Stock notifications</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Lidé čekají na naskladnění. Prioritizuj objednávky u dodavatele podle počtu pending.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">Pending</div>
              <div className="text-2xl font-black text-[#1a1a2e]">{pending.length}</div>
              <div className="text-[10px] text-[#9AA3C2]">{byProduct.size} produktů</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">Odesláno</div>
              <div className="text-2xl font-black text-[#065F46]">{sent.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">Odhlášeno</div>
              <div className="text-2xl font-black text-[#9AA3C2]">{unsubscribed.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">Cron</div>
              <div className="text-sm font-mono text-[#1a1a2e]">09:00 UTC</div>
              <div className="text-[10px] text-[#9AA3C2]">/api/cron/stock-notify</div>
            </div>
          </div>

          {/* Top products waiting */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">
              Top čekané produkty ({byProduct.size})
            </h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Produkt</th>
                    <th className="text-right p-3 font-bold">Čekajících</th>
                    <th className="text-right p-3 font-bold">Variants</th>
                    <th className="text-left p-3 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#9AA3C2]">
                        Žádné pending notifikace.
                      </td>
                    </tr>
                  ) : (
                    sortedProducts.map(([pid, info]) => {
                      const p = productMap.get(pid);
                      return (
                        <tr key={pid} className="border-t border-[#E2E6F3]">
                          <td className="p-3 font-bold">{p?.name ?? `(produkt #${pid.slice(0, 8)})`}</td>
                          <td className="p-3 text-right tabular-nums">{info.count}</td>
                          <td className="p-3 text-right tabular-nums">{info.variants.size || "—"}</td>
                          <td className="p-3">
                            {p?.public_slug && (
                              <Link
                                href={`/shop/${p.public_slug}`}
                                target="_blank"
                                className="text-xs text-[#3B7CF4] hover:underline"
                              >
                                Otevřít →
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent signups */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Posledních 100 signupů</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Kdy</th>
                    <th className="text-left p-3 font-bold">E-mail</th>
                    <th className="text-left p-3 font-bold">Variant</th>
                    <th className="text-left p-3 font-bold">Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((r) => (
                    <tr key={r.id} className="border-t border-[#E2E6F3]">
                      <td className="p-3 text-xs">{new Date(r.created_at).toLocaleString("cs-CZ")}</td>
                      <td className="p-3 font-mono text-xs">{r.customer_email}</td>
                      <td className="p-3 text-xs">{r.variant_external_id ?? "—"}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            r.unsubscribed_at
                              ? "bg-[#F0F2FA] text-[#9AA3C2]"
                              : r.notified_at
                                ? "bg-[#D1FAE5] text-[#065F46]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                          }`}
                        >
                          {r.unsubscribed_at ? "unsub" : r.notified_at ? "sent" : "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
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
