/**
 * Meta Conversions API (CAPI) — server-side event tracking.
 *
 * Posílá eventy přímo z Vercel functions do Meta Graph API,
 * obchází adblockery, iOS Privacy a 3rd-party cookie restrikce.
 *
 * Důležité:
 * - PII (email, phone) se hashuje SHA-256 před odesláním (Meta requirement).
 * - event_id musí být sdílený s browser pixelem pro deduplikaci.
 * - V no-op módu (chybí env vars) tichá no-op, neházíme exception.
 */
import crypto from "crypto";

const PIXEL_ID = process.env.META_CAPI_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE; // optional

const GRAPH_VERSION = "v21.0";
const ENDPOINT = PIXEL_ID
  ? `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`
  : null;

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  country?: string;
  /** Plain client IP (Meta hashuje server-side dle dokumentace). */
  clientIp?: string;
  /** Plain User-Agent (NESMÍ se hashovat). */
  userAgent?: string;
  /** _fbp cookie hodnota (Browser ID) — pro lepší match. */
  fbp?: string;
  /** _fbc cookie nebo z fbclid query param. */
  fbc?: string;
  /** Stable external_id z DB (UUID, např. order ID) — pro deduplikaci napříč session. */
  externalId?: string;
}

export interface CapiCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  [key: string]: unknown;
}

export interface CapiEventOptions {
  eventName: string; // Purchase | Lead | CompleteRegistration | AddToCart | InitiateCheckout | ViewContent | Search | PageView
  eventId?: string; // pro deduplikaci s browser pixelem (UUID)
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData?: CapiCustomData;
  /** Default "website". */
  actionSource?: "website" | "email" | "app" | "phone_call" | "chat" | "physical_store" | "system_generated" | "other";
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizePhone(phone: string): string {
  // E.164 bez plus, bez mezer/pomlček — Meta requirement
  return phone.replace(/[^\d]/g, "");
}

function buildUserData(u: CapiUserData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (u.email) out.em = [sha256(u.email)];
  if (u.phone) out.ph = [sha256(normalizePhone(u.phone))];
  if (u.firstName) out.fn = [sha256(u.firstName)];
  if (u.lastName) out.ln = [sha256(u.lastName)];
  if (u.city) out.ct = [sha256(u.city)];
  if (u.zip) out.zp = [sha256(u.zip.replace(/\s+/g, ""))];
  if (u.country) out.country = [sha256(u.country.toLowerCase())];
  if (u.externalId) out.external_id = [sha256(u.externalId)];
  // IP a User-Agent jsou plain (Meta je hashuje sama)
  if (u.clientIp) out.client_ip_address = u.clientIp;
  if (u.userAgent) out.client_user_agent = u.userAgent;
  if (u.fbp) out.fbp = u.fbp;
  if (u.fbc) out.fbc = u.fbc;
  return out;
}

/**
 * Pošle jeden event do Meta CAPI. V no-op módu (chybí env vars) tichá no-op.
 * Failures se logují do console.error, ale neházíme exception ven —
 * tracking nesmí rozbít business flow.
 */
export async function sendMetaCapiEvent(options: CapiEventOptions): Promise<void> {
  if (!ENDPOINT || !ACCESS_TOKEN) {
    // No-op v devu pokud chybí env vars
    return;
  }

  const body: {
    data: Array<Record<string, unknown>>;
    access_token: string;
    test_event_code?: string;
  } = {
    data: [
      {
        event_name: options.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: options.eventId,
        event_source_url: options.eventSourceUrl,
        action_source: options.actionSource ?? "website",
        user_data: buildUserData(options.userData),
        custom_data: options.customData ?? {},
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  if (TEST_EVENT_CODE) {
    body.test_event_code = TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "(no body)");
      console.error("[meta-capi] non-2xx:", res.status, text.slice(0, 500));
    }
  } catch (err) {
    console.error("[meta-capi] fetch error:", err);
  }
}

/**
 * Extract client IP + User-Agent z Request headers.
 * Vercel posílá originální IP v "x-forwarded-for" (první v listu) nebo "x-real-ip".
 */
export function extractClientContext(headers: Headers): { clientIp?: string; userAgent?: string } {
  const xff = headers.get("x-forwarded-for");
  const xri = headers.get("x-real-ip");
  const ua = headers.get("user-agent") ?? undefined;
  const ip = (xff?.split(",")[0]?.trim() || xri || undefined) ?? undefined;
  return { clientIp: ip, userAgent: ua };
}

/**
 * Extract _fbp a _fbc cookies z request headers.
 */
export function extractFbCookies(headers: Headers): { fbp?: string; fbc?: string } {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return {};
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  return { fbp: cookies["_fbp"], fbc: cookies["_fbc"] };
}
