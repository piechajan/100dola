import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema-helpers";
import ScottBikeGallery from "@/components/scott/ScottBikeGallery";
import {
  SCOTT_TEST_BIKES,
  SCOTT_TEST_PRODUCT_PAGES_LIVE,
  getScottTestBike,
} from "@/data/scott-test-bikes";

export const dynamicParams = false;

export function generateStaticParams() {
  return SCOTT_TEST_BIKES.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bike = getScottTestBike(slug);
  if (!bike) return {};
  return {
    title: `SCOTT ${bike.model.replace(/^SCOTT\s+/, "")} — testovací jízda | 100dola sport`,
    description: `${bike.model} (${bike.cat}) k zapůjčení ve Šternberku: ${bike.specs.join(", ")}. Rezervuj si testovací jízdu.`,
    alternates: { canonical: `/vyzkousej-scott/${bike.slug}` },
    openGraph: {
      title: `${bike.model} — testovací jízda | 100dola sport`,
      description: `${bike.cat} · ${bike.specs.join(" · ")}`,
      url: `/vyzkousej-scott/${bike.slug}`,
      type: "website",
      locale: "cs_CZ",
      images: bike.photos[0] ? [{ url: bike.photos[0] }] : undefined,
    },
  };
}

export default async function ScottBikeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bike = getScottTestBike(slug);
  if (!bike) notFound();

  // Budoucí přepnutí: až bude e-shop napojený, flag + productSlug pošlou
  // uživatele rovnou na feed-driven produktovou stránku (koupě) místo detailu.
  if (SCOTT_TEST_PRODUCT_PAGES_LIVE && bike.productSlug) {
    redirect(`/shop/${bike.productSlug}`);
  }

  const breadcrumb = breadcrumbSchema([
    { name: "100dola sport", url: "/" },
    { name: "Vyzkoušej SCOTT", url: "/vyzkousej-scott" },
    { name: bike.model, url: `/vyzkousej-scott/${bike.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />

      <Navbar />
      <main className="pt-20 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-10 md:py-14">
          {/* Breadcrumb */}
          <nav className="text-xs text-[#9AA3C2] mb-6">
            <Link href="/" className="hover:text-[#3B7CF4]">
              100dola sport
            </Link>{" "}
            /{" "}
            <Link href="/vyzkousej-scott" className="hover:text-[#3B7CF4]">
              Vyzkoušej SCOTT
            </Link>{" "}
            / <span className="text-[#5A6480]">{bike.model}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            {/* Galerie */}
            <ScottBikeGallery photos={bike.photos} alt={bike.model} />

            {/* Detail */}
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-[#3B7CF4] mb-2">
                {bike.cat}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-5">
                {bike.model}
              </h1>

              {/* Specs */}
              <div className="rounded-2xl border border-[#E2E6F3] bg-[#F7F9FF] p-5 md:p-6 mb-5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-3">
                  Výbava
                </div>
                <ul className="space-y-2">
                  {bike.specs.map((s) => (
                    <li key={s} className="text-sm text-[#5A6480] leading-snug flex gap-2">
                      <span className="text-[#3B7CF4] flex-shrink-0 font-bold">·</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Velikosti */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-2">
                  Dostupné velikosti
                </div>
                <div className="flex flex-wrap gap-2">
                  {bike.sizes.map((s) => (
                    <span
                      key={s}
                      className="px-4 py-2 rounded-xl border-2 border-[#E2E6F3] bg-white text-sm font-black text-[#1a1a2e]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/vyzkousej-scott#rezervace"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90 transition-opacity"
              >
                Vybrat pro rezervaci →
              </Link>
              <p className="text-xs text-[#9AA3C2] mt-3">
                Zápůjčka silničního SCOTTu na vyjížďku je zdarma, počet kol je omezený.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
