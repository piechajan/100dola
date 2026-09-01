import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdminContext, logAdminAction } from "@/lib/admin-auth";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const PatchSchema = z.object({
  status: z
    .enum(["new", "processing", "offer_sent", "paid", "pending", "cancelled"])
    .optional(),
  adminNote: z.string().max(2000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminContext();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) patch.status = parsed.data.status;
  if (parsed.data.adminNote !== undefined) patch.admin_note = parsed.data.adminNote.trim() || null;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nic k uložení" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
  }

  const sb = getSupabase();
  const { error } = await sb.from("event_signups").update(patch).eq("id", id);
  if (error) {
    console.error("[admin/event-signups] update failed:", error);
    return NextResponse.json({ error: "Nepodařilo se uložit." }, { status: 500 });
  }

  await logAdminAction(admin, {
    action: "event_signup_update",
    resource_type: "event_signup",
    resource_id: id,
    metadata: patch,
  });

  revalidatePath("/admin/prihlasky", "page");
  return NextResponse.json({ ok: true });
}
