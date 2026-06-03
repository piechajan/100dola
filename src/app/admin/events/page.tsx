import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { listEventsFromDb } from "@/lib/events-db";

export const metadata: Metadata = {
  title: "Admin · Events — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SPORT_COLOR: Record<string, string> = {
  Silnice: "#3B7CF4",
  Gravel: "#E8431A",
  MTB: "#2EAA6E",
  Skialpy: "#7C5CBF",
  Běžky: "#00A8CC",
  Turistika: "#8B6E52",
  Malaga: "#C4622D",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminEventsPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/events");

  const rows = await listEventsFromDb();
  const now = new Date().toISOString().slice(0, 10);
  const upcoming = rows.filter((r) => r.date_iso >= now && !r.is_past);
  const past = rows.filter((r) => r.date_iso < now || r.is_past);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <h1 className="text-3xl font-black text-[#1a1a2e] mb-1">Events</h1>
              <p className="text-sm text-[#5A6480]">
                {upcoming.length} nadcházející · {past.length} minulé · celkem {rows.length}
              </p>
              <p className="text-[11px] text-amber-700 mt-2">
                ⚠ Frontend (Navbar, /community, sitemap) zatím čte ze <code>src/data/events.ts</code>.
                Edit v adminu změní DB, ale na webu se projeví až přepneme zdroj (další commit).
              </p>
            </div>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90"
            >
              + Nový event
            </Link>
          </div>

          {/* Upcoming */}
          <section className="mb-8">
            <h2 className="text-lg font-black text-[#1a1a2e] mb-3">Nadcházející</h2>
            <EventTable rows={upcoming} />
          </section>

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-black text-[#1a1a2e] mb-3">Minulé</h2>
              <EventTable rows={past} muted />
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function EventTable({ rows, muted = false }: { rows: Awaited<ReturnType<typeof listEventsFromDb>>; muted?: boolean }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E2E6F3] p-6 text-center text-sm text-[#9AA3C2]">
        Žádné události.
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
          <tr>
            <th className="text-left p-3 font-bold">Datum</th>
            <th className="text-left p-3 font-bold">Sport</th>
            <th className="text-left p-3 font-bold">Titul</th>
            <th className="text-right p-3 font-bold">Kapacita</th>
            <th className="text-left p-3 font-bold">Stav</th>
            <th className="text-right p-3 font-bold">Akce</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const fillPct = r.capacity > 0 ? Math.round((r.filled / r.capacity) * 100) : 0;
            return (
              <tr key={r.id} className={`border-t border-[#E2E6F3] ${muted ? "opacity-60" : ""}`}>
                <td className="p-3 text-xs tabular-nums">
                  <div className="font-mono">{fmtDate(r.date_iso)}</div>
                  <div className="text-[#9AA3C2]">{r.time_label}</div>
                </td>
                <td className="p-3">
                  <span
                    className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${SPORT_COLOR[r.sport] ?? "#999"}20`, color: SPORT_COLOR[r.sport] ?? "#333" }}
                  >
                    {r.sport}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-bold text-[#1a1a2e]">{r.title}</div>
                  <div className="text-[11px] text-[#9AA3C2] truncate max-w-[280px]">{r.location}</div>
                </td>
                <td className="p-3 text-right tabular-nums">
                  <div className="text-sm">{r.filled} / {r.capacity}</div>
                  <div className="text-[10px] text-[#9AA3C2]">{fillPct} %</div>
                </td>
                <td className="p-3">
                  {!r.is_published ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                      draft
                    </span>
                  ) : r.is_past ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F0F2FA] text-[#5A6480]">
                      minulý
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                      live
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Link
                    href={`/admin/events/${r.id}`}
                    className="text-xs text-[#3B7CF4] hover:underline font-bold"
                  >
                    Editovat →
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
