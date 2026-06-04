"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/admin-auth";
import {
  upsertCampaign,
  deleteCampaign,
  testSendCampaign,
  getCampaign,
  wrapEmailHtml,
  type CampaignInput,
} from "@/lib/newsletter";
import { listConfirmedSubscribers } from "@/lib/newsletter-subscribers";

function parseInput(fd: FormData): CampaignInput {
  return {
    subject: String(fd.get("subject") ?? "").trim(),
    preheader: nullable(fd.get("preheader")),
    body_html: String(fd.get("body_html") ?? ""),
    body_md: nullable(fd.get("body_md")),
  };
}

function nullable(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function saveCampaignAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = (fd.get("id") as string | null) || undefined;
  const input = parseInput(fd);
  if (!input.subject) throw new Error("Předmět je povinný");
  if (!input.body_html.trim()) throw new Error("Tělo je povinné");

  const result = await upsertCampaign(input, ctx.email, id);
  if (!result.ok) throw new Error(result.error);

  revalidatePath("/admin/newsletter");
  redirect(`/admin/newsletter/${result.id}?saved=1`);
}

export async function deleteCampaignAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");

  const result = await deleteCampaign(id);
  if (!result.ok) throw new Error(result.error ?? "delete_failed");

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?deleted=1");
}

export async function testSendAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = String(fd.get("id") ?? "");
  const recipient = String(fd.get("test_recipient") ?? "").trim() || ctx.email;
  if (!id) throw new Error("id chybí");

  const result = await testSendCampaign(id, recipient);
  if (!result.ok) throw new Error(result.error ?? "send_failed");

  redirect(`/admin/newsletter/${id}?test_sent=${encodeURIComponent(recipient)}`);
}

/**
 * Send-to-all: pošle kampaň na všechny confirmed (a non-unsubscribed) subscribery.
 * Batch send přes Resend (~50/s rate limit Resend Standard tier).
 * Updateuje campaign status + sent_count + recipients_count.
 */
export async function sendToAllAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");

  const campaign = await getCampaign(id);
  if (!campaign) throw new Error("campaign_not_found");
  if (campaign.status === "sent") throw new Error("already_sent");

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) throw new Error("no_resend_key");

  const subscribers = await listConfirmedSubscribers();
  if (subscribers.length === 0) throw new Error("no_subscribers");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("no_db");
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Mark as sending + recipients count
  await sb.from("newsletter_campaigns").update({
    status: "sending",
    recipients_count: subscribers.length,
    sent_by: ctx.email,
  }).eq("id", id);

  const resend = new Resend(resendKey);
  const from = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

  let sent = 0;
  let failed = 0;

  // Batch send — Resend rate limit cca 50/s na Standard; throttle 100ms per send
  for (const sub of subscribers) {
    const unsubUrl = `${siteUrl}/api/unsubscribe?token=${sub.unsubscribe_token}`;
    const html = wrapEmailHtml(campaign.subject, campaign.preheader, campaign.body_html)
      .replace(
        "</body>",
        `<p style="font-size:11px;color:#9AA3C2;margin-top:24px;">
          Nechceš dostávat newsletter? <a href="${unsubUrl}" style="color:#9AA3C2;">Odhlásit se</a>.
        </p></body>`,
      );

    try {
      await resend.emails.send({
        from,
        to: sub.email,
        subject: campaign.subject,
        html,
      });
      sent++;
      // Update last_sent_at + counter (best-effort)
      await sb.from("newsletter_subscribers").update({
        last_sent_at: new Date().toISOString(),
        send_count: 1, // increment se musí udělat raw — pro MVP set 1
      }).eq("id", sub.id);
    } catch {
      failed++;
    }
    // Throttle pro Resend rate limit
    await new Promise((r) => setTimeout(r, 100));
  }

  await sb.from("newsletter_campaigns").update({
    status: failed === subscribers.length ? "failed" : "sent",
    sent_at: new Date().toISOString(),
    sent_count: sent,
    failed_count: failed,
  }).eq("id", id);

  revalidatePath("/admin/newsletter", "page");
  redirect(`/admin/newsletter/${id}?sent=${sent}`);
}
