import type { Metadata } from "next";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buildSpaydQrDataUrl, FUTUNATU_IBAN } from "@/lib/spayd";

export const metadata: Metadata = {
  title: "Objednávka přijata — 100dola sport",
  description: "Potvrzení objednávky s platebními informacemi.",
  robots: { index: false, follow: false },
};

interface OrderRecord {
  id: string;
  registeredAt: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  status: string;
  items: Array<{ productId: number; slug: string; name: string; priceWithVat: number; vatRate: number; qty: number }>;
  contact: { name: string; email: string; phone: string };
  shipping: { method: string; methodLabel: string; street?: string; city?: string; zip?: string; zasilkovnaPickup?: string };
  payment: { method: string; methodLabel: string };
}

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function getOrder(id: string): Promise<OrderRecord | null> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const all: OrderRecord[] = JSON.parse(raw);
    return all.find((o) => o.id === id) || null;
  } catch {
    return null;
  }
}

function fmtPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " Kč";
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  const showQr = order && (order.payment.method === "qr" || order.payment.method === "bank-transfer");
  const qrDataUrl = showQr
    ? await buildSpaydQrDataUrl({
        amount: order!.total,
        vs: order!.id,
        recipientName: "FUTUNATU s.r.o.",
        message: `100dola objednavka ${order!.id}`,
      })
    : null;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 pt-10 md:pt-16">
          {!order ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🤔</div>
              <h1 className="text-2xl font-black text-[#1a1a2e] mb-3">Objednávka nenalezena</h1>
              <p className="text-sm text-[#5A6480] mb-6">
                Číslo objednávky <strong>{id}</strong> v evidenci nemáme. Pokud to byla nedávná objednávka,
                ozvi se na <a href="mailto:info@100dola.com" className="text-[#3B7CF4] font-bold">info@100dola.com</a>.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-full bg-[#3B7CF4]"
              >
                Do shopu
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#3B7CF415" }}
                >
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#3B7CF4" strokeWidth={2.5}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] tracking-tight">
                  Díky za objednávku, {order.contact.name.split(" ")[0]}.
                </h1>
                <p className="mt-3 text-base text-[#5A6480]">
                  Objednávka <strong className="text-[#1a1a2e]">{order.id}</strong> · potvrzení jsme poslali na{" "}
                  <strong className="text-[#1a1a2e]">{order.contact.email}</strong>
                </p>
              </div>

              {/* Payment section */}
              {qrDataUrl && (
                <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 mb-6">
                  <div className="text-xs tracking-[0.18em] uppercase font-bold text-[#3B7CF4] mb-2">
                    {order.payment.methodLabel}
                  </div>
                  <h2 className="text-xl font-black text-[#1a1a2e] mb-5">Zaplať a objednávka se rozjede.</h2>

                  <div className="grid md:grid-cols-[1fr_240px] gap-6 items-start">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-[#F0F2FA]">
                        <span className="text-[#9AA3C2]">Číslo účtu</span>
                        <span className="font-bold text-[#1a1a2e]">2001508163/2010</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F0F2FA]">
                        <span className="text-[#9AA3C2]">IBAN</span>
                        <span className="font-bold text-[#1a1a2e] font-mono text-xs">{FUTUNATU_IBAN}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F0F2FA]">
                        <span className="text-[#9AA3C2]">Variabilní symbol</span>
                        <span className="font-bold text-[#1a1a2e]">{order.id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#F0F2FA]">
                        <span className="text-[#9AA3C2]">Splatnost</span>
                        <span className="font-bold text-[#1a1a2e]">5 pracovních dní</span>
                      </div>
                      <div className="flex justify-between py-3 mt-2">
                        <span className="text-base font-black text-[#1a1a2e]">Částka</span>
                        <span className="text-2xl font-black text-[#1a1a2e]">{fmtPrice(order.total)}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center bg-[#F7F9FF] rounded-2xl p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrDataUrl} alt="QR platba" width={200} height={200} className="rounded-lg" />
                      <div className="text-[10px] text-[#9AA3C2] text-center mt-2 leading-relaxed">
                        Naskenuj v bankovní aplikaci<br/>(FIO, KB, Air Bank, Revolut…)
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {order.payment.method === "cash-pickup" && (
                <section className="bg-[#FFF8EC] rounded-2xl border border-[#FBD38D] p-6 mb-6">
                  <h2 className="text-base font-black text-[#7A5615] mb-2">Hotovost při převzetí</h2>
                  <p className="text-sm text-[#7A5615]">
                    Zaplatíš na místě při osobním vyzvednutí ({order.shipping.methodLabel.replace("Osobní vyzvednutí — ", "")}).
                    Než budeme připraveni, ozveme se ti e-mailem nebo telefonem.
                  </p>
                </section>
              )}

              {/* What's next */}
              <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 mb-6">
                <h2 className="text-base font-black text-[#1a1a2e] mb-3">Co bude dál</h2>
                <p className="text-sm text-[#5A6480] leading-relaxed">
                  Mnoho položek máme u externích dodavatelů — konkrétní termín dodání ti upřesníme po přijetí objednávky / platby.
                  Ozveme se ti do <strong className="text-[#1a1a2e]">48 hodin</strong> na e-mail nebo telefon.
                </p>
              </section>

              {/* Order summary */}
              <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 mb-6">
                <h2 className="text-base font-black text-[#1a1a2e] mb-4">Souhrn objednávky</h2>

                <div className="space-y-2 mb-5">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between py-2 border-b border-[#F0F2FA] text-sm">
                      <span className="text-[#1a1a2e]">
                        {item.name} <span className="text-[#9AA3C2]">× {item.qty}</span>
                      </span>
                      <span className="font-bold text-[#1a1a2e]">{fmtPrice(item.priceWithVat * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-[#5A6480]">
                    <span>Mezisoučet</span>
                    <span>{fmtPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#5A6480]">
                    <span>Doprava ({order.shipping.methodLabel})</span>
                    <span>{order.shippingFee === 0 ? "zdarma" : fmtPrice(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#F0F2FA] mt-2">
                    <span className="text-base font-black text-[#1a1a2e]">Celkem</span>
                    <span className="text-xl font-black text-[#1a1a2e]">{fmtPrice(order.total)}</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-[#F0F2FA] text-xs text-[#5A6480] space-y-1">
                  <div><strong className="text-[#1a1a2e]">Doprava:</strong> {order.shipping.methodLabel}</div>
                  {order.shipping.street && (
                    <div><strong className="text-[#1a1a2e]">Adresa:</strong> {order.shipping.street}, {order.shipping.zip} {order.shipping.city}</div>
                  )}
                  {order.shipping.zasilkovnaPickup && (
                    <div><strong className="text-[#1a1a2e]">Pobočka:</strong> {order.shipping.zasilkovnaPickup}</div>
                  )}
                  <div><strong className="text-[#1a1a2e]">Platba:</strong> {order.payment.methodLabel}</div>
                </div>
              </section>

              <div className="text-center mt-10">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] hover:text-[#3B7CF4] transition-colors"
                >
                  Pokračovat v nákupu
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
