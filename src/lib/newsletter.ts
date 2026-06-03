/**
 * Newsletter campaign DB layer + Resend send helper.
 *
 * Status flow: draft → (test-send loop) → sent
 * Audience pro "send to all" zatím není napojený — vyžaduje subscriber model
 * s explicit GDPR opt-in. MVP: pouze test send na admin email.
 */

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export interface NewsletterCampaign {
  id: string;
  subject: string;
  preheader: string | null;
  body_html: string;
  body_md: string | null;
  status: "draft" | "queued" | "sending" | "sent" | "failed";
  scheduled_for: string | null;
  sent_at: string | null;
  recipients_count: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  sent_by: string | null;
  error_message: string | null;
}

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function listCampaigns(): Promise<NewsletterCampaign[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("newsletter_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as NewsletterCampaign[];
}

export async function getCampaign(id: string): Promise<NewsletterCampaign | null> {
  const client = sb();
  if (!client) return null;
  const { data } = await client.from("newsletter_campaigns").select("*").eq("id", id).maybeSingle();
  return (data as NewsletterCampaign | null) ?? null;
}

export interface CampaignInput {
  subject: string;
  preheader: string | null;
  body_html: string;
  body_md: string | null;
}

export async function upsertCampaign(
  input: CampaignInput,
  createdBy: string,
  id?: string,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const client = sb();
  if (!client) return { ok: false, error: "no_db" };
  if (id) {
    const { error } = await client
      .from("newsletter_campaigns")
      .update({ ...input })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, id };
  }
  const { data, error } = await client
    .from("newsletter_campaigns")
    .insert({ ...input, created_by: createdBy })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string }).id };
}

export async function deleteCampaign(id: string): Promise<{ ok: boolean; error?: string }> {
  const client = sb();
  if (!client) return { ok: false, error: "no_db" };
  const { error } = await client.from("newsletter_campaigns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Test send — pouze 1 příjemce (jako sanity check před production).
 * Označí campaign status='draft' (zůstává) a posílá přes Resend.
 */
export async function testSendCampaign(
  id: string,
  testRecipient: string,
): Promise<{ ok: boolean; error?: string }> {
  const client = sb();
  if (!client) return { ok: false, error: "no_db" };
  const campaign = await getCampaign(id);
  if (!campaign) return { ok: false, error: "campaign_not_found" };

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return { ok: false, error: "no_resend_key" };

  const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
  const resend = new Resend(resendKey);

  try {
    await resend.emails.send({
      from,
      to: testRecipient,
      subject: `[TEST] ${campaign.subject}`,
      html: wrapEmailHtml(campaign.subject, campaign.preheader, campaign.body_html),
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Obalí body do standardního layoutu s preheader + footer (unsub TBD).
 */
export function wrapEmailHtml(subject: string, preheader: string | null, bodyHtml: string): string {
  const pre = preheader
    ? `<div style="display:none;font-size:1px;color:transparent;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>`
    : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:560px;margin:0 auto;padding:24px 16px;line-height:1.55;">
${pre}
${bodyHtml}
<hr style="margin:32px 0 12px;border:none;border-top:1px solid #E2E6F3;">
<p style="font-size:11px;color:#9AA3C2;">
  100dola sport · FUTUNATU s.r.o. · Šternberk<br>
  <a href="https://www.100dola.com" style="color:#9AA3C2;">www.100dola.com</a>
</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
