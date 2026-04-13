import Link from "next/link";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Scott Addict RC 10",
    year: "2026",
    category: "Silniční kola",
    price: "159 900 Kč",
    badge: "Doporučuje tým",
    note: "Kolo, na kterém jezdíme v Malaze",
    photo: "/media/scott-addict-rc10.png",
    photoBg: "#f0f2f7",
    specs: ["Shimano Ultegra Di2", "Syncros Carbon 40mm", "~7 kg"],
  },
  {
    id: 2,
    name: "Gregarius Q36.5 Pro Jersey",
    year: "2025",
    category: "Cyklistické oblečení",
    price: "3 290 Kč",
    badge: null,
    note: "Dres, který jedeme my",
    photo: "https://www.q36-5.com/media/44/51/b4/1734343420/038PRO25-GregariusQ36.5ProCyclingTeamShortsSleeveJersey-1.png",
    photoBg: "#ffffff",
    specs: ["112 g (vel. M)", "4 speciální materiály", "Made in Italy"],
  },
  {
    id: 3,
    name: "Magicshine Seemee R300",
    year: null,
    category: "Radarové světlo",
    price: "3 190 Kč",
    badge: "Buď vidět",
    note: "Funkce jako Garmin Varia + USB-C. Za zlomek ceny.",
    photo: "/media/seemee-r300.jpg",
    photoBg: "#ffffff",
    specs: ["Radar 140 m dozadu", "ANT+ / Bluetooth", "100 h výdrž, USB-C"],
  },
  {
    id: 4,
    name: "Dynastar M-Vertical 88 Open",
    year: "2026",
    category: "Skialpové lyže",
    price: "20 990 Kč",
    badge: "Novinka",
    note: "Skialpová sezóna s OMC",
    photo: "https://www.dynastar-lange.com/dw/image/v2/BJJZ_PRD/on/demandware.static/-/Sites-rossignol-catalog/default/dw966b7994/images/large/DANM301_000_72DPI_01.jpg",
    photoBg: "#f5f7fa",
    specs: ["88mm waist", "1.18 kg / lyži", "Paulownia core"],
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
  year,
  category,
  price,
  badge,
  note,
  photo,
  photoBg,
  gradient,
  specs,
}: {
  name: string;
  year: string | null;
  category: string;
  price: string;
  badge: string | null;
  note: string | null;
  photo: string | null;
  photoBg: string | null;
  gradient?: string;
  specs: string[];
}) {
  return (
    <Link href="/shop" className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E8E8] hover:border-[#E8431A]/20 hover:shadow-lg transition-all duration-200">

      {/* Image area */}
      <div
        className={`relative aspect-[4/3] flex items-center justify-center overflow-hidden ${!photo ? `bg-gradient-to-br ${gradient}` : ""}`}
        style={photo && photoBg ? { backgroundColor: photoBg } : undefined}
      >
        {photo ? (
          <Image
            src={photo}
            alt={name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5} opacity={0.4}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
        )}

        {badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: badge === "Doporučuje tým" ? "#E8431A" : badge === "Novinka" ? "#2EAA6E" : badge === "Buď vidět" ? "#3B7CF4" : "#1a1a1a" }}
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
        <h3 className="text-sm font-bold text-[#111111] leading-snug">
          {name} {year && <span className="text-[#9A9A9A] font-medium">{year}</span>}
        </h3>

        {specs.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {specs.map((s) => (
              <li key={s} className="text-[10px] text-[#9A9A9A] flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#E8431A] shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        )}

        {note && (
          <p className="text-[11px] text-[#E8431A] mt-2 font-medium italic">{note}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F4F4F4] mt-3">
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
