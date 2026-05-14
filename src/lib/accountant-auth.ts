// Magic-link auth pro účetní → read-only přístup k /admin/ucto.
//
// Architektura:
//   1. Účetní zadá email → /api/auth/accountant/request
//   2. Server vygeneruje krátký token (15min) → pošle mail s linkem
//   3. Klik na link → /api/auth/accountant/callback → verify → set cookie 30 dní
//   4. /admin/ucto akceptuje buď preview_auth (full admin) NEBO accountant_auth (read-only)
//
// Allowlist: env ACCOUNTANT_EMAILS = "ucetni@example.com,partner@example.com"

import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.ACCOUNTANT_SECRET;
const ALLOWED_EMAILS = (process.env.ACCOUNTANT_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export const SESSION_COOKIE = "accountant_auth";
export const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 dní
const MAGIC_LINK_TTL_SEC = 15 * 60; // 15 minut

export function isAccountantAuthConfigured(): boolean {
  return Boolean(SECRET) && ALLOWED_EMAILS.length > 0;
}

export function isAllowedAccountantEmail(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function sign(payload: string): string {
  if (!SECRET) throw new Error("ACCOUNTANT_SECRET není nastaven");
  return b64urlEncode(createHmac("sha256", SECRET).update(payload).digest());
}

function verifySig(payload: string, signature: string): boolean {
  try {
    const expected = sign(payload);
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ── Magic link token (krátký, 15 min) ────────────────────────────────────────

export interface MagicPayload {
  email: string;
  /** Epoch seconds. */
  exp: number;
  /** Random nonce — proti replay (i když exp už chrání). */
  nonce: string;
}

export function signMagicToken(email: string): string {
  if (!SECRET) throw new Error("ACCOUNTANT_SECRET není nastaven");
  const payload: MagicPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + MAGIC_LINK_TTL_SEC,
    nonce: b64urlEncode(Buffer.from(crypto.getRandomValues(new Uint8Array(8)).buffer)),
  };
  const body = b64urlEncode(Buffer.from(JSON.stringify(payload)));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export function verifyMagicToken(token: string): MagicPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!verifySig(body, sig)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString("utf-8")) as MagicPayload;
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!isAllowedAccountantEmail(payload.email)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Session cookie (30 dní) ──────────────────────────────────────────────────

export interface SessionPayload {
  email: string;
  exp: number;
}

export function signSessionCookie(email: string): string {
  if (!SECRET) throw new Error("ACCOUNTANT_SECRET není nastaven");
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SEC,
  };
  const body = b64urlEncode(Buffer.from(JSON.stringify(payload)));
  return `${body}.${sign(body)}`;
}

export function verifySessionCookie(cookie: string | undefined): SessionPayload | null {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!verifySig(body, sig)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body).toString("utf-8")) as SessionPayload;
    if (typeof payload.email !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!isAllowedAccountantEmail(payload.email)) return null;
    return payload;
  } catch {
    return null;
  }
}
