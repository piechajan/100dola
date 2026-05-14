// Server-only Resend client + email šablony.
// Všechny e-maily se posílají odsud, NIKDY z klienta.

import "server-only";
import { Resend } from "resend";
import type { MalagaLeadRow, RegistrationRow } from "./supabase";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "100dola <onboarding@resend.dev>";
const NOTIFY_EMAIL = process.env.RESEND_NOTIFY_EMAIL || "info@100dola.com";

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
          <a href="mailto:info@100dola.com" style="color: #E8431A; text-decoration: none;">info@100dola.com</a>
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
    `info@100dola.com`,
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

// ── Notifikace pro Jana — Lab lead ──────────────────────────────────────────

export interface LabLeadPayload {
  id: string;
  registeredAt: string;
  name: string;
  email: string;
  phone?: string;
  bikeBrand?: string;
  bikeValue?: "under100k" | "100to200k" | "200kPlus" | "undecided";
  services?: ("bearings" | "shield" | "glaze" | "wax" | "cleanup" | "fit")[];
  preferredWindow?: string;
  pickupInPrague?: boolean;
  message?: string;
}

const LAB_SERVICE_LABELS: Record<NonNullable<LabLeadPayload["services"]>[number], string> = {
  bearings: "Lab Bearings (keramická ložiska)",
  shield: "Lab Shield (PPF folie)",
  glaze: "Lab Glaze (keramika laku)",
  wax: "Lab Wax (voskování řetězu)",
  cleanup: "Lab Cleanup (servisní cleanup)",
  fit: "Lab Fit (kontrola buildu a fitu)",
};

const LAB_BIKE_VALUE_LABELS: Record<NonNullable<LabLeadPayload["bikeValue"]>, string> = {
  under100k: "do 100 000 Kč",
  "100to200k": "100 000 – 200 000 Kč",
  "200kPlus": "nad 200 000 Kč",
  undecided: "raději neuvedeno",
};

export async function sendLabLeadNotification(lead: LabLeadPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const servicesList = (lead.services || []).map((s) => LAB_SERVICE_LABELS[s]).join(", ") || "—";
  const bikeValueLabel = lead.bikeValue ? LAB_BIKE_VALUE_LABELS[lead.bikeValue] : "—";

  const subject = `🧪 Nová Lab poptávka — ${lead.name}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="border-left: 4px solid #1F4937; padding-left: 16px; margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #1F4937; font-weight: 700;">100dola Lab</div>
        <h1 style="font-size: 22px; margin: 4px 0 0 0; font-weight: 800;">${escapeHtml(lead.name)}</h1>
        <div style="color: #5A6480; font-size: 14px; margin-top: 4px;">${escapeHtml(lead.email)}${lead.phone ? ` · ${escapeHtml(lead.phone)}` : ""}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #9AA3C2; width: 180px;">Kolo</td><td style="padding: 6px 0;">${escapeHtml(lead.bikeBrand || "—")}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Hodnota kola</td><td style="padding: 6px 0;">${escapeHtml(bikeValueLabel)}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2; vertical-align: top;">Služby</td><td style="padding: 6px 0;"><strong>${escapeHtml(servicesList)}</strong></td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Preferovaný termín</td><td style="padding: 6px 0;">${escapeHtml(lead.preferredWindow || "—")}</td></tr>
        <tr><td style="padding: 6px 0; color: #9AA3C2;">Svoz po Praze</td><td style="padding: 6px 0;">${lead.pickupInPrague ? "✓ ano" : "—"}</td></tr>
      </table>

      ${lead.message ? `
        <div style="margin-top: 20px; padding: 16px; background: #E8F0EC; border-radius: 12px;">
          <div style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #5A6480; font-weight: 700; margin-bottom: 6px;">Poznámka</div>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${escapeHtml(lead.message)}</div>
        </div>
      ` : ""}

      <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E2E6F3; font-size: 12px; color: #9AA3C2;">
        Lead ID: ${lead.id} · ${new Date(lead.registeredAt).toLocaleString("cs-CZ")}
      </div>
    </div>
  `;

  const text = [
    `Nová Lab poptávka — ${lead.name}`,
    `E-mail: ${lead.email}`,
    lead.phone ? `Telefon: ${lead.phone}` : "",
    lead.bikeBrand ? `Kolo: ${lead.bikeBrand}` : "",
    `Hodnota kola: ${bikeValueLabel}`,
    `Služby: ${servicesList}`,
    lead.preferredWindow ? `Termín: ${lead.preferredWindow}` : "",
    lead.pickupInPrague ? "Svoz po Praze: ano" : "",
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
    console.error("[email] sendLabLeadNotification failed:", e);
  }
}

// ── Confirmation klientovi (Lab) ────────────────────────────────────────────

export async function sendLabLeadConfirmation(lead: LabLeadPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = "Tvoje poptávka 100dola Lab přijata";
  const firstName = lead.name.split(" ")[0];

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #1F4937; font-weight: 700;">100dola Lab</div>
        <h1 style="font-size: 26px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.1;">Díky, ${escapeHtml(firstName)}.</h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Mám tvoji poptávku. Ozvu se ti do 24 hodin s konkrétním termínem, finální cenou po prohlídce kola a tím, co si máš s sebou připravit.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Pokud spěcháš nebo si chceš v něčem doupřesnit hned, klidně mi rovnou napiš nebo zavolej.
      </p>

      <div style="margin-top: 28px; padding: 18px; background: #E8F0EC; border-radius: 12px;">
        <div style="font-weight: 700; margin-bottom: 4px;">Jan Piecha</div>
        <div style="font-size: 14px; color: #5A6480;">FUTUNATU s.r.o.</div>
        <div style="font-size: 14px; margin-top: 8px;">
          <a href="mailto:info@100dola.com" style="color: #1F4937; text-decoration: none;">info@100dola.com</a>
          · <a href="tel:+420739045057" style="color: #1F4937; text-decoration: none;">+420 739 045 057</a>
        </div>
      </div>

      <div style="margin-top: 28px; font-size: 12px; color: #9AA3C2; line-height: 1.5;">
        Tato zpráva potvrzuje, že jsem zaznamenal tvoji poptávku z webu 100dola.com.
        Pokud jsi ji neodeslal/a ty, ignoruj prosím tento e-mail.
      </div>
    </div>
  `;

  const text = [
    `Díky za poptávku, ${firstName}.`,
    ``,
    `Mám tvoji zprávu. Ozvu se ti do 24 hodin s konkrétním termínem, finální cenou po prohlídce kola a tím, co si máš s sebou připravit.`,
    ``,
    `Pokud spěcháš, klidně mi napiš nebo zavolej:`,
    `info@100dola.com`,
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
    console.error("[email] sendLabLeadConfirmation failed:", e);
  }
}

// ── Newsletter "Hlídat akce" welcome ────────────────────────────────────────

export async function sendNewsletterConfirmation(p: {
  email: string;
  unsubscribeToken: string;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
  const unsubUrl = `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(p.unsubscribeToken)}`;

  const subject = "Sleduješ Open Miles Clinic — co teď?";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #2EAA6E; font-weight: 700;">Open Miles Clinic · 100dola</div>
        <h1 style="font-size: 26px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.1;">Vítej v hlídači akcí.</h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Tvůj e-mail máme uložený. Když přidáme novou akci (kolo, gravel, MTB, skialp, turistika), pošleme ti shrnutí dřív, než se vyplní.
      </p>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Před každou akcí, na kterou se přihlásíš, dostaneš ještě připomínku 48 hodin předem — s aktualizovaným počasím, místem startu a tím, co si vzít.
      </p>

      <div style="margin-top: 28px; padding: 18px; background: #EDFAF3; border-radius: 12px;">
        <div style="font-weight: 700; margin-bottom: 4px;">Open Miles Clinic</div>
        <div style="font-size: 14px; color: #5A6480;">Sportovní komunita z Valašska · sekce 100dola</div>
        <div style="font-size: 14px; margin-top: 8px;">
          <a href="${baseUrl}/community" style="color: #2EAA6E; text-decoration: none;">100dola.com/community</a>
          · <a href="https://www.instagram.com/open_miles_clinic/" style="color: #2EAA6E; text-decoration: none;">@open_miles_clinic</a>
        </div>
      </div>

      <div style="margin-top: 28px; font-size: 12px; color: #9AA3C2; line-height: 1.5;">
        Nechtěl/a jsi se přihlásit? <a href="${unsubUrl}" style="color: #9AA3C2;">Klikni sem a odhlas se</a> — jedním klikem, bez ptaní.
      </div>
    </div>
  `;

  const text = [
    `Vítej v hlídači akcí Open Miles Clinic.`,
    ``,
    `Tvůj e-mail máme uložený. Když přidáme novou akci, pošleme ti shrnutí dřív, než se vyplní.`,
    ``,
    `Před každou akcí, na kterou se přihlásíš, dostaneš ještě připomínku 48 hodin předem.`,
    ``,
    `100dola.com/community · @open_miles_clinic`,
    ``,
    `Odhlásit: ${unsubUrl}`,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      html,
      text,
    });
  } catch (e) {
    console.error("[email] sendNewsletterConfirmation failed:", e);
  }
}

// ── E-shop order confirmation ───────────────────────────────────────────────

interface OrderEmailPayload {
  id: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  iban: string;
  qrDataUrl?: string;
  items: Array<{
    productId: number;
    slug: string;
    name: string;
    priceWithVat: number;
    vatRate: number;
    qty: number;
  }>;
  contact: {
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    companyIco?: string;
    companyDic?: string;
  };
  shipping: {
    method: string;
    methodLabel: string;
    street?: string;
    city?: string;
    zip?: string;
    zasilkovnaPickup?: string;
  };
  payment: {
    method: string;
    methodLabel: string;
  };
  notes?: string;
}

function fmtPrice(amount: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount) + " Kč";
}

export async function sendOrderConfirmation(order: OrderEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `Objednávka ${order.id} přijata — 100dola sport`;
  const firstName = order.contact.name.split(" ")[0];
  const isPersonal = order.shipping.method.startsWith("personal-");

  const itemsRows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #F0F2FA;">
          ${escapeHtml(i.name)} <span style="color: #9AA3C2;">× ${i.qty}</span>
        </td>
        <td style="padding: 8px 0; border-bottom: 1px solid #F0F2FA; text-align: right; font-weight: 700;">
          ${escapeHtml(fmtPrice(i.priceWithVat * i.qty))}
        </td>
      </tr>`,
    )
    .join("");

  const paymentBlock = (() => {
    if (order.payment.method === "qr" || order.payment.method === "bank-transfer") {
      return `
        <div style="margin-top: 24px; padding: 20px; background: #F0F4FF; border-radius: 12px;">
          <div style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #3B7CF4; font-weight: 700; margin-bottom: 10px;">Platba ${escapeHtml(order.payment.methodLabel)}</div>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="padding: 4px 0; color: #9AA3C2; width: 130px;">Číslo účtu</td><td style="padding: 4px 0;"><strong>2001508163/2010</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #9AA3C2;">IBAN</td><td style="padding: 4px 0;"><strong>${escapeHtml(order.iban)}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #9AA3C2;">Variabilní symbol</td><td style="padding: 4px 0;"><strong>${escapeHtml(order.id)}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #9AA3C2;">Částka</td><td style="padding: 4px 0;"><strong>${escapeHtml(fmtPrice(order.total))}</strong></td></tr>
            <tr><td style="padding: 4px 0; color: #9AA3C2;">Splatnost</td><td style="padding: 4px 0;">5 pracovních dní</td></tr>
          </table>
          ${order.qrDataUrl
            ? `<div style="margin-top: 16px; text-align: center;">
                <img src="${order.qrDataUrl}" alt="QR platba" width="180" height="180" style="display: inline-block; border-radius: 8px; background: #fff; padding: 8px;" />
                <div style="font-size: 11px; color: #9AA3C2; margin-top: 6px;">Naskenuj v bankovní aplikaci (FIO, KB, Air Bank, Revolut…)</div>
              </div>`
            : ""}
        </div>`;
    }
    if (order.payment.method === "cash-pickup") {
      return `
        <div style="margin-top: 24px; padding: 18px; background: #FFF8EC; border-radius: 12px;">
          <div style="font-size: 14px;">
            <strong>Hotovost při převzetí</strong> — zaplatíš na místě při osobním vyzvednutí (${escapeHtml(order.shipping.methodLabel.replace("Osobní vyzvednutí — ", ""))}).
          </div>
        </div>`;
    }
    return `
      <div style="margin-top: 24px; padding: 18px; background: #F0F4FF; border-radius: 12px;">
        <div style="font-size: 14px;">Platba <strong>${escapeHtml(order.payment.methodLabel)}</strong> — instrukce zašleme samostatně po potvrzení.</div>
      </div>`;
  })();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #3B7CF4; font-weight: 700;">100dola sport</div>
        <h1 style="font-size: 26px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.1;">Díky za objednávku, ${escapeHtml(firstName)}.</h1>
        <div style="color: #5A6480; font-size: 14px; margin-top: 4px;">Objednávka <strong>${escapeHtml(order.id)}</strong></div>
      </div>

      <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
        ${itemsRows}
        <tr><td style="padding: 8px 0; color: #5A6480;">Doprava (${escapeHtml(order.shipping.methodLabel)})</td><td style="padding: 8px 0; text-align: right;">${escapeHtml(fmtPrice(order.shippingFee))}</td></tr>
        <tr><td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 800;">Celkem</td><td style="padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: 900;">${escapeHtml(fmtPrice(order.total))}</td></tr>
      </table>

      ${paymentBlock}

      <p style="font-size: 14px; line-height: 1.6; color: #5A6480; margin-top: 24px;">
        <strong style="color: #1a1a2e;">Co bude dál:</strong><br/>
        Termín dodání ti potvrdíme po zadání objednávky. Ozveme se ti do 24 hodin.
      </p>

      <div style="margin-top: 28px; padding: 18px; background: #F0F4FF; border-radius: 12px;">
        <div style="font-weight: 700; margin-bottom: 4px;">100dola sport · FUTUNATU s.r.o.</div>
        <div style="font-size: 14px;">
          <a href="mailto:info@100dola.com" style="color: #3B7CF4; text-decoration: none;">info@100dola.com</a>
          · <a href="tel:+420739045057" style="color: #3B7CF4; text-decoration: none;">+420 739 045 057</a>
        </div>
        <div style="font-size: 12px; color: #9AA3C2; margin-top: 6px;">IČO 07376766 · DIČ CZ07376766</div>
      </div>

      <div style="margin-top: 28px; font-size: 12px; color: #9AA3C2; line-height: 1.5;">
        Tento e-mail potvrzuje, že jsme zaznamenali tvoji objednávku z 100dola.com.
      </div>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: order.contact.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      html,
    });
  } catch (e) {
    console.error("[email] sendOrderConfirmation failed:", e);
  }
}

export async function sendOrderNotification(order: OrderEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `🛒 Nová objednávka ${order.id} — ${order.contact.name} (${fmtPrice(order.total)})`;

  const itemsList = order.items
    .map((i) => `• ${i.name} × ${i.qty} = ${fmtPrice(i.priceWithVat * i.qty)}`)
    .join("\n");

  const text = [
    `Nová objednávka — ${order.id}`,
    ``,
    `${order.contact.name} · ${order.contact.email} · ${order.contact.phone}`,
    order.contact.companyName ? `Firma: ${order.contact.companyName} (IČO ${order.contact.companyIco || "—"})` : "",
    ``,
    `Položky:`,
    itemsList,
    ``,
    `Mezisoučet: ${fmtPrice(order.subtotal)}`,
    `Doprava (${order.shipping.methodLabel}): ${fmtPrice(order.shippingFee)}`,
    `CELKEM: ${fmtPrice(order.total)}`,
    ``,
    `Doprava: ${order.shipping.methodLabel}`,
    order.shipping.street ? `Adresa: ${order.shipping.street}, ${order.shipping.city || ""} ${order.shipping.zip || ""}` : "",
    order.shipping.zasilkovnaPickup ? `Zásilkovna pobočka: ${order.shipping.zasilkovnaPickup}` : "",
    ``,
    `Platba: ${order.payment.methodLabel}`,
    order.notes ? `\nPoznámka:\n${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: order.contact.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendOrderNotification failed:", e);
  }
}
