import Link from "next/link";
import Image from "next/image";
import { PRODUCTS, formatPrice } from "@/data/products";
import { ACTIVE_PROMO, promoPrice } from "@/lib/promo";

const PICK_SLUG = "cycplus-t2h";

/**
 * „Nejlepší poměr cena/výkon" — jedno konkrétní doporučení nad výpisem
 * trenažérů. Studený návštěvník z reklamy nechce srovnávat sedm modelů;
 * pomůže mu jasná volba a až pod ní celý výpis. Server komponenta (obsah v HTML).
 * Cena s kódem se zobrazí jen dokud kód platí (ACTIVE_PROMO).
 */
export default function TrainerPick() {
  const p = PRODUCTS.find((x) => x.slug === PICK_SLUG);
  if (!p) return null;

  const withCode = ACTIVE_PROMO ? promoPrice(p.priceWithVat, p.slug) : null;

  return (
    <section
      aria-label="Doporučený trenažér"
      className="rounded-2xl border border-[#E2E6F3] bg-white p-5 md:p-6 flex flex-col sm:flex-row gap-5 items-center"
    >
      <div className="relative w-40 h-40 shrink-0">
        <Image
          src={p.photo}
          alt={p.name}
          fill
          sizes="160px"
          className="object-contain"
        />
      </div>
      <div className="flex-1 text-center sm:text-left">
        <div className="text-[11px] tracking-[0.18em] uppercase font-bold text-[#3B7CF4]">
          Náš nejlepší poměr cena/výkon
        </div>
        <h2 className="mt-1 text-xl font-black text-[#1a1a2e]">{p.name}</h2>
        <p className="mt-1 text-sm text-[#5A6480]">
          85 Nm točivého momentu, simulace stoupání až 20 %, přímý pohon.
          Pro většinu jezdců na Zwiftu a Rouvy stačí.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          {withCode !== null ? (
            <div>
              <span className="text-2xl font-black text-[#1a1a2e]">{formatPrice(withCode)}</span>
              <span className="ml-2 text-sm text-[#9AA3C2] line-through">{formatPrice(p.priceWithVat)}</span>
              <div className="text-[11px] text-[#5A6480]">s kódem 100dola</div>
            </div>
          ) : (
            <span className="text-2xl font-black text-[#1a1a2e]">{formatPrice(p.priceWithVat)}</span>
          )}
          <Link
            href={`/shop/${p.slug}`}
            className="inline-flex items-center px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90 transition"
          >
            Zobrazit T2H
          </Link>
        </div>
      </div>
    </section>
  );
}
