"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin-auth";
import {
  upsertCampaign,
  deleteCampaign,
  testSendCampaign,
  type CampaignInput,
} from "@/lib/newsletter";

function parseInput(fd: FormData): CampaignInput {
  return {
    subject: String(fd.get("subject") ?? "").trim(),
    preheader: nullable(fd.get("preheader")),
    body_html: String(fd.get("body_html") ?? ""),
    body_md: nullable(fd.get("body_md")),
  };
}

function nullable(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function saveCampaignAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = (fd.get("id") as string | null) || undefined;
  const input = parseInput(fd);
  if (!input.subject) throw new Error("Předmět je povinný");
  if (!input.body_html.trim()) throw new Error("Tělo je povinné");

  const result = await upsertCampaign(input, ctx.email, id);
  if (!result.ok) throw new Error(result.error);

  revalidatePath("/admin/newsletter");
  redirect(`/admin/newsletter/${result.id}?saved=1`);
}

export async function deleteCampaignAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = String(fd.get("id") ?? "");
  if (!id) throw new Error("id chybí");

  const result = await deleteCampaign(id);
  if (!result.ok) throw new Error(result.error ?? "delete_failed");

  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter?deleted=1");
}

export async function testSendAction(fd: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/newsletter");

  const id = String(fd.get("id") ?? "");
  const recipient = String(fd.get("test_recipient") ?? "").trim() || ctx.email;
  if (!id) throw new Error("id chybí");

  const result = await testSendCampaign(id, recipient);
  if (!result.ok) throw new Error(result.error ?? "send_failed");

  redirect(`/admin/newsletter/${id}?test_sent=${encodeURIComponent(recipient)}`);
}
