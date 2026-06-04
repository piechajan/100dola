import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import ReturnForm from "@/components/shop/ReturnForm";

export const metadata: Metadata = {
  title: "Vrácení zboží — 100dola sport",
  description: "Formulář pro odstoupení od smlouvy, reklamaci nebo nahlášení poškození.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Order {
  id: string;
  email: string;
  name: string;
  total: number;
  paid_at: string | null;
  shipped_at: string | null;
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 3600 * 1000));
}

export default async function ReturnRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) notFound();

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb
    .from("orders")
    .select("id, email, name, total, paid_at, shipped_at")
    .eq("id", id)
    .maybeSingle();
  const order = data as Order | null;
  if (!order) notFound();

  const daysFromShipped = daysSince(order.shipped_at);
  const within14Days = daysFromShipped !== null && daysFromShipped <= 14;

  return (
    <>
      <Navbar />
      <main className="bg-[#F7F9FF] min-h-screen">
        <div className="max-w-[760px] mx-auto px-6 md:px-12 py-12 md:py-16">
          <Link
            href={`/objednavka/${order.id}`}
            className="text-xs text-[#5A6480] hover:underline"
          >
            ← Zpět na objednávku
          </Link>

          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mt-1 mb-2">
            Vrácení zboží
          </h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Objednávka <strong className="font-mono">{order.id}</strong>
            {order.shipped_at && (
              <>
                {" · "}odesláno před <strong>{daysFromShipped}</strong> dny
              </>
            )}
          </p>

          {/* Info banner — info o lhůtách */}
          <div
            className={`rounded-2xl p-5 mb-6 ${
              within14Days
                ? "bg-[#F0FDF4] border border-[#A7F3D0] text-[#065F46]"
                : "bg-[#F0F4FF] border border-[#D6E1FB] text-[#1a1a2e]"
            }`}
          >
            <h3 className="text-sm font-black mb-2">
              {within14Days
                ? "🛡 Máš nárok na vrácení do 14 dnů bez udání důvodu"
                : "Žádné automatické vrácení do 14 dnů"}
            </h3>
            <p className="text-xs leading-relaxed">
              {within14Days
                ? `Podle § 1829 občanského zákoníku můžeš do 14 dnů od převzetí (zbývá ${14 - (daysFromShipped ?? 14)} dnů) odstoupit od smlouvy bez udání důvodu. Stačí vyplnit formulář níže nebo poslat poštou.`
                : "14denní lhůta na odstoupení od smlouvy uplynula. Pokud má zboží vadu, můžeš uplatnit reklamaci (24 měsíců) — vyber „Reklamace v záruce“."}
            </p>
          </div>

          <ReturnForm
            orderId={order.id}
            customerEmail={order.email}
            customerName={order.name}
          />

          {/* Informace o procesu */}
          <div className="mt-8 bg-white rounded-2xl border border-[#E2E6F3] p-6">
            <h3 className="text-sm font-black text-[#1a1a2e] mb-3">Jak to bude probíhat</h3>
            <ol className="space-y-2.5 text-xs text-[#5A6480] leading-relaxed">
              <li>
                <strong className="text-[#1a1a2e]">1.</strong> Pošleš tento formulář — okamžitě dostaneš potvrzovací e-mail.
              </li>
              <li>
                <strong className="text-[#1a1a2e]">2.</strong> Do 2 pracovních dnů ti pošlu odpověď s adresou pro odeslání zboží + případnými dotazy.
              </li>
              <li>
                <strong className="text-[#1a1a2e]">3.</strong> Po obdržení zboží zkontroluju stav a do 14 dnů ti vrátím peníze na účet
                (zákonná lhůta dle § 1832 obč. zákoníku).
              </li>
              <li>
                <strong className="text-[#1a1a2e]">4.</strong> Pokud máš jakékoliv dotazy, klidně volej <a href="tel:+420739045057" className="text-[#3B7CF4] hover:underline">+420 739 045 057</a>.
              </li>
            </ol>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
