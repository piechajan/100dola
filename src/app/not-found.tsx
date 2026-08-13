import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Stránka nenalezena · 100dola",
  description: "Tato stránka neexistuje nebo byla přesunuta.",
  robots: { index: false, follow: true },
};

const QUICK_LINKS = [
  { href: "/", label: "Domů", primary: true },
  { href: "/shop", label: "E-shop" },
  { href: "/sport", label: "Sport" },
  { href: "/malaga", label: "Malaga" },
  { href: "/community", label: "Community" },
];

const POPULAR_CATEGORIES = [
  { href: "/shop/kola/silnicni", label: "Silniční kola" },
  { href: "/shop/kola/gravel", label: "Gravel" },
  { href: "/shop/obleceni/obleceni-dresy", label: "Dresy" },
  { href: "/shop/doplnky/helmy", label: "Helmy" },
  { href: "/shop/doplnky/vyplety", label: "Výplety" },
  { href: "/shop/vyziva", label: "Výživa" },
];

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="pt-24 bg-[#F7F9FF] min-h-[70vh] py-12 md:py-20">
        <div className="max-w-[760px] mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <div className="text-7xl md:text-9xl font-black text-[#3B7CF4] leading-none mb-4">
              404
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
              Tady to nic není.
            </h1>
            <p className="text-base text-[#5A6480] max-w-md mx-auto">
              Stránka neexistuje nebo se přesunula. Buď se vrať domů, nebo zkus prohledat shop.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  l.primary
                    ? "bg-[#3B7CF4] text-white hover:opacity-90"
                    : "border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4] hover:text-[#3B7CF4]"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Popular shop categories */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-4 text-center">
              Nejhledanější kategorie
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {POPULAR_CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#1a1a2e] hover:bg-[#F0F2FA] transition-colors"
                >
                  <span className="text-[#3B7CF4]">→</span>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact fallback */}
          <p className="text-center text-xs text-[#9AA3C2] mt-8">
            Hledáš něco konkrétního? Napiš na{" "}
            <a href="mailto:info@100dola.com" className="text-[#3B7CF4] hover:underline">
              info@100dola.com
            </a>{" "}
            nebo zavolej{" "}
            <a href="tel:+420739045057" className="text-[#3B7CF4] hover:underline">
              +420 739 045 057
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
