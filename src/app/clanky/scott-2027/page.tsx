import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Scott2027Hub from "@/components/scott-2027/Scott2027Hub";

export const metadata: Metadata = {
  title: "Scott 2027 lineup — Spark, Scale, Addict, Addict RC, Addict Gravel | 100dola sport",
  description:
    "Co Scott chystá pro modelový rok 2027. Honest přehled MTB, silnice a gravelu — který model je reálná novinka, který carry-over a kde redesign teprve čekáme. Specs, ceny v EUR a poptávka.",
  alternates: { canonical: "/clanky/scott-2027" },
  openGraph: {
    title: "Scott 2027 lineup — Spark, Scale, Addict, Addict RC, Addict Gravel",
    description: "Honest přehled co Scott chystá pro 2027 a co je carry-over.",
    type: "article",
  },
};

export default function Scott2027Page() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Scott2027Hub />
      </main>
      <Footer />
    </>
  );
}
