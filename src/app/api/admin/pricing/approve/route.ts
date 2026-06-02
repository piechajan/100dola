import { createClient } from "@supabase/supabase-js";
import { verifyApprovalToken } from "@/lib/pricing/magic-link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Magic-link endpoint: GET /api/admin/pricing/approve?token=<HMAC>
 * Token verifikuje + aplikuje akci na proposal:
 *  - "approve" → updatne cenu v supplier_products + uloží price_changes záznam
 *  - "reject"  → jen status=rejected
 *
 * Vrací HTML stránku s výsledkem (jednoduchý UI feedback v prohlížeči).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token) return htmlResponse("Chybí token.", 400);

  const payload = verifyApprovalToken(token);
  if (!payload) return htmlResponse("Token neplatný nebo expirovaný.", 401);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return htmlResponse("Server config error.", 500);

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });

  const { data: proposalRow, error: pErr } = await sb
    .from("price_proposals")
    .select(
      "id, watchlist_id, our_price_minor, suggested_price_minor, suggested_action, status, expires_at",
    )
    .eq("id", payload.proposalId)
    .single();

  if (pErr || !proposalRow) return htmlResponse("Návrh nenalezen.", 404);

  if (proposalRow.status !== "pending") {
    return htmlResponse(`Návrh už byl zpracován (stav: ${proposalRow.status}).`, 200);
  }
  if (new Date(proposalRow.expires_at).getTime() < Date.now()) {
    await sb.from("price_proposals").update({ status: "expired" }).eq("id", proposalRow.id);
    return htmlResponse("Návrh expiroval.", 410);
  }

  if (payload.action === "reject") {
    await sb
      .from("price_proposals")
      .update({
        status: "rejected",
        decided_at: new Date().toISOString(),
        decided_via: "magic_link",
      })
      .eq("id", proposalRow.id);
    return htmlResponse("Návrh odmítnut.", 200);
  }

  // approve → aplikovat cenu
  const { data: watch } = await sb
    .from("price_watchlist")
    .select("product_kind, product_id, product_name")
    .eq("id", proposalRow.watchlist_id)
    .single();

  if (!watch) return htmlResponse("Watchlist record chybí.", 404);

  const newPriceMinor = proposalRow.suggested_price_minor;
  if (newPriceMinor === null) return htmlResponse("Návrh nemá cenu.", 422);
  const newPriceCzk = newPriceMinor / 100;

  let updateErr: string | null = null;
  if (watch.product_kind === "supplier") {
    const { error } = await sb
      .from("supplier_products")
      .update({ price_czk_retail: newPriceCzk })
      .eq("id", watch.product_id);
    if (error) updateErr = error.message;
  } else {
    updateErr = "own products v MVP nejsou v DB; změnit ručně";
  }

  if (updateErr) {
    return htmlResponse(`Cena nezměněna: ${updateErr}`, 500);
  }

  await sb.from("price_changes").insert({
    product_kind: watch.product_kind,
    product_id: watch.product_id,
    old_price_minor: proposalRow.our_price_minor,
    new_price_minor: newPriceMinor,
    source: "proposal",
    proposal_id: proposalRow.id,
    changed_by: "magic_link",
  });

  await sb
    .from("price_proposals")
    .update({
      status: "approved",
      decided_at: new Date().toISOString(),
      decided_via: "magic_link",
    })
    .eq("id", proposalRow.id);

  return htmlResponse(
    `Schváleno. Cena <strong>${watch.product_name}</strong> změněna na ${formatCzk(newPriceCzk)}.`,
    200,
  );
}

function htmlResponse(message: string, status: number): Response {
  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>Pricing</title></head>
<body style="font-family:-apple-system,Segoe UI,sans-serif;color:#1a1a2e;max-width:480px;margin:80px auto;padding:0 16px;text-align:center;">
  <h2 style="font-size:18px;">Pricing watch</h2>
  <p style="color:#5A6480;">${message}</p>
  <p style="font-size:12px;color:#9AA3C2;margin-top:32px;">
    <a href="/admin/pricing" style="color:#3B7CF4;">Přejít do admina</a>
  </p>
</body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function formatCzk(czk: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(czk) + " Kč";
}
