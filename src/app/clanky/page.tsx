import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  ARTICLES,
  CATEGORY_LABEL,
  CATEGORY_COLOR,
  type ArticleCategory,
} from "@/data/articles";

export const metadata: Metadata = {
  title: "Magazín · 100dola",
  description:
    "Články o cyklistice, servisu kol, cestování s kolem do Malagy a komunitě Open Miles Clinic. Návody, recenze, akce a tipy z praxe.",
  alternates: { canonical: "/clanky" },
  openGraph: {
    title: "Magazín · 100dola",
    description: "Cyklistika, servis, Malaga, komunita. Z praxe, ne z teorie.",
    url: "/clanky",
  },
};

const SITE = "https://www.100dola.com";

export default function MagazinPage() {
  const sorted = [...ARTICLES].sort((a, b) => {
    // published first, then by date desc
    if (a.status !== b.status) return a.status === "published" ? -1 : 1;
    return b.publishedAt.localeCompare(a.publishedAt);
  });

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "100dola Magazín",
    url: `${SITE}/clanky`,
    itemListElement: sorted
      .filter((a) => a.status === "published")
      .map((a, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE}/clanky/${a.slug}`,
        name: a.title,
      })),
  };

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        {/* Hero */}
        <section className="bg-white border-b border-[#E2E6F3]">
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-12 md:py-16">
            <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2">
              Magazín · 100dola
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-3">
              Z praxe, ne z teorie.
            </h1>
            <p className="text-base md:text-lg text-[#5A6480] max-w-2xl leading-relaxed">
              Návody, recenze a tipy okolo cyklistiky, servisu kol, cestování s kolem do
              Malagy a komunity Open Miles Clinic. Píšeme jen o tom, co opravdu jedeme.
            </p>
          </div>
        </section>

        {/* Grid článků */}
        <section className="max-w-[1100px] mx-auto px-6 md:px-12 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>

          <p className="text-xs text-[#9AA3C2] text-center mt-12 max-w-xl mx-auto">
            Postupně doplňujeme. Pokud chceš dostávat nové články e-mailem, přihlas se k
            odběru na{" "}
            <Link href="/community#newsletter" className="font-bold text-[#3B7CF4] hover:underline">
              novinkám Open Miles Clinic
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ArticleCard({ a }: { a: (typeof ARTICLES)[number] }) {
  const color = CATEGORY_COLOR[a.category];
  const isDraft = a.status === "draft";
  const cardClass = `flex flex-col bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden transition-all ${
    isDraft ? "opacity-70" : "hover:border-[#1a1a2e]/20 hover:shadow-lg"
  }`;

  const body = (
    <>
      <div className="relative aspect-[16/10] bg-[#F0F2FA]">
        <Image
          src={a.image}
          alt={a.title}
          fill
          className={`object-cover ${isDraft ? "grayscale" : ""}`}
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
        />
        {isDraft && (
          <div className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-bold text-white bg-black/60 px-2 py-1 rounded-full">
            Připravujeme
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div
          className="inline-flex self-start text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full mb-3"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {CATEGORY_LABEL[a.category]}
        </div>
        <h2 className="text-base md:text-lg font-black text-[#1a1a2e] leading-snug mb-2">
          {a.title}
        </h2>
        <p className="text-sm text-[#5A6480] leading-relaxed mb-4 flex-1">{a.summary}</p>
        <div className="flex items-center justify-between text-xs text-[#9AA3C2] mt-auto">
          <span>{a.author.name}</span>
          {a.status === "published" ? (
            <span>
              {a.publishedAt &&
                new Date(a.publishedAt).toLocaleDateString("cs-CZ", {
                  day: "numeric",
                  month: "long",
                })}
              {a.readMinutes && ` · ${a.readMinutes} min`}
            </span>
          ) : (
            <span>Brzy</span>
          )}
        </div>
      </div>
    </>
  );

  if (isDraft) {
    return <div className={cardClass}>{body}</div>;
  }

  return (
    <Link href={`/clanky/${a.slug}`} className={cardClass}>
      {body}
    </Link>
  );
}
