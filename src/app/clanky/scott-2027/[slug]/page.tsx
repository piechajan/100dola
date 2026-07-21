import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScottPlatformPage from "@/components/scott-2027/ScottPlatformPage";
import { SCOTT_2027, getPlatformBySlug } from "@/data/scott-2027";

export function generateStaticParams() {
  return SCOTT_2027.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);
  if (!platform) return {};
  return {
    title: `${platform.name} 2027 — ${platform.tagline} | 100dola sport`,
    description: `${platform.claim} ${platform.variants.length} variant. Specs, váhy, ceny v EUR a poptávka.`,
    alternates: { canonical: `/clanky/scott-2027/${slug}` },
    keywords: platform.seoKeywords.join(", "),
    openGraph: {
      title: `${platform.name} 2027`,
      description: platform.tagline,
      type: "article",
      images: platform.variants[0]?.photo ? [platform.variants[0].photo] : undefined,
    },
  };
}

export default async function ScottPlatformRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);
  if (!platform) notFound();

  // Product schema per variant — pro Google rich snippets
  const productSchemas = platform.variants.map((v) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Scott ${v.name}`,
    image: `https://www.100dola.com${v.photo}`,
    description: `${platform.claim} ${v.name}: ${v.groupset}, ${v.wheels}.`,
    brand: { "@type": "Brand", name: "Scott" },
    sku: `scott-${v.slug}`,
    // Cenu do offers dáváme jen když je známá — preferujeme přesnou CZK.
    ...((v.priceCzk != null || v.priceEur != null) && {
      offers: {
        "@type": "Offer",
        url: `https://www.100dola.com/clanky/scott-2027/${slug}/${v.slug}`,
        priceCurrency: v.priceCzk != null ? "CZK" : "EUR",
        price: v.priceCzk ?? v.priceEur,
        availability: "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "100dola sport" },
      },
    }),
  }));

  return (
    <>
      {productSchemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <Navbar />
      <main className="pt-20">
        <ScottPlatformPage platform={platform} />
      </main>
      <Footer />
    </>
  );
}
