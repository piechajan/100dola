import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { getCampaign, wrapEmailHtml } from "@/lib/newsletter";
import {
  saveCampaignAction,
  deleteCampaignAction,
  testSendAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Admin · Newsletter campaign — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewsletterEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; test_sent?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) {
    const { id } = await params;
    redirect(`/admin/login?from=/admin/newsletter/${id}`);
  }

  const { id } = await params;
  const isNew = id === "new";
  const c = isNew ? null : await getCampaign(id);
  if (!isNew && !c) notFound();

  const sp = await searchParams;
  const previewHtml = c ? wrapEmailHtml(c.subject, c.preheader, c.body_html) : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <Link href="/admin/newsletter" className="text-xs text-[#5A6480] hover:underline">
                ← Zpět na seznam kampaní
              </Link>
              <h1 className="text-3xl font-black text-[#1a1a2e] mt-1">
                {isNew ? "Nová kampaň" : c?.subject}
              </h1>
              {c && (
                <p className="text-xs text-[#9AA3C2] mt-1">
                  Stav: <strong>{c.status}</strong> · Vytvořil: {c.created_by ?? "—"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {sp?.saved === "1" && (
                <span className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                  ✓ Uloženo
                </span>
              )}
              {sp?.test_sent && (
                <span className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                  ✓ Test odeslán na {decodeURIComponent(sp.test_sent)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Edit form ── */}
            <form action={saveCampaignAction} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 space-y-4">
              {!isNew && c && <input type="hidden" name="id" value={c.id} />}

              <label className="block">
                <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
                  Předmět <span className="text-red-600">*</span>
                </span>
                <input
                  name="subject"
                  defaultValue={c?.subject ?? ""}
                  required
                  maxLength={120}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
                />
                <span className="text-[10px] text-[#9AA3C2]">Max 120 znaků. Krátký, akční, bez clickbaitu.</span>
              </label>

              <label className="block">
                <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
                  Preheader (preview v inboxu)
                </span>
                <input
                  name="preheader"
                  defaultValue={c?.preheader ?? ""}
                  maxLength={150}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
                  Tělo (HTML) <span className="text-red-600">*</span>
                </span>
                <textarea
                  name="body_html"
                  defaultValue={c?.body_html ?? "<p>Ahoj,</p>\n<p>…</p>\n<p>Měj se,<br>Jan</p>"}
                  required
                  rows={18}
                  className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none font-mono text-xs"
                />
                <span className="text-[10px] text-[#9AA3C2]">
                  HTML přímo (p, h2, a, strong, ul/li, img). Wrap layout přidáme automaticky.
                </span>
              </label>

              <div className="flex items-center justify-between pt-4 border-t border-[#E2E6F3]">
                <Link href="/admin/newsletter" className="text-xs text-[#5A6480] hover:underline">
                  Zrušit
                </Link>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90"
                >
                  {isNew ? "Vytvořit" : "Uložit"}
                </button>
              </div>
            </form>

            {/* ── Preview + actions ── */}
            <div className="space-y-4">
              {c ? (
                <>
                  <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
                    <div className="bg-[#F7F9FF] px-4 py-2 border-b border-[#E2E6F3] text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                      Náhled
                    </div>
                    <iframe
                      title="Email preview"
                      srcDoc={previewHtml}
                      className="w-full bg-white"
                      style={{ height: 500, border: "none" }}
                    />
                  </div>

                  <form
                    action={testSendAction}
                    className="bg-white rounded-2xl border border-[#E2E6F3] p-5"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <h3 className="text-sm font-black text-[#1a1a2e] mb-1">Test send</h3>
                    <p className="text-xs text-[#5A6480] mb-3">
                      Pošle 1 testovací e-mail (subject prefix <code>[TEST]</code>). Default na tvůj admin e-mail.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        name="test_recipient"
                        defaultValue={ctx.email}
                        placeholder="příjemce@example.com"
                        className="flex-1 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#3B7CF4] text-white rounded-full text-xs font-bold hover:opacity-90"
                      >
                        Test send
                      </button>
                    </div>
                  </form>

                  <form
                    action={deleteCampaignAction}
                    className="bg-[#FEE2E2] rounded-2xl border border-red-200 p-5"
                  >
                    <input type="hidden" name="id" value={c.id} />
                    <h3 className="text-sm font-black text-red-900 mb-1">Smazat kampaň</h3>
                    <p className="text-xs text-red-700 mb-3">
                      Permanentně smaže ze DB. Nelze vrátit.
                    </p>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700"
                    >
                      Smazat
                    </button>
                  </form>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 text-sm text-[#5A6480]">
                  Po uložení kampaně se zde objeví náhled a test-send.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
