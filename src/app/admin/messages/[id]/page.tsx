import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { markRepliedAction, markSpamAction, archiveAction } from "../actions";

export const metadata: Metadata = {
  title: "Admin · Message — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  page_url: string | null;
  product_slug: string | null;
  ai_draft: string | null;
  ai_model: string | null;
  ai_tokens_in: number | null;
  ai_tokens_out: number | null;
  ai_error: string | null;
  status: "new" | "replied" | "spam" | "archived";
  notification_sent_at: string | null;
  auto_reply_sent_at: string | null;
  replied_at: string | null;
  replied_by: string | null;
  ip_address: string | null;
  created_at: string;
}

function fmt(d: string): string {
  return new Date(d).toLocaleString("cs-CZ");
}

export default async function AdminMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAdminContext();
  if (!ctx) {
    const { id } = await params;
    redirect(`/admin/login?from=/admin/messages/${id}`);
  }

  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) notFound();

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb.from("contact_messages").select("*").eq("id", id).maybeSingle();
  const r = data as Row | null;
  if (!r) notFound();

  const mailto = `mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent(`Re: tvůj dotaz na 100dola`)}&body=${encodeURIComponent(r.ai_draft ?? "")}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[860px] mx-auto px-6">
          <Link href="/admin/messages" className="text-xs text-[#5A6480] hover:underline">
            ← Zpět na inbox
          </Link>
          <h1 className="text-2xl font-black text-[#1a1a2e] mt-1 mb-1">{r.name}</h1>
          <div className="text-sm text-[#5A6480] mb-6">
            <a href={`mailto:${r.email}`} className="text-[#3B7CF4] hover:underline">{r.email}</a>
            {r.phone && <> · <a href={`tel:${r.phone}`} className="text-[#3B7CF4] hover:underline">{r.phone}</a></>}
            <span className="text-[#9AA3C2]"> · {fmt(r.created_at)}</span>
          </div>

          {/* Context chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {r.product_slug && (
              <Link href={`/shop/${r.product_slug}`} target="_blank" className="text-[11px] px-2.5 py-1 rounded-full bg-[#F0F4FF] text-[#1a1a2e] border border-[#D6E1FB]">
                🛍 {r.product_slug}
              </Link>
            )}
            {r.page_url && (
              <a href={r.page_url} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2.5 py-1 rounded-full bg-[#F0F2FA] text-[#5A6480] truncate max-w-[300px]">
                🌐 {r.page_url}
              </a>
            )}
          </div>

          {/* Customer message */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-5 mb-5">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-2">Zpráva zákazníka</div>
            <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap leading-relaxed">{r.message}</p>
          </div>

          {/* AI draft */}
          {r.ai_draft ? (
            <div className="bg-[#F0F7FF] rounded-2xl border border-[#D6E1FB] p-5 mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-wider text-[#3B7CF4] font-bold">
                  ✦ AI návrh odpovědi
                </div>
                {r.ai_model && (
                  <div className="text-[10px] text-[#9AA3C2] font-mono">
                    {r.ai_model} · {r.ai_tokens_in}↓ / {r.ai_tokens_out}↑ tok
                  </div>
                )}
              </div>
              <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap leading-relaxed">{r.ai_draft}</p>
              <div className="flex gap-2 mt-4">
                <a
                  href={mailto}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B7CF4] text-white rounded-full text-xs font-bold hover:opacity-90"
                >
                  Otevřít v mailu (předplněné)
                </a>
              </div>
            </div>
          ) : r.ai_error ? (
            <div className="bg-[#FFF7ED] rounded-2xl border border-[#FBD38D] p-4 mb-5 text-xs text-[#92400E]">
              AI návrh nedostupný: <code>{r.ai_error}</code>
            </div>
          ) : null}

          {/* Status actions */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-5">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-3">Akce</div>
            <div className="flex flex-wrap gap-2">
              {r.status !== "replied" && (
                <form action={markRepliedAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-[#10B981] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Označit jako odpovězeno
                  </button>
                </form>
              )}
              {r.status !== "spam" && (
                <form action={markSpamAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold hover:opacity-90">
                    Spam
                  </button>
                </form>
              )}
              {r.status !== "archived" && (
                <form action={archiveAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-[#5A6480] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Archivovat
                  </button>
                </form>
              )}
            </div>
            <div className="mt-4 text-[11px] text-[#9AA3C2] space-y-1">
              <div>Stav: <strong>{r.status}</strong></div>
              {r.notification_sent_at && <div>Notifikace odeslána: {fmt(r.notification_sent_at)}</div>}
              {r.auto_reply_sent_at && <div>Auto-reply odeslán: {fmt(r.auto_reply_sent_at)}</div>}
              {r.replied_at && <div>Odpověděno: {fmt(r.replied_at)} ({r.replied_by})</div>}
              {r.ip_address && <div className="font-mono">IP: {r.ip_address}</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
