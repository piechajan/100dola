import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateDiscountCode } from "@/lib/discounts";
import { checkRateLimit } from "@/lib/rate-limit";

const Schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().min(0),
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

  const result = await validateDiscountCode(parsed.data.code, { subtotal: parsed.data.subtotal });
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
  }
  return NextResponse.json({ ok: true, discount: result.discount });
}
