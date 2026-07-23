import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import { getAdminContext } from "@/lib/admin-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusActions from "@/components/shop/OrderStatusActions";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Admin · Detail objednávky — 100dola",
  robots: { index: false, follow: false },
};

interface OrderDetail {
  id: string;
  registered_at: string;
  status: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  name: string;
  email: string;
  phone: string;
  company_name: string | null;
  company_ico: string | null;
  company_dic: string | null;
  shipping_method_label: string;
  street: string | null;
  city: string | null;
  zip: string | null;
  zasilkovna_pickup: string | null;
  has_bulky: boolean;
  payment_method_label: string;
  paid_at: string | null;
  shipped_at: string | null;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_notified_at: string | null;
  notes: string | null;
  invoice?: {
    fakturoid_id: number;
    number: string;
    pdf_url: string;
    html_url: string;
    status: string;
  };
  items: Array<{
    product_id: number;
    slug: string;
    name: string;
    price_with_vat: number;
    vat_rate: number;
    qty: number;
    bulky: boolean;
  }>;
}

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function getOrder(id: string): Promise<OrderDetail | null> {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { data: order, error } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
      if (error || !order) throw error || new Error("not found");
      const { data: items } = await sb.from("order_items").select("*").eq("order_id", id);
      const { data: invoice } = await sb
        .from("invoices")
        .select("fakturoid_id, number, pdf_url, html_url, status")
        .eq("order_id", id)
        .maybeSingle();
      return {
        ...order,
        invoice: invoice || undefined,
        items: (items || []).map((i: Record<string, unknown>) => ({
          product_id: i.product_id as number,
          slug: i.slug as string,
          name: i.name as string,
          price_with_vat: i.price_with_vat as number,
          vat_rate: i.vat_rate as number,
          qty: i.qty as number,
          bulky: (i.bulky as boolean) ?? false,
        })),
      } as OrderDetail;
    } catch (e) {
      console.warn("[admin/orders/detail] Supabase fail, fallback to file:", e);
    }
  }
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const all = JSON.parse(raw) as Record<string, unknown>[];
    const order = all.find((o) => o.id === id);
    if (!order) return null;
    const contact = order.contact as Record<string, unknown>;
    const shipping = order.shipping as Record<string, unknown>;
    const payment = order.payment as Record<string, unknown>;
    return {
      id: order.id as string,
      registered_at: order.registeredAt as string,
      status: order.status as string,
      subtotal: order.subtotal as number,
      shipping_fee: order.shippingFee as number,
      total: order.total as number,
      name: contact?.name as string,
      email: contact?.email as string,
      phone: contact?.phone as string,
      company_name: (contact?.companyName as string) || null,
      company_ico: (contact?.companyIco as string) || null,
      company_dic: (contact?.companyDic as string) || null,
      shipping_method_label: shipping?.methodLabel as string,
      street: (shipping?.street as string) || null,
      city: (shipping?.city as string) || null,
      zip: (shipping?.zip as string) || null,
      zasilkovna_pickup: (shipping?.zasilkovnaPickup as string) || null,
      has_bulky: (order.hasBulky as boolean) || false,
      payment_method_label: payment?.methodLabel as string,
      paid_at: (order.paid_at as string) || null,
      shipped_at: (order.shipped_at as string) || null,
      tracking_number: (order.tracking_number as string) || null,
      tracking_carrier: (order.tracking_carrier as string) || null,
      tracking_notified_at: (order.tracking_notified_at as string) || null,
      notes: (order.notes as string) || null,
      items: (order.items as Array<Record<string, unknown>>).map((i) => ({
        product_id: i.productId as number,
        slug: i.slug as string,
        name: i.name as string,
        price_with_vat: i.priceWithVat as number,
        vat_rate: i.vatRate as number,
        qty: i.qty as number,
        bulky: (i.bulky as boolean) ?? false,
      })),
    };
  } catch {
    return null;
  }
}

function fmtPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " Kč";
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("cs-CZ");
  } catch {
    return iso;
  }
}

const STATUS: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: "#FEF3C7", fg: "#92400E", label: "Čeká platba" },
  paid: { bg: "#D1FAE5", fg: "#065F46", label: "Zaplaceno" },
  shipped: { bg: "#DBEAFE", fg: "#1E3A8A", label: "Odesláno" },
  cancelled: { bg: "#FEE2E2", fg: "#991B1B", label: "Stornováno" },
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/orders");

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const status = STATUS[order.status] || STATUS.pending;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 pt-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#9AA3C2] mb-6">
            <Link href="/admin/orders" className="hover:text-[#3B7CF4]">Admin · Objednávky</Link>
            <span>/</span>
            <span className="text-[#5A6480]">{order.id}</span>
          </div>

          {/* Header */}
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">
                Objednávka <span className="font-mono">{order.id}</span>
              </h1>
              <div className="text-sm text-[#5A6480] mt-2">{fmtDate(order.registered_at)}</div>
            </div>
            <span
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
              style={{ backgroundColor: status.bg, color: status.fg }}
            >
              {status.label}
            </span>
          </div>

          {/* Invoice (Fakturoid) */}
          {order.invoice && (
            <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
              <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#9AA3C2] mb-3">
                Faktura
              </div>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-black text-[#1a1a2e]">
                    Faktura č. {order.invoice.number}
                  </div>
                  <div className="text-xs text-[#5A6480] mt-0.5">
                    Status: <span className="font-bold">{order.invoice.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={order.invoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90"
                  >
                    Stáhnout PDF
                  </a>
                  <a
                    href={order.invoice.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
                  >
                    Otevřít ve Fakturoidu →
                  </a>
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#9AA3C2] mb-3">Akce</div>
            <OrderStatusActions
              orderId={order.id}
              currentStatus={order.status}
              paidAt={order.paid_at}
              shippedAt={order.shipped_at}
              trackingNumber={order.tracking_number}
              trackingCarrier={order.tracking_carrier}
            />
            <div className="mt-4 pt-4 border-t border-[#F0F2FA] flex gap-2 flex-wrap">
              <Link
                href={`/objednavka/${order.id}`}
                target="_blank"
                className="text-xs font-bold text-[#3B7CF4] hover:underline"
              >
                Otevřít zákaznickou stránku →
              </Link>
              <a
                href={`mailto:${order.email}?subject=${encodeURIComponent(`Objednávka ${order.id} — 100dola sport`)}`}
                className="text-xs font-bold text-[#3B7CF4] hover:underline ml-4"
              >
                Napsat klientovi →
              </a>
              <a
                href={`tel:${order.phone}`}
                className="text-xs font-bold text-[#3B7CF4] hover:underline ml-4"
              >
                Zavolat →
              </a>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Customer */}
            <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
              <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Zákazník</h2>
              <div className="space-y-1.5 text-sm">
                <div className="font-bold text-[#1a1a2e]">{order.name}</div>
                <div className="text-[#5A6480]">{order.email}</div>
                <div className="text-[#5A6480]">{order.phone}</div>
                {order.company_name && (
                  <div className="pt-3 mt-3 border-t border-[#F0F2FA]">
                    <div className="text-xs text-[#9AA3C2] uppercase tracking-wider mb-1">Firma</div>
                    <div className="font-bold text-[#1a1a2e]">{order.company_name}</div>
                    {order.company_ico && (
                      <div className="text-xs text-[#5A6480]">IČO {order.company_ico}{order.company_dic ? ` · DIČ ${order.company_dic}` : ""}</div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
              <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Doprava</h2>
              <div className="space-y-1.5 text-sm">
                <div className="font-bold text-[#1a1a2e]">{order.shipping_method_label}</div>
                {order.has_bulky && (
                  <div className="inline-block text-[10px] uppercase tracking-wider bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded">
                    Velký balík
                  </div>
                )}
                {order.street && (
                  <div className="text-[#5A6480]">{order.street}, {order.zip} {order.city}</div>
                )}
                {order.zasilkovna_pickup && (
                  <div className="text-[#5A6480] text-xs italic">Pobočka: {order.zasilkovna_pickup}</div>
                )}
                <div className="pt-3 mt-3 border-t border-[#F0F2FA]">
                  <div className="text-xs text-[#9AA3C2] uppercase tracking-wider mb-1">Platba</div>
                  <div className="font-bold text-[#1a1a2e]">{order.payment_method_label}</div>
                  {order.paid_at && (
                    <div className="text-xs text-[#10B981] mt-1">✓ Zaplaceno {fmtDate(order.paid_at)}</div>
                  )}
                  {order.shipped_at && (
                    <div className="text-xs text-[#3B7CF4] mt-1">
                      ✓ Odesláno {fmtDate(order.shipped_at)}{order.tracking_number ? ` · ${order.tracking_number}` : ""}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Items */}
          <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mt-5">
            <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Položky ({order.items.length})</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#9AA3C2] border-b border-[#F0F2FA]">
                  <th className="text-left p-2 font-bold">Produkt</th>
                  <th className="text-center p-2 font-bold">Ks</th>
                  <th className="text-right p-2 font-bold">Cena/ks</th>
                  <th className="text-right p-2 font-bold">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-[#F0F2FA] last:border-0">
                    <td className="p-2">
                      <div className="font-bold text-[#1a1a2e]">{i.name}</div>
                      <div className="text-[10px] text-[#9AA3C2]">/{i.slug}{i.bulky ? " · velký balík" : ""}</div>
                    </td>
                    <td className="p-2 text-center">{i.qty}</td>
                    <td className="p-2 text-right">{fmtPrice(i.price_with_vat)}</td>
                    <td className="p-2 text-right font-black text-[#1a1a2e]">
                      {fmtPrice(i.price_with_vat * i.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="text-sm text-[#5A6480]">
                  <td colSpan={3} className="p-2 text-right">Mezisoučet</td>
                  <td className="p-2 text-right">{fmtPrice(order.subtotal)}</td>
                </tr>
                <tr className="text-sm text-[#5A6480]">
                  <td colSpan={3} className="p-2 text-right">Doprava</td>
                  <td className="p-2 text-right">{order.shipping_fee === 0 ? "zdarma" : fmtPrice(order.shipping_fee)}</td>
                </tr>
                <tr className="border-t border-[#E2E6F3]">
                  <td colSpan={3} className="p-2 text-right text-base font-black text-[#1a1a2e]">Celkem</td>
                  <td className="p-2 text-right text-base font-black text-[#1a1a2e]">{fmtPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mt-5">
              <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Poznámka od zákazníka</h2>
              <p className="text-sm text-[#5A6480] whitespace-pre-wrap leading-relaxed">{order.notes}</p>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
