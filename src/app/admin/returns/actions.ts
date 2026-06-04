"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/admin-auth";

function sb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function approveReturnAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/returns");
  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("returns").update({
    status: "approved",
    approved_at: new Date().toISOString(),
    approved_by: ctx.email,
  }).eq("id", id);
  revalidatePath("/admin/returns", "page");
  redirect(`/admin/returns/${id}`);
}

export async function markReceivedAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/returns");
  const id = String(fd.get("id") ?? "");
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("returns").update({
    status: "received",
    received_at: new Date().toISOString(),
  }).eq("id", id);
  revalidatePath("/admin/returns", "page");
  redirect(`/admin/returns/${id}`);
}

export async function markRefundedAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/returns");
  const id = String(fd.get("id") ?? "");
  const refundAmount = parseFloat(String(fd.get("refund_amount") ?? "0"));
  const refundMethod = String(fd.get("refund_method") ?? "bank_transfer");
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("returns").update({
    status: "refunded",
    refunded_at: new Date().toISOString(),
    refund_amount: refundAmount > 0 ? refundAmount : null,
    refund_method: refundMethod || null,
  }).eq("id", id);
  revalidatePath("/admin/returns", "page");
  redirect(`/admin/returns/${id}`);
}

export async function rejectReturnAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/returns");
  const id = String(fd.get("id") ?? "");
  const reason = String(fd.get("rejected_reason") ?? "");
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("returns").update({
    status: "rejected",
    rejected_reason: reason || null,
  }).eq("id", id);
  revalidatePath("/admin/returns", "page");
  redirect("/admin/returns");
}

export async function saveReturnNoteAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/returns");
  const id = String(fd.get("id") ?? "");
  const note = String(fd.get("admin_note") ?? "");
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("returns").update({ admin_note: note || null }).eq("id", id);
  revalidatePath("/admin/returns", "page");
  redirect(`/admin/returns/${id}?saved=1`);
}
