import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WaterMap from "@/components/malaga/WaterMap";
import { getWaterMarkers } from "@/lib/malaga/water-points";

const accent = "#E8431A";

export const metadata: Metadata = {
  title: "Mapa vody na kole kolem Malagy — fuentes, obchody a bary | 100dola",
  description:
    "Kde doplnit vodu na kole v provincii Málaga: prameny (fuentes), obchody a bary na našich trasách. Jedna mapa přes celý katalog — plánuj, ať nezůstaneš v horku bez vody.",
  alternates: { canonical: "/malaga/trasy/voda" },
};

export default function VodaPage() {
  const markers = getWaterMarkers();
  const byType = {
    fuente: markers.filter((m) => m.type === "fuente").length,
    shop: markers.filter((m) => m.type === "shop").length,
    bar: markers.filter((m) => m.type === "bar").length,
    cafe: markers.filter((m) => m.type === "cafe").length,
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-white">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-10 md:py-14">
          <div className="text-xs text-[#9AA3C2] mb-5">
            <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
            {" / "}
            <Link href="/malaga/trasy" className="hover:text-[#1a1a2e]">Trasy</Link>
            {" / "}
            <span className="text-[#5A6480]">Mapa vody</span>
          </div>

          <div className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
            Praktická vrstva
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-3">
            Mapa vody kolem Malagy
          </h1>
          <p className="text-[#5A6480] leading-relaxed mb-6 max-w-[720px]">
            V andaluském horku je voda plán, ne náhoda. Tady jsou všechny body na našich trasách, kde
            doplníš — <strong>prameny (fuentes), obchody a bary</strong>. Klikni na bod pro detail a
            trasu, ke které patří. Fuentes bývají v létě nespolehlivé — u nich to hlídáme zvlášť.
          </p>

          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            <span className="px-3 py-1.5 rounded-full bg-[#F0F4FF] text-[#3B7CF4] font-bold">⛲ {byType.fuente} pramenů</span>
            <span className="px-3 py-1.5 rounded-full bg-[#F0FDF4] text-[#2EAA6E] font-bold">🛒 {byType.shop} obchodů</span>
            <span className="px-3 py-1.5 rounded-full bg-[#FFF7ED] text-[#B8460F] font-bold">🍺 {byType.bar} barů</span>
            <span className="px-3 py-1.5 rounded-full bg-[#FFF1EA] text-[#E8431A] font-bold">☕ {byType.cafe} kaváren</span>
          </div>

          <WaterMap markers={markers} />

          <p className="text-[11px] text-[#9AA3C2] mt-6 leading-relaxed">
            Body jsou odvozené z GPS stop tras — polohy jsou orientační a ověřujeme je v terénu.
            Fuente v létě nemusí téct; ber vždy rezervu, hlavně na trasách s dlouhým úsekem bez vody.
          </p>

          <div className="mt-8">
            <Link href="/malaga/trasy" className="text-sm font-bold hover:underline" style={{ color: accent }}>
              ← Zpět na trasy
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
