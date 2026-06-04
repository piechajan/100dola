/**
 * Newsletter subscribers — wraps existing newsletter_subscribers table
 * (migrace 002 + 009 + 033 extend) s GDPR double opt-in pipeline.
 *
 * Schema:
 *   email, consent, confirmed, confirmation_token, unsubscribe_token,
 *   unsubscribed_at, source ('community'|'shop'|'malaga'|'lab'),
 *   name, send_count, open_count, ip_address, user_agent, …
 *
 * Flow:
 *   1. POST /api/newsletter/subscribe → insert pending + confirm mail
 *   2. /api/newsletter/confirm?token=… (existing) → confirmed=true
 *   3. /admin/newsletter/[id] Send-to-all → fetch confirmed → Resend batch
 *   4. /api/unsubscribe?token=… → unsubscribed_at = now
 */

import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Náhodný token (32 znaků hex) — confirm i unsub */
export function randomToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

export interface SubscriberInput {
  email: string;
  name?: string | null;
  source: "community" | "shop" | "malaga" | "lab";
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface SubscribeResult {
  ok: boolean;
  alreadyConfirmed?: boolean;
  alreadyPending?: boolean;
  resubscribed?: boolean;
  confirmationToken?: string;
  unsubscribeToken?: string;
  error?: string;
}

export async function upsertSubscriber(input: SubscriberInput): Promise<SubscribeResult> {
  const client = sb();
  if (!client) return { ok: false, error: "no_db" };

  const email = input.email.toLowerCase().trim();

  const { data: existing } = await client
    .from("newsletter_subscribers")
    .select("id, confirmed, unsubscribed_at, confirmation_token, unsubscribe_token")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    const e = existing as {
      id: string;
      confirmed: boolean;
      unsubscribed_at: string | null;
      confirmation_token: string | null;
      unsubscribe_token: string | null;
    };
    if (e.confirmed && !e.unsubscribed_at) {
      return { ok: true, alreadyConfirmed: true };
    }
    if (!e.confirmed && !e.unsubscribed_at) {
      return {
        ok: true,
        alreadyPending: true,
        confirmationToken: e.confirmation_token ?? undefined,
        unsubscribeToken: e.unsubscribe_token ?? undefined,
      };
    }
    if (e.unsubscribed_at) {
      // Resubscribe — reset
      const newConfirm = randomToken();
      const newUnsub = randomToken();
      await client
        .from("newsletter_subscribers")
        .update({
          confirmed: false,
          confirmed_at: null,
          confirmation_token: newConfirm,
          unsubscribe_token: newUnsub,
          unsubscribed_at: null,
          source: input.source,
          name: input.name ?? null,
          ip_address: input.ipAddress ?? null,
          user_agent: input.userAgent ?? null,
        })
        .eq("id", e.id);
      return {
        ok: true,
        resubscribed: true,
        confirmationToken: newConfirm,
        unsubscribeToken: newUnsub,
      };
    }
  }

  const newConfirm = randomToken();
  const newUnsub = randomToken();
  const { error } = await client.from("newsletter_subscribers").insert({
    email,
    name: input.name ?? null,
    source: input.source,
    consent: true,
    confirmation_token: newConfirm,
    unsubscribe_token: newUnsub,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
  });
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    confirmationToken: newConfirm,
    unsubscribeToken: newUnsub,
  };
}

/** Vrátí všechny confirmed subscribery — pro send-to-all kampaň */
export async function listConfirmedSubscribers(): Promise<
  Array<{ id: string; email: string; name: string | null; unsubscribe_token: string }>
> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("newsletter_subscribers")
    .select("id, email, name, unsubscribe_token")
    .eq("confirmed", true)
    .is("unsubscribed_at", null)
    .order("registered_at", { ascending: true });
  return (data ?? []) as Array<{
    id: string;
    email: string;
    name: string | null;
    unsubscribe_token: string;
  }>;
}

export async function countConfirmedSubscribers(): Promise<number> {
  const client = sb();
  if (!client) return 0;
  const { count } = await client
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("confirmed", true)
    .is("unsubscribed_at", null);
  return count ?? 0;
}
