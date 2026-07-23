"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getAdminContext } from "@/lib/admin-auth";

async function requireAdmin() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/reviews");
}

function sb() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function moderateReview(
  reviewId: string,
  status: "approved" | "rejected" | "spam",
  productSlug: string,
): Promise<void> {
  await requireAdmin();
  const client = sb();
  await client
    .from("product_reviews")
    .update({
      status,
      moderated_at: new Date().toISOString(),
      moderated_by: "admin",
    })
    .eq("id", reviewId);
  // Trigger automaticky updatuje aggregate
  revalidatePath("/admin/reviews");
  revalidatePath(`/shop/${productSlug}`);
}
