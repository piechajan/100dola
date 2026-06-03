import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

export const metadata: Metadata = {
  title: "Admin · Cron monitoring — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Run {
  id: string;
  cron_name: string;
  schedule: string | null;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  status: "running" | "success" | "failed" | "no_op" | "gated";
  error_message: string | null;
  result_json: Record<string, unknown> | null;
}

interface CronDef {
  path: string;
  schedule: string;
}

interface CronCard {
  name: string;
  schedule: string;
  path: string;
  lastRun: Run | null;
  recentRuns: Run[];
  hasFailures: boolean;
  successRate7d: number; // 0-100
  isStale: boolean;
}

function cronNameFromPath(p: string): string {
  // /api/cron/stock-notify → stock-notify
  return p.replace(/^\/api\/cron\//, "");
}

function fmtDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusPill(s: Run["status"]): { bg: string; fg: string; label: string } {
  switch (s) {
    case "success":
      return { bg: "#D1FAE5", fg: "#065F46", label: "OK" };
    case "no_op":
      return { bg: "#E0F2FE", fg: "#075985", label: "no-op" };
    case "gated":
      return { bg: "#F0F2FA", fg: "#5A6480", label: "gated" };
    case "failed":
      return { bg: "#FEE2E2", fg: "#991B1B", label: "FAIL" };
    case "running":
      return { bg: "#FEF3C7", fg: "#92400E", label: "running" };
  }
}

export default async function AdminCronMonitoringPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/cron-monitoring");

  // Load defined cron schedule from vercel.json
  let defined: CronDef[] = [];
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "vercel.json"), "utf-8");
    const json = JSON.parse(raw) as { crons?: CronDef[] };
    defined = json.crons ?? [];
  } catch {
    defined = [];
  }

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

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const since = new Date(nowMs - 14 * 24 * 3600 * 1000).toISOString();
  const { data: runs } = await sb
    .from("cron_runs")
    .select("*")
    .gte("started_at", since)
    .order("started_at", { ascending: false })
    .limit(2000);

  const allRuns = (runs ?? []) as Run[];

  // Group by cron name
  const byName = new Map<string, Run[]>();
  for (const r of allRuns) {
    if (!byName.has(r.cron_name)) byName.set(r.cron_name, []);
    byName.get(r.cron_name)!.push(r);
  }

  // Build per-cron cards (one per defined schedule)
  const cards: CronCard[] = defined.map((def) => {
    const name = cronNameFromPath(def.path);
    const all = byName.get(name) ?? [];
    const last = all[0] ?? null;
    const recent7d = all.filter(
      (r) => new Date(r.started_at).getTime() > nowMs - 7 * 24 * 3600 * 1000,
    );
    const hasFailures = recent7d.some((r) => r.status === "failed");
    const success = recent7d.filter((r) => r.status === "success" || r.status === "no_op").length;
    const successRate = recent7d.length > 0 ? (success / recent7d.length) * 100 : 0;
    const isStale =
      !last ||
      nowMs - new Date(last.started_at).getTime() > 36 * 3600 * 1000;
    return {
      name,
      schedule: def.schedule,
      path: def.path,
      lastRun: last,
      recentRuns: all.slice(0, 5),
      hasFailures,
      successRate7d: successRate,
      isStale,
    };
  });

  // Orphan runs — recorded for cron that's not in vercel.json (renamed/removed)
  const definedNames = new Set(cards.map((c) => c.name));
  const orphans = Array.from(byName.entries()).filter(([n]) => !definedNames.has(n));

  const totalFailures = allRuns.filter((r) => r.status === "failed").length;
  const totalRuns = allRuns.length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <h1 className="text-3xl font-black text-[#1a1a2e] mb-2">Cron monitoring</h1>
          <p className="text-sm text-[#5A6480] mb-6">
            {defined.length} jobs · {totalRuns} runs / 14 dní · {totalFailures} failů
          </p>

          {/* Summary tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Tile label="Jobs definováno" value={defined.length.toString()} />
            <Tile
              label="Failů / 14 d"
              value={totalFailures.toString()}
              tone={totalFailures > 0 ? "red" : "green"}
            />
            <Tile
              label="Stale jobs"
              value={cards.filter((c) => c.isStale).length.toString()}
              tone={cards.some((c) => c.isStale) ? "amber" : "green"}
            />
            <Tile label="Orphan" value={orphans.length.toString()} tone={orphans.length > 0 ? "amber" : "neutral"} />
          </div>

          {/* Per-cron cards */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Aktivní crony</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cards.map((c) => (
                <CronCardView key={`${c.name}-${c.schedule}`} card={c} />
              ))}
            </div>
          </section>

          {orphans.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Orphan runs</h2>
              <p className="text-xs text-[#5A6480] mb-3">
                Cron logy zaznamenané pro jobs, které nejsou v <code>vercel.json</code>. Možná zrušeno nebo přejmenováno.
              </p>
              <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                    <tr>
                      <th className="text-left p-3 font-bold">Cron name</th>
                      <th className="text-right p-3 font-bold">Runs (14d)</th>
                      <th className="text-left p-3 font-bold">Poslední</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orphans.map(([n, rs]) => (
                      <tr key={n} className="border-t border-[#E2E6F3]">
                        <td className="p-3 font-mono text-xs">{n}</td>
                        <td className="p-3 text-right tabular-nums">{rs.length}</td>
                        <td className="p-3 text-xs">{rs[0] ? fmtTime(rs[0].started_at) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Recent fails */}
          <section className="mb-8">
            <h2 className="text-xl font-black text-[#1a1a2e] mb-3">Posledních 20 failů</h2>
            <div className="bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F9FF] text-[10px] uppercase tracking-wider text-[#9AA3C2]">
                  <tr>
                    <th className="text-left p-3 font-bold">Kdy</th>
                    <th className="text-left p-3 font-bold">Cron</th>
                    <th className="text-left p-3 font-bold">Error</th>
                    <th className="text-right p-3 font-bold">Trvání</th>
                  </tr>
                </thead>
                <tbody>
                  {allRuns
                    .filter((r) => r.status === "failed")
                    .slice(0, 20)
                    .map((r) => (
                      <tr key={r.id} className="border-t border-[#E2E6F3]">
                        <td className="p-3 text-xs">{fmtTime(r.started_at)}</td>
                        <td className="p-3 font-mono text-xs">{r.cron_name}</td>
                        <td className="p-3 text-xs text-red-700 max-w-[400px] truncate">
                          {r.error_message ?? "—"}
                        </td>
                        <td className="p-3 text-right text-xs tabular-nums">{fmtDuration(r.duration_ms)}</td>
                      </tr>
                    ))}
                  {allRuns.filter((r) => r.status === "failed").length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-[#9AA3C2] text-sm">
                        Žádné failure za 14 dní.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Tile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const color =
    tone === "green"
      ? "#065F46"
      : tone === "red"
        ? "#991B1B"
        : tone === "amber"
          ? "#92400E"
          : "#1a1a2e";
  return (
    <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
      <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">{label}</div>
      <div className="text-2xl font-black" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function CronCardView({ card }: { card: CronCard }) {
  const last = card.lastRun;
  const pill = last ? statusPill(last.status) : null;
  const successColor =
    card.successRate7d >= 99
      ? "#065F46"
      : card.successRate7d >= 80
        ? "#92400E"
        : "#991B1B";

  return (
    <div className="bg-white rounded-xl border border-[#E2E6F3] p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-mono text-sm font-bold text-[#1a1a2e]">{card.name}</div>
          <div className="text-[11px] text-[#9AA3C2] font-mono">{card.schedule}</div>
        </div>
        {pill && (
          <span
            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: pill.bg, color: pill.fg }}
          >
            {pill.label}
          </span>
        )}
      </div>

      {last ? (
        <div className="text-xs text-[#5A6480] space-y-1 mb-3">
          <div>
            Poslední běh: <strong>{fmtTime(last.started_at)}</strong> · {fmtDuration(last.duration_ms)}
          </div>
          {card.isStale && (
            <div className="text-amber-700 font-semibold">
              ⚠ Stale — žádný run za 36+ h
            </div>
          )}
          {last.error_message && (
            <div className="text-red-700 max-w-full truncate">⚠ {last.error_message}</div>
          )}
        </div>
      ) : (
        <div className="text-xs text-amber-700 mb-3">
          ⚠ Nikdy nezaznamenán run (cron nebyl ještě instrumentován nebo neběžel).
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-[#9AA3C2]">
        <span>
          Last 7d:{" "}
          <span className="font-bold" style={{ color: successColor }}>
            {card.successRate7d.toFixed(0)} %
          </span>{" "}
          OK ({card.recentRuns.length} runs)
        </span>
        {card.hasFailures && <span className="text-red-700 font-bold">• failure</span>}
      </div>

      {card.recentRuns.length > 0 && (
        <div className="mt-3 flex gap-1">
          {card.recentRuns.map((r) => {
            const p = statusPill(r.status);
            return (
              <div
                key={r.id}
                title={`${fmtTime(r.started_at)} · ${p.label} · ${fmtDuration(r.duration_ms)}`}
                className="w-2 h-6 rounded-sm"
                style={{ backgroundColor: p.bg, border: `1px solid ${p.fg}40` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
