import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { OrderPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import { PRODUCTS } from "@/data/products";
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
import { getAdminContext } from "@/lib/admin-auth";
import { invoiceOrder, type OrderForInvoice } from "@/lib/invoicing";
import { recordProductPairs } from "@/lib/shop/pair-counts";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendMetaCapiEvent,
  extractClientContext,
  extractFbCookies,
} from "@/lib/meta-capi";

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
  // Rate-limit: max 5 objednávek / 10 min / IP
  const rl = await checkRateLimit(req, { bucket: "orders", max: 5, windowSec: 600 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Příliš mnoho pokusů — zkus to za chvíli." },
      { status: 429 },
    );
  }

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

  // BEZPEČNOST: nikdy nevěř ceně z klienta. U statických katalogových produktů
  // přepiš priceWithVat/vatRate autoritativní hodnotou z PRODUCTS (podle slugu).
  // Supplier/konfigurátor produkty nejsou v PRODUCTS → zůstávají (residuální riziko,
  // řešit DB lookupem / HMAC podpisem zvlášť). Nikdy nezneplatní legitimní objednávku
  // (override jen při shodě slugu), takže nemůže omylem vynulovat cenu.
  const catalogBySlug = new Map(
    PRODUCTS.map((p) => [p.slug, { priceWithVat: p.priceWithVat, vatRate: p.vatRate }]),
  );
  for (const item of data.items) {
    // Variantu jsme do slugu nepřidávali, ale checkout dává do názvu " — barva, vel.".
    const baseSlug = item.slug;
    const authoritative = catalogBySlug.get(baseSlug);
    if (authoritative) {
      if (item.priceWithVat !== authoritative.priceWithVat) {
        console.warn(
          `[orders] cena přepsána z katalogu u "${baseSlug}": klient ${item.priceWithVat} → ${authoritative.priceWithVat} Kč`,
        );
      }
      item.priceWithVat = authoritative.priceWithVat;
      item.vatRate = authoritative.vatRate;
    }
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

      // Behavioral recommendations pipeline — uložit páry produktů
      // z jedné objednávky (n choose 2 unikátní kombinace).
      try {
        await recordProductPairs(sb, data.items.map((i) => i.slug));
      } catch (pairErr) {
        console.warn("[api/orders] pair counts update failed:", pairErr);
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

  // Uložit payment metadata snapshot pro pozdější reminder e-mail
  // (vyžaduje migraci 011_orders_payment_lifecycle.sql — pokud sloupce ještě
  // neexistují, UPDATE selže a my pokračujeme bez chyby).
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase();
      await sb
        .from("orders")
        .update({
          iban: FUTUNATU_IBAN,
          variable_symbol: id,
          qr_data_url: qrDataUrl ?? null,
        })
        .eq("id", id);
    } catch (e) {
      console.warn("[api/orders] payment metadata snapshot update skipped:", e);
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
  const { clientIp, userAgent } = extractClientContext(req.headers);
  const { fbp, fbc } = extractFbCookies(req.headers);
  const eventSourceUrl = req.headers.get("referer") ?? "https://www.100dola.com/objednavka";

  Promise.allSettled([
    sendOrderConfirmation(emailPayload),
    sendOrderNotification(emailPayload),
    sendMetaCapiEvent({
      eventName: "Purchase",
      eventId: id, // sdílené s browser pixelem pro dedup
      eventSourceUrl,
      userData: {
        email: data.email,
        phone: data.phone,
        firstName: data.name.split(" ")[0] || undefined,
        lastName: data.name.split(" ").slice(1).join(" ") || undefined,
        city: data.city,
        zip: data.zip,
        country: "cz",
        clientIp,
        userAgent,
        fbp,
        fbc,
        externalId: id,
      },
      customData: {
        currency: "CZK",
        value: total,
        content_ids: data.items.map((i) => i.slug),
        content_type: "product",
        num_items: data.items.reduce((sum, i) => sum + i.qty, 0),
        contents: data.items.map((i) => ({
          id: i.slug,
          quantity: i.qty,
          item_price: i.priceWithVat,
        })),
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    orderId: id,
    eventId: id, // stejný event_id jako CAPI Purchase → browser pixel dedup
    total,
    iban: FUTUNATU_IBAN,
    qrDataUrl,
  });
}

// GET (admin-protected) — list orders for admin
export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const all = await readOrders();
  return NextResponse.json({ count: all.length, orders: all });
}
