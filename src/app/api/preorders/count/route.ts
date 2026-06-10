import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Public GET endpoint — počet aktivních předobjednávek pro daný model.
 * Slouží pro FOMO trigger v UI ("Už předobjednáno X kol").
 *
 * Query: ?model=scott-spark-rc-2027
 * Response: { count: number, model: string }
 *
 * Bezpečnost: jen count, žádné PII. Cached 5 min.
 */

export const revalidate = 300; // 5 minut

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const model = url.searchParams.get("model");
  if (!model || !/^[a-z0-9-]+$/i.test(model) || model.length > 80) {
    return NextResponse.json({ error: "invalid model" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ count: 0, model });
  }

  const sb = getSupabase();
  const { count, error } = await sb
    .from("preorders")
    .select("*", { count: "exact", head: true })
    .eq("model_slug", model)
    .in("status", ["new", "contacted", "reserved"]); // bez 'cancelled'

  if (error) {
    console.error("[preorders/count] failed:", error);
    return NextResponse.json({ count: 0, model });
  }

  return NextResponse.json(
    { count: count ?? 0, model },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
