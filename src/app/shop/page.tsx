import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShopLayout from "@/components/shop/ShopLayout";

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

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ShopLayout />
      </main>
      <Footer />
    </>
  );
}
