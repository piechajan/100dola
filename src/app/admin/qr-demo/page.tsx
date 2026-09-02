import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { buildSpayd, buildSpaydQrDataUrl, FUTUNATU_IBAN } from "@/lib/spayd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · QR platba (demo) — 100dola",
  robots: { index: false, follow: false },
};

// Statické demo hodnoty — reálně se generují per platba (částka + VS + zpráva).
const DEMO = {
  amount: 2500,
  vs: "2610230001",
  message: "Malaga zaloha - demo",
  recipientName: "FUTUNATU s.r.o.",
};

export default async function QrDemoPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/qr-demo");

  const spayd = buildSpayd(DEMO);
  const qr = await buildSpaydQrDataUrl(DEMO);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FAFBFF]">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <div className="text-xs text-[#9AA3C2] mb-2">
            <Link href="/admin" className="hover:text-[#1a1a2e]">Admin</Link> / QR platba (demo)
          </div>
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">QR platba — jak to funguje</h1>
          <p className="text-sm text-[#5A6480] mb-8 max-w-xl">
            Naskenuj tenhle QR bankovní aplikací (FIO, KB, Air Bank, ČS, Revolut…). Předvyplní se{" "}
            <strong>účet, částka, variabilní symbol i zpráva</strong> — zaplatíš na dvě kliknutí. Tohle je
            demo se statickou částkou; naostro se QR generuje pro každou platbu s aktuální částkou a VS.
          </p>

          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 flex flex-col md:flex-row gap-6 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="QR platba demo" width={220} height={220} className="rounded-xl border border-[#F0F2FA]" />
            <div className="text-sm w-full">
              <table className="w-full">
                <tbody>
                  <tr><td className="py-1.5 pr-3 text-[#9AA3C2]">Příjemce</td><td className="py-1.5 font-semibold text-[#1a1a2e]">{DEMO.recipientName}</td></tr>
                  <tr><td className="py-1.5 pr-3 text-[#9AA3C2]">IBAN</td><td className="py-1.5 font-mono text-[#1a1a2e] break-all">{FUTUNATU_IBAN}</td></tr>
                  <tr><td className="py-1.5 pr-3 text-[#9AA3C2]">Částka</td><td className="py-1.5 font-black text-[#E8431A]">{DEMO.amount.toLocaleString("cs-CZ")} Kč</td></tr>
                  <tr><td className="py-1.5 pr-3 text-[#9AA3C2]">Var. symbol</td><td className="py-1.5 font-mono text-[#1a1a2e]">{DEMO.vs}</td></tr>
                  <tr><td className="py-1.5 pr-3 text-[#9AA3C2]">Zpráva</td><td className="py-1.5 text-[#1a1a2e]">{DEMO.message}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl border border-[#E2E6F3] p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">SPAYD řetězec (co je v QR)</div>
            <code className="block text-xs bg-[#F7F9FF] rounded-lg p-3 text-[#1a1a2e] break-all">{spayd}</code>
          </div>

          <div className="mt-6 rounded-2xl bg-[#F3FBF6] border border-[#CDECDA] p-5 text-sm text-[#1a1a2e] leading-relaxed">
            <strong>Naostro:</strong> každá přihláška/objednávka dostane vlastní QR s aktuální částkou
            (např. 50 % záloha) a VS odvozeným z ID (kvůli párování plateb). Po zaplacení Fakturoid
            platbu spáruje a pošle fakturu (ty v kopii). Účet je už z tvého FIO IBANu.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
