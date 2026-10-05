import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateDiscountCode } from "@/lib/discounts";
import { checkRateLimit } from "@/lib/rate-limit";

const Schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().min(0),
  // Potřebné u kódů omezených na část sortimentu (např. jen trenažéry).
  // Cena i kategorie se na serveru stejně dohledávají z katalogu.
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(200),
        priceWithVat: z.number().min(0),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .max(99)
    .optional(),
});

export async function POST(req: NextRequest) {
  // Rate-limit: brání enumeraci slevových kódů — max 20 pokusů / 60s / IP
  const rate = await checkRateLimit(req, { bucket: "discount-validate", max: 20, windowSec: 60 });
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await validateDiscountCode(parsed.data.code, {
    subtotal: parsed.data.subtotal,
    items: parsed.data.items,
  });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
  }
  return NextResponse.json({ ok: true, discount: result.discount });
}
