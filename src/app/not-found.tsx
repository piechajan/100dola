import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Stránka nenalezena · 100dola",
  description: "Tato stránka neexistuje nebo byla přesunuta.",
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="pt-24 bg-[#F7F9FF] min-h-[70vh] flex items-center">
        <div className="max-w-[600px] mx-auto px-6 md:px-12 text-center">
          <div className="text-7xl md:text-9xl font-black text-[#3B7CF4] leading-none mb-4">
            404
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
            Tady to nic není.
          </h1>
          <p className="text-base text-[#5A6480] max-w-md mx-auto mb-8">
            Stránka neexistuje nebo se přesunula. Mrkni se na hlavní rozcestník, ať tě ten odkaz
            nezavedl příliš daleko.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90"
            >
              Domů
            </Link>
            <Link
              href="/sport"
              className="px-5 py-3 rounded-full border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4]"
            >
              100dola sport
            </Link>
            <Link
              href="/malaga"
              className="px-5 py-3 rounded-full border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4]"
            >
              100dola Malaga
            </Link>
            <Link
              href="/community"
              className="px-5 py-3 rounded-full border border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4]"
            >
              Open Miles Clinic
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
