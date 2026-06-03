import "server-only";
import { unzipSync, gunzipSync } from "fflate";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseDmarcXml, aggregateReport, type ParsedDmarcReport } from "./parser";

/**
 * Pipeline: file (ZIP / GZ / raw XML) → parse → DB.
 * Vrátí počet úspěšně uložených reports.
 */
export interface IngestResult {
  successCount: number;
  duplicateCount: number;
  errors: string[];
}

export async function ingestDmarcFile(
  filename: string,
  buffer: Uint8Array,
  uploadedBy: string,
  sb?: SupabaseClient,
): Promise<IngestResult> {
  const client = sb ?? defaultSb();
  const xmlBlobs = extractXmlBlobs(filename, buffer);
  const errors: string[] = [];
  let success = 0;
  let dup = 0;

  for (const xml of xmlBlobs) {
    try {
      const parsed = parseDmarcXml(xml);
      const ok = await persistReport(client, parsed, xml, uploadedBy);
      if (ok === "inserted") success++;
      else if (ok === "duplicate") dup++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }

  return { successCount: success, duplicateCount: dup, errors };
}

/**
 * Rozbalí soubor — podporuje:
 *   • .zip (1+ XML uvnitř)
 *   • .gz (1 XML)
 *   • .xml (raw, vrátí buffer jako string)
 */
function extractXmlBlobs(filename: string, buffer: Uint8Array): string[] {
  const lower = filename.toLowerCase();
  // Magic byte detection (safer than extension)
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;
  const isGz = buffer[0] === 0x1f && buffer[1] === 0x8b;

  if (isZip || lower.endsWith(".zip")) {
    const unzipped = unzipSync(buffer);
    const xmls: string[] = [];
    for (const [name, data] of Object.entries(unzipped)) {
      if (name.toLowerCase().endsWith(".xml")) {
        xmls.push(new TextDecoder("utf-8").decode(data));
      }
    }
    return xmls;
  }

  if (isGz || lower.endsWith(".gz")) {
    const xml = new TextDecoder("utf-8").decode(gunzipSync(buffer));
    return [xml];
  }

  // Raw XML
  return [new TextDecoder("utf-8").decode(buffer)];
}

async function persistReport(
  sb: SupabaseClient,
  parsed: ParsedDmarcReport,
  rawXml: string,
  uploadedBy: string,
): Promise<"inserted" | "duplicate"> {
  const agg = aggregateReport(parsed);

  const { data, error } = await sb
    .from("dmarc_reports")
    .insert({
      org_name: parsed.org_name,
      org_email: parsed.org_email,
      report_id: parsed.report_id,
      date_range_begin: parsed.date_range_begin.toISOString(),
      date_range_end: parsed.date_range_end.toISOString(),
      policy_domain: parsed.policy_domain,
      policy_p: parsed.policy_p,
      policy_sp: parsed.policy_sp,
      policy_pct: parsed.policy_pct,
      policy_adkim: parsed.policy_adkim,
      policy_aspf: parsed.policy_aspf,
      total_count: agg.total_count,
      pass_count: agg.pass_count,
      fail_count: agg.fail_count,
      unique_source_ips: agg.unique_source_ips,
      raw_xml: rawXml.length < 100_000 ? rawXml : null,
      uploaded_by: uploadedBy,
    })
    .select("id")
    .single();

  if (error) {
    // Unique violation = duplicate (already imported)
    if (error.code === "23505") return "duplicate";
    throw new Error(`insert report: ${error.message}`);
  }

  const reportId = data.id as string;

  // Insert records
  const rows = parsed.records.map((r) => ({
    report_id: reportId,
    source_ip: r.source_ip,
    message_count: r.message_count,
    disposition: r.disposition,
    policy_evaluated_dkim: r.policy_evaluated_dkim,
    policy_evaluated_spf: r.policy_evaluated_spf,
    header_from: r.header_from,
    auth_dkim_domain: r.auth_dkim_domain,
    auth_dkim_selector: r.auth_dkim_selector,
    auth_dkim_result: r.auth_dkim_result,
    auth_spf_domain: r.auth_spf_domain,
    auth_spf_result: r.auth_spf_result,
    override_type: r.override_type,
    override_comment: r.override_comment,
  }));

  if (rows.length > 0) {
    const { error: recErr } = await sb.from("dmarc_records").insert(rows);
    if (recErr) throw new Error(`insert records: ${recErr.message}`);
  }

  return "inserted";
}

function defaultSb(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: "public" },
  });
}
