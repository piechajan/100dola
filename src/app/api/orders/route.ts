import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { OrderPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import {
  calcOrderTotal,
  isPaymentAvailable,
  isShippingAvailable,
  SHIPPING_LABELS,
  PAYMENT_LABELS,
} from "@/lib/orders";
import { buildOrderId, buildSpaydQrDataUrl, FUTUNATU_IBAN } from "@/lib/spayd";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/email";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { validateDiscountCode, incrementDiscountUsage } from "@/lib/discounts";
import { invoiceOrder, type OrderForInvoice } from "@/lib/invoicing";

function isHoneypotFilled(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const v = (body as Record<string, unknown>)[HONEYPOT_NAME];
  return typeof v === "string" && v.length > 0;
}

const DATA_DIR = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

interface OrderRecord {
  id: string;
  registeredAt: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  status: "pending" | "paid" | "shipped" | "cancelled";
  // Snapshot from payload + computed
  [k: string]: unknown;
}

async function readOrders(): Promise<OrderRecord[]> {
  try {
    const raw = await fs.readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function appendOrder(record: OrderRecord): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const all = await readOrders();
  all.push(record);
  await fs.writeFile(ORDERS_FILE, JSON.stringify(all, null, 2), "utf-8");
}

function todayPrefix(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/** Spočítá sequenční ID pro daný den (od 1 nahoru) — z DB pokud je konfigurován, jinak z file. */
async function nextDailySeq(date: Date): Promise<number> {
  const prefix = todayPrefix(date);
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { count } = await sb
        .from("orders")
        .select("*", { count: "exact", head: true })
        .like("id", `${prefix}%`);
      return (count ?? 0) + 1;
    } catch (e) {
      console.warn("[api/orders] nextDailySeq DB failed, falling back to file:", e);
    }
  }
  const all = await readOrders();
  const todayOrders = all.filter((o) => o.id.startsWith(prefix));
  return todayOrders.length + 1;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (isHoneypotFilled(body)) {
    console.warn("[api/orders] honeypot triggered — silently dropping");
    return NextResponse.json({ ok: true });
  }

  const parsed = OrderPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Validace: platba musí odpovídat dopravě (hotovost jen pro osobní)
  if (!isPaymentAvailable(data.paymentMethod, data.shippingMethod)) {
    return NextResponse.json(
      { error: "Platba není kompatibilní s vybranou dopravou." },
      { status: 400 },
    );
  }

  // Validace: Zásilkovna nepodporuje velké balíky
  const hasBulkyInItems = data.items.some(
    (i) => i.bulky === true || (i.bulky === undefined && i.priceWithVat >= 5000),
  );
  if (!isShippingAvailable(data.shippingMethod, hasBulkyInItems)) {
    return NextResponse.json(
      { error: "Zásilkovna nepodporuje velké balíky (kolo, lyže). Vyber osobní vyzvednutí nebo GLS." },
      { status: 400 },
    );
  }

  // Discount validace (server-side znovu, aby klient nepodvedl ceny)
  let discountAmount = 0;
  let discountCode: string | undefined;
  if (data.discountCode) {
    const subtotalCheck = data.items.reduce((s, i) => s + i.priceWithVat * i.qty, 0);
    const v = await validateDiscountCode(data.discountCode, { subtotal: subtotalCheck });
    if (v.ok) {
      discountAmount = v.discount.amount;
      discountCode = v.discount.code;
    } else {
      return NextResponse.json(
        { error: `Slevový kód: ${v.error}` },
        { status: 400 },
      );
    }
  }

  const { subtotal, shippingFee, discount, total, hasBulky } = calcOrderTotal(
    data.items,
    data.shippingMethod,
    discountAmount,
  );

  // Order ID
  const now = new Date();
  const seq = await nextDailySeq(now);
  const id = buildOrderId(now, seq);
  const registeredAt = data.registeredAt || now.toISOString();

  // Build order record
  const record: OrderRecord = {
    id,
    registeredAt,
    status: "pending",
    subtotal,
    shippingFee,
    total,
    hasBulky,
    items: data.items,
    contact: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      companyIco: data.companyIco,
      companyDic: data.companyDic,
    },
    shipping: {
      method: data.shippingMethod,
      methodLabel: SHIPPING_LABELS[data.shippingMethod],
      street: data.street,
      city: data.city,
      zip: data.zip,
      zasilkovnaPickup: data.zasilkovnaPickup,
    },
    payment: {
      method: data.paymentMethod,
      methodLabel: PAYMENT_LABELS[data.paymentMethod],
    },
    notes: data.notes,
  };

  // Persist — Supabase preferred, file fallback
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      const { error: orderErr } = await sb.from("orders").insert({
        id,
        status: "pending",
        subtotal,
        shipping_fee: shippingFee,
        total,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company_name: data.companyName || null,
        company_ico: data.companyIco || null,
        company_dic: data.companyDic || null,
        shipping_method: data.shippingMethod,
        shipping_method_label: SHIPPING_LABELS[data.shippingMethod],
        street: data.street || null,
        city: data.city || null,
        zip: data.zip || null,
        zasilkovna_pickup: data.zasilkovnaPickup || null,
        has_bulky: hasBulky,
        payment_method: data.paymentMethod,
        payment_method_label: PAYMENT_LABELS[data.paymentMethod],
        discount_code: discountCode || null,
        discount_amount: discount,
        notes: data.notes || null,
        registered_at: registeredAt,
      });
      if (orderErr) throw orderErr;

      const { error: itemsErr } = await sb.from("order_items").insert(
        data.items.map((i) => ({
          order_id: id,
          product_id: i.productId,
          slug: i.slug,
          name: i.name,
          price_with_vat: i.priceWithVat,
          vat_rate: i.vatRate,
          qty: i.qty,
          bulky: i.bulky ?? false,
        })),
      );
      if (itemsErr) throw itemsErr;

      if (discountCode) {
        await incrementDiscountUsage(discountCode);
      }
    } catch (e) {
      console.error("[api/orders] DB persist failed, fallback to file:", e);
      await appendOrder(record);
    }
  } else {
    await appendOrder(record);
  }

  // QR code (pro QR a bank-transfer obě)
  let qrDataUrl: string | undefined;
  if (data.paymentMethod === "qr" || data.paymentMethod === "bank-transfer") {
    try {
      qrDataUrl = await buildSpaydQrDataUrl({
        amount: total,
        vs: id,
        recipientName: "FUTUNATU s.r.o.",
        message: `100dola objednavka ${id}`,
      });
    } catch (e) {
      console.error("[api/orders] QR generation failed:", e);
    }
  }

  // Auto-vytvoření faktury ve Fakturoidu (fire-and-forget).
  // Faktura má variable_symbol = order.id → Fakturoid bank sync (FIO) ji při
  // přijaté platbě automaticky označí jako zaplacenou, webhook nám pak markne order.
  const orderForInvoice: OrderForInvoice = {
    id,
    contact: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName ?? null,
      companyIco: data.companyIco ?? null,
      companyDic: data.companyDic ?? null,
    },
    shipping: {
      street: data.street ?? null,
      city: data.city ?? null,
      zip: data.zip ?? null,
      methodLabel: SHIPPING_LABELS[data.shippingMethod],
    },
    items: data.items.map((i) => ({
      name: i.name,
      qty: i.qty,
      priceWithVat: i.priceWithVat,
      vatRate: i.vatRate,
    })),
    shippingFee,
    discountCode: discountCode ?? null,
    discountAmount: discount,
  };
  invoiceOrder(orderForInvoice).catch((e) =>
    console.error("[api/orders] invoiceOrder failed:", e),
  );

  // Send emails (fire-and-forget)
  const emailPayload = {
    id,
    total,
    subtotal,
    shippingFee,
    iban: FUTUNATU_IBAN,
    qrDataUrl,
    items: data.items,
    contact: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      companyIco: data.companyIco,
      companyDic: data.companyDic,
    },
    shipping: {
      method: data.shippingMethod,
      methodLabel: SHIPPING_LABELS[data.shippingMethod],
      street: data.street,
      city: data.city,
      zip: data.zip,
      zasilkovnaPickup: data.zasilkovnaPickup,
    },
    payment: {
      method: data.paymentMethod,
      methodLabel: PAYMENT_LABELS[data.paymentMethod],
    },
    notes: data.notes,
  };
  Promise.allSettled([
    sendOrderConfirmation(emailPayload),
    sendOrderNotification(emailPayload),
  ]);

  return NextResponse.json({
    ok: true,
    orderId: id,
    total,
    iban: FUTUNATU_IBAN,
    qrDataUrl,
  });
}

// GET (preview-protected) — list orders for admin
export async function GET(req: NextRequest) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await readOrders();
  return NextResponse.json({ count: all.length, orders: all });
}
