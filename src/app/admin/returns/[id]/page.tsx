import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import {
  approveReturnAction,
  markReceivedAction,
  markRefundedAction,
  rejectReturnAction,
  saveReturnNoteAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Admin · Vrácení detail — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  order_id: string;
  customer_email: string;
  return_type: string;
  items_description: string;
  reason: string;
  status: string;
  refund_amount: number | null;
  refund_method: string | null;
  refunded_at: string | null;
  admin_note: string | null;
  approved_at: string | null;
  approved_by: string | null;
  received_at: string | null;
  rejected_reason: string | null;
  ip_address: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  withdrawal: "Odstoupení od smlouvy (14 dnů)",
  warranty: "Reklamace v záruce",
  damaged: "Poškozeno v dopravě",
  other: "Jiný důvod",
};

function fmt(d: string): string {
  return new Date(d).toLocaleString("cs-CZ");
}

export default async function AdminReturnDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) {
    const { id } = await params;
    redirect(`/admin/login?from=/admin/returns/${id}`);
  }

  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) notFound();

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb.from("returns").select("*").eq("id", id).maybeSingle();
  const r = data as Row | null;
  if (!r) notFound();

  const sp = await searchParams;

  // Fetch original order for context
  const { data: orderData } = await sb
    .from("orders")
    .select("id, total, name, shipped_at, paid_at")
    .eq("id", r.order_id)
    .maybeSingle();
  const order = orderData as { id: string; total: number; name: string; shipped_at: string | null; paid_at: string | null } | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[860px] mx-auto px-6">
          <Link href="/admin/returns" className="text-xs text-[#5A6480] hover:underline">
            ← Zpět na vrácení
          </Link>
          <div className="flex items-end justify-between flex-wrap gap-3 mt-1 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#FEE2E2] text-[#991B1B] inline-block mb-2">
                {TYPE_LABELS[r.return_type] ?? r.return_type}
              </div>
              <h1 className="text-2xl font-black text-[#1a1a2e]">
                {order?.name ?? r.customer_email}
              </h1>
              <div className="text-sm text-[#5A6480] mt-1">
                <a href={`mailto:${r.customer_email}`} className="text-[#3B7CF4] hover:underline">{r.customer_email}</a>
                {" · "}
                <Link href={`/admin/orders/${r.order_id}`} className="text-[#3B7CF4] hover:underline font-mono">
                  Objednávka {r.order_id}
                </Link>
              </div>
            </div>
            {sp?.saved === "1" && (
              <span className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                ✓ Uloženo
              </span>
            )}
          </div>

          {order && (
            <div className="bg-[#F7F9FF] rounded-2xl border border-[#E2E6F3] p-4 mb-5 text-xs text-[#5A6480]">
              Objednávka celkem <strong>{order.total.toLocaleString("cs-CZ")} Kč</strong>
              {order.shipped_at && <> · odesláno {fmt(order.shipped_at)}</>}
              {order.paid_at && <> · zaplaceno {fmt(order.paid_at)}</>}
            </div>
          )}

          {/* Customer's data */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-2">
              Co vrací
            </div>
            <p className="text-sm text-[#1a1a2e] mb-4">{r.items_description}</p>
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-2">
              Důvod
            </div>
            <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap leading-relaxed">{r.reason}</p>
          </div>

          {/* Admin note */}
          <form action={saveReturnNoteAction} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <input type="hidden" name="id" value={r.id} />
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-2">
              Interní poznámka
            </div>
            <textarea
              name="admin_note"
              defaultValue={r.admin_note ?? ""}
              rows={3}
              placeholder="Stav zboží, refund detail, číslo dobropisu…"
              className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
            />
            <div className="flex justify-end mt-3">
              <button className="px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-xs font-bold hover:opacity-90">
                Uložit poznámku
              </button>
            </div>
          </form>

          {/* Status actions */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-3">
              Stav vrácení: <strong className="text-[#1a1a2e]">{r.status}</strong>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {r.status === "requested" && (
                <form action={approveReturnAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-[#10B981] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Schválit → čekat na zboží
                  </button>
                </form>
              )}
              {r.status === "approved" && (
                <form action={markReceivedAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-[#3B7CF4] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Zboží přišlo
                  </button>
                </form>
              )}
              {r.status !== "rejected" && r.status !== "refunded" && (
                <form action={rejectReturnAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input
                    type="text"
                    name="rejected_reason"
                    placeholder="Důvod zamítnutí"
                    className="px-3 py-1.5 text-xs border border-[#E2E6F3] rounded-full focus:outline-none w-44"
                  />
                  <button className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold hover:opacity-90">
                    Zamítnout
                  </button>
                </form>
              )}
            </div>

            {/* Refund form pokud status = received */}
            {r.status === "received" && (
              <form action={markRefundedAction} className="bg-[#F0FDF4] rounded-lg p-4 border border-[#A7F3D0]">
                <input type="hidden" name="id" value={r.id} />
                <div className="text-[11px] font-bold text-[#065F46] mb-2">Vrátit peníze</div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    name="refund_amount"
                    placeholder="Částka Kč"
                    defaultValue={order?.total ?? ""}
                    step="0.01"
                    className="px-3 py-1.5 text-xs border border-[#A7F3D0] rounded-full focus:outline-none w-32"
                  />
                  <select
                    name="refund_method"
                    defaultValue="bank_transfer"
                    className="px-3 py-1.5 text-xs border border-[#A7F3D0] rounded-full focus:outline-none bg-white"
                  >
                    <option value="bank_transfer">Bankovní převod</option>
                    <option value="card_reverse">Reverz karty</option>
                    <option value="voucher">Voucher</option>
                  </select>
                  <button className="px-3 py-1.5 bg-[#10B981] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Označit jako refunded
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 text-[11px] text-[#9AA3C2] space-y-1">
              {r.approved_at && <div>Schváleno: {fmt(r.approved_at)} ({r.approved_by})</div>}
              {r.received_at && <div>Zboží přijato: {fmt(r.received_at)}</div>}
              {r.refunded_at && (
                <div className="text-[#065F46] font-bold">
                  ✓ Vráceno {fmt(r.refunded_at)} ·
                  {r.refund_amount && ` ${r.refund_amount.toLocaleString("cs-CZ")} Kč`}
                  {r.refund_method && ` · ${r.refund_method}`}
                </div>
              )}
              {r.rejected_reason && (
                <div className="text-red-700">Zamítnuto: {r.rejected_reason}</div>
              )}
              {r.ip_address && <div className="font-mono">IP: {r.ip_address}</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
