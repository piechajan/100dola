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
  await client.from("contact_messages").update({ status, ...extra }).eq("id", id);
}

export async function markRepliedAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/messages");
  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");
  await setStatus(id, "replied", ctx.email, {
    replied_at: new Date().toISOString(),
    replied_by: ctx.email,
  });
  revalidatePath("/admin/messages");
  redirect(`/admin/messages/${id}`);
}

export async function markSpamAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/messages");
  const id = String(fd.get("id") ?? "");
  await setStatus(id, "spam", ctx.email);
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}

export async function archiveAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/messages");
  const id = String(fd.get("id") ?? "");
  await setStatus(id, "archived", ctx.email);
  revalidatePath("/admin/messages");
  redirect("/admin/messages");
}
