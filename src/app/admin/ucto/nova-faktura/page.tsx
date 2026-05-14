import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InvoiceForm from "@/components/admin/InvoiceForm";

export const metadata: Metadata = {
  title: "Admin · Nová faktura — 100dola",
  robots: { index: false, follow: false },
};

export default async function NewInvoicePage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    // Účetní nemůže vytvářet faktury → redirect na dashboard
    redirect("/admin/ucto");
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 pt-10">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-1">
                Admin / Účetnictví
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">
                Nová faktura
              </h1>
              <p className="text-sm text-[#5A6480] mt-1.5">
                Manuální fakturace pro Lab, Malagu, OMC nebo Sport mimo e-shop.{" "}
                Eshop objednávky se fakturují automaticky.
              </p>
            </div>
            <Link
              href="/admin/ucto"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
            >
              ← Zpět na účto
            </Link>
          </div>

          <InvoiceForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
