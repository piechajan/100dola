import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusActions from "@/components/shop/OrderStatusActions";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin · Objednávky — 100dola",
  robots: { index: false, follow: false },
};

interface AdminOrder {
  id: string;
  registered_at: string;
  total: number;
  status: string;
  name: string;
  email: string;
  phone: string;
  shipping_method_label: string;
  payment_method_label: string;
  has_bulky: boolean;
  paid_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
}

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function getAllOrders(): Promise<AdminOrder[]> {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("orders")
        .select(
          "id, registered_at, total, status, name, email, phone, shipping_method_label, payment_method_label, has_bulky, paid_at, shipped_at, tracking_number",
        )
        .order("registered_at", { ascending: false });
      if (error) throw error;
      return (data as AdminOrder[]) || [];
    } catch (e) {
      console.warn("[admin/orders] Supabase fetch failed, fallback to file:", e);
    }
  }
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const all = JSON.parse(raw);
    return all
      .map((o: Record<string, unknown>) => ({
        id: o.id as string,
        registered_at: o.registeredAt as string,
        total: o.total as number,
        status: o.status as string,
        name: ((o.contact as Record<string, unknown>)?.name as string) || "—",
        email: ((o.contact as Record<string, unknown>)?.email as string) || "—",
        phone: ((o.contact as Record<string, unknown>)?.phone as string) || "—",
        shipping_method_label:
          ((o.shipping as Record<string, unknown>)?.methodLabel as string) || "—",
        payment_method_label:
          ((o.payment as Record<string, unknown>)?.methodLabel as string) || "—",
        has_bulky: (o.hasBulky as boolean) || false,
        paid_at: (o.paid_at as string) || null,
        shipped_at: (o.shipped_at as string) || null,
        tracking_number: (o.tracking_number as string) || null,
      }))
      .sort((a: AdminOrder, b: AdminOrder) =>
        b.registered_at.localeCompare(a.registered_at),
      );
  } catch {
    return [];
  }
}

function fmtPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " Kč";
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: "#FEF3C7", fg: "#92400E", label: "Čeká platba" },
  paid: { bg: "#D1FAE5", fg: "#065F46", label: "Zaplaceno" },
  shipped: { bg: "#DBEAFE", fg: "#1E3A8A", label: "Odesláno" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B", label: "Stornováno" },
};

export default async function AdminOrdersPage() {
  // Preview auth check
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    redirect("/login?from=/admin/orders");
  }

  const orders = await getAllOrders();
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    revenue: orders
      .filter((o) => o.status === "paid" || o.status === "shipped")
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10">
          <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
            <div>
              <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-1">
                Admin
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Objednávky</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href="/api/admin/orders/export"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] hover:text-[#3B7CF4] transition-colors"
              >
                Export CSV
              </a>
              <Link
                href="/api/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] hover:text-[#3B7CF4] transition-colors"
              >
                JSON
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: "Celkem", value: String(stats.total) },
              { label: "Čeká platba", value: String(stats.pending) },
              { label: "Zaplaceno", value: String(stats.paid) },
              { label: "Odesláno", value: String(stats.shipped) },
              { label: "Tržby", value: fmtPrice(stats.revenue) },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E2E6F3] p-4">
                <div className="text-xs text-[#9AA3C2] uppercase tracking-wider">{s.label}</div>
                <div className="text-2xl font-black text-[#1a1a2e] mt-1">{s.value}</div>
              </div>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-[#5A6480]">Zatím žádné objednávky.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                    <th className="text-left p-3 font-bold">ID / VS</th>
                    <th className="text-left p-3 font-bold">Datum</th>
                    <th className="text-left p-3 font-bold">Zákazník</th>
                    <th className="text-left p-3 font-bold">Doprava</th>
                    <th className="text-left p-3 font-bold">Platba</th>
                    <th className="text-right p-3 font-bold">Částka</th>
                    <th className="text-center p-3 font-bold">Stav</th>
                    <th className="text-left p-3 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const status = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={o.id} className="border-t border-[#F0F2FA] hover:bg-[#F7F9FF]">
                        <td className="p-3 font-mono text-xs text-[#1a1a2e] font-bold">{o.id}</td>
                        <td className="p-3 text-xs text-[#5A6480]">{fmtDate(o.registered_at)}</td>
                        <td className="p-3">
                          <div className="font-bold text-[#1a1a2e]">{o.name}</div>
                          <div className="text-[11px] text-[#9AA3C2]">{o.email}</div>
                        </td>
                        <td className="p-3 text-xs text-[#5A6480]">
                          {o.shipping_method_label}
                          {o.has_bulky && (
                            <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded">
                              velký
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-xs text-[#5A6480]">{o.payment_method_label}</td>
                        <td className="p-3 text-right font-black text-[#1a1a2e]">
                          {fmtPrice(o.total)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                            style={{ backgroundColor: status.bg, color: status.fg }}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <OrderStatusActions
                            orderId={o.id}
                            currentStatus={o.status}
                            paidAt={o.paid_at}
                            shippedAt={o.shipped_at}
                            trackingNumber={o.tracking_number}
                          />
                          <Link
                            href={`/objednavka/${o.id}`}
                            target="_blank"
                            className="text-[11px] font-bold text-[#3B7CF4] hover:underline mt-2 inline-block"
                          >
                            Detail klienta →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-[#9AA3C2] text-center mt-6">
            {isSupabaseConfigured() ? "Data: Supabase orders table" : "Data: file storage /tmp/orders.json (po aplikaci migrací se přepne na DB)"}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
