import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Orbea Orca M20 Team",
    category: "Silniční kola",
    price: "74 990 Kč",
    badge: "Doporučuje tým",
    note: "Kolo, na kterém jezdíme v Malaze",
    gradient: "from-zinc-800 to-zinc-900",
    tag: "sport",
  },
  {
    id: 2,
    name: "Castelli Velocissima 4",
    category: "Cyklistické oblečení",
    price: "4 290 Kč",
    badge: null,
    note: null,
    gradient: "from-stone-700 to-stone-900",
    tag: "sport",
  },
  {
    id: 3,
    name: "Garmin Edge 1050",
    category: "Cyklocomputer",
    price: "18 490 Kč",
    badge: "Bestseller",
    note: null,
    gradient: "from-slate-700 to-slate-900",
    tag: "sport",
  },
  {
    id: 4,
    name: "Dynafit Radical 88",
    category: "Skialpové lyže",
    price: "28 900 Kč",
    badge: "Novinka",
    note: "Brzy i na Open Miles Clinic",
    gradient: "from-blue-900 to-slate-900",
    tag: "skialpy",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-px bg-[#E8431A]" />
              <span className="text-xs tracking-[0.18em] uppercase font-semibold text-[#E8431A]">
                100dola sport
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#111111]">
              Aktuálně doporučujeme
            </h2>
            <p className="mt-2 text-sm text-[#666666] max-w-md">
              Nevybíráme pro kvantitu. Každý produkt prošel rukama někoho, kdo ho opravdu používá.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:text-[#E8431A] transition-colors shrink-0"
          >
            Celý shop
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  name,
  category,
  price,
  badge,
  note,
  gradient,
}: {
  name: string;
  category: string;
  price: string;
  badge: string | null;
  note: string | null;
  gradient: string;
}) {
  return (
    <Link href="/shop" className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E8E8] hover:border-[#E8431A]/20 hover:shadow-lg transition-all duration-200">

      {/* Image area */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {/* Placeholder product visual */}
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5} opacity={0.4}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: badge === "Doporučuje tým" ? "var(--accent)" : badge === "Novinka" ? "var(--community-color)" : "#1a1a1a",
                color: "white",
              }}
            >
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[10px] tracking-wider uppercase text-[#9A9A9A] font-medium mb-1">
          {category}
        </div>
        <h3 className="text-sm font-bold text-[#111111] leading-snug mb-auto">
          {name}
        </h3>

        {note && (
          <p className="text-[11px] text-[#E8431A] mt-2 font-medium italic">
            {note}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F4F4F4]">
          <span className="text-base font-black text-[#111111]">{price}</span>
          <button
            className="p-2 rounded-full bg-[#F4F4F4] group-hover:bg-[#E8431A] transition-colors duration-200"
            aria-label="Přidat do košíku"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="text-[#666666] group-hover:text-white transition-colors">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
