import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import UploadForm from "./UploadForm";

export const metadata: Metadata = {
  title: "Admin · DMARC — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ReportRow {
  id: string;
  org_name: string;
  report_id: string;
  date_range_begin: string;
  date_range_end: string;
  policy_p: string | null;
  policy_pct: number | null;
  total_count: number;
  pass_count: number;
  fail_count: number;
  unique_source_ips: number;
  uploaded_at: string;
}

interface SourceIpRow {
  source_ip: string;
  total_messages: number;
  pass_messages: number;
  fail_messages: number;
  reports: number;
}

export default async function AdminDmarcPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") redirect("/login?from=/admin/dmarc");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-red-600">Supabase env chybí.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Reports z posledních 30 dnů — server component je force-dynamic,
  // takže Date.now() per-request je správně i přes lint warning.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: reports } = await sb
    .from("dmarc_reports")
    .select("*")
    .gte("date_range_end", since)
    .order("date_range_end", { ascending: false })
    .limit(50);
  const reportRows = (reports ?? []) as ReportRow[];

  // Aggregations
  const totalMessages = reportRows.reduce((s, r) => s + r.total_count, 0);
  const totalPass = reportRows.reduce((s, r) => s + r.pass_count, 0);
  const totalFail = reportRows.reduce((s, r) => s + r.fail_count, 0);
  const passRate = totalMessages > 0 ? (totalPass / totalMessages) * 100 : 0;

  // Source IPs aggregation
  const { data: records } = await sb
    .from("dmarc_records")
    .select("source_ip, message_count, policy_evaluated_dkim, policy_evaluated_spf, report_id")
    .in("report_id", reportRows.map((r) => r.id))
    .limit(2000);
  const ipMap = new Map<string, SourceIpRow>();
  for (const rec of records ?? []) {
    const r = rec as {
      source_ip: string;
      message_count: number;
      policy_evaluated_dkim: string | null;
      policy_evaluated_spf: string | null;
      report_id: string;
    };
    const key = r.source_ip;
    const cur = ipMap.get(key) ?? {
      source_ip: key,
      total_messages: 0,
      pass_messages: 0,
      fail_messages: 0,
      reports: 0,
    };
    cur.total_messages += r.message_count;
    if (r.policy_evaluated_dkim === "pass" && r.policy_evaluated_spf === "pass") {
      cur.pass_messages += r.message_count;
    } else {
      cur.fail_messages += r.message_count;
    }
    cur.reports++;
    ipMap.set(key, cur);
  }
  const sourceIps = Array.from(ipMap.values())
    .sort((a, b) => b.total_messages - a.total_messages)
    .slice(0, 25);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">DMARC monitoring</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Aggregate reports z posledních 30 dnů.{" "}
            <a
              href="https://dash.cloudflare.com/0b313c74556787d3b28f9f59ce10f98c/100dola.com/dns/records"
              target="_blank"
              rel="noreferrer"
              className="text-[#3B7CF4] hover:underline"
            >
              Cloudflare DNS →
            </a>
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                Reportů (30 dní)
              </div>
              <div className="text-2xl font-black text-[#1a1a2e]">{reportRows.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                Pass rate
              </div>
              <div
                className={`text-2xl font-black ${passRate >= 99 ? "text-[#065F46]" : "text-[#991B1B]"}`}
              >
                {passRate.toFixed(1)} %
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                Pass / Fail
              </div>
              <div className="text-sm font-bold">
                <span className="text-[#065F46]">{totalPass}</span>
                {" / "}
                <span className="text-[#991B1B]">{totalFail}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
              <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                Unikátních IP
              </div>
              <div className="text-2xl font-black text-[#1a1a2e]">{ipMap.size}</div>
            </div>
          </div>

          {/* Upload */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Nahrát report</h2>
            <UploadForm />
          </section>

          {/* Source IPs */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">
              Top source IPs ({ipMap.size})
            </h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Source IP</th>
                    <th className="text-right p-3 font-bold">Zprávy</th>
                    <th className="text-right p-3 font-bold">Pass</th>
                    <th className="text-right p-3 font-bold">Fail</th>
                    <th className="text-right p-3 font-bold">Pass %</th>
                    <th className="text-right p-3 font-bold">Reportů</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceIps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#9AA3C2]">
                        Žádné records. Nahraj první report nahoře.
                      </td>
                    </tr>
                  ) : (
                    sourceIps.map((ip) => {
                      const rate =
                        ip.total_messages > 0
                          ? (ip.pass_messages / ip.total_messages) * 100
                          : 0;
                      return (
                        <tr key={ip.source_ip} className="border-t border-[#E2E6F3]">
                          <td className="p-3 font-mono text-xs">{ip.source_ip}</td>
                          <td className="p-3 text-right tabular-nums">{ip.total_messages}</td>
                          <td className="p-3 text-right text-[#065F46] tabular-nums">
                            {ip.pass_messages}
                          </td>
                          <td className="p-3 text-right text-[#991B1B] tabular-nums">
                            {ip.fail_messages}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-bold ${rate >= 99 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"}`}
                            >
                              {rate.toFixed(1)} %
                            </span>
                          </td>
                          <td className="p-3 text-right tabular-nums">{ip.reports}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Reports list */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">
              Reporty (posledních 50)
            </h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Provider</th>
                    <th className="text-left p-3 font-bold">Období</th>
                    <th className="text-left p-3 font-bold">Policy</th>
                    <th className="text-right p-3 font-bold">Total</th>
                    <th className="text-right p-3 font-bold">Pass</th>
                    <th className="text-right p-3 font-bold">Fail</th>
                    <th className="text-right p-3 font-bold">IPs</th>
                  </tr>
                </thead>
                <tbody>
                  {reportRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[#9AA3C2]">
                        Zatím žádné reporty.
                      </td>
                    </tr>
                  ) : (
                    reportRows.map((r) => (
                      <tr key={r.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 font-bold">{r.org_name}</td>
                        <td className="p-3 text-xs text-[#5A6480]">
                          {new Date(r.date_range_begin).toLocaleDateString("cs-CZ")} –{" "}
                          {new Date(r.date_range_end).toLocaleDateString("cs-CZ")}
                        </td>
                        <td className="p-3 text-xs font-mono">
                          {r.policy_p}/{r.policy_pct}
                        </td>
                        <td className="p-3 text-right tabular-nums">{r.total_count}</td>
                        <td className="p-3 text-right text-[#065F46] tabular-nums">
                          {r.pass_count}
                        </td>
                        <td className="p-3 text-right text-[#991B1B] tabular-nums">
                          {r.fail_count}
                        </td>
                        <td className="p-3 text-right tabular-nums">{r.unique_source_ips}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
