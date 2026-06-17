import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScottComparison from "@/components/scott-2027/ScottComparison";

export const metadata: Metadata = {
  title: "Srovnání Scott 2027 modelů — 100dola sport",
  description:
    "Porovnej dva libovolné Scott modely vedle sebe — groupset, kola, brzdy, váha, cena. Doporučená srovnání (Spark RC SL vs World Cup, Addict 30 vs 20, Addict RC 10 vs Addict 10).",
  alternates: { canonical: "/clanky/scott-2027/srovnani" },
  keywords:
    "scott srovnání 2027, scott spark rc sl vs world cup, scott addict 30 vs 20, scott addict rc vs addict, srovnání kol scott",
  openGraph: {
    title: "Srovnání Scott 2027 — model k modelu",
    description:
      "Side-by-side groupset, kola, brzdy, váha, cena. Pro váhající rozhodnutí mezi platformami.",
    type: "article",
  },
};

export default async function ScottComparisonRoute({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <ScottComparison initialA={a} initialB={b} />
      </main>
      <Footer />
    </>
  );
}
