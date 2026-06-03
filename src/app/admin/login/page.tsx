import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Přihlášení do administrace · 100dola",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from || "/admin/orders";

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[440px] mx-auto px-6 md:px-12 py-16">
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8">
            <h1 className="text-2xl font-black text-[#1a1a2e] mb-1">
              Přihlášení do administrace
            </h1>
            <p className="text-sm text-[#5A6480] mb-6">
              Pošleme ti odkaz na e-mail. Platí 15 minut, použiješ jednou.
            </p>
            <AdminLoginForm fromUrl={from} />
          </div>
          <p className="text-[10px] text-[#9AA3C2] text-center mt-6">
            Přístup mají jen schválené e-maily z whitelistu admin_users.
            Pokud potřebuješ přístup, ozvi se Janovi.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
