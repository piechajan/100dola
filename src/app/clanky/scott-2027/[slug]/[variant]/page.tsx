import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VariantDetailPage from "@/components/scott-2027/VariantDetailPage";
import { SCOTT_2027, getVariantBySlug } from "@/data/scott-2027";

export function generateStaticParams() {
  return SCOTT_2027.flatMap((p) =>
    p.variants.map((v) => ({ slug: p.slug, variant: v.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; variant: string }>;
}): Promise<Metadata> {
  const { slug, variant } = await params;
  const found = getVariantBySlug(slug, variant);
  if (!found) return {};
  const { platform, variant: v } = found;
  const sizes = v.sizes.join(", ");
  return {
    title: `Scott ${v.name} 2027 — ${v.groupset} | 100dola sport`,
    description: `${platform.claim} ${v.name}: ${v.groupset}, ${v.wheels}${v.weightKg ? `, ${v.weightKg} kg` : ""}. Velikosti ${sizes}. Specs, fotky a poptávka.`,
    alternates: { canonical: `/clanky/scott-2027/${slug}/${variant}` },
    keywords: [`scott ${v.slug} 2027`, `scott ${v.name.toLowerCase()}`, ...platform.seoKeywords].join(", "),
    openGraph: {
      title: `Scott ${v.name} 2027`,
      description: `${v.groupset} · ${v.wheels}${v.weightKg ? ` · ${v.weightKg} kg` : ""}`,
      type: "article",
      images: [v.photo],
    },
  };
}

export default async function VariantRoute({
  params,
}: {
  params: Promise<{ slug: string; variant: string }>;
}) {
  const { slug, variant } = await params;
  const found = getVariantBySlug(slug, variant);
  if (!found) notFound();
  const { platform, variant: v } = found;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Scott ${v.name}`,
    image: v.gallery.map((g) => `https://www.100dola.com${g}`),
    description: `${platform.claim} ${v.componentry?.frame ?? ""}`,
    brand: { "@type": "Brand", name: "Scott" },
    sku: `scott-${v.slug}-2027`,
    // Cenu do schématu dáváme jen když je známá — preferujeme přesnou CZK.
    ...((v.priceCzk != null || v.priceEur != null) && {
      offers: {
        "@type": "Offer",
        url: `https://www.100dola.com/clanky/scott-2027/${slug}/${variant}#inquiry`,
        priceCurrency: v.priceCzk != null ? "CZK" : "EUR",
        price: v.priceCzk ?? v.priceEur,
        availability: "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "100dola sport" },
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Navbar />
      <main className="pt-20">
        <VariantDetailPage platform={platform} variant={v} />
      </main>
      <Footer />
    </>
  );
}
