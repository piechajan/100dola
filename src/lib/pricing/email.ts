import "server-only";
import { Resend } from "resend";
import { signApprovalToken } from "./magic-link";
import { formatCzk } from "./comparator";
import type { ProposalCalc, SuggestedAction } from "./types";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
const TO = process.env.PRICING_NOTIFY_EMAIL || process.env.RESEND_NOTIFY_EMAIL || "piecha.jan@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

export interface DailyPriceReport {
  date: string;
  proposals: Array<{
    proposalId: string;
    productName: string;
    competitorLabel: string;
    competitorUrl: string;
  } & ProposalCalc>;
}

/**
 * Pošle Janovi denní souhrn cenových návrhů s magic linky.
 * Pokud RESEND_API_KEY chybí → no-op (dev safety).
 */
export async function sendDailyPriceReport(report: DailyPriceReport): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY missing" };
  if (report.proposals.length === 0) return { sent: false, reason: "no_proposals" };

  const resend = new Resend(RESEND_API_KEY);
  const expSec = Math.floor(Date.now() / 1000) + 24 * 3600;

  const rows = report.proposals
    .map((p) => renderRow(p, expSec))
    .join("");

  const html = `<!doctype html>
<html lang="cs"><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:680px;margin:24px auto;padding:0 16px;">
  <h2 style="margin:0 0 8px;font-size:18px;">Pricing watch — ${escapeHtml(report.date)}</h2>
  <p style="color:#5A6480;font-size:13px;margin:0 0 20px;">
    Denní cenový sken. Klikni Schválit pro aplikaci, Odmítnout pro skip.
    Linky expirují za 24 h.
  </p>
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #E2E6F3;border-radius:8px;overflow:hidden;font-size:13px;">
    <thead style="background:#F7F9FF;text-align:left;">
      <tr>
        <th style="padding:10px;font-size:11px;color:#9AA3C2;">Produkt / konkurent</th>
        <th style="padding:10px;font-size:11px;color:#9AA3C2;text-align:right;">Naše</th>
        <th style="padding:10px;font-size:11px;color:#9AA3C2;text-align:right;">Konkurent</th>
        <th style="padding:10px;font-size:11px;color:#9AA3C2;text-align:right;">Návrh</th>
        <th style="padding:10px;font-size:11px;color:#9AA3C2;text-align:center;">Akce</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="color:#9AA3C2;font-size:12px;margin-top:24px;">
    Celý přehled + historie: <a href="${SITE_URL}/admin/pricing" style="color:#3B7CF4;">/admin/pricing</a>
  </p>
</body></html>`;

  const res = await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `Pricing watch · ${report.proposals.length} návrhů · ${report.date}`,
    html,
  });

  if (res.error) {
    return { sent: false, reason: res.error.message };
  }
  return { sent: true };
}

function renderRow(
  p: DailyPriceReport["proposals"][number],
  expSec: number,
): string {
  const approveTok = signApprovalToken({ proposalId: p.proposalId, action: "approve", expSec });
  const rejectTok = signApprovalToken({ proposalId: p.proposalId, action: "reject", expSec });
  const approveUrl = `${SITE_URL}/api/admin/pricing/approve?token=${encodeURIComponent(approveTok)}`;
  const rejectUrl = `${SITE_URL}/api/admin/pricing/approve?token=${encodeURIComponent(rejectTok)}`;

  const actionStyle = actionBadge(p.suggested_action);

  return `<tr style="border-top:1px solid #E2E6F3;">
    <td style="padding:10px;vertical-align:top;">
      <div style="font-weight:700;color:#1a1a2e;">${escapeHtml(p.productName)}</div>
      <div style="font-size:11px;color:#9AA3C2;margin-top:2px;">
        <a href="${escapeHtml(p.competitorUrl)}" style="color:#9AA3C2;">${escapeHtml(p.competitorLabel)}</a>
        · <span style="${actionStyle.css};padding:1px 6px;border-radius:8px;font-size:10px;font-weight:700;">${actionStyle.label}</span>
      </div>
      <div style="font-size:11px;color:#5A6480;margin-top:2px;">${escapeHtml(p.reason ?? "")}</div>
    </td>
    <td style="padding:10px;text-align:right;font-variant-numeric:tabular-nums;">${formatCzk(p.our_price_minor)}</td>
    <td style="padding:10px;text-align:right;font-variant-numeric:tabular-nums;">${formatCzk(p.competitor_price_minor)}</td>
    <td style="padding:10px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums;">${formatCzk(p.suggested_price_minor)}</td>
    <td style="padding:10px;text-align:center;white-space:nowrap;">
      ${p.suggested_action === "lower" || p.suggested_action === "raise" ? `
      <a href="${approveUrl}" style="display:inline-block;padding:6px 10px;background:#1a1a2e;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700;">Schválit</a>
      <a href="${rejectUrl}" style="display:inline-block;padding:6px 10px;background:#F7F9FF;color:#5A6480;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700;margin-left:4px;">Odmítnout</a>
      ` : `<span style="color:#9AA3C2;font-size:11px;">—</span>`}
    </td>
  </tr>`;
}

function actionBadge(a: SuggestedAction): { label: string; css: string } {
  switch (a) {
    case "lower":
      return { label: "Sleva", css: "background:#FEE2E2;color:#991B1B" };
    case "raise":
      return { label: "Zvýšit", css: "background:#D1FAE5;color:#065F46" };
    case "hold":
      return { label: "Hold", css: "background:#F7F9FF;color:#5A6480" };
    case "no_data":
      return { label: "Bez dat", css: "background:#FEF3C7;color:#92400E" };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
