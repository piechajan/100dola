import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopLayout from "@/components/shop/ShopLayout";
import { getShopProducts } from "@/lib/shop/get-products";

export const metadata: Metadata = {
  title: "E-shop — 100dola sport",
  description: "Kola, zimní výbava, doplňky a výživa. Každý produkt jsme si sami vyzkoušeli nebo ho jedeme. Scott, Isaac, Lapierre, Continental, MagicShine a další.",
  keywords: ["100dola shop", "silniční kola", "MTB kola", "gravel kola", "skialpy", "cyklistické doplňky", "Scott", "Lapierre"],
  openGraph: {
    title: "E-shop — 100dola sport",
    description: "Výbava od těch, co to jedou.",
    images: ["/media/sport-hero.jpg"],
  },
};

// Revaliduj merged katalog každou hodinu — supplier_products se mění denně cronem,
// vlastní static PRODUCTS jsou v gitu.
export const revalidate = 3600;

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
