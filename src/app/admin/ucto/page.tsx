import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MonthlyChart from "@/components/admin/MonthlyChart";
import { getAccountingOverview, PROJECTS, getProject } from "@/lib/accounting";

export const metadata: Metadata = {
  title: "Admin · Účetnictví — 100dola",
  robots: { index: false, follow: false },
};

// Always fresh data — Fakturoid API call per request
export const dynamic = "force-dynamic";

function fmtPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " Kč";
}

function fmtMonth(monthStr: string): string {
  const [y, m] = monthStr.split("-");
  const months = ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"];
  return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "otevřená", color: "#92400E" },
  sent: { label: "odeslaná", color: "#1E3A8A" },
  overdue: { label: "po splatnosti", color: "#991B1B" },
  paid: { label: "zaplaceno", color: "#065F46" },
  cancelled: { label: "stornováno", color: "#6B7280" },
  uncollectible: { label: "nedobytné", color: "#6B7280" },
};

export default async function AdminAccountingPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    redirect("/login?from=/admin/ucto");
  }

  const overview = await getAccountingOverview();

  const monthDelta = overview.totals.lastMonth > 0
    ? ((overview.totals.thisMonth - overview.totals.lastMonth) / overview.totals.lastMonth) * 100
    : 0;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10">

          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-1">
                Admin
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">Účetnictví</h1>
              <p className="text-sm text-[#5A6480] mt-1.5">
                Per-project P&L · data z Fakturoidu (slug: <code className="text-xs">futunatu</code>)
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
              >
                Objednávky →
              </Link>
              <a
                href="https://app.fakturoid.cz/futunatu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full bg-[#1a1a2e] text-white hover:opacity-90"
              >
                Fakturoid →
              </a>
            </div>
          </div>

          {!overview.isConfigured && (
            <div className="rounded-xl p-4 mb-6 bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <strong>Fakturoid není nakonfigurovaný.</strong> Doplň <code>FAKTUROID_SLUG</code>, <code>FAKTUROID_CLIENT_ID</code>, <code>FAKTUROID_CLIENT_SECRET</code> ve Vercel env vars.
            </div>
          )}

          {overview.isConfigured && !process.env.FAKTUROID_WEBHOOK_SECRET && (
            <div className="rounded-xl p-4 mb-6 bg-blue-50 border border-blue-200 text-sm text-blue-900">
              <strong>Auto-detekce platby není aktivní.</strong> Po povolení &bdquo;Správa webhooků přes API&ldquo; ve Fakturoid → API přístupy spusť{" "}
              <code className="font-mono">POST /api/admin/fakturoid/setup-webhook</code>, zkopíruj <code>secretKey</code> do Vercel jako{" "}
              <code>FAKTUROID_WEBHOOK_SECRET</code> a redeploy. Pak FIO bank sync ve Fakturoidu (Nastavení → Účty).
            </div>
          )}
          {overview.isConfigured && process.env.FAKTUROID_WEBHOOK_SECRET && (
            <div className="rounded-xl p-3 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <strong>Auto-detekce platby aktivní</strong> · Fakturoid bank sync → webhook → auto-status. Hotovostní platby označuj ručně.
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              {
                label: "Tento měsíc",
                value: fmtPrice(overview.totals.thisMonth),
                hint: monthDelta !== 0
                  ? `${monthDelta > 0 ? "+" : ""}${monthDelta.toFixed(0)} % vs. minulý`
                  : "",
                hintColor: monthDelta >= 0 ? "#10B981" : "#E8431A",
              },
              {
                label: "Minulý měsíc",
                value: fmtPrice(overview.totals.lastMonth),
                hint: "",
                hintColor: "#9AA3C2",
              },
              {
                label: "Rok 2026",
                value: fmtPrice(overview.totals.thisYear),
                hint: `${overview.totals.invoiceCount} faktur celkem`,
                hintColor: "#9AA3C2",
              },
              {
                label: "Posledních 12 měs.",
                value: fmtPrice(
                  overview.monthlyBuckets.reduce((s, b) => s + b.total, 0),
                ),
                hint: "rolling window",
                hintColor: "#9AA3C2",
              },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-[#E2E6F3] p-4">
                <div className="text-xs text-[#9AA3C2] uppercase tracking-wider">{kpi.label}</div>
                <div className="text-2xl font-black text-[#1a1a2e] mt-1">{kpi.value}</div>
                {kpi.hint && (
                  <div className="text-[11px] font-bold mt-1" style={{ color: kpi.hintColor }}>
                    {kpi.hint}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Per-project breakdown */}
          <h2 className="text-base font-black text-[#1a1a2e] mb-3">Per-project obrat (rok 2026)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {overview.projectStats.map((stats) => {
              const project = getProject(stats.projectId);
              return (
                <div
                  key={stats.projectId}
                  className="bg-white rounded-2xl border border-[#E2E6F3] p-5 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: project.color }}>
                    {project.label}
                  </div>
                  <div className="text-3xl font-black text-[#1a1a2e] mb-1">
                    {fmtPrice(stats.revenueTotal)}
                  </div>
                  <div className="text-xs text-[#9AA3C2]">
                    {stats.invoiceCount} faktur · průměr {fmtPrice(stats.averageInvoice)}
                  </div>

                  {stats.invoiceCount > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F0F2FA] grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <div className="font-bold text-[#065F46]">{fmtPrice(stats.revenuePaid)}</div>
                        <div className="text-[#9AA3C2]">{stats.paidCount}× zaplaceno</div>
                      </div>
                      <div>
                        <div className="font-bold text-[#92400E]">{fmtPrice(stats.revenueUnpaid)}</div>
                        <div className="text-[#9AA3C2]">{stats.unpaidCount}× čeká</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Monthly chart */}
          <h2 className="text-base font-black text-[#1a1a2e] mb-3">Měsíční trend (posledních 12 měsíců)</h2>
          <div className="mb-8">
            <MonthlyChart buckets={overview.monthlyBuckets} />
          </div>

          {/* Recent invoices */}
          <h2 className="text-base font-black text-[#1a1a2e] mb-3">Posledních 10 faktur</h2>
          {overview.recentInvoices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm text-[#5A6480]">Zatím žádné faktury.</p>
              <p className="text-xs text-[#9AA3C2] mt-1">
                Faktury se vytvoří automaticky po označení objednávky jako zaplacené.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                    <th className="text-left p-3 font-bold">Číslo</th>
                    <th className="text-left p-3 font-bold">Datum</th>
                    <th className="text-left p-3 font-bold">Projekt</th>
                    <th className="text-right p-3 font-bold">Částka</th>
                    <th className="text-center p-3 font-bold">Status</th>
                    <th className="text-center p-3 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.recentInvoices.map((inv) => {
                    const status = STATUS_LABELS[inv.status] || { label: inv.status, color: "#6B7280" };
                    const project = inv.project === "uncategorized" ? null : getProject(inv.project);
                    return (
                      <tr key={inv.fakturoidId} className="border-t border-[#F0F2FA] hover:bg-[#F7F9FF]">
                        <td className="p-3 font-mono text-xs text-[#1a1a2e] font-bold">{inv.number}</td>
                        <td className="p-3 text-xs text-[#5A6480]">{inv.issuedOn}</td>
                        <td className="p-3 text-xs">
                          {project ? (
                            <span
                              className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${project.color}20`, color: project.color }}
                            >
                              {project.label}
                            </span>
                          ) : (
                            <span className="text-[#9AA3C2]">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-[#1a1a2e]">
                          {fmtPrice(inv.total)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${status.color}15`, color: status.color }}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex gap-2 justify-center text-xs">
                            <a
                              href={inv.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#3B7CF4] hover:underline"
                            >
                              PDF
                            </a>
                            <a
                              href={inv.htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#9AA3C2] hover:text-[#3B7CF4]"
                            >
                              Detail →
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-[#9AA3C2] text-center mt-6">
            Data fetched live z Fakturoid API · Per-project breakdown podle tagů
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
