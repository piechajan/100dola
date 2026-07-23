import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@supabase/supabase-js";
import Stars from "@/components/shop/Stars";
import ModerationButtons from "./ModerationButtons";

export const metadata: Metadata = {
  title: "Admin · Recenze — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ReviewRow {
  id: string;
  product_slug: string;
  product_name_snapshot: string;
  customer_name: string;
  customer_email: string;
  customer_city: string | null;
  rating: number;
  title: string | null;
  body: string;
  status: string;
  order_id: string | null;
  created_at: string;
  moderated_at: string | null;
  ip_address: string | null;
}

export default async function AdminReviewsPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/reviews");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-[#F7F9FF] py-8">
          <div className="max-w-[1200px] mx-auto px-6">
            <p className="text-red-600">Supabase env chybí.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: reviews } = await sb
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (reviews ?? []) as ReviewRow[];
  const counts = {
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    spam: rows.filter((r) => r.status === "spam").length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Recenze</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            Schvaluj nové recenze před zveřejněním na PDP. Aggregate per produkt se přepočítá automaticky triggerem.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {Object.entries(counts).map(([k, v]) => (
              <div key={k} className="bg-white rounded-xl border border-[#E2E6F3] p-3">
                <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                  {k === "pending" ? "Ke schválení" : k === "approved" ? "Zveřejněné" : k === "rejected" ? "Odmítnuté" : "Spam"}
                </div>
                <div className="text-2xl font-black text-[#1a1a2e]">{v}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {rows.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center text-sm text-[#9AA3C2]">
                Žádné recenze zatím.
              </div>
            ) : (
              rows.map((r) => (
                <article
                  key={r.id}
                  className={`bg-white rounded-2xl border p-5 ${
                    r.status === "pending"
                      ? "border-[#FCD34D]"
                      : r.status === "approved"
                        ? "border-[#E2E6F3]"
                        : "border-[#FECACA] opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={`/shop/${r.product_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#3B7CF4] hover:underline"
                        >
                          {r.product_name_snapshot}
                        </a>
                        <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full ${
                          r.status === "pending"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : r.status === "approved"
                              ? "bg-[#D1FAE5] text-[#065F46]"
                              : r.status === "rejected"
                                ? "bg-[#FECACA] text-[#991B1B]"
                                : "bg-[#1a1a2e] text-white"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Stars value={r.rating} size="small" />
                        <span className="text-xs font-bold text-[#1a1a2e]">{r.customer_name}</span>
                        <span className="text-xs text-[#9AA3C2]">{r.customer_email}</span>
                        {r.customer_city && <span className="text-xs text-[#9AA3C2]">· {r.customer_city}</span>}
                        {r.order_id && (
                          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                            Order #{r.order_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-[#9AA3C2] shrink-0">
                      {new Date(r.created_at).toLocaleString("cs-CZ")}
                    </div>
                  </div>
                  {r.title && <h3 className="text-base font-bold text-[#1a1a2e] mb-1">{r.title}</h3>}
                  <p className="text-sm text-[#5A6480] whitespace-pre-wrap leading-relaxed">{r.body}</p>
                  {r.ip_address && (
                    <div className="text-[10px] text-[#9AA3C2] mt-2">IP: {r.ip_address}</div>
                  )}
                  <div className="mt-3 pt-3 border-t border-[#F0F2FA]">
                    <ModerationButtons reviewId={r.id} productSlug={r.product_slug} status={r.status} />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
