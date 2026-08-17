import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Vyhledávání — 100dola sport",
  robots: { index: false, follow: true },
};

export default function HledatPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FAFAFA]">
        <Suspense fallback={null}>
          <SearchResults />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
