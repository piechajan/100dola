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

async function setStatus(id: string, status: string, ctxEmail: string, extra: Record<string, unknown> = {}) {
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("service_bookings").update({ status, ...extra }).eq("id", id);
}

export async function confirmBookingAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/bookings");
  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");
  await setStatus(id, "confirmed", ctx.email, {
    confirmed_at: new Date().toISOString(),
    confirmed_by: ctx.email,
  });
  revalidatePath("/admin/bookings", "page");
  redirect(`/admin/bookings/${id}`);
}

export async function completeBookingAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/bookings");
  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");
  await setStatus(id, "completed", ctx.email, {
    completed_at: new Date().toISOString(),
  });
  revalidatePath("/admin/bookings", "page");
  redirect(`/admin/bookings/${id}`);
}

export async function cancelBookingAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/bookings");
  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");
  await setStatus(id, "cancelled", ctx.email);
  revalidatePath("/admin/bookings", "page");
  redirect("/admin/bookings");
}

export async function saveNoteAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/bookings");
  const id = String(fd.get("id") ?? "");
  const note = String(fd.get("admin_note") ?? "");
  const client = sb();
  if (!client) throw new Error("no_db");
  await client.from("service_bookings").update({ admin_note: note || null }).eq("id", id);
  revalidatePath("/admin/bookings", "page");
  redirect(`/admin/bookings/${id}?saved=1`);
}
