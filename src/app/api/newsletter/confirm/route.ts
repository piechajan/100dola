// Newsletter double opt-in confirm endpoint.
// GET /api/newsletter/confirm?token=<confirmation_token>
//   → najde subscribera s tímto tokenem, nastaví confirmed=true, vymaže token
//   → redirect na potvrzovací stránku /newsletter/potvrzeno

import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  if (!token || token.length < 10) {
    return NextResponse.redirect(`${baseUrl}/newsletter/potvrzeno?status=invalid`);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${baseUrl}/newsletter/potvrzeno?status=error`);
  }

  const sb = getSupabase();

  try {
    const { data: sub, error: findErr } = await sb
      .from("newsletter_subscribers")
      .select("id, email, confirmed")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (findErr || !sub) {
      return NextResponse.redirect(`${baseUrl}/newsletter/potvrzeno?status=expired`);
    }

    if (sub.confirmed) {
      return NextResponse.redirect(`${baseUrl}/newsletter/potvrzeno?status=already`);
    }

    await sb
      .from("newsletter_subscribers")
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
        confirmation_token: null,
      })
      .eq("id", sub.id);

    return NextResponse.redirect(`${baseUrl}/newsletter/potvrzeno?status=ok`);
  } catch (e) {
    console.error("[newsletter/confirm] error:", e);
    return NextResponse.redirect(`${baseUrl}/newsletter/potvrzeno?status=error`);
  }
}
