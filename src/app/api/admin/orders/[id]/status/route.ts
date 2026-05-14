import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "cancelled"]),
  trackingNumber: z.string().max(80).trim().optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = StatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "paid") patch.paid_at = now;
  if (parsed.data.status === "shipped") {
    patch.shipped_at = now;
    if (parsed.data.trackingNumber) patch.tracking_number = parsed.data.trackingNumber;
  }

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error } = await sb.from("orders").update(patch).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true, id, ...patch });
    } catch (e) {
      console.warn("[admin/orders/status] DB failed, fallback to file:", e);
    }
  }

  // File fallback
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    const all = JSON.parse(raw) as Record<string, unknown>[];
    const idx = all.findIndex((o) => o.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    all[idx] = { ...all[idx], ...patch };
    await fs.writeFile(ORDERS_FILE, JSON.stringify(all, null, 2), "utf-8");
    return NextResponse.json({ ok: true, id, ...patch });
  } catch {
    return NextResponse.json({ error: "Storage error" }, { status: 500 });
  }
}
