import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { OrderPayloadSchema, HONEYPOT_NAME } from "@/lib/schemas";
import { calcOrderTotal, isPaymentAvailable, SHIPPING_LABELS, PAYMENT_LABELS } from "@/lib/orders";
import { buildOrderId, buildSpaydQrDataUrl, FUTUNATU_IBAN } from "@/lib/spayd";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/email";

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

/** Spočítá sequenční ID pro daný den (od 1 nahoru). */
async function nextDailySeq(date: Date): Promise<number> {
  const all = await readOrders();
  const todayPrefix = (() => {
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}${mm}${dd}`;
  })();
  const todayOrders = all.filter((o) => o.id.startsWith(todayPrefix));
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

  const { subtotal, shippingFee, total, hasBulky } = calcOrderTotal(data.items, data.shippingMethod);

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

  await appendOrder(record);

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
