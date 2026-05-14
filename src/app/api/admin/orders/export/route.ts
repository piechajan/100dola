import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/"/g, '""');
  if (/[",\n;]/.test(s)) return `"${s}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const columns = [
    "id",
    "registered_at",
    "status",
    "total",
    "subtotal",
    "shipping_fee",
    "name",
    "email",
    "phone",
    "company_name",
    "company_ico",
    "company_dic",
    "shipping_method_label",
    "street",
    "city",
    "zip",
    "zasilkovna_pickup",
    "has_bulky",
    "payment_method_label",
    "paid_at",
    "shipped_at",
    "tracking_number",
    "notes",
  ];

  let rows: Record<string, unknown>[] = [];

  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("orders")
        .select("*")
        .order("registered_at", { ascending: false });
      if (error) throw error;
      rows = data as Record<string, unknown>[];
    } catch (e) {
      console.warn("[export] Supabase failed, falling back to file:", e);
    }
  }

  if (rows.length === 0) {
    try {
      const raw = await fs.readFile(ORDERS_FILE, "utf-8");
      const all = JSON.parse(raw) as Record<string, unknown>[];
      rows = all.map((o) => ({
        id: o.id,
        registered_at: o.registeredAt,
        status: o.status,
        total: o.total,
        subtotal: o.subtotal,
        shipping_fee: o.shippingFee,
        name: (o.contact as Record<string, unknown>)?.name,
        email: (o.contact as Record<string, unknown>)?.email,
        phone: (o.contact as Record<string, unknown>)?.phone,
        company_name: (o.contact as Record<string, unknown>)?.companyName,
        company_ico: (o.contact as Record<string, unknown>)?.companyIco,
        company_dic: (o.contact as Record<string, unknown>)?.companyDic,
        shipping_method_label: (o.shipping as Record<string, unknown>)?.methodLabel,
        street: (o.shipping as Record<string, unknown>)?.street,
        city: (o.shipping as Record<string, unknown>)?.city,
        zip: (o.shipping as Record<string, unknown>)?.zip,
        zasilkovna_pickup: (o.shipping as Record<string, unknown>)?.zasilkovnaPickup,
        has_bulky: o.hasBulky,
        payment_method_label: (o.payment as Record<string, unknown>)?.methodLabel,
        paid_at: null,
        shipped_at: null,
        tracking_number: null,
        notes: o.notes,
      }));
    } catch {
      // empty
    }
  }

  const csv = [
    columns.join(","),
    ...rows.map((r) => columns.map((c) => csvEscape(r[c])).join(",")),
  ].join("\n");

  // Add UTF-8 BOM pro Excel (jinak diakritika rozbitá)
  const bom = "﻿";

  const filename = `objednavky-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(bom + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
