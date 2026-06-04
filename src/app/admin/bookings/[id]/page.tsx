import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import {
  confirmBookingAction,
  completeBookingAction,
  cancelBookingAction,
  saveNoteAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Admin · Booking detail — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  bike_brand: string | null;
  bike_model: string | null;
  bike_kind: string | null;
  preferred_date: string | null;
  preferred_time_label: string | null;
  flexibility: string | null;
  description: string;
  status: "new" | "confirmed" | "completed" | "cancelled";
  confirmed_at: string | null;
  confirmed_by: string | null;
  completed_at: string | null;
  admin_note: string | null;
  ip_address: string | null;
  created_at: string;
}

const SERVICE_LABEL: Record<string, string> = {
  servis: "Servis kola",
  bikefit: "Bikefit",
  detailing: "Detailing",
  jine: "Jiné",
};

function fmt(d: string): string {
  return new Date(d).toLocaleString("cs-CZ");
}

export default async function AdminBookingDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) {
    const { id } = await params;
    redirect(`/admin/login?from=/admin/bookings/${id}`);
  }

  const { id } = await params;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) notFound();

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await sb.from("service_bookings").select("*").eq("id", id).maybeSingle();
  const r = data as Row | null;
  if (!r) notFound();

  const sp = await searchParams;
  const bike = [r.bike_brand, r.bike_model].filter(Boolean).join(" ") || r.bike_kind || "—";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[860px] mx-auto px-6">
          <Link href="/admin/bookings" className="text-xs text-[#5A6480] hover:underline">
            ← Zpět na rezervace
          </Link>
          <div className="flex items-end justify-between flex-wrap gap-3 mt-1 mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#F0F2FA] text-[#5A6480] inline-block mb-2">
                {SERVICE_LABEL[r.service_type] ?? r.service_type}
              </div>
              <h1 className="text-2xl font-black text-[#1a1a2e]">{r.name}</h1>
              <div className="text-sm text-[#5A6480] mt-1">
                <a href={`mailto:${r.email}`} className="text-[#3B7CF4] hover:underline">{r.email}</a>
                {" · "}
                <a href={`tel:${r.phone}`} className="text-[#3B7CF4] hover:underline">{r.phone}</a>
              </div>
            </div>
            {sp?.saved === "1" && (
              <span className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                ✓ Uloženo
              </span>
            )}
          </div>

          {/* Booking info */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <table className="w-full text-sm">
              <tbody>
                <Tr label="Kolo" value={bike} />
                <Tr label="Druh" value={r.bike_kind} />
                <Tr label="Preferovaný den" value={r.preferred_date} />
                <Tr label="Čas" value={r.preferred_time_label} />
                <Tr label="Flexibilita" value={r.flexibility} />
                <Tr label="Vytvořeno" value={fmt(r.created_at)} />
                <Tr label="IP" value={r.ip_address} mono />
              </tbody>
            </table>
          </div>

          {/* Customer message */}
          <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5">
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-2">
              Popis od zákazníka
            </div>
            <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap leading-relaxed">{r.description}</p>
          </div>

          {/* Admin note */}
          <form
            action={saveNoteAction}
            className="bg-white rounded-2xl border border-[#E2E6F3] p-6 mb-5"
          >
            <input type="hidden" name="id" value={r.id} />
            <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-2">
              Interní poznámka (admin)
            </div>
            <textarea
              name="admin_note"
              defaultValue={r.admin_note ?? ""}
              rows={3}
              placeholder="Domluvený termín, cena, co potřeba dodat…"
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
              Stav rezervace
            </div>
            <div className="flex flex-wrap gap-2">
              {r.status === "new" && (
                <form action={confirmBookingAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-[#10B981] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Potvrdit termín
                  </button>
                </form>
              )}
              {r.status === "confirmed" && (
                <form action={completeBookingAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-[#3B7CF4] text-white rounded-full text-xs font-bold hover:opacity-90">
                    Hotovo
                  </button>
                </form>
              )}
              {r.status !== "cancelled" && r.status !== "completed" && (
                <form action={cancelBookingAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-1.5 bg-red-600 text-white rounded-full text-xs font-bold hover:opacity-90">
                    Stornovat
                  </button>
                </form>
              )}
            </div>
            <div className="mt-4 text-[11px] text-[#9AA3C2] space-y-1">
              <div>Stav: <strong>{r.status}</strong></div>
              {r.confirmed_at && <div>Potvrzeno: {fmt(r.confirmed_at)} ({r.confirmed_by})</div>}
              {r.completed_at && <div>Hotovo: {fmt(r.completed_at)}</div>}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Tr({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <tr className="border-b border-[#F0F2FA] last:border-b-0">
      <td className="py-2 text-[11px] text-[#9AA3C2] uppercase tracking-wider font-bold w-40">{label}</td>
      <td className={`py-2 text-sm ${mono ? "font-mono text-xs" : ""}`}>{value}</td>
    </tr>
  );
}
