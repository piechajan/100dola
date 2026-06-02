import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProductBySlugMerged } from "@/lib/shop/get-products";
import ReviewForm from "./ReviewForm";

export const metadata: Metadata = {
  title: "Napsat recenzi — 100dola sport",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ReviewSubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; order?: string }>;
}) {
  const params = await searchParams;
  const slug = params.slug;
  if (!slug) notFound();
  const product = await getProductBySlugMerged(slug);
  if (!product) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[640px] mx-auto px-6 md:px-12 py-10 md:py-14">
          <Link href={`/shop/${slug}`} className="text-xs text-[#9AA3C2] hover:text-[#3B7CF4] mb-4 inline-flex items-center gap-1.5">
            ← Zpět na produkt
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-2">
            Napsat recenzi
          </h1>
          <p className="text-sm text-[#5A6480] mb-2">
            <strong>{product.name}</strong>
          </p>
          <p className="text-sm text-[#9AA3C2] mb-8">
            Tvoje recenze pomůže dalším cyklistům s rozhodováním. Před zveřejněním ji rychle projdeme — typicky do 24 h.
          </p>

          <ReviewForm
            productSlug={product.slug}
            productName={product.name}
            orderIdHint={params.order ?? ""}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
