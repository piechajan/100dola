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
        Mám tvoji zprávu. Ozvu se ti do 48 hodin s konkrétním dalším krokem — termín, cena na míru, co potřebuju vědět.
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
        Tato zpráva potvrzuje, že jsem zaznamenal tvoji poptávku z webu 100dola.com.
        Pokud jsi ji neodeslal/a ty, ignoruj prosím tento e-mail.
      </div>
    </div>
  `;

  const text = [
    `Díky za poptávku, ${lead.name.split(" ")[0]}.`,
    ``,
    `Mám tvoji zprávu. Ozvu se ti do 48 hodin s konkrétním dalším krokem — termín, cena na míru, co potřebuju vědět.`,
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
        Mám tvoji poptávku. Ozvu se ti do 48 hodin s konkrétním termínem, finální cenou po prohlídce kola a tím, co si máš s sebou připravit.
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
    `Mám tvoji zprávu. Ozvu se ti do 48 hodin s konkrétním termínem, finální cenou po prohlídce kola a tím, co si máš s sebou připravit.`,
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

/**
 * Double opt-in confirmation request — pošle e-mail s linkem co odběr aktivuje.
 * Pokud `confirmationToken` chybí, fungujeme jako before (single opt-in welcome).
 */
export async function sendNewsletterConfirmation(p: {
  email: string;
  unsubscribeToken: string;
  confirmationToken?: string;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
  const unsubUrl = `${baseUrl}/api/unsubscribe?token=${encodeURIComponent(p.unsubscribeToken)}`;

  // Double opt-in varianta — pokud máme confirmationToken, posíláme verifying email
  if (p.confirmationToken) {
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${encodeURIComponent(p.confirmationToken)}`;
    const verifySubject = "Potvrď odběr Open Miles Clinic — 1 klik";
    const verifyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
        <div style="margin-bottom: 20px;">
          <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #2EAA6E; font-weight: 700;">Open Miles Clinic</div>
          <h1 style="font-size: 22px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.2;">Potvrď, že ti můžeme posílat akce.</h1>
        </div>
        <p style="font-size: 14px; line-height: 1.6; color: #5A6480;">
          Někdo (snad ty) tě právě přihlásil k odběru akcí Open Miles Clinic. Stačí kliknout —
          a začneme ti posílat informace o nadcházejících vyjížďkách, akcích a komunitních eventech.
        </p>
        <p style="margin: 28px 0;">
          <a href="${confirmUrl}" style="display: inline-block; background: #2EAA6E; color: white; padding: 14px 28px; border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 14px;">
            Ano, potvrzuji odběr
          </a>
        </p>
        <p style="font-size: 12px; color: #9AA3C2; line-height: 1.5;">
          Pokud jsi to nebyl/a ty, prostě tento e-mail ignoruj — odběr nebude aktivován.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E2E6F3; font-size: 11px; color: #9AA3C2; word-break: break-all;">
          Nebo zkopíruj odkaz do prohlížeče:<br>${confirmUrl}
        </div>
      </div>
    `;
    const verifyText = [
      `Potvrď odběr Open Miles Clinic.`,
      ``,
      `Otevři tento odkaz a tím odběr aktivuješ:`,
      confirmUrl,
      ``,
      `Pokud jsi to nebyl/a ty, e-mail ignoruj — odběr nebude aktivován.`,
    ].join("\n");

    try {
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: p.email,
        replyTo: NOTIFY_EMAIL,
        subject: verifySubject,
        html: verifyHtml,
        text: verifyText,
      });
    } catch (e) {
      console.error("[email] sendNewsletterConfirmation (verify) failed:", e);
    }
    return;
  }

  const subject = "Sleduješ Open Miles Clinic — co teď?";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #2EAA6E; font-weight: 700;">Open Miles Clinic · 100dola</div>
        <h1 style="font-size: 26px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.1;">Vítej v hlídači akcí.</h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480;">
        Tvůj e-mail máme uložený. Když přidáme novou akci (kolo, gravel, MTB, skialp, turistika), pošleme ti shrnutí dřív, než se naplní.
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
    `Tvůj e-mail máme uložený. Když přidáme novou akci, pošleme ti shrnutí dřív, než se naplní.`,
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
        Termín dodání ti potvrdíme po zadání platby. Ozveme se ti do 48 hodin.
      </p>

      <div style="margin-top: 16px; padding: 14px 16px; background: #FFF8E7; border: 1px solid #F5D78E; border-radius: 12px; font-size: 13px; color: #5A4500; line-height: 1.5;">
        <strong style="color: #1a1a2e;">Splatnost 7 dní.</strong>
        Pokud platbu neobdržíme do 7 dnů od objednávky, objednávka bude
        automaticky stornována a zboží uvolněno pro další zájemce. Den 2 ti
        pošleme připomínku, kdybys náhodou zapomněl/a.
      </div>

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

/**
 * Review follow-up — pošle zákazníkovi prosbu o recenzi ~7 dní po expedici.
 * Primárně vede na recenzi produktu na našem webu (/reviews/submit) — každá
 * položka objednávky má vlastní tlačítko „Ohodnotit". Pokud je nastavený
 * GOOGLE_REVIEW_URL, přidá i sekundární CTA na Google recenzi. Naplánováno přes
 * Resend `scheduledAt` (+7 dní), takže nepotřebuje cron ani DB sloupec. Voláno
 * při přechodu objednávky do „shipped". Graceful no-op když Resend není
 * nakonfigurován.
 */
export async function sendReviewRequest(p: {
  id: string;
  name: string;
  email: string;
  items?: { slug: string; name: string }[];
  /** true = poslat hned (admin test), jinak naplánováno +7 dní. */
  immediate?: boolean;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";
  const googleUrl = process.env.GOOGLE_REVIEW_URL;
  const firstName = p.name.split(" ")[0] || "";
  const sendInSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const items = (p.items ?? []).filter((i) => i.slug && i.name);

  const reviewLink = (slug: string) =>
    `${base}/reviews/submit?slug=${encodeURIComponent(slug)}&order=${encodeURIComponent(p.id)}`;

  const productRows = items
    .map(
      (it, idx) => `
      <tr>
        <td style="padding: 14px 16px; font-size: 14px; font-weight: 700; color: #1a1a2e; ${idx > 0 ? "border-top: 1px solid #F0F2FA;" : ""}">
          ${escapeHtml(it.name)}
        </td>
        <td style="padding: 14px 16px; text-align: right; ${idx > 0 ? "border-top: 1px solid #F0F2FA;" : ""}">
          <a href="${reviewLink(it.slug)}" style="display: inline-block; padding: 9px 18px; background: #3B7CF4; color: #fff; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 13px; white-space: nowrap;">Ohodnotit ★</a>
        </td>
      </tr>`,
    )
    .join("");

  const productBlock = items.length
    ? `<table style="width: 100%; border-collapse: collapse; border: 1px solid #E9ECF5; border-radius: 14px; margin: 0 0 24px;">
        ${productRows}
      </table>`
    : `<div style="text-align: center; margin: 8px 0 24px;">
        <a href="${base}/reviews/submit?order=${encodeURIComponent(p.id)}" style="display: inline-block; padding: 14px 28px; background: #3B7CF4; color: #fff; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 15px;">Napsat recenzi ★</a>
      </div>`;

  const googleBlock = googleUrl
    ? `<div style="text-align: center; margin: 4px 0 8px; padding-top: 20px; border-top: 1px solid #F0F2FA;">
        <p style="font-size: 14px; color: #5A6480; margin: 0 0 12px;">A jestli budeš mít chvilku navíc, moc nám pomůže i recenze na Googlu — jsme malý lokální obchod:</p>
        <a href="${escapeHtml(googleUrl)}" style="display: inline-block; padding: 12px 24px; background: #fff; border: 2px solid #3B7CF4; color: #3B7CF4; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">Recenze na Googlu ★</a>
      </div>`
    : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="margin-bottom: 18px;">
        <div style="font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #3B7CF4; font-weight: 700;">100dola sport</div>
        <h1 style="font-size: 24px; margin: 8px 0 0 0; font-weight: 800; line-height: 1.15;">Jak jsi spokojený${firstName ? `, ${escapeHtml(firstName)}` : ""}?</h1>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #5A6480; margin: 0 0 8px;">
        Nedávno jsi u nás nakoupil — díky za důvěru! 🚴 Doufáme, že ti všechno sedí a užíváš si to.
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #5A6480; margin: 0 0 22px;">
        Budeme rádi za tvůj názor. Pomůže dalším při výběru a nám udělá radost — zabere to chvilku:
      </p>

      ${productBlock}

      ${googleBlock}

      <p style="font-size: 13px; line-height: 1.6; color: #9AA3C2; margin-top: 22px;">
        Kdyby cokoli nebylo v pořádku, napiš nám prosím rovnou na
        <a href="mailto:info@100dola.com" style="color: #3B7CF4;">info@100dola.com</a> — vyřešíme to.
      </p>

      <div style="margin-top: 24px; padding: 16px; background: #F0F4FF; border-radius: 12px;">
        <div style="font-weight: 700; margin-bottom: 4px;">100dola sport · FUTUNATU s.r.o.</div>
        <div style="font-size: 14px;">
          <a href="mailto:info@100dola.com" style="color: #3B7CF4; text-decoration: none;">info@100dola.com</a>
          · <a href="tel:+420739045057" style="color: #3B7CF4; text-decoration: none;">+420 739 045 057</a>
        </div>
        <div style="font-size: 12px; color: #9AA3C2; margin-top: 6px;">IČO 07376766 · DIČ CZ07376766</div>
      </div>

      <div style="margin-top: 20px; font-size: 12px; color: #9AA3C2; line-height: 1.5;">
        Tenhle e-mail ti posíláme jednorázově k objednávce ${escapeHtml(p.id)}. Pokud si výzvy k hodnocení nepřeješ, napiš nám a vyřadíme tě.
      </div>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      replyTo: NOTIFY_EMAIL,
      subject: "Jak jsi spokojený s nákupem? — 100dola sport",
      html,
      ...(p.immediate ? {} : { scheduledAt: sendInSevenDays }),
    });
  } catch (e) {
    console.error("[email] sendReviewRequest failed:", e);
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

// ── Magic-link login pro účetní ──────────────────────────────────────────────

export async function sendAccountantMagicLink(p: {
  email: string;
  magicUrl: string;
}): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn("[email] sendAccountantMagicLink: Resend not configured");
    return;
  }

  const subject = "Přihlášení do účetnictví 100dola";
  const text = [
    `Dobrý den,`,
    ``,
    `pro přihlášení do účetního přehledu 100dola otevři tento odkaz:`,
    p.magicUrl,
    ``,
    `Odkaz platí 15 minut. Po přihlášení zůstaneš přihlášen 30 dní.`,
    ``,
    `Pokud jsi tento e-mail neočekával, ignoruj ho.`,
    ``,
    `100dola`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a2e">
      <h2 style="margin:0 0 16px;font-size:18px;">Přihlášení do účetnictví 100dola</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#5A6480">
        Klikni na tlačítko níže. Odkaz platí <strong>15 minut</strong>.
      </p>
      <p style="margin:24px 0">
        <a href="${p.magicUrl}" style="display:inline-block;background:#3B7CF4;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px;">
          Otevřít účetnictví →
        </a>
      </p>
      <p style="margin:24px 0 0;font-size:12px;color:#9AA3C2;line-height:1.5">
        Po přihlášení tě budeme pamatovat 30 dní. Pokud jsi tento e-mail neočekával, ignoruj ho.
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error("[email] sendAccountantMagicLink failed:", e);
    throw e;
  }
}

// ── Order zaplaceno — auto-detekce z Fakturoid bank sync ─────────────────────

export interface OrderPaidNotificationPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  invoiceNumber: string;
}

/**
 * Posílá 2 e-maily:
 *  1. Klientovi — „Platba dorazila, balík chystáme."
 *  2. Adminovi — interní notif, že platba byla automaticky spárovaná.
 */
export async function sendOrderPaidNotification(
  p: OrderPaidNotificationPayload,
): Promise<void> {
  if (!isEmailConfigured()) return;

  // 1) klient
  const customerSubject = `Platba přijata · objednávka ${p.orderId}`;
  const customerText = [
    `Dobrý den ${escapeHtml(p.customerName)},`,
    ``,
    `vaše platba dorazila — objednávku ${p.orderId} právě připravujeme k odeslání.`,
    `Souhrn najdete v PDF faktuře (${p.invoiceNumber}), kterou jsme vám poslali zvlášť.`,
    ``,
    `Jakmile balík předáme dopravci, ozveme se s číslem zásilky.`,
    ``,
    `Díky,`,
    `100dola sport`,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.customerEmail,
      subject: customerSubject,
      text: customerText,
    });
  } catch (e) {
    console.error("[email] sendOrderPaidNotification (klient) failed:", e);
  }

  // 2) admin
  const adminSubject = `💸 Platba spárovaná · ${p.orderId} (${p.total} Kč)`;
  const adminText = [
    `Auto-detekce platby z Fakturoid bank sync:`,
    ``,
    `Order:    ${p.orderId}`,
    `Klient:   ${p.customerName} · ${p.customerEmail}`,
    `Částka:   ${p.total} Kč`,
    `Faktura:  ${p.invoiceNumber}`,
    ``,
    `Status orderu byl automaticky přepnut na "paid".`,
    `→ Připravit k odeslání: https://100dola.com/admin/orders/${p.orderId}`,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: adminSubject,
      text: adminText,
    });
  } catch (e) {
    console.error("[email] sendOrderPaidNotification (admin) failed:", e);
  }
}

// ── ISAAC test rezervace ─────────────────────────────────────────────────────

import { buildIcs, buildGoogleCalendarUrl } from "./isaac-calendar";

export interface IsaacTestEmailPayload {
  reservationId: number;
  bike: string;
  slotLabel: string;
  slotStart: string;
  slotEnd: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  /** Cancel token — pro link na zrušení rezervace v e-mailu. */
  cancelToken?: string;
}

const STORE_LOCATION =
  "Obchod 100dola sport, vedle kavárny Namístě, náměstí Šternberk";
const BRING_LIST_TEXT = [
  "• Občanský průkaz (povinný — slouží jako záloha, vrátíme po odevzdání kola)",
  "• Helma (povinná)",
  "• Cyklistické oblečení",
  "• Vlastní pedály",
  "• Cyklistické tretry (vázané na vaše pedály)",
];

export async function sendIsaacTestConfirmation(p: IsaacTestEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const eventDesc = [
    `Kolo: ${p.bike}`,
    `Délka: 1 hodina`,
    ``,
    `Co s sebou:`,
    ...BRING_LIST_TEXT,
    ``,
    `Před vyzvednutím podepíšete protokol o zápůjčce (vyrobíme my, ty jen podepíšeš).`,
    `Doneste si doklad totožnosti.`,
    ``,
    `Kontakt: Jan Piecha · +420 739 045 057 · info@100dola.com`,
  ].join("\\n");

  const calEvent = {
    uid: `isaac-${p.reservationId}@100dola.com`,
    title: `Testovací jízda ISAAC — ${p.bike}`,
    description: eventDesc,
    location: STORE_LOCATION,
    startIso: p.slotStart,
    endIso: p.slotEnd,
  };
  const ics = buildIcs(calEvent);
  const gcalUrl = buildGoogleCalendarUrl(calEvent);

  const subject = `Rezervace testovací jízdy ISAAC — ${p.slotLabel}`;
  const text = [
    `Dobrý den ${p.fullName},`,
    ``,
    `vaše rezervace na testovací jízdu ISAAC kola je potvrzená:`,
    ``,
    `Kolo:    ${p.bike}`,
    `Termín:  ${p.slotLabel}`,
    `Délka:   1 hodina`,
    ``,
    `Co si vezměte s sebou:`,
    ...BRING_LIST_TEXT,
    ``,
    `Přidat do kalendáře:`,
    `Google: ${gcalUrl}`,
    `(Pro Apple / Outlook použijte přiložený .ics soubor.)`,
    ``,
    `Před vyzvednutím podepíšete krátký protokol o zápůjčce — vytiskneme ho za vás,`,
    `přijdete s dokladem totožnosti. Po dobu zápůjčky plně odpovídáte za kolo.`,
    ``,
    `Ráno v 8:00 v den testu vám připomeneme detail e-mailem.`,
    ``,
    `Pokud byste přijít nemohl/a, můžete rezervaci zrušit 1 klikem:`,
    p.cancelToken
      ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/api/isaac-test/cancel?token=${p.cancelToken}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/isaac-test/zrusit-rezervaci`,
    ``,
    `Jan Piecha`,
    `100dola sport · +420 739 045 057`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a2e">
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3B7CF4;font-weight:700;margin-bottom:8px">
        Testovací jízda ISAAC
      </div>
      <h2 style="margin:0 0 16px;font-size:20px">Rezervace potvrzená</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#5A6480">
        Dobrý den ${escapeHtml(p.fullName)}, vaše rezervace je zapsaná.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;background:#F7F9FF;border-radius:12px">
        <tr><td style="padding:10px 14px;color:#9AA3C2;width:90px">Kolo</td><td style="padding:10px 14px;font-weight:700">${escapeHtml(p.bike)}</td></tr>
        <tr><td style="padding:10px 14px;color:#9AA3C2;border-top:1px solid #E2E6F3">Termín</td><td style="padding:10px 14px;font-weight:700;border-top:1px solid #E2E6F3">${escapeHtml(p.slotLabel)}</td></tr>
        <tr><td style="padding:10px 14px;color:#9AA3C2;border-top:1px solid #E2E6F3">Délka</td><td style="padding:10px 14px;border-top:1px solid #E2E6F3">1 hodina</td></tr>
      </table>

      <p style="margin:0 0 20px">
        <a href="${gcalUrl}" target="_blank" style="display:inline-block;background:#3B7CF4;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:13px;">
          📅 Přidat do Google Kalendáře
        </a>
        <span style="font-size:12px;color:#9AA3C2;margin-left:8px">.ics soubor v příloze pro Apple / Outlook</span>
      </p>

      <div style="background:#F7F9FF;border:1px solid #E2E6F3;border-radius:12px;padding:14px;font-size:13px;color:#1a1a2e;line-height:1.6;margin:16px 0">
        <div style="font-weight:700;margin-bottom:6px">Co si vezměte s sebou</div>
        <ul style="margin:0;padding-left:18px">
          <li><strong>Občanský průkaz</strong> — povinný, slouží jako záloha (vrátíme po odevzdání kola)</li>
          <li><strong>Helma</strong> — povinná</li>
          <li>Cyklistické oblečení</li>
          <li>Vlastní pedály</li>
          <li>Tretry vázané na vaše pedály</li>
        </ul>
      </div>

      <div style="background:#FFF8E7;border:1px solid #F5D78E;border-radius:12px;padding:14px;font-size:13px;color:#5A4500;line-height:1.5;margin:16px 0">
        <strong>Před vyzvednutím:</strong> připravíme za vás protokol o zápůjčce, jen podepíšete a předáte OP jako zálohu. Po dobu zápůjčky plně odpovídáte za kolo.
      </div>

      <p style="margin:0 0 16px;font-size:13px;color:#5A6480">
        Ráno v 8:00 v den testu vám připomeneme detail e-mailem.
      </p>

      ${
        p.cancelToken
          ? `<p style="margin:16px 0;font-size:12px;color:#9AA3C2;text-align:center;padding-top:12px;border-top:1px solid #F0F2FA">
          Pokud nemůžete přijít, můžete <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/api/isaac-test/cancel?token=${p.cancelToken}" style="color:#E8431A;font-weight:700">zrušit rezervaci jedním klikem</a>. Slot se ihned uvolní pro další.
        </p>`
          : ""
      }

      <p style="margin:24px 0 0;font-size:13px;color:#9AA3C2">
        Jan Piecha · 100dola sport · +420 739 045 057
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
      html,
      attachments: [
        {
          filename: "isaac-test.ics",
          content: Buffer.from(ics, "utf-8").toString("base64"),
          contentType: "text/calendar; charset=utf-8; method=PUBLISH",
        },
      ],
    });
  } catch (e) {
    console.error("[email] sendIsaacTestConfirmation failed:", e);
  }
}

export async function sendIsaacTestNotification(p: IsaacTestEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `🚲 Nová ISAAC rezervace — ${p.fullName} · ${p.slotLabel}`;
  const text = [
    `Nová rezervace testovací jízdy ISAAC`,
    ``,
    `Klient:  ${p.fullName} · ${p.email} · ${p.phone}`,
    `Kolo:    ${p.bike}`,
    `Termín:  ${p.slotLabel}`,
    p.notes ? `Poznámka:\n${p.notes}` : "",
    ``,
    `→ https://www.100dola.com/admin/isaac-test`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: p.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendIsaacTestNotification failed:", e);
  }
}

// ── SCOTT test / zápůjčka rezervace ──────────────────────────────────────────

export interface ScottTestEmailPayload {
  fullName: string;
  email: string;
  phone: string;
  /** Model + velikost, např. "SCOTT Addict RC 10 · vel. L". */
  bike: string;
  /** Popisek termínu, např. "Testovací jízdy · Po–Pá 3.–7. 8. (9:00–16:00)". */
  term: string;
  notes?: string;
  requestId: number | string;
}

export async function sendScottTestConfirmation(p: ScottTestEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `Rezervace testovací jízdy SCOTT — ${p.term}`;
  const text = [
    `Dobrý den ${p.fullName},`,
    ``,
    `vaše rezervace testovací jízdy je zapsaná:`,
    ``,
    `Kolo:    ${p.bike}`,
    `Termín:  ${p.term}`,
    ``,
    `Co si vezměte s sebou:`,
    ...BRING_LIST_TEXT,
    ``,
    `Místo: ${STORE_LOCATION}`,
    ``,
    `Před vyzvednutím podepíšete krátký protokol o zápůjčce — vytiskneme ho za vás,`,
    `přijdete s dokladem totožnosti. Po dobu zápůjčky plně odpovídáte za kolo.`,
    ``,
    `Pro změnu nebo zrušení nám napiš na info@100dola.com nebo zavolej +420 739 045 057.`,
    ``,
    `Kontakt: Jan Piecha · +420 739 045 057 · info@100dola.com`,
    ``,
    `Jan Piecha`,
    `100dola sport · +420 739 045 057`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a2e">
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3B7CF4;font-weight:700;margin-bottom:8px">
        Testovací jízda SCOTT
      </div>
      <h2 style="margin:0 0 16px;font-size:20px">Rezervace potvrzená</h2>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#5A6480">
        Dobrý den ${escapeHtml(p.fullName)}, vaše rezervace je zapsaná.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;background:#F7F9FF;border-radius:12px">
        <tr><td style="padding:10px 14px;color:#9AA3C2;width:90px">Kolo</td><td style="padding:10px 14px;font-weight:700">${escapeHtml(p.bike)}</td></tr>
        <tr><td style="padding:10px 14px;color:#9AA3C2;border-top:1px solid #E2E6F3">Termín</td><td style="padding:10px 14px;font-weight:700;border-top:1px solid #E2E6F3">${escapeHtml(p.term)}</td></tr>
        <tr><td style="padding:10px 14px;color:#9AA3C2;border-top:1px solid #E2E6F3">Místo</td><td style="padding:10px 14px;border-top:1px solid #E2E6F3">${escapeHtml(STORE_LOCATION)}</td></tr>
      </table>

      <div style="background:#F7F9FF;border:1px solid #E2E6F3;border-radius:12px;padding:14px;font-size:13px;color:#1a1a2e;line-height:1.6;margin:16px 0">
        <div style="font-weight:700;margin-bottom:6px">Co si vezměte s sebou</div>
        <ul style="margin:0;padding-left:18px">
          <li><strong>Občanský průkaz</strong> — povinný, slouží jako záloha (vrátíme po odevzdání kola)</li>
          <li><strong>Helma</strong> — povinná</li>
          <li>Cyklistické oblečení</li>
          <li>Vlastní pedály</li>
          <li>Tretry vázané na vaše pedály</li>
        </ul>
      </div>

      <div style="background:#FFF8E7;border:1px solid #F5D78E;border-radius:12px;padding:14px;font-size:13px;color:#5A4500;line-height:1.5;margin:16px 0">
        <strong>Před vyzvednutím:</strong> připravíme za vás protokol o zápůjčce, jen podepíšete a předáte OP jako zálohu. Po dobu zápůjčky plně odpovídáte za kolo.
      </div>

      <p style="margin:16px 0;font-size:13px;color:#5A6480;line-height:1.5">
        Pro změnu nebo zrušení nám napiš na <a href="mailto:info@100dola.com" style="color:#3B7CF4;font-weight:700">info@100dola.com</a> nebo zavolej <strong>+420 739 045 057</strong>.
      </p>

      <p style="margin:24px 0 0;font-size:13px;color:#9AA3C2">
        Jan Piecha · 100dola sport · +420 739 045 057
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error("[email] sendScottTestConfirmation failed:", e);
  }
}

export async function sendScottTestNotification(p: ScottTestEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `🚲 Nová SCOTT rezervace — ${p.fullName} · ${p.term}`;
  const text = [
    `Nová rezervace testovací jízdy`,
    ``,
    `Klient:  ${p.fullName} · ${p.email} · ${p.phone}`,
    `Kolo:    ${p.bike}`,
    `Termín:  ${p.term}`,
    p.notes ? `Poznámka:\n${p.notes}` : "",
    ``,
    `Ref:     ${p.requestId}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: p.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendScottTestNotification failed:", e);
  }
}

// ── Ranní reminder v 8:00 v den testu (přes Resend scheduled_at) ─────────────

export async function scheduleIsaacTestReminder(
  p: IsaacTestEmailPayload,
): Promise<string | null> {
  if (!isEmailConfigured()) return null;

  // 8:00 ráno v den testu (Europe/Prague = CEST UTC+2 v květnu)
  const slotDay = p.slotStart.slice(0, 10);
  const sendAtIso = new Date(`${slotDay}T08:00:00+02:00`).toISOString();

  // Pokud je čas v minulosti (admin testuje), neschedule
  if (new Date(sendAtIso).getTime() <= Date.now() + 60_000) {
    console.warn(`[email] reminder time ${sendAtIso} is in the past, skipping schedule`);
    return null;
  }

  const subject = `🚲 Připomínka: dnes testuješ ISAAC v ${p.slotLabel.split("·").pop()?.trim() || ""}`;
  const text = [
    `Dobré ráno ${p.fullName},`,
    ``,
    `dnes v ${p.slotLabel} máš testovací jízdu ISAAC.`,
    ``,
    `Kolo:  ${p.bike}`,
    `Místo: ${STORE_LOCATION}`,
    ``,
    `Co si nezapomeň vzít:`,
    ...BRING_LIST_TEXT,
    ``,
    `Připrav se 10 min předem — kolo seřídíme, nasadíme tvoje pedály, podepíšeš protokol, předáš OP jako zálohu a jedeš.`,
    ``,
    `Kdybys to nestihl/a, zruš rezervaci 1 klikem:`,
    p.cancelToken
      ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/api/isaac-test/cancel?token=${p.cancelToken}`
      : `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/isaac-test/zrusit-rezervaci`,
    ``,
    `Kdyby cokoliv: +420 739 045 057.`,
    ``,
    `Jan`,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a2e">
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#3B7CF4;font-weight:700;margin-bottom:8px">
        ISAAC test · dnes
      </div>
      <h2 style="margin:0 0 12px;font-size:22px">Dnes v ${escapeHtml(p.slotLabel.split("·").pop()?.trim() || "")} testuješ.</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#5A6480">Kolo: <strong>${escapeHtml(p.bike)}</strong></p>
      <div style="background:#F7F9FF;border:1px solid #E2E6F3;border-radius:12px;padding:14px;font-size:14px;color:#1a1a2e;line-height:1.7;margin:16px 0">
        <div style="font-weight:700;margin-bottom:6px">Co si vezmi</div>
        <ul style="margin:0;padding-left:18px">
          <li><strong>Občanský průkaz</strong> (záloha — vrátíme po odevzdání kola)</li>
          <li><strong>Helma</strong> (povinná)</li>
          <li>Cyklistické oblečení</li>
          <li>Vlastní pedály</li>
          <li>Tretry</li>
        </ul>
      </div>
      <p style="margin:0;font-size:14px;color:#5A6480">
        Připrav se 10 min předem. Kdyby cokoliv: <strong>+420 739 045 057</strong>.
      </p>
      ${
        p.cancelToken
          ? `<p style="margin:16px 0 0;font-size:12px;color:#9AA3C2;text-align:center;padding-top:12px;border-top:1px solid #F0F2FA">
          Nestíháš? <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/api/isaac-test/cancel?token=${p.cancelToken}" style="color:#E8431A;font-weight:700">Zrušit rezervaci jedním klikem</a>.
        </p>`
          : ""
      }
      <p style="margin:24px 0 0;font-size:13px;color:#9AA3C2">Jan · 100dola sport</p>
    </div>
  `;

  try {
    const res = await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
      html,
      scheduledAt: sendAtIso,
    });
    const id = (res as { data?: { id?: string } } | null)?.data?.id || null;
    console.log(`[email] reminder scheduled for ${sendAtIso} → resendId=${id}`);
    return id;
  } catch (e) {
    console.error("[email] scheduleIsaacTestReminder failed:", e);
    return null;
  }
}

// ── Kontakt formulář ─────────────────────────────────────────────────────────

export interface ContactEmailPayload {
  name: string;
  email: string;
  phone?: string | null;
  topic: "general" | "sport" | "malaga" | "lab" | "community" | "store";
  message: string;
}

const TOPIC_LABELS: Record<ContactEmailPayload["topic"], string> = {
  general: "Obecná otázka",
  sport: "100dola sport (kola, vybavení)",
  malaga: "100dola Malaga (přeprava / pobyty)",
  lab: "100dola Lab (servis kol)",
  community: "Open Miles Clinic (akce)",
  store: "Kamenná prodejna Šternberk",
};

export async function sendContactNotification(p: ContactEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `📨 Nová zpráva — ${p.name} · ${TOPIC_LABELS[p.topic]}`;
  const text = [
    `Nová zpráva z kontaktního formuláře`,
    ``,
    `Téma:    ${TOPIC_LABELS[p.topic]}`,
    `Od:      ${p.name} · ${p.email}${p.phone ? ` · ${p.phone}` : ""}`,
    ``,
    `Zpráva:`,
    p.message,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: p.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendContactNotification failed:", e);
  }
}

export async function sendContactConfirmation(p: ContactEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = "Tvoji zprávu mám · 100dola";
  const text = [
    `Dobrý den ${p.name},`,
    ``,
    `díky za zprávu na téma "${TOPIC_LABELS[p.topic]}".`,
    `Odpovím ti do 48 hodin (obvykle dřív).`,
    ``,
    `Pro rychlejší věci klidně zavolej: +420 739 045 057.`,
    ``,
    `Jan Piecha`,
    `100dola`,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendContactConfirmation failed:", e);
  }
}

// ── ISAAC test cancel — confirm, notif, request-link list ────────────────────

export interface IsaacCancelEmailPayload {
  reservationId: number;
  bike: string;
  slotLabel: string;
  slotStart: string;
  slotEnd: string;
  fullName: string;
  email: string;
  phone: string;
  /** True pokud rezervace stornovaná po odeslání ranní upomínky — text vysvětlí potenciální zmatek. */
  lateCancel?: boolean;
}

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com";

export async function sendIsaacCancelConfirmation(p: IsaacCancelEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  const subject = `Rezervace ISAAC zrušena · ${p.slotLabel}`;
  const text = [
    `Dobrý den ${p.fullName},`,
    ``,
    `vaše rezervace testovací jízdy ISAAC byla zrušena.`,
    ``,
    `Kolo:   ${p.bike}`,
    `Termín: ${p.slotLabel}`,
    ``,
    p.lateCancel
      ? `Pokud vám dnes ráno přišla připomínka, omlouváme se za zmatek — odešla se\nautomaticky před tím, než systém zaznamenal storno. Můžete ji ignorovat.\n`
      : "",
    `Slot je teď volný pro další zájemce. Pokud si to rozmyslíte, můžete si`,
    `vybrat nový termín na ${SITE_BASE}/isaac-test.`,
    ``,
    `Díky,`,
    `100dola sport`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendIsaacCancelConfirmation failed:", e);
  }
}

export async function sendIsaacCancelNotification(p: IsaacCancelEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  const subject = `❌ ISAAC zrušeno · ${p.fullName} · ${p.slotLabel}`;
  const text = [
    `Klient zrušil rezervaci ISAAC testovací jízdy`,
    ``,
    `Klient:  ${p.fullName} · ${p.email} · ${p.phone}`,
    `Kolo:    ${p.bike}`,
    `Termín:  ${p.slotLabel}`,
    ``,
    `Slot je teď znovu dostupný.`,
    `→ ${SITE_BASE}/admin/isaac-test`,
  ].join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: p.email,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendIsaacCancelNotification failed:", e);
  }
}

export async function sendIsaacCancelLinkList(p: {
  email: string;
  fullName: string;
  reservations: { id: number; bike: string; slotLabel: string; cancelToken: string }[];
}): Promise<void> {
  if (!isEmailConfigured()) return;
  if (p.reservations.length === 0) return;

  const subject = `Zrušení rezervace ISAAC · klikni na odkaz`;
  const linksText = p.reservations
    .map(
      (r) =>
        `  • ${r.bike} · ${r.slotLabel}\n    Zrušit: ${SITE_BASE}/api/isaac-test/cancel?token=${r.cancelToken}`,
    )
    .join("\n\n");
  const text = [
    `Dobrý den ${p.fullName || ""},`,
    ``,
    `vyžádal/a sis zrušení rezervace ISAAC testovací jízdy.`,
    `Máme pro tebe ${p.reservations.length === 1 ? "tuto rezervaci" : `${p.reservations.length} aktivních rezervací`}:`,
    ``,
    linksText,
    ``,
    `Klik na link nad termínem, který chceš zrušit. Slot se okamžitě uvolní.`,
    ``,
    `Pokud jsi o zrušení nepožádal/a, prostě tento e-mail ignoruj — žádné rezervace se nezruší samy.`,
    ``,
    `Díky,`,
    `100dola sport`,
  ].join("\n");

  const linksHtml = p.reservations
    .map(
      (r) => `
      <div style="background:#F7F9FF;border:1px solid #E2E6F3;border-radius:12px;padding:14px;margin:12px 0">
        <div style="font-weight:700;color:#1a1a2e;margin-bottom:4px">${escapeHtml(r.bike)}</div>
        <div style="font-size:13px;color:#5A6480;margin-bottom:10px">${escapeHtml(r.slotLabel)}</div>
        <a href="${SITE_BASE}/api/isaac-test/cancel?token=${r.cancelToken}"
           style="display:inline-block;background:#E8431A;color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:700;font-size:13px;">
          Zrušit tuto rezervaci
        </a>
      </div>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a2e">
      <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#E8431A;font-weight:700;margin-bottom:8px">
        ISAAC test · zrušení
      </div>
      <h2 style="margin:0 0 12px;font-size:20px">Klikni na rezervaci, kterou chceš zrušit</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#5A6480">
        Aktivní rezervace na ${escapeHtml(p.email)}:
      </p>
      ${linksHtml}
      <p style="margin:20px 0 0;font-size:12px;color:#9AA3C2">
        Pokud jsi o zrušení nepožádal/a, e-mail klidně ignoruj — žádné rezervace se nezruší samy.
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error("[email] sendIsaacCancelLinkList failed:", e);
  }
}

// ─────────────────────────────────────────────────────────────────────
// Order payment reminders & auto-cancel (cron)
// ─────────────────────────────────────────────────────────────────────

interface OrderReminderPayload {
  id: string;
  total: number;
  iban: string;
  variableSymbol?: string;
  qrDataUrl?: string;
  contact: { name: string; email: string };
  daysOld: number;
  expiresInDays: number;
}

/** Den 2 — připomínka klientovi že platba nedorazila. */
export async function sendOrderPaymentReminder(p: OrderReminderPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  const firstName = p.contact.name.split(" ")[0];
  const subject = `Připomínka platby — objednávka ${p.id} · 100dola sport`;

  const text = [
    `Dobrý den ${firstName},`,
    "",
    `připomínáme, že jsme zatím neobdrželi platbu za vaši objednávku ${p.id}.`,
    `Splatnost vyprší za ${p.expiresInDays} dní — pak bude objednávka automaticky stornována.`,
    "",
    `Částka: ${fmtPrice(p.total)}`,
    `IBAN: ${p.iban}`,
    p.variableSymbol ? `Variabilní symbol: ${p.variableSymbol}` : "",
    "",
    "Pokud jste už zaplatili, prosím ignorujte tento e-mail — bankovní převody se",
    "občas zpracovávají i 24-48 hodin.",
    "",
    "100dola sport · +420 739 045 057 · info@100dola.com",
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #E8A020; font-weight: 700; margin-bottom: 8px;">
        Připomínka platby
      </div>
      <h1 style="font-size: 22px; margin: 4px 0 16px 0; font-weight: 800;">Objednávka ${escapeHtml(p.id)} čeká na platbu</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #5A6480;">
        Dobrý den ${escapeHtml(firstName)}, připomínáme, že jsme zatím neobdrželi platbu
        za vaši objednávku. <strong>Splatnost vyprší za ${p.expiresInDays} dní</strong> —
        po té bude objednávka automaticky stornována a zboží uvolněno pro další zájemce.
      </p>

      <div style="margin-top: 20px; padding: 16px; background: #F0F4FF; border-radius: 12px;">
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="color: #5A6480; padding: 4px 0;">Částka</td><td style="text-align: right; font-weight: 800;">${escapeHtml(fmtPrice(p.total))}</td></tr>
          <tr><td style="color: #5A6480; padding: 4px 0;">IBAN</td><td style="text-align: right; font-family: 'SF Mono', monospace; font-size: 12px;">${escapeHtml(p.iban)}</td></tr>
          ${p.variableSymbol ? `<tr><td style="color: #5A6480; padding: 4px 0;">Variabilní symbol</td><td style="text-align: right; font-family: 'SF Mono', monospace;">${escapeHtml(p.variableSymbol)}</td></tr>` : ""}
        </table>
      </div>

      ${p.qrDataUrl ? `<div style="text-align: center; margin-top: 20px;"><img src="${p.qrDataUrl}" alt="QR platba" style="width: 200px; height: 200px;"/><div style="font-size: 12px; color: #9AA3C2; margin-top: 6px;">QR platba</div></div>` : ""}

      <p style="font-size: 13px; color: #9AA3C2; line-height: 1.5; margin-top: 24px;">
        Pokud jste už zaplatili, prosím ignorujte tento e-mail — bankovní převody
        se občas zpracovávají i 24-48 hodin a my párujeme platby ručně.
      </p>

      <div style="margin-top: 28px; padding: 16px; background: #F0F4FF; border-radius: 12px; font-size: 13px;">
        <strong>100dola sport · FUTUNATU s.r.o.</strong><br/>
        <a href="mailto:info@100dola.com" style="color: #3B7CF4;">info@100dola.com</a> · <a href="tel:+420739045057" style="color: #3B7CF4;">+420 739 045 057</a>
      </div>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.contact.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      text,
      html,
    });
  } catch (e) {
    console.error("[email] sendOrderPaymentReminder failed:", e);
  }
}

/** Den 2 — interní notif Janovi: tahle objednávka čeká na platbu. */
export async function sendOrderPaymentReminderAdmin(p: OrderReminderPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  const subject = `[Připomínka] Objednávka ${p.id} čeká ${p.daysOld} dní na platbu`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #E8A020; font-weight: 700;">Reminder · Den ${p.daysOld}</div>
      <h2 style="margin: 4px 0 12px 0;">Objednávka ${escapeHtml(p.id)}</h2>
      <p style="font-size: 14px; color: #5A6480; line-height: 1.6;">
        Klient <strong>${escapeHtml(p.contact.name)}</strong> (${escapeHtml(p.contact.email)})
        zatím nezaplatil. Částka <strong>${escapeHtml(fmtPrice(p.total))}</strong>.
        Splatnost vyprší za ${p.expiresInDays} dní.
      </p>
      <p style="font-size: 13px; color: #9AA3C2;">
        Klient dnes dostal automatickou připomínku.
        Detail: <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.100dola.com"}/admin/orders" style="color: #3B7CF4;">admin/orders</a>
      </p>
    </div>
  `;
  try {
    await getResend().emails.send({ from: FROM_EMAIL, to: NOTIFY_EMAIL, subject, html });
  } catch (e) {
    console.error("[email] sendOrderPaymentReminderAdmin failed:", e);
  }
}

interface OrderAutoCancelPayload {
  id: string;
  total: number;
  contact: { name: string; email: string };
}

/** Den 7+ — objednávka stornována, info klientovi. */
export async function sendOrderAutoCancelCustomer(p: OrderAutoCancelPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  const subject = `Objednávka ${p.id} stornována (vypršela splatnost) — 100dola sport`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9AA3C2; font-weight: 700;">Storno</div>
      <h1 style="font-size: 22px; margin: 4px 0 16px 0; font-weight: 800;">Objednávka ${escapeHtml(p.id)} byla automaticky stornována</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #5A6480;">
        Dobrý den ${escapeHtml(p.contact.name.split(" ")[0])}, neobdrželi jsme platbu za
        objednávku <strong>${escapeHtml(p.id)}</strong> v lhůtě splatnosti (7 dní), takže
        ji systém automaticky stornoval a zboží uvolnil.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #5A6480;">
        Pokud máte stále zájem, můžete objednávku zopakovat — nebo nám napsat a
        dohodneme se individuálně.
      </p>
      <div style="margin-top: 28px; padding: 16px; background: #F0F4FF; border-radius: 12px; font-size: 13px;">
        <strong>100dola sport · FUTUNATU s.r.o.</strong><br/>
        <a href="mailto:info@100dola.com" style="color: #3B7CF4;">info@100dola.com</a> · <a href="tel:+420739045057" style="color: #3B7CF4;">+420 739 045 057</a>
      </div>
    </div>
  `;
  try {
    await getResend().emails.send({ from: FROM_EMAIL, to: p.contact.email, replyTo: NOTIFY_EMAIL, subject, html });
  } catch (e) {
    console.error("[email] sendOrderAutoCancelCustomer failed:", e);
  }
}

/** Den 7+ — interní info Janovi: storno proběhlo. */
export async function sendOrderAutoCancelAdmin(p: OrderAutoCancelPayload): Promise<void> {
  if (!isEmailConfigured()) return;
  const subject = `[Auto-storno] Objednávka ${p.id} — nezaplaceno`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #9AA3C2; font-weight: 700;">Auto-storno</div>
      <h2 style="margin: 4px 0 12px 0;">Objednávka ${escapeHtml(p.id)}</h2>
      <p style="font-size: 14px; color: #5A6480; line-height: 1.6;">
        Klient <strong>${escapeHtml(p.contact.name)}</strong> (${escapeHtml(p.contact.email)})
        nezaplatil v lhůtě 7 dní. Částka <strong>${escapeHtml(fmtPrice(p.total))}</strong>.
        Objednávka byla automaticky stornována (status: cancelled).
      </p>
    </div>
  `;
  try {
    await getResend().emails.send({ from: FROM_EMAIL, to: NOTIFY_EMAIL, subject, html });
  } catch (e) {
    console.error("[email] sendOrderAutoCancelAdmin failed:", e);
  }
}

// ─────────────────────────────────────────────────────────────────────
// ISAAC test — daily summary, end-of-event report, no-show notif
// ─────────────────────────────────────────────────────────────────────

interface DailySummaryRow {
  slotLabel: string;
  slotStart: string;
  bike: string;
  fullName: string;
  email: string;
  phone: string;
  notes: string | null;
  status: string;
}

/** Ranní summary Janovi v 7:00 v den testu — kdo dnes přijde. */
export async function sendIsaacDailySummary(p: {
  dateLabel: string; // "Pátek 29. 5. 2026"
  rows: DailySummaryRow[];
  totalSlots: number;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  const reserved = p.rows.filter((r) => r.status === "reserved");
  const cancelled = p.rows.filter((r) => r.status === "cancelled");
  const subject = `🚲 ISAAC den ${p.dateLabel} — ${reserved.length} rezervací`;

  const text = [
    `ISAAC test ${p.dateLabel}`,
    ``,
    `Rezervací: ${reserved.length} / ${p.totalSlots} slotů`,
    cancelled.length > 0 ? `Zrušené: ${cancelled.length}` : "",
    ``,
    `Plán dne (časově):`,
    ...reserved
      .sort((a, b) => a.slotStart.localeCompare(b.slotStart))
      .map(
        (r, i) =>
          `${i + 1}. ${r.slotLabel}\n   ${r.bike}\n   ${r.fullName} · ${r.email} · ${r.phone}${r.notes ? `\n   Pozn.: ${r.notes}` : ""}`,
      ),
    ``,
    `→ https://www.100dola.com/admin/isaac-test`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const tableRows = reserved
    .sort((a, b) => a.slotStart.localeCompare(b.slotStart))
    .map(
      (r) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #F0F2FA; font-weight: 700; white-space: nowrap;">${escapeHtml(r.slotLabel)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #F0F2FA;">${escapeHtml(r.bike)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #F0F2FA;">
          ${escapeHtml(r.fullName)}<br/>
          <span style="font-size: 11px; color: #9AA3C2;">${escapeHtml(r.email)} · ${escapeHtml(r.phone)}</span>
          ${r.notes ? `<br/><span style="font-size: 11px; color: #E8A020;">Pozn.: ${escapeHtml(r.notes)}</span>` : ""}
        </td>
      </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #3B7CF4; font-weight: 700;">ISAAC test — denní plán</div>
      <h1 style="margin: 4px 0 16px 0; font-size: 24px;">${escapeHtml(p.dateLabel)}</h1>
      <p style="font-size: 14px; color: #5A6480;">
        <strong>${reserved.length}</strong> rezervací z ${p.totalSlots} slotů
        ${cancelled.length > 0 ? ` · <strong style="color: #9AA3C2;">${cancelled.length} zrušených</strong>` : ""}
      </p>

      ${
        reserved.length === 0
          ? '<p style="padding: 14px; background: #F0F4FF; border-radius: 12px; font-size: 14px; color: #5A6480;">Žádné rezervace na dnešek.</p>'
          : `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 12px;">
              <thead>
                <tr style="background: #F7F9FF;">
                  <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9AA3C2;">Čas</th>
                  <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9AA3C2;">Kolo</th>
                  <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #9AA3C2;">Klient</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>`
      }

      <p style="margin-top: 24px; font-size: 13px;">
        <a href="https://www.100dola.com/admin/isaac-test" style="color: #3B7CF4; font-weight: 700;">→ Otevřít admin (změny, walk-in, stornování)</a>
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({ from: FROM_EMAIL, to: NOTIFY_EMAIL, subject, text, html });
  } catch (e) {
    console.error("[email] sendIsaacDailySummary failed:", e);
  }
}

interface EventReportRow {
  date: string;
  reserved: number;
  completed: number;
  no_show: number;
  cancelled: number;
}

/** Souhrnný report po skončení akce (1. den po skončení). */
export async function sendIsaacEventReport(p: {
  totalReservations: number;
  totalCompleted: number;
  totalNoShow: number;
  totalCancelled: number;
  byDay: EventReportRow[];
  topBikes: Array<{ bike: string; count: number }>;
  newsletterOptIns: number;
  uniqueEmails: number;
}): Promise<void> {
  if (!isEmailConfigured()) return;
  const subject = `📊 ISAAC víkend — souhrn (${p.totalReservations} rezervací)`;

  const text = [
    `ISAAC víkend Závodu Míru — souhrn`,
    ``,
    `Celkem: ${p.totalReservations} rezervací`,
    `Dokončeno: ${p.totalCompleted}`,
    `No-show:  ${p.totalNoShow}`,
    `Zrušeno:  ${p.totalCancelled}`,
    `Unikátní e-maily: ${p.uniqueEmails}`,
    `Newsletter opt-in: ${p.newsletterOptIns}`,
    ``,
    `Po dnech:`,
    ...p.byDay.map(
      (d) =>
        `${d.date}: ${d.reserved + d.completed + d.no_show} rezervací (${d.completed} dokončeno, ${d.no_show} no-show, ${d.cancelled} zrušeno)`,
    ),
    ``,
    `Top kola:`,
    ...p.topBikes.map((b, i) => `${i + 1}. ${b.bike} — ${b.count}×`),
    ``,
    `→ https://www.100dola.com/admin/isaac-test`,
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <div style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #2EAA6E; font-weight: 700;">ISAAC víkend — souhrn</div>
      <h1 style="margin: 4px 0 16px 0; font-size: 22px;">Co máš za sebou</h1>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div style="background: #F0F4FF; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #9AA3C2; text-transform: uppercase;">Celkem</div>
          <div style="font-size: 28px; font-weight: 900;">${p.totalReservations}</div>
        </div>
        <div style="background: #EDFAF3; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #9AA3C2; text-transform: uppercase;">Dokončeno</div>
          <div style="font-size: 28px; font-weight: 900; color: #2EAA6E;">${p.totalCompleted}</div>
        </div>
        <div style="background: #FFF8E7; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #9AA3C2; text-transform: uppercase;">No-show</div>
          <div style="font-size: 28px; font-weight: 900; color: #E8A020;">${p.totalNoShow}</div>
        </div>
        <div style="background: #FCEFEA; border-radius: 12px; padding: 14px;">
          <div style="font-size: 11px; color: #9AA3C2; text-transform: uppercase;">Zrušeno</div>
          <div style="font-size: 28px; font-weight: 900; color: #E8431A;">${p.totalCancelled}</div>
        </div>
      </div>

      <h2 style="font-size: 14px; margin: 24px 0 8px;">Newsletter & leads</h2>
      <p style="font-size: 13px; color: #5A6480;">
        <strong>${p.uniqueEmails}</strong> unikátních e-mailů ·
        <strong>${p.newsletterOptIns}</strong> opt-in newsletter
      </p>

      <h2 style="font-size: 14px; margin: 24px 0 8px;">Top kola</h2>
      <ol style="font-size: 13px; color: #5A6480; line-height: 1.8; padding-left: 20px;">
        ${p.topBikes.map((b) => `<li><strong>${escapeHtml(b.bike)}</strong> — ${b.count}×</li>`).join("")}
      </ol>

      <h2 style="font-size: 14px; margin: 24px 0 8px;">Po dnech</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead><tr style="background: #F7F9FF;"><th style="padding: 8px; text-align: left;">Den</th><th>Rez.</th><th>Done</th><th>NoShow</th><th>Storno</th></tr></thead>
        <tbody>
          ${p.byDay
            .map(
              (d) => `<tr style="border-top: 1px solid #F0F2FA;">
                <td style="padding: 8px;">${escapeHtml(d.date)}</td>
                <td style="padding: 8px; text-align: center;">${d.reserved + d.completed + d.no_show}</td>
                <td style="padding: 8px; text-align: center; color: #2EAA6E;">${d.completed}</td>
                <td style="padding: 8px; text-align: center; color: #E8A020;">${d.no_show}</td>
                <td style="padding: 8px; text-align: center; color: #9AA3C2;">${d.cancelled}</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>

      <p style="margin-top: 24px; font-size: 13px;">
        <a href="https://www.100dola.com/admin/isaac-test" style="color: #3B7CF4; font-weight: 700;">→ Otevřít admin</a>
      </p>
    </div>
  `;

  try {
    await getResend().emails.send({ from: FROM_EMAIL, to: NOTIFY_EMAIL, subject, text, html });
  } catch (e) {
    console.error("[email] sendIsaacEventReport failed:", e);
  }
}

// ── Předobjednávky (Scott Spark RC 2027 a další modely) ─────────────────────────

export interface PreorderEmailPayload {
  modelSlug: string;
  modelLabel: string;
  fullName: string;
  email: string;
  phone: string;
  variantInterest?: string;
  sizeInterest?: string;
  notes?: string;
  subscribeNewsletter: boolean;
}

export async function sendPreorderNotification(p: PreorderEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `🚲 Nová předobjednávka — ${p.modelLabel} — ${p.fullName}`;
  const lines = [
    `Nová předobjednávka přes web 100dola.com`,
    ``,
    `Model:    ${p.modelLabel} (slug: ${p.modelSlug})`,
    `Klient:   ${p.fullName}`,
    `E-mail:   ${p.email}`,
    `Telefon:  ${p.phone}`,
  ];
  if (p.variantInterest) lines.push(`Varianta: ${p.variantInterest}`);
  if (p.sizeInterest) lines.push(`Velikost: ${p.sizeInterest}`);
  if (p.notes) {
    lines.push("", "Poznámka:", p.notes);
  }
  lines.push("");
  if (p.subscribeNewsletter) lines.push("✓ Klient chce dostávat novinky 100dola sport");
  lines.push("", "→ Ozvi se osobně, projdi spolu modelovou řadu, velikost a termín.");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: p.email,
      subject,
      text: lines.join("\n"),
    });
  } catch (e) {
    console.error("[email] sendPreorderNotification failed:", e);
  }
}

export async function sendPreorderConfirmation(p: PreorderEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const subject = `Předobjednávka ${p.modelLabel} přijata · 100dola`;
  const text = [
    `Ahoj ${p.fullName.split(" ")[0]},`,
    ``,
    `dík za předobjednávku ${p.modelLabel}.`,
    ``,
    `Jan Piecha z týmu 100dola sport se ti ozve osobně — projdeme spolu modelovou řadu,`,
    `dostupné varianty, velikost a termín dodání. Vše osobně, žádné`,
    `automatické sliby termínů.`,
    ``,
    `Co jsi nám poslal/a:`,
    `Model:   ${p.modelLabel}`,
    p.variantInterest ? `Varianta: ${p.variantInterest}` : null,
    p.sizeInterest ? `Velikost: ${p.sizeInterest}` : null,
    p.notes ? `\nPoznámka:\n${p.notes}` : null,
    ``,
    `Pokud potřebuješ rychlejší odpověď, volej Janu Piechovi na +420 739 045 057.`,
    ``,
    `S díky,`,
    `100dola sport`,
    `https://www.100dola.com`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: p.email,
      replyTo: NOTIFY_EMAIL,
      subject,
      text,
    });
  } catch (e) {
    console.error("[email] sendPreorderConfirmation failed:", e);
  }
}
