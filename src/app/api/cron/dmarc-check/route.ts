import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { withCronLog } from "@/lib/cron-monitor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CRON_NAME = "dmarc-check";
const SCHEDULE = "0 4 * * *";

/**
 * Denní DMARC health check (Vercel cron 04:00 UTC):
 *   • Evaluuje reports za posledních 7 dní
 *   • Alert pokud:
 *       - pass rate < 99 %
 *       - nový source IP (mimo whitelist Resend AWS SES + CF)
 *       - žádné reports za 5+ dní (signal výpadku)
 *
 * Alert posíláme Janovi přes Resend, jen když je co řešit
 * (pokud vše OK → no-op, žádný spam).
 */

// Známé legitimní source IP ranges. Sportka aliasy přidat až poznáme.
const KNOWN_GOOD_PREFIXES = [
  // Resend (AWS SES eu-west-1, us-east-1)
  "23.249.", "54.240.", "54.241.", "54.242.",
  "199.255.", "199.127.",
  // Cloudflare Email Routing
  "104.16.", "104.17.", "104.18.", "104.19.",
  "172.65.", "172.66.", "172.67.",
  "162.158.", "162.159.",
  "188.114.",
  // Google (jen pro forward path / GSuite)
  "209.85.", "64.233.", "66.249.", "74.125.",
];

function isKnownIp(ip: string): boolean {
  return KNOWN_GOOD_PREFIXES.some((p) => ip.startsWith(p));
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  return withCronLog(CRON_NAME, SCHEDULE, runDmarcCheck)();
}

async function runDmarcCheck() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { ok: false, status: "failed" as const, error: "no_env" };
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const now = Date.now();
  const since7d = new Date(now - 7 * 24 * 3600 * 1000).toISOString();
  const since5d = new Date(now - 5 * 24 * 3600 * 1000).toISOString();

  // 1) Reports last 7d
  const { data: reports } = await sb
    .from("dmarc_reports")
    .select("id, org_name, date_range_end, total_count, pass_count, fail_count")
    .gte("date_range_end", since7d)
    .order("date_range_end", { ascending: false });

  const reportRows = reports ?? [];
  const totalMessages = reportRows.reduce((s, r) => s + (r.total_count ?? 0), 0);
  const totalPass = reportRows.reduce((s, r) => s + (r.pass_count ?? 0), 0);
  const totalFail = reportRows.reduce((s, r) => s + (r.fail_count ?? 0), 0);
  const passRate = totalMessages > 0 ? (totalPass / totalMessages) * 100 : 100;

  // 2) Source IPs unknown
  const { data: records } = await sb
    .from("dmarc_records")
    .select("source_ip, message_count, policy_evaluated_dkim, policy_evaluated_spf")
    .in("report_id", reportRows.map((r) => r.id));

  const ipFails = new Map<string, number>();
  const unknownIps = new Set<string>();
  for (const r of records ?? []) {
    const ip = String(r.source_ip);
    const fail =
      (r.policy_evaluated_dkim ?? "") !== "pass" ||
      (r.policy_evaluated_spf ?? "") !== "pass";
    if (fail) {
      ipFails.set(ip, (ipFails.get(ip) ?? 0) + Number(r.message_count ?? 0));
    }
    if (!isKnownIp(ip)) unknownIps.add(ip);
  }

  // 3) Recent reports check
  const lastReport = reportRows[0];
  const stale =
    !lastReport || new Date(lastReport.date_range_end).toISOString() < since5d;

  // Decide if alert needed
  const alerts: string[] = [];
  if (passRate < 99 && totalMessages > 10) {
    alerts.push(`Pass rate ${passRate.toFixed(1)} % (cíl ≥ 99 %), za 7 dní ${totalFail} fail z ${totalMessages}.`);
  }
  if (unknownIps.size > 0) {
    alerts.push(`${unknownIps.size} neznámých source IPs: ${Array.from(unknownIps).slice(0, 5).join(", ")}`);
  }
  if (stale) {
    alerts.push("Žádné DMARC reports v posledních 5 dnech — možný výpadek email infrastruktury.");
  }

  if (alerts.length === 0) {
    return {
      ok: true,
      status: "no_op" as const,
      sentAlert: false,
      passRate,
      totalMessages,
      reportsLast7d: reportRows.length,
    };
  }

  // Send alert
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return {
      ok: true,
      sentAlert: false,
      reason: "no_resend_key",
      alerts,
    };
  }

  const resend = new Resend(resendKey);
  const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:600px;margin:24px auto;padding:0 16px;">
<h2 style="margin:0 0 8px;font-size:18px;color:#991B1B;">⚠ DMARC alert</h2>
<p style="color:#5A6480;font-size:13px;margin:0 0 16px;">
  Denní health check za posledních 7 dní zachytil tyto anomálie:
</p>
<ul style="font-size:13px;line-height:1.6;color:#1a1a2e;">
  ${alerts.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}
</ul>
<p style="font-size:12px;color:#9AA3C2;margin-top:24px;">
  Detail: <a href="https://www.100dola.com/admin/dmarc" style="color:#3B7CF4;">/admin/dmarc</a>
</p>
</body></html>`;

  const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
  const to = process.env.RESEND_NOTIFY_EMAIL || "piecha.jan@gmail.com";

  await resend.emails.send({
    from,
    to,
    subject: `⚠ DMARC alert · pass rate ${passRate.toFixed(1)} %`,
    html,
  });

  return {
    ok: true,
    sentAlert: true,
    passRate,
    alerts,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
