import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopLayout from "@/components/shop/ShopLayout";
import { getShopProducts } from "@/lib/shop/get-products";

export const metadata: Metadata = {
  title: { absolute: "E-shop — 100dola sport" },
  description: "Kola, zimní výbava, doplňky a výživa. Každý produkt jsme si sami vyzkoušeli nebo ho jedeme. Scott, Isaac, Lapierre, Ridley, Pinarello, Continental, MagicShine a další.",
  alternates: { canonical: "/shop" },
  keywords: ["100dola shop", "silniční kola", "MTB kola", "gravel kola", "skialpy", "cyklistické doplňky", "Scott", "Lapierre", "Ridley", "Pinarello"],
  openGraph: {
    title: "E-shop — 100dola sport",
    description: "Výbava od těch, co to jedou.",
    images: ["/media/sport-hero.jpg"],
  },
};

// Revaliduj merged katalog jednou za 6 hodin — supplier_products se mění denně
// cronem, vlastní static PRODUCTS jsou v gitu. Důvod 6h místo 1h: redukce
// ISR Writes na free Vercel plan (200k/měsíc quota).
export const revalidate = 21600;

export default async function ShopPage() {
  const products = await getShopProducts();
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ShopLayout products={products} />
      </main>
      <Footer />
    </>
  );
}
