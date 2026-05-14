import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AccountantLoginForm from "@/components/admin/AccountantLoginForm";

export const metadata: Metadata = {
  title: "Přihlášení účetní · 100dola",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AccountantLoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorMessage =
    params.error === "invalid"
      ? "Odkaz je neplatný nebo expirovaný. Požádej o nový."
      : params.error === "missing"
      ? "Odkaz neobsahuje token."
      : null;

  return (
    <>
      <Navbar />
      <main className="pt-24 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[440px] mx-auto px-6 md:px-12 pt-10">
          <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-2 text-center">
            Účetní přístup
          </div>
          <h1 className="text-3xl font-black text-[#1a1a2e] text-center mb-2">
            Přihlášení
          </h1>
          <p className="text-sm text-[#5A6480] text-center mb-8">
            Zadej e-mail. Pošleme ti přihlašovací odkaz (platí 15 minut).
          </p>

          {errorMessage && (
            <div className="rounded-xl p-3 mb-4 bg-red-50 border border-red-200 text-xs text-red-900">
              {errorMessage}
            </div>
          )}

          <AccountantLoginForm />

          <p className="text-xs text-[#9AA3C2] text-center mt-8">
            Přístup je omezený na vybrané e-maily. Jiné požadavky budou ignorovány.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
