import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  withdrawal: "Odstoupení od smlouvy",
  warranty: "Reklamace v záruce",
  damaged: "Poškozeno v dopravě",
  other: "Jiné",
};

const STATUS_LABELS: Record<string, string> = {
  requested: "Žádost",
  approved: "Schváleno",
  received: "Přijato",
  refunded: "Vráceno",
  rejected: "Zamítnuto",
};

const REFUND_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bankovní převod",
  card_reverse: "Reverz karty",
  voucher: "Voucher",
};

interface ReturnRow {
  id: string;
  order_id: string;
  customer_email: string;
  return_type: string;
  items_description: string;
  reason: string;
  status: string;
  refund_amount: number | null;
  refund_method: string | null;
  refunded_at: string | null;
  admin_note: string | null;
  approved_at: string | null;
  approved_by: string | null;
  received_at: string | null;
  rejected_reason: string | null;
  created_at: string;
}

interface OrderRef {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  company_ico: string | null;
  company_dic: string | null;
  total: number;
  payment_method_label: string | null;
}

/** CZ format: ";" delimiter, BOM pro Excel, "," v decimal */
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value).replace(/"/g, '""');
  if (/[";\n]/.test(s)) return `"${s}"`;
  return s;
}

function fmtDateCz(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function fmtAmount(n: number | null): string {
  if (n === null || n === undefined) return "";
  return n.toFixed(2).replace(".", ",");
}

export async function GET(req: NextRequest) {
  // Stejná auth jako orders export (preview_auth cookie nebo admin magic-link cookie)
  const auth = req.cookies.get("preview_auth");
  const adminSession = req.cookies.get("admin_session");
  if (auth?.value !== "100dola2025" && !adminSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from"); // YYYY-MM-DD inclusive
  const to = searchParams.get("to"); // YYYY-MM-DD inclusive
  const statusFilter = searchParams.get("status"); // 'refunded' for accounting purposes

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "no_db" }, { status: 500 });
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  let query = sb
    .from("returns")
    .select("*")
    .neq("honeypot_caught", true)
    .order("created_at", { ascending: true });

  if (from) query = query.gte("created_at", `${from}T00:00:00Z`);
  if (to) query = query.lte("created_at", `${to}T23:59:59Z`);
  if (statusFilter) query = query.eq("status", statusFilter);

  const { data } = await query;
  const rows = (data ?? []) as ReturnRow[];

  // Fetch original orders pro contact info + total
  const orderIds = Array.from(new Set(rows.map((r) => r.order_id)));
  const orderMap = new Map<string, OrderRef>();
  if (orderIds.length > 0) {
    const { data: orders } = await sb
      .from("orders")
      .select("id, name, email, phone, company_name, company_ico, company_dic, total, payment_method_label")
      .in("id", orderIds);
    for (const o of orders ?? []) orderMap.set((o as OrderRef).id, o as OrderRef);
  }

  // Fakturoid-ready columns — dobropis evidenci přizpůsobené
  const columns = [
    "Číslo vrácení",            // returns.id (uuid prefix)
    "Datum žádosti",             // created_at
    "Datum schválení",           // approved_at
    "Datum přijetí zboží",       // received_at
    "Datum vrácení peněz",       // refunded_at
    "Typ vrácení",               // return_type label
    "Stav",                      // status label
    "Číslo původní objednávky",  // order_id
    "Zákazník — jméno",          // orders.name
    "Zákazník — e-mail",         // customer_email
    "Zákazník — telefon",        // orders.phone
    "Firma",                     // orders.company_name
    "IČO",                       // orders.company_ico
    "DIČ",                       // orders.company_dic
    "Původní cena objednávky",   // orders.total (formatted CZ)
    "Vrácená částka",            // refund_amount (formatted CZ)
    "Způsob vrácení",            // refund_method label
    "Původní platba",            // orders.payment_method_label
    "Co bylo vráceno",           // items_description
    "Důvod zákazníka",           // reason
    "Důvod zamítnutí",           // rejected_reason
    "Interní poznámka",          // admin_note
  ];

  const lines: string[] = [];
  lines.push(columns.map(csvEscape).join(";"));

  for (const r of rows) {
    const o = orderMap.get(r.order_id);
    const idShort = r.id.slice(0, 8).toUpperCase();
    const cols = [
      idShort,
      fmtDateCz(r.created_at),
      fmtDateCz(r.approved_at),
      fmtDateCz(r.received_at),
      fmtDateCz(r.refunded_at),
      TYPE_LABELS[r.return_type] ?? r.return_type,
      STATUS_LABELS[r.status] ?? r.status,
      r.order_id,
      o?.name ?? "",
      r.customer_email,
      o?.phone ?? "",
      o?.company_name ?? "",
      o?.company_ico ?? "",
      o?.company_dic ?? "",
      o ? fmtAmount(o.total) : "",
      fmtAmount(r.refund_amount),
      r.refund_method ? REFUND_METHOD_LABELS[r.refund_method] ?? r.refund_method : "",
      o?.payment_method_label ?? "",
      r.items_description,
      r.reason,
      r.rejected_reason ?? "",
      r.admin_note ?? "",
    ];
    lines.push(cols.map(csvEscape).join(";"));
  }

  // BOM pro Excel CZ + Pohoda kompatibilita
  const csv = "﻿" + lines.join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
  const filename = `vraceni-${today}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
