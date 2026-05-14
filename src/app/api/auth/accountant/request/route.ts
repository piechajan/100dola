import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  isAccountantAuthConfigured,
  isAllowedAccountantEmail,
  signMagicToken,
} from "@/lib/accountant-auth";
import { sendAccountantMagicLink } from "@/lib/email";

const Schema = z.object({
  email: z.string().email().max(120),
});

export async function POST(req: NextRequest) {
  if (!isAccountantAuthConfigured()) {
    return NextResponse.json(
      { error: "Magic-link login není nakonfigurovaný (ACCOUNTANT_SECRET / ACCOUNTANT_EMAILS chybí)" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Zadej validní e-mail" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  // Vždy vrátíme "ok" — neprozrazujeme, jestli je email v allowlistu (anti-enum).
  if (!isAllowedAccountantEmail(email)) {
    console.warn(`[auth/accountant/request] not in allowlist: ${email}`);
    return NextResponse.json({ ok: true });
  }

  try {
    const token = signMagicToken(email);
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const magicUrl = `${base.replace(/\/$/, "")}/api/auth/accountant/callback?token=${encodeURIComponent(token)}`;

    await sendAccountantMagicLink({ email, magicUrl });
  } catch (e) {
    console.error("[auth/accountant/request] failed:", e);
    // Pořád 200, aby uživatel nedostal víc info než „pokud existuješ, dostaneš mail"
  }

  return NextResponse.json({ ok: true });
}
