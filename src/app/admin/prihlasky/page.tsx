import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getSupabase,
  isSupabaseConfigured,
  type EventSignupRow,
  type EventSignupMemberRow,
} from "@/lib/supabase";
import { events } from "@/data/events";
import { SIGNUP_STATUSES, SIGNUP_STATUS_META, type SignupStatus } from "@/data/signup-status";
import { malagaSummaryLines, type MalagaSignupOptions } from "@/data/malaga-signup";
import { stayLabel, formatNights } from "@/data/events-signup";
import SignupStatusEditor from "@/components/admin/SignupStatusEditor";
import FeedbackTestButton from "@/components/admin/FeedbackTestButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · Přihlášky — 100dola",
  robots: { index: false, follow: false },
};

type Row = EventSignupRow & { event_signup_members: EventSignupMemberRow[] };

function eventTitle(slug: string): string {
  return events.find((e) => e.slug === slug)?.title ?? slug;
}

function summaryLines(r: Row): { label: string; value: string }[] {
  if (r.signup_kind === "malaga") {
    return malagaSummaryLines((r.options ?? {}) as unknown as MalagaSignupOptions);
  }
  const lines: { label: string; value: string }[] = [];
  if (r.stay_type) lines.push({ label: "Pobyt", value: stayLabel(r.stay_type) });
  const nights = formatNights(r.nights_from, r.nights_to);
  if (nights) lines.push({ label: "Termín", value: nights });
  return lines;
}

export default async function PrihlaskyAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ stav?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/prihlasky");

  let rows: Row[] = [];
  if (isSupabaseConfigured()) {
    const sb = getSupabase();
    const { data } = await sb
      .from("event_signups")
      .select("*, event_signup_members(*)")
      .order("registered_at", { ascending: false });
    rows = (data ?? []) as Row[];
  }

  const sp = await searchParams;
  const filter = sp?.stav && SIGNUP_STATUSES.includes(sp.stav as SignupStatus) ? sp.stav : "";
  const filtered = filter ? rows.filter((r) => r.status === filter) : rows;

  const counts = SIGNUP_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = rows.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-[#FAFBFF]">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-[#9AA3C2]">
              <Link href="/admin" className="hover:text-[#1a1a2e]">Admin</Link> / Přihlášky
            </div>
            <span className="text-xs text-[#9AA3C2]">{ctx.email}</span>
          </div>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-[#1a1a2e] mb-1">Přihlášky na akce</h1>
              <p className="text-sm text-[#5A6480]">
                Rychleby (skupinové) i Malaga (prodejní). Změň stav a přidej poznámku, co je potřeba dořešit.
              </p>
            </div>
            <FeedbackTestButton />
          </div>

          {/* Filtr stavů */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href="/admin/prihlasky"
              className="px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: !filter ? "#1a1a2e" : "#fff",
                color: !filter ? "#fff" : "#5A6480",
                borderColor: "#E2E6F3",
              }}
            >
              Vše ({rows.length})
            </Link>
            {SIGNUP_STATUSES.map((s) => {
              const meta = SIGNUP_STATUS_META[s];
              const active = filter === s;
              return (
                <Link
                  key={s}
                  href={`/admin/prihlasky?stav=${s}`}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: active ? meta.fg : meta.bg,
                    color: active ? "#fff" : meta.fg,
                    borderColor: "transparent",
                  }}
                >
                  {meta.label} ({counts[s] ?? 0})
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center text-[#9AA3C2]">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-semibold">Žádné přihlášky {filter ? "v tomto stavu" : "zatím"}.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => {
                const meta = SIGNUP_STATUS_META[r.status] ?? SIGNUP_STATUS_META.new;
                const lines = summaryLines(r);
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-[#E2E6F3] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        {r.public_consent && r.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={r.photo_url} alt={r.lead_name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#EEF1F8] flex items-center justify-center text-sm font-black text-[#9AA3C2] shrink-0">
                            {r.lead_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-black text-[#1a1a2e] flex items-center gap-2 flex-wrap">
                            {r.lead_name}
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: r.signup_kind === "malaga" ? "#FFE3D6" : "#DDF3E7", color: r.signup_kind === "malaga" ? "#B8460F" : "#1E7A4D" }}
                            >
                              {r.signup_kind === "malaga" ? "Malaga" : "Skupina"}
                            </span>
                          </div>
                          <div className="text-xs text-[#5A6480] mt-0.5">
                            {r.lead_email} · {r.lead_phone}
                          </div>
                          <div className="text-xs text-[#9AA3C2] mt-0.5">
                            {eventTitle(r.event_slug)} · {r.party_size} {r.party_size === 1 ? "osoba" : "osob"} ·{" "}
                            {new Date(r.registered_at).toLocaleDateString("cs-CZ")}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0"
                        style={{ backgroundColor: meta.bg, color: meta.fg }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Souhrn poptávky */}
                      <div>
                        <table className="w-full text-xs">
                          <tbody>
                            {lines.map((l, i) => (
                              <tr key={i} className="border-b border-[#F0F2FA] last:border-0">
                                <td className="py-1.5 pr-3 text-[#9AA3C2] align-top w-40">{l.label}</td>
                                <td className="py-1.5 font-semibold text-[#1a1a2e]">{l.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {r.event_signup_members.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-[#9AA3C2]">Členové: </span>
                            <span className="text-[#1a1a2e]">
                              {r.event_signup_members
                                .sort((a, b) => a.position - b.position)
                                .map((m) => m.name + (m.phone || m.email ? ` (${[m.phone, m.email].filter(Boolean).join(", ")})` : ""))
                                .join(" · ")}
                            </span>
                          </div>
                        )}
                        {r.note && (
                          <div className="mt-2 text-xs">
                            <span className="text-[#9AA3C2]">Pozn. zákazníka: </span>
                            <span className="text-[#1a1a2e]">{r.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Admin editor */}
                      <div className="md:border-l md:border-[#F0F2FA] md:pl-4">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">Stav & poznámka</div>
                        <SignupStatusEditor id={r.id} currentStatus={r.status} currentNote={r.admin_note} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
