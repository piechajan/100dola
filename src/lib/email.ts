// Server-only Resend client + email šablony.
// Všechny e-maily se posílají odsud, NIKDY z klienta.

import "server-only";
import { Resend } from "resend";
import type { MalagaLeadRow, RegistrationRow } from "./supabase";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
const NOTIFY_EMAIL = process.env.RESEND_NOTIFY_EMAIL || "piecha.jan@gmail.com";

let cached: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

function getResend(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error("Resend env vars missing — RESEND_API_KEY není nastaven.");
  }
  if (cached) return cached;
  cached = new Resend(RESEND_API_KEY);
  return cached;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const INTENT_LABELS: Record<MalagaLeadRow["intent"], string> = {
  package: "Kompletní balíček (transport + skladování)",
  transport: "Jen doprava kola",
  storage: "Jen skladování",
  group: "Skupina / klub",
  tour: "Guided tour",
  other: "Něco jiného",
};

const PACKAGE_LABELS: Record<NonNullable<MalagaLeadRow["package_interest"]>, string> = {
  basic: "Basic",
  exclusive: "Exclusive",
  undecided: "Ještě nevím",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Notifikace pro Jana — Malaga lead ───────────────────────────────────────

export async function sendMalagaLeadNotification(lead: MalagaLeadRow): Promise<void> {
  if (!isEmailConfigured()) return; // graceful no-op pokud Resend není nastaven

  const intent = INTENT_LABELS[lead.intent] || lead.intent;
  const pkg = lead.package_interest ? PACKAGE_LABELS[lead.package_interest] : "—";
  const ebike = lead.is_ebike ? " (e-bike)" : "";

  const subject = `🚲 Nová Malaga poptávka — ${lead.name} (${intent})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="border-left: 4px solid #E8431A; padding-left: 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #E8431A; font-weight: 700;">Nová poptávka</div>
        <h1 style="font-size: 22px; margin: 4px 0 0 0; font-weight: 800;">${escapeHtml(lead.name)}</h1>
        <div style="color: #5A6480; font-size: 14px; margin-top: 4px;">${escapeHtml(lead.email)}${lead.phone ? ` · ${escapeHtml(lead.phone)}` : ""}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #9AA3C2; width: 160px;">Co chce</td><td style="padding: 6px 0;"><strong>${escapeHtml(intent)}</strong></td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Balíček</td><td style="padding: 6px 0;">${escapeHtml(pkg)}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Počet kol</td><td style="padding: 6px 0;">${lead.bike_count ?? "—"}${ebike}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Typ kola</td><td style="padding: 6px 0;">${escapeHtml(lead.bike_type || "—")}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Preferovaný měsíc</td><td style="padding: 6px 0;">${escapeHtml(lead.preferred_month || "—")}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Skupina</td><td style="padding: 6px 0;">${lead.group_kind || "—"}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Pickup doma</td><td style="padding: 6px 0;">${lead.pickup_at_home ? "✓ ano" : "—"}</td></tr>
      </table>

      ${lead.message ? `
        <div style="margin-top: 20px; padding: 16px; background: #FFEFE9; border-radius: 12px;">
          <div style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; font-weight: 700; margin-bottom: 6px;">Poznámka</div>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${escapeHtml(lead.message)}</div>
        </div>
      ` : ""}

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E6F3; font-size: 12px; color: #9AA3C2;">
        Lead ID: ${lead.id} · ${new Date(lead.registered_at).toLocaleString("cs-CZ")}
      </div>
    </div>
  `;

  const text = [
    `Nová Malaga poptávka — ${lead.name}`,
    `E-mail: ${lead.email}`,
    lead.phone ? `Telefon: ${lead.phone}` : "",
    `Co chce: ${intent}`,
    lead.package_interest ? `Balíček: ${pkg}` : "",
    lead.bike_count ? `Počet kol: ${lead.bike_count}${ebike}` : "",
    lead.bike_type ? `Typ kola: ${lead.bike_type}` : "",
    lead.preferred_month ? `Měsíc: ${lead.preferred_month}` : "",
    lead.pickup_at_home ? "Pickup doma: ano" : "",
    lead.message ? `\nPoznámka:\n${lead.message}` : "",
    `\nLead ID: ${lead.id}`,
  ].filter(Boolean).join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: lead.email,
      subject,
      html,
      text,
    });
  } catch (e) {
    console.error("[email] sendMalagaLeadNotification failed:", e);
    // nehazem — registrace v DB má prioritu před notifikací
  }
}

// ── Confirmation klientovi (Malaga) ─────────────────────────────────────────

export async function sendMalagaLeadConfirmation(lead: MalagaLeadRow): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = "Tvoje poptávka 100dola Malaga přijata";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #E8431A; font-weight: 700;">100dola Malaga</div>
        <h1 style="font-size: 26px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.1;">Díky za poptávku, ${escapeHtml(lead.name.split(" ")[0])}.</h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Mám tvoji zprávu. Ozvu se ti do 24 hodin s konkrétním dalším krokem — termín, cena na míru, co potřebuju vědět.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Pokud spěcháš nebo si chceš v něčem doupřesnit hned, klidně mi rovnou napiš nebo zavolej.
      </p>

      <div style="margin-top: 28px; padding: 18px; background: #FFEFE9; border-radius: 12px;">
        <div style="font-weight: 700; margin-bottom: 4px;">Jan Piecha</div>
        <div style="font-size: 14px; color: #5A6480;">FUTUNATU s.r.o.</div>
        <div style="font-size: 14px; margin-top: 8px;">
          <a href="mailto:piecha.jan@gmail.com" style="color: #E8431A; text-decoration: none;">piecha.jan@gmail.com</a>
          · <a href="tel:+420739045057" style="color: #E8431A; text-decoration: none;">+420 739 045 057</a>
        </div>
      </div>

      <div style="margin-top: 28px; font-size: 12px; color: #9AA3C2; line-height: 1.5;">
        Tato zpráva potvrzuje, že jsem zaznamenal tvoji poptávku z webu 100dolamalaga.cz.
        Pokud jsi ji neodeslal/a ty, ignoruj prosím tento e-mail.
      </div>
    </div>
  `;

  const text = [
    `Díky za poptávku, ${lead.name.split(" ")[0]}.`,
    ``,
    `Mám tvoji zprávu. Ozvu se ti do 24 hodin s konkrétním dalším krokem — termín, cena na míru, co potřebuju vědět.`,
    ``,
    `Pokud spěcháš, klidně mi napiš nebo zavolej:`,
    `piecha.jan@gmail.com`,
    `+420 739 045 057`,
    ``,
    `Jan Piecha · FUTUNATU s.r.o.`,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: lead.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      html,
      text,
    });
  } catch (e) {
    console.error("[email] sendMalagaLeadConfirmation failed:", e);
  }
}

// ── Notifikace pro Jana — event registration ────────────────────────────────

export async function sendEventRegistrationNotification(reg: RegistrationRow): Promise<void> {
  if (!isEmailConfigured()) return;

  const fullName = `${reg.first_name} ${reg.last_name}`;
  const vipBadge = reg.is_vip ? " ⭐ VIP" : "";
  const subject = `📋 Nová registrace na akci — ${fullName}${vipBadge} (${reg.event_slug})`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="border-left: 4px solid #2EAA6E; padding-left: 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #2EAA6E; font-weight: 700;">Open Miles Clinic</div>
        <h1 style="font-size: 22px; margin: 4px 0 0 0; font-weight: 800;">${escapeHtml(fullName)}${reg.is_vip ? ' <span style="font-size: 14px; color: #E8A020;">⭐ VIP</span>' : ""}</h1>
        <div style="color: #5A6480; font-size: 14px; margin-top: 4px;">${escapeHtml(reg.email)}${reg.phone ? ` · ${escapeHtml(reg.phone)}` : ""}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #9AA3C2; width: 160px;">Akce</td><td style="padding: 6px 0;"><strong>${escapeHtml(reg.event_slug)}</strong></td></tr>
        ${reg.nickname ? `<tr><td style="padding: 6px 0; color: #9AA3C2;">Přezdívka</td><td style="padding: 6px 0;">${escapeHtml(reg.nickname)}</td></tr>` : ""}
        ${reg.club ? `<tr><td style="padding: 6px 0; color: #9AA3C2;">Klub</td><td style="padding: 6px 0;">${escapeHtml(reg.club)}</td></tr>` : ""}
        ${reg.city ? `<tr><td style="padding: 6px 0; color: #9AA3C2;">Město</td><td style="padding: 6px 0;">${escapeHtml(reg.city)}</td></tr>` : ""}
      </table>

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E6F3; font-size: 12px; color: #9AA3C2;">
        Registration ID: ${reg.id} · ${new Date(reg.registered_at).toLocaleString("cs-CZ")}
      </div>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: reg.email,
      subject,
      html,
    });
  } catch (e) {
    console.error("[email] sendEventRegistrationNotification failed:", e);
  }
}
