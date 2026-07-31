import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { getAdminContext } from "@/lib/admin-auth";
import { sendReviewRequest } from "@/lib/email";

/**
 * Admin test — pošle hodnoticí („ohodnoť nákup") e-mail OKAMŽITĚ pro danou
 * objednávku, bez +7denního plánování. Slouží k auditu review flow
 * („simulace uběhnutého týdne"). Jinak identické s ostrým follow-upem.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "no_db" }, { status: 503 });
  }

  const { id } = await ctx.params;
  try {
    const sb = getSupabase();
    const { data: order } = await sb
      .from("orders")
      .select("id, name, email")
      .eq("id", id)
      .maybeSingle();
    if (!order || !order.email) {
      return NextResponse.json({ error: "order_not_found" }, { status: 404 });
    }
    const { data: items } = await sb
      .from("order_items")
      .select("slug, name")
      .eq("order_id", id);

    await sendReviewRequest({
      id: order.id,
      name: order.name ?? "",
      email: order.email,
      items: (items ?? []).map((i) => ({ slug: i.slug as string, name: i.name as string })),
      immediate: true,
    });

    return NextResponse.json({ ok: true, sentTo: order.email });
  } catch (e) {
    console.error("[admin/orders/send-review-test] failed:", e);
    return NextResponse.json({ error: "send_failed" }, { status: 500 });
  }
}
