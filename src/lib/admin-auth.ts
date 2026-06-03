import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SESSION_COOKIE = "admin_session";
const LEGACY_COOKIE = "preview_auth";
const LEGACY_VALUE = "100dola2025";
const SESSION_TTL_MS = 8 * 3600 * 1000; // 8 h
const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 min magic link

function getSb(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase env missing");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sha256Hex(s: string): string {
  return createHash("sha256").update(s, "utf-8").digest("hex");
}

function sessionSecret(): Buffer {
  const s = process.env.ADMIN_SESSION_SECRET ?? "";
  if (s.length < 32) {
    // Bezpečný fallback: stejně dlouhý pseudo-secret z domeny — nezabezpečí
    // při leaku source kódu, ale je lepší než žádný v dev prostředí.
    return Buffer.from(sha256Hex("100dola-admin-default-" + (process.env.SUPABASE_URL ?? "")));
  }
  return Buffer.from(s, "utf-8");
}

// ─── Magic link tokens ───────────────────────────────────────────────────────

export async function createLoginToken(
  email: string,
  ip: string | null,
): Promise<{ rawToken: string; expiresAt: Date } | null> {
  const sb = getSb();
  const { data: user } = await sb
    .from("admin_users")
    .select("email, is_active")
    .eq("email", email)
    .maybeSingle();
  if (!user || !user.is_active) return null;

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  const { error } = await sb.from("admin_login_tokens").insert({
    email,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
    created_ip: ip,
  });
  if (error) throw new Error(`token insert: ${error.message}`);

  return { rawToken, expiresAt };
}

export async function verifyLoginTokenAndStart(
  rawToken: string,
  userAgent: string | null,
  ip: string | null,
): Promise<{ sessionToken: string; email: string; expiresAt: Date } | null> {
  const sb = getSb();
  const tokenHash = sha256Hex(rawToken);
  const now = new Date().toISOString();

  const { data: tok } = await sb
    .from("admin_login_tokens")
    .select("id, email, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!tok || tok.used_at || tok.expires_at < now) return null;

  // Mark used
  await sb.from("admin_login_tokens").update({ used_at: now }).eq("id", tok.id);

  // Create session
  const sessionToken = randomBytes(32).toString("base64url");
  const sessionHash = sha256Hex(sessionToken);
  const sessionExp = new Date(Date.now() + SESSION_TTL_MS);

  const { error } = await sb.from("admin_sessions").insert({
    email: tok.email,
    session_token_hash: sessionHash,
    expires_at: sessionExp.toISOString(),
    user_agent: userAgent,
    ip_address: ip,
  });
  if (error) throw new Error(`session insert: ${error.message}`);

  return { sessionToken, email: tok.email, expiresAt: sessionExp };
}

// ─── Session verification ────────────────────────────────────────────────────

export interface AdminContext {
  email: string;
  role: string;
  via: "session" | "legacy";
}

/**
 * Vrátí AdminContext pokud je aktuální request přihlášený, jinak null.
 * Backward compat: stará `preview_auth=100dola2025` cookie zatím funguje
 * (via='legacy'), bude odebraná za 14 dní (2026-06-17).
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const jar = await cookies();

  // 1) Nový session token
  const sessionToken = jar.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    const sb = getSb();
    const hash = sha256Hex(sessionToken);
    const { data } = await sb
      .from("admin_sessions")
      .select("email, expires_at, revoked_at, admin_users:admin_users(role, is_active)")
      .eq("session_token_hash", hash)
      .maybeSingle();
    if (data && !data.revoked_at && data.expires_at > new Date().toISOString()) {
      const user = data.admin_users as unknown as { role: string; is_active: boolean } | null;
      if (user && user.is_active) {
        return { email: data.email, role: user.role, via: "session" };
      }
    }
  }

  // 2) Legacy cookie (deprecated)
  const legacy = jar.get(LEGACY_COOKIE)?.value;
  if (legacy === LEGACY_VALUE) {
    return { email: "legacy@100dola.local", role: "admin", via: "legacy" };
  }

  return null;
}

export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) throw new Error("unauthorized");
  return ctx;
}

// ─── Audit log helper ────────────────────────────────────────────────────────

export interface AdminAuditInput {
  action: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(
  ctx: AdminContext,
  input: AdminAuditInput,
  ip: string | null = null,
  userAgent: string | null = null,
): Promise<void> {
  try {
    const sb = getSb();
    await sb.from("admin_audit").insert({
      actor_email: ctx.via === "legacy" ? null : ctx.email,
      action: input.action,
      resource_type: input.resource_type ?? null,
      resource_id: input.resource_id ?? null,
      metadata: input.metadata ?? null,
      ip_address: ip,
      user_agent: userAgent,
    });
  } catch (e) {
    // Audit log nesmí padat workflow → jen log
    console.warn("[admin-audit]", e);
  }
}

// ─── HMAC helpers (pro budoucí token-less features) ──────────────────────────

export function signAdminPayload(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function verifyAdminPayload(payload: string, sig: string): boolean {
  const expected = Buffer.from(signAdminPayload(payload), "utf-8");
  const got = Buffer.from(sig, "utf-8");
  if (expected.length !== got.length) return false;
  return timingSafeEqual(expected, got);
}

export const COOKIE_NAMES = {
  session: SESSION_COOKIE,
  legacy: LEGACY_COOKIE,
};
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;
