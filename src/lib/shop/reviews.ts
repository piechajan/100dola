import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface ReviewAggregate {
  product_slug: string;
  rating_avg: number | null;
  rating_count: number;
  rating_1: number;
  rating_2: number;
  rating_3: number;
  rating_4: number;
  rating_5: number;
  last_review_at: string | null;
}

export interface PublicReview {
  id: string;
  customer_name: string;
  customer_city: string | null;
  rating: number;
  title: string | null;
  body: string;
  photos: string[] | null;
  created_at: string;
  verified_buyer: boolean;
}

let _sb: SupabaseClient | null = null;
function getSb(): SupabaseClient {
  if (_sb) return _sb;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase env missing");
  _sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
  return _sb;
}

export async function getReviewAggregate(slug: string): Promise<ReviewAggregate | null> {
  try {
    const sb = getSb();
    const { data } = await sb
      .from("product_review_aggregates")
      .select("*")
      .eq("product_slug", slug)
      .maybeSingle();
    return (data as ReviewAggregate | null) ?? null;
  } catch (e) {
    console.warn("[reviews] aggregate fetch failed:", e);
    return null;
  }
}

export async function getPublicReviews(slug: string, limit = 20): Promise<PublicReview[]> {
  try {
    const sb = getSb();
    const { data } = await sb
      .from("product_reviews")
      .select("id, customer_name, customer_city, rating, title, body, photos, created_at, order_id")
      .eq("product_slug", slug)
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data ?? []).map((r) => {
      const row = r as {
        id: string; customer_name: string; customer_city: string | null;
        rating: number; title: string | null; body: string; photos: string[] | null;
        created_at: string; order_id: string | null;
      };
      return {
        id: row.id,
        customer_name: row.customer_name,
        customer_city: row.customer_city,
        rating: row.rating,
        title: row.title,
        body: row.body,
        photos: row.photos,
        created_at: row.created_at,
        verified_buyer: !!row.order_id,
      };
    });
  } catch (e) {
    console.warn("[reviews] public fetch failed:", e);
    return [];
  }
}
