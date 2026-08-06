import Image from "next/image";
import Link from "next/link";
import { LAB_CROSS_SELL_MALAGA } from "@/data/lab";

export default function LabCrossSellMalaga() {
  return (
    <section className="bg-[#1a0e08] text-white py-20 md:py-28 overflow-hidden relative">
      <Image
        src="/media/lab-cross-sell-malaga.webp"
        alt="Malaga — slunce na kole"
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(26,14,8,0.92) 0%, rgba(26,14,8,0.7) 60%, rgba(26,14,8,0.4) 100%)",
        }}
      />

      <div className="relative max-w-[1100px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-xs tracking-[0.22em] uppercase font-bold mb-4" style={{ color: "#FFA98F" }}>
          {LAB_CROSS_SELL_MALAGA.eyebrow}
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1] max-w-2xl">
          {LAB_CROSS_SELL_MALAGA.title}
        </h2>
        <p className="mt-5 text-lg text-white/80 max-w-2xl leading-relaxed">
          {LAB_CROSS_SELL_MALAGA.text}
        </p>

        <Link
          href={LAB_CROSS_SELL_MALAGA.href}
          className="mt-9 inline-flex items-center gap-2 px-7 py-4 text-sm font-bold text-white rounded-full transition-all hover:opacity-90"
          style={{ backgroundColor: "#E8431A", boxShadow: "0 4px 24px #E8431A50" }}
        >
          {LAB_CROSS_SELL_MALAGA.cta}
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
