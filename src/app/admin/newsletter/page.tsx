import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { listCampaigns } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Admin · Newsletter — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmt(d: string): string {
  return new Date(d).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  draft: { bg: "#F0F2FA", fg: "#5A6480" },
  queued: { bg: "#FEF3C7", fg: "#92400E" },
  sending: { bg: "#FEF3C7", fg: "#92400E" },
  sent: { bg: "#D1FAE5", fg: "#065F46" },
  failed: { bg: "#FEE2E2", fg: "#991B1B" },
};

export default async function AdminNewsletterPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const campaigns = await listCampaigns();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-2">
            <div>
              <h1 className="text-3xl font-black text-[#1a1a2e]">Newsletter</h1>
              <p className="text-sm text-[#5A6480]">
                {campaigns.length} kampaní · MVP: test-send funkční, „send to all" zatím čeká na audience model
              </p>
            </div>
            <Link
              href="/admin/newsletter/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90"
            >
              + Nová kampaň
            </Link>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 mb-6 mt-3">
            <strong>Audience model TBD:</strong> než pošleš na produkční publikum, je třeba postavit
            <code className="mx-1">newsletter_subscribers</code>tabulku se GDPR opt-inem
            (signup form na webu + checkbox v checkout flow). Zatím slouží test-send k iteraci na obsahu.
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center">
              <p className="text-sm text-[#5A6480]">Žádné kampaně. Začni první.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Vytvořeno</th>
                    <th className="text-left p-3 font-bold">Předmět</th>
                    <th className="text-left p-3 font-bold">Stav</th>
                    <th className="text-right p-3 font-bold">Odesláno</th>
                    <th className="text-right p-3 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => {
                    const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft;
                    return (
                      <tr key={c.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 text-xs">
                          <div>{fmt(c.created_at)}</div>
                          <div className="text-[#9AA3C2] text-[10px]">{c.created_by ?? "—"}</div>
                        </td>
                        <td className="p-3 font-bold text-[#1a1a2e] max-w-[400px] truncate">
                          {c.subject}
                          {c.preheader && (
                            <div className="text-[11px] text-[#9AA3C2] font-normal truncate">
                              {c.preheader}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: s.bg, color: s.fg }}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right tabular-nums text-xs">
                          {c.sent_at ? fmt(c.sent_at) : "—"}
                          {c.sent_count > 0 && (
                            <div className="text-[10px] text-[#9AA3C2]">
                              {c.sent_count}/{c.recipients_count}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            href={`/admin/newsletter/${c.id}`}
                            className="text-xs text-[#3B7CF4] hover:underline font-bold"
                          >
                            Otevřít →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
