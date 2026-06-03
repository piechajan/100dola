/**
 * Cron execution monitoring — wrap cron handler so každý běh
 * loguje start/end/duration/status/result do `cron_runs`.
 *
 * Usage:
 *   export const GET = withCronLog('stock-notify', '0 9 * * *', async () => {
 *     // ... cron logic ...
 *     return { ok: true, sent: 5 };
 *   });
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type CronStatus = "success" | "failed" | "no_op" | "gated";

export interface CronResult {
  status?: CronStatus;        // defaultně "success"; "no_op" když nebyla žádná práce; "gated" když flag off
  // Volné pole — counts, ids zpracovaných items. Půjde do result_json.
  [key: string]: unknown;
}

function getSb() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function logStart(cronName: string, schedule: string): Promise<string | null> {
  const sb = getSb();
  if (!sb) return null;
  const { data } = await sb
    .from("cron_runs")
    .insert({ cron_name: cronName, schedule, status: "running" })
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

async function logFinish(
  runId: string | null,
  status: CronStatus,
  startedAt: number,
  errorMessage: string | null,
  resultJson: Record<string, unknown> | null,
): Promise<void> {
  if (!runId) return;
  const sb = getSb();
  if (!sb) return;
  const duration = Date.now() - startedAt;
  await sb
    .from("cron_runs")
    .update({
      finished_at: new Date().toISOString(),
      duration_ms: duration,
      status,
      error_message: errorMessage,
      result_json: resultJson,
    })
    .eq("id", runId);
}

export function withCronLog<TBody extends CronResult>(
  cronName: string,
  schedule: string,
  handler: () => Promise<TBody>,
): () => Promise<NextResponse> {
  return async () => {
    const startedAt = Date.now();
    const runId = await logStart(cronName, schedule);
    try {
      const result = await handler();
      const status: CronStatus = result.status ?? "success";
      // Strip "status" from result_json — uloženo zvlášť do sloupce
      const { status: _omit, ...rest } = result;
      void _omit;
      await logFinish(runId, status, startedAt, null, rest as Record<string, unknown>);
      return NextResponse.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await logFinish(runId, "failed", startedAt, message, null);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}

/**
 * Non-invasive variant — handler vrací Response/NextResponse přímo.
 * Logger inspektuje response.status pro success/fail a HTTP status uloží
 * do result_json. Vhodné když cron handler je už komplexní a refactor
 * by byl riskantní (orders-cleanup, sync-paid-invoices, ...).
 *
 * Usage:
 *   export async function GET(req) {
 *     // auth check…
 *     return logCronRun("orders-cleanup", "0 8 * * *", async () => {
 *       // …existing body that returns NextResponse…
 *     });
 *   }
 */
export async function logCronRun<T extends Response>(
  cronName: string,
  schedule: string,
  handler: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now();
  const runId = await logStart(cronName, schedule);
  try {
    const result = await handler();
    // Handler může vrátit response s X-Cron-Status: no_op|gated|failed pro nuance
    const headerStatus = result.headers.get("x-cron-status") as CronStatus | null;
    const validStatuses: CronStatus[] = ["success", "failed", "no_op", "gated"];
    const status: CronStatus =
      headerStatus && validStatuses.includes(headerStatus)
        ? headerStatus
        : result.ok
          ? "success"
          : "failed";
    await logFinish(
      runId,
      status,
      startedAt,
      status === "failed" ? `HTTP ${result.status}` : null,
      { httpStatus: result.status },
    );
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logFinish(runId, "failed", startedAt, message, null);
    throw err;
  }
}
