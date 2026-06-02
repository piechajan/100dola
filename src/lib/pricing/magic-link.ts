import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * HMAC-SHA256 magic link tokens pro pricing approval emaily.
 * Bez JWT lib — minimalistický HMAC + base64url.
 *
 * Token payload: `<proposalId>:<action>:<expSec>` HMAC-signed.
 * Příklad URL: /api/admin/pricing/approve?token=<base64url>
 */

const ALG = "sha256";

function getSecret(): Buffer {
  const s = process.env.PRICING_APPROVAL_SECRET;
  if (!s || s.length < 32) {
    throw new Error("PRICING_APPROVAL_SECRET missing or too short (need ≥32 chars)");
  }
  return Buffer.from(s, "utf8");
}

export type ApprovalAction = "approve" | "reject";

export interface ApprovalPayload {
  proposalId: string;
  action: ApprovalAction;
  expSec: number; // unix seconds
}

export function signApprovalToken(payload: ApprovalPayload): string {
  const body = `${payload.proposalId}:${payload.action}:${payload.expSec}`;
  const mac = createHmac(ALG, getSecret()).update(body).digest();
  const token = `${b64url(Buffer.from(body, "utf8"))}.${b64url(mac)}`;
  return token;
}

export function verifyApprovalToken(token: string): ApprovalPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  let bodyBuf: Buffer, macBuf: Buffer;
  try {
    bodyBuf = b64urlDecode(parts[0]);
    macBuf = b64urlDecode(parts[1]);
  } catch {
    return null;
  }
  const expected = createHmac(ALG, getSecret()).update(bodyBuf).digest();
  if (expected.length !== macBuf.length) return null;
  if (!timingSafeEqual(expected, macBuf)) return null;

  const body = bodyBuf.toString("utf8");
  const m = body.match(/^([0-9a-f-]{36}):(approve|reject):(\d+)$/i);
  if (!m) return null;
  const expSec = parseInt(m[3], 10);
  if (!Number.isFinite(expSec) || expSec < Math.floor(Date.now() / 1000)) {
    return null; // expired
  }
  return {
    proposalId: m[1],
    action: m[2] as ApprovalAction,
    expSec,
  };
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}
