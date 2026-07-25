import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getPublishedLocations, getLocationBySlug } from "@/data/locations";
import { breadcrumbSchema, faqPageSchema } from "@/lib/seo/schema-helpers";
import { storeSchema } from "@/lib/schema-org";

// Jen publikované lokality mají statickou stránku. Nepublikované (Valmez/Vsetín)
// vrací 404, dokud se v datech nepřepne published:true.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedLocations().map((l) => ({ mesto: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mesto: string }>;
}): Promise<Metadata> {
  const { mesto } = await params;
  const loc = getLocationBySlug(mesto);
  if (!loc || !loc.published) return { title: "Prodejna — 100dola sport" };
  const url = `/prodejna/${loc.slug}`;
  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    keywords: loc.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      url,
      type: "website",
      locale: "cs_CZ",
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ mesto: string }>;
}) {
  const { mesto } = await params;
  const loc = getLocationBySlug(mesto);
  if (!loc || !loc.published) notFound();

  const breadcrumb = breadcrumbSchema([
    { name: "100dola sport", url: "/" },
    { name: `Prodejna ${loc.city}`, url: `/prodejna/${loc.slug}` },
  ]);
  const faq = faqPageSchema(loc.faq.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faq} />
      {/* Reálná LocalBusiness schema jen pro kamennou prodejnu (Šternberk).
          U výdejních/připravovaných měst by adresa neseděla → jen breadcrumb+FAQ. */}
      {loc.type === "store" && <JsonLd data={storeSchema()} />}

      <Navbar />
      <main className="pt-20 bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#F7F9FF] to-white border-b border-[#E2E6F3]">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-14 md:py-20">
            <nav className="text-xs text-[#9AA3C2] mb-4">
              <Link href="/" className="hover:text-[#3B7CF4]">
                100dola sport
              </Link>{" "}
              / <span className="text-[#5A6480]">Prodejna {loc.city}</span>
            </nav>
            <div className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-[#3B7CF4] mb-3">
              {loc.type === "store"
                ? "Kamenná prodejna"
                : loc.type === "pickup"
                  ? "Výdej + doručení"
                  : loc.type === "community"
                    ? "Social rides · komunita"
                    : "Připravujeme"}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-5">
              {loc.h1}
            </h1>
            <p className="text-base md:text-lg text-[#5A6480] leading-relaxed max-w-[720px]">
              {loc.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Prohlédnout e-shop
              </Link>
              <Link
                href="/kontakt"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4] transition-colors"
              >
                Kontakt a otevírací doba
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loc.highlights.map((h) => (
              <div
                key={h.title}
                className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6"
              >
                <h2 className="text-lg font-black text-[#1a1a2e] mb-2">{h.title}</h2>
                <p className="text-sm text-[#5A6480] leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Local angle (Valmez social rides apod.) */}
        {loc.localAngle && (
          <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-6">
            <div className="bg-[#1a1a2e] text-white rounded-2xl p-7 md:p-9">
              <h2 className="text-xl md:text-2xl font-black mb-3">{loc.localAngle.title}</h2>
              <p className="text-sm md:text-base text-white/80 leading-relaxed">
                {loc.localAngle.body}
              </p>
            </div>
          </section>
        )}

        {/* Jak to funguje */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
          <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-3">
            Jak to {loc.cityLocative} funguje
          </h2>
          <p className="text-sm md:text-base text-[#5A6480] leading-relaxed">{loc.logistics}</p>
        </section>

        {/* FAQ */}
        {loc.faq.length > 0 && (
          <section className="max-w-[900px] mx-auto px-4 md:px-6 py-8 pb-16">
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-5">Časté dotazy</h2>
            <div className="space-y-4">
              {loc.faq.map((f) => (
                <div key={f.q} className="border-b border-[#E2E6F3] pb-4">
                  <h3 className="text-base font-bold text-[#1a1a2e] mb-1.5">{f.q}</h3>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-[#F7F9FF] border-t border-[#E2E6F3]">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
              Poradíme ti s výběrem
            </h2>
            <p className="text-sm md:text-base text-[#5A6480] mb-6 max-w-[560px] mx-auto">
              Nevíš, co přesně potřebuješ? Napiš nebo zavolej — poradíme s kolem, vybavením i
              výživou podle toho, jak a kde jezdíš.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/kontakt"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Kontaktuj nás
              </Link>
              <a
                href="tel:+420739045057"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4] transition-colors"
              >
                +420 739 045 057
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
