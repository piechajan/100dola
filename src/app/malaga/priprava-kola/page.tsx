import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MALAGA_BRAND } from "@/data/malaga";
import {
  BOX,
  CARRY,
  EXTRA,
  CABIN_ONLY,
  PACKING_TIPS,
  type PrepItem,
} from "@/data/malaga-priprava";

const accent = MALAGA_BRAND.color;

export const metadata: Metadata = {
  title: "Příprava kola do Malagy — co s sebou a jak ho zabalit",
  description:
    "Jak připravit kolo na přepravu do Malagy: doporučené rozměry krabice (25 × 86 × 170 cm), výbava, nabíječky, duše, imbusy a co patří do příručního zavazadla.",
  alternates: { canonical: "/malaga/priprava-kola" },
};

const breadcrumbsJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "100dola Malaga", item: "https://www.100dola.com/malaga" },
    { "@type": "ListItem", position: 2, name: "Přeprava kola", item: "https://www.100dola.com/malaga/preprava" },
    { "@type": "ListItem", position: 3, name: "Příprava kola", item: "https://www.100dola.com/malaga/priprava-kola" },
  ],
};

function ItemList({ items }: { items: PrepItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.title} className="flex gap-3">
          <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
          <div>
            <div className="font-bold text-[#1a1a2e]">{i.title}</div>
            <div className="text-sm text-[#5A6480] leading-relaxed">{i.detail}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function PripravaKolaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <Navbar />
      <main className="pt-20">
        {/* Hero */}
        <section className="pt-32 pb-10 md:pt-40 md:pb-14 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="text-xs text-[#9AA3C2] mb-6">
              <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
              <span className="mx-2">/</span>
              <Link href="/malaga/preprava" className="hover:text-[#1a1a2e]">Přeprava kola</Link>
              <span className="mx-2">/</span>
              <span className="text-[#1a1a2e] font-semibold">Příprava kola</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px" style={{ backgroundColor: accent }} />
              <span className="text-xs tracking-[0.18em] uppercase font-bold" style={{ color: accent }}>
                Příprava
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#1a1a2e] leading-[0.98] max-w-3xl">
              Co s sebou a jak kolo <span style={{ color: accent }}>přichystat.</span>
            </h1>
            <p className="mt-6 text-lg text-[#5A6480] leading-relaxed max-w-2xl">
              Krátký seznam, ať se po příletu hned vyjede. Rozměry krabice,
              výbava, nabíječky a to, co patří do příručního zavazadla.
            </p>
          </div>
        </section>

        {/* Rozměry krabice */}
        <section className="py-10 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="rounded-2xl border border-[#E2E6F3] bg-[#F7F9FF] p-6 md:p-8">
              <h2 className="text-2xl font-black text-[#1a1a2e]">{BOX.title}</h2>
              <p className="mt-2 text-[#5A6480] max-w-2xl">{BOX.intro}</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 max-w-lg">
                {BOX.dims.map((d) => (
                  <div key={d.label} className="rounded-xl bg-white border border-[#E2E6F3] p-4 text-center">
                    <dt className="text-xs uppercase tracking-wider text-[#9AA3C2] font-bold">{d.label}</dt>
                    <dd className="mt-1 text-xl font-black text-[#1a1a2e]">{d.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-[#5A6480] max-w-2xl">{BOX.note}</p>
            </div>
          </div>
        </section>

        {/* Výbava + extra */}
        <section className="py-10 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-black text-[#1a1a2e] mb-5">Co s sebou</h2>
              <ItemList items={CARRY} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#1a1a2e] mb-5">Co se ještě hodí</h2>
              <ItemList items={EXTRA} />
            </div>
          </div>
        </section>

        {/* Příruční zavazadlo */}
        <section className="py-10 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="rounded-2xl border border-[#FBD38D] bg-[#FFF7ED] p-6 md:p-8">
              <h2 className="text-2xl font-black text-[#1a1a2e]">Do příručního zavazadla</h2>
              <ul className="mt-4 space-y-2 text-sm text-[#7A5615] leading-relaxed">
                {CABIN_ONLY.map((i) => (
                  <li key={i.text} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>
                      {i.text}
                      {i.link && (
                        <>
                          {" "}
                          <Link href={i.link.path} className="font-bold text-[#E8431A] hover:underline">
                            {i.link.label}
                          </Link>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Balení */}
        <section className="py-10 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
            <h2 className="text-2xl font-black text-[#1a1a2e] mb-5">Jak kolo zabalit</h2>
            <div className="max-w-2xl">
              <ItemList items={PACKING_TIPS} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 md:py-20 bg-[#1a0e08]">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 text-white">
            <h2 className="text-3xl md:text-4xl font-black leading-tight max-w-2xl">
              Nejsi si jistý rozměry nebo balením?
            </h2>
            <p className="mt-3 text-white/70 text-lg max-w-xl">
              Napiš nám typ kola a odpovíme dřív, než ho začneš balit.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/malaga/preprava#poptavka"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-black text-sm hover:opacity-90 transition"
                style={{ backgroundColor: accent }}
              >
                Poptat přepravu
              </Link>
              <a
                href="tel:+420739045057"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/40 text-white font-black text-sm hover:bg-white/10 transition"
              >
                Zavolat +420 739 045 057
              </a>
            </div>
            <p className="mt-6 text-sm text-white/60">
              Přeprava je pojištěná. Více na{" "}
              <Link href="/malaga/preprava" className="underline hover:text-white">stránce přepravy</Link>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
