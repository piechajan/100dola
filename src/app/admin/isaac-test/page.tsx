import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IsaacReservationActions from "@/components/admin/IsaacReservationActions";
import IsaacWalkInForm from "@/components/admin/IsaacWalkInForm";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { ISAAC_BIKES, ISAAC_DAYS, ISAAC_SLOTS } from "@/data/isaac-bikes";

export const metadata: Metadata = {
  title: "Admin · ISAAC test rezervace — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Reservation {
  id: number;
  bike_slug: string;
  bike_label: string;
  slot_start: string;
  slot_end: string;
  slot_day_label: string;
  full_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: string;
  created_at: string;
}

async function loadReservations(): Promise<Reservation[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from("isaac_test_reservations")
    .select("*")
    .order("slot_start", { ascending: true });
  if (error) {
    console.error("[admin/isaac-test] load failed:", error);
    return [];
  }
  return (data || []) as Reservation[];
}

export default async function AdminIsaacTestPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    redirect("/login?from=/admin/isaac-test");
  }

  const reservations = await loadReservations();
  const byBike: Record<string, Reservation[]> = {};
  const bySlot: Record<string, Reservation[]> = {};
  for (const r of reservations) {
    byBike[r.bike_slug] = byBike[r.bike_slug] || [];
    byBike[r.bike_slug].push(r);
    bySlot[r.slot_start] = bySlot[r.slot_start] || [];
    bySlot[r.slot_start].push(r);
  }

  const totalSlots = ISAAC_DAYS.reduce((s, d) => s + d.slots.length, 0) * ISAAC_BIKES.length;
  const reservedCount = reservations.filter((r) => r.status !== "cancelled").length;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#F7F9FF] min-h-screen pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
            <div>
              <div className="text-xs tracking-[0.22em] uppercase font-bold text-[#3B7CF4] mb-1">
                Admin
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e]">
                ISAAC test rezervace
              </h1>
              <p className="text-sm text-[#5A6480] mt-1.5">
                {reservedCount}/{totalSlots} slotů obsazeno · 29.–31. 5. 2026
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full border border-[#E2E6F3] text-[#1a1a2e] hover:border-[#3B7CF4]"
              >
                Objednávky →
              </Link>
              <Link
                href="/isaac-test"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full bg-[#3B7CF4] text-white hover:opacity-90"
              >
                Veřejná stránka ↗
              </Link>
            </div>
          </div>

          {/* Walk-in tlačítko/form */}
          <div className="mb-8">
            <IsaacWalkInForm bikes={ISAAC_BIKES} slots={ISAAC_SLOTS} />
          </div>

          {/* Matrix přehled — kola × dny */}
          <h2 className="text-base font-black text-[#1a1a2e] mb-3">Přehled obsazení</h2>
          <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-x-auto mb-8">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F7F9FF] uppercase tracking-wider text-[#9AA3C2]">
                  <th className="text-left p-2 font-bold sticky left-0 bg-[#F7F9FF] min-w-[200px]">
                    Kolo
                  </th>
                  {ISAAC_DAYS.flatMap((d) =>
                    d.slots.map((s) => (
                      <th key={s.slotStart} className="text-center p-2 font-bold min-w-[60px]">
                        <div className="text-[9px] text-[#9AA3C2]">{d.label.split(" ")[0].slice(0, 2)}</div>
                        <div>{String(s.hour).padStart(2, "0")}</div>
                      </th>
                    )),
                  )}
                </tr>
              </thead>
              <tbody>
                {ISAAC_BIKES.map((bike) => (
                  <tr key={bike.slug} className="border-t border-[#F0F2FA]">
                    <td className="p-2 font-bold sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: bike.colorHex, border: "1px solid #E2E6F3" }}
                        />
                        <span className="text-xs">
                          {bike.model} {bike.color}{" "}
                          <span className="text-[#9AA3C2] font-normal">· {bike.size}</span>
                        </span>
                      </div>
                    </td>
                    {ISAAC_DAYS.flatMap((d) =>
                      d.slots.map((s) => {
                        const r = (byBike[bike.slug] || []).find(
                          (x) => x.slot_start === s.slotStart && x.status !== "cancelled",
                        );
                        return (
                          <td key={s.slotStart} className="p-1 text-center">
                            {r ? (
                              <div
                                className="bg-[#3B7CF4] text-white text-[9px] font-bold rounded px-1 py-1 truncate"
                                title={`${r.full_name} · ${r.email} · ${r.phone}`}
                              >
                                {r.full_name.split(" ").slice(0, 1).join("").slice(0, 8)}
                              </div>
                            ) : (
                              <div className="text-[#E2E6F3]">·</div>
                            )}
                          </td>
                        );
                      }),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailní seznam */}
          <h2 className="text-base font-black text-[#1a1a2e] mb-3">
            Seznam rezervací ({reservations.length})
          </h2>
          {reservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center">
              <div className="text-3xl mb-2">🚲</div>
              <p className="text-sm text-[#5A6480]">Zatím žádné rezervace.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                    <th className="text-left p-3 font-bold">Termín</th>
                    <th className="text-left p-3 font-bold">Kolo</th>
                    <th className="text-left p-3 font-bold">Klient</th>
                    <th className="text-left p-3 font-bold">Kontakt</th>
                    <th className="text-left p-3 font-bold">Pozn.</th>
                    <th className="text-center p-3 font-bold">Status</th>
                    <th className="text-left p-3 font-bold">Akce</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id} className="border-t border-[#F0F2FA] hover:bg-[#F7F9FF]">
                      <td className="p-3 text-xs">{r.slot_day_label}</td>
                      <td className="p-3 text-xs font-bold">{r.bike_label}</td>
                      <td className="p-3 text-xs font-bold">{r.full_name}</td>
                      <td className="p-3 text-xs">
                        <a href={`mailto:${r.email}`} className="text-[#3B7CF4] hover:underline">
                          {r.email}
                        </a>
                        <br />
                        <a href={`tel:${r.phone}`} className="text-[#5A6480] hover:text-[#3B7CF4]">
                          {r.phone}
                        </a>
                      </td>
                      <td className="p-3 text-xs text-[#5A6480] max-w-[200px] truncate" title={r.notes || ""}>
                        {r.notes || "—"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                            r.status === "reserved"
                              ? "bg-blue-100 text-blue-900"
                              : r.status === "completed"
                              ? "bg-emerald-100 text-emerald-900"
                              : r.status === "no_show"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <IsaacReservationActions
                          id={r.id}
                          status={r.status}
                          customerName={r.full_name}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
