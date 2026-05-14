// Fakturoid API v3 client — OAuth 2 Client Credentials Flow.
// Docs: https://www.fakturoid.cz/api/v3
//
// Použití pouze server-side (RESEND_API_KEY-like security).
//
// Token caching: in-memory (cold-start Vercel funkce = nový token, OK pro low traffic).
// Pro produkční vysoký traffic: cachovat do Supabase nebo Vercel KV.

import "server-only";

const SLUG = process.env.FAKTUROID_SLUG;
const CLIENT_ID = process.env.FAKTUROID_CLIENT_ID;
const CLIENT_SECRET = process.env.FAKTUROID_CLIENT_SECRET;

const BASE_URL = "https://app.fakturoid.cz/api/v3";
const USER_AGENT = "100dola-web/1.0 (info@100dola.com)";

export function isFakturoidConfigured(): boolean {
  return Boolean(SLUG && CLIENT_ID && CLIENT_SECRET);
}

// ─── OAuth token cache ───────────────────────────────────────────────────────

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}
let cached: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Fakturoid env vars chybí (CLIENT_ID / CLIENT_SECRET)");
  }
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fakturoid OAuth failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  cached = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cached.token;
}

// ─── Low-level request helper ────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  if (!SLUG) throw new Error("FAKTUROID_SLUG není nastaven");
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/accounts/${SLUG}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fakturoid ${method} ${path} failed (${res.status}): ${text}`);
  }
  // 204 No Content
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

// ─── Subjects (customers) ────────────────────────────────────────────────────

export interface FakturoidSubject {
  id: number;
  custom_id: string | null;
  name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  registration_no: string | null; // IČO
  vat_no: string | null; // DIČ
  type: "customer" | "supplier" | "both";
  html_url: string;
}

export interface SubjectInput {
  customId?: string;
  name: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
  registrationNo?: string; // IČO
  vatNo?: string; // DIČ
  type?: "customer";
}

/** Najít subjekt podle custom_id (= náš email-hash). */
export async function findSubjectByCustomId(customId: string): Promise<FakturoidSubject | null> {
  const params = new URLSearchParams({ custom_id: customId });
  const list = await request<FakturoidSubject[]>("GET", `/subjects.json?${params}`);
  return list[0] || null;
}

export async function createSubject(input: SubjectInput): Promise<FakturoidSubject> {
  const payload = {
    subject: {
      custom_id: input.customId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      street: input.street,
      city: input.city,
      zip: input.zip,
      country: input.country || "CZ",
      registration_no: input.registrationNo,
      vat_no: input.vatNo,
      type: input.type || "customer",
    },
  };
  return request<FakturoidSubject>("POST", "/subjects.json", payload);
}

export async function findOrCreateSubject(input: SubjectInput): Promise<FakturoidSubject> {
  if (input.customId) {
    const existing = await findSubjectByCustomId(input.customId);
    if (existing) return existing;
  }
  return createSubject(input);
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface InvoiceLine {
  name: string;
  quantity: number;
  unit_name?: string;
  unit_price: string; // s DPH per kus, jako string s 2 desetinami
  vat_rate: number; // 21 / 12 / 0
}

export interface FakturoidInvoice {
  id: number;
  number: string;
  variable_symbol: string;
  status: "open" | "sent" | "overdue" | "paid" | "cancelled" | "uncollectible";
  subtotal: string;
  total: string;
  issued_on: string;
  due_on: string;
  paid_on: string | null;
  pdf_url: string;
  html_url: string;
  public_html_url: string;
  tags: string[];
}

export interface CreateInvoiceInput {
  subjectId: number;
  /** Variable symbol — typicky náš order ID. */
  variableSymbol: string;
  lines: InvoiceLine[];
  /** Projekt pro tagování (sport / lab / malaga / omc). */
  project: "sport" | "lab" | "malaga" | "omc";
  /** Volitelné — pokud chceš override. */
  note?: string;
  /** Default true: Fakturoid si vyšle PDF klientovi na jeho email. */
  sendEmail?: boolean;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<FakturoidInvoice> {
  const payload = {
    invoice: {
      subject_id: input.subjectId,
      variable_symbol: input.variableSymbol,
      lines: input.lines,
      tags: [`100dola-${input.project}`],
      note: input.note,
    },
  };
  const invoice = await request<FakturoidInvoice>("POST", "/invoices.json", payload);

  // Auto-send PDF klientovi pokud nastaveno
  if (input.sendEmail !== false) {
    try {
      await request("POST", `/invoices/${invoice.id}/message.json`, {
        message: { event: "deliver" },
      });
    } catch (e) {
      console.warn("[fakturoid] auto-send email failed:", e);
    }
  }

  return invoice;
}

export async function getInvoice(id: number): Promise<FakturoidInvoice> {
  return request<FakturoidInvoice>("GET", `/invoices/${id}.json`);
}

/** Označit fakturu jako zaplacenou. */
export async function markInvoicePaid(id: number, paidOn?: string): Promise<FakturoidInvoice> {
  return request<FakturoidInvoice>("POST", `/invoices/${id}/pay.json`, {
    paid_at: paidOn,
  });
}

// ─── Invoice listing s pagination ────────────────────────────────────────────

export interface ListInvoicesOptions {
  /** Filtr podle tagu (např. "100dola-sport"). */
  tag?: string;
  /** Filtr od data (inclusive). Formát YYYY-MM-DD. */
  since?: string;
  /** Filtr do data (inclusive). */
  until?: string;
  /** Stránka (1-based). */
  page?: number;
  /** Max stránek k tažení (default 20, ~400 faktur). */
  maxPages?: number;
  /** Status filter (např. "paid"). */
  status?: "open" | "sent" | "overdue" | "paid" | "cancelled" | "uncollectible";
}

/**
 * Seznam všech faktur podle filtru. Auto-paginates do `maxPages`.
 * Pro full sync můžeš zvýšit maxPages.
 */
export async function listInvoices(opts: ListInvoicesOptions = {}): Promise<FakturoidInvoice[]> {
  const maxPages = opts.maxPages || 20;
  const all: FakturoidInvoice[] = [];

  for (let page = opts.page || 1; page <= maxPages; page++) {
    const params = new URLSearchParams();
    if (opts.tag) params.set("tags", opts.tag);
    if (opts.since) params.set("since", opts.since);
    if (opts.until) params.set("until", opts.until);
    if (opts.status) params.set("status", opts.status);
    params.set("page", String(page));

    const batch = await request<FakturoidInvoice[]>("GET", `/invoices.json?${params}`);
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 20) break; // last page (default per_page=20)
  }

  return all;
}
