import "server-only";
import { XMLParser } from "fast-xml-parser";

export interface ParsedDmarcReport {
  org_name: string;
  org_email: string | null;
  report_id: string;
  date_range_begin: Date;
  date_range_end: Date;
  policy_domain: string;
  policy_p: string | null;
  policy_sp: string | null;
  policy_pct: number | null;
  policy_adkim: string | null;
  policy_aspf: string | null;
  records: ParsedDmarcRecord[];
}

export interface ParsedDmarcRecord {
  source_ip: string;
  message_count: number;
  disposition: string | null;
  policy_evaluated_dkim: string | null;
  policy_evaluated_spf: string | null;
  header_from: string | null;
  auth_dkim_domain: string | null;
  auth_dkim_selector: string | null;
  auth_dkim_result: string | null;
  auth_spf_domain: string | null;
  auth_spf_result: string | null;
  override_type: string | null;
  override_comment: string | null;
}

const parser = new XMLParser({
  attributeNamePrefix: "@_",
  ignoreAttributes: false,
  parseAttributeValue: false,
  parseTagValue: false,
});

/**
 * Parse RFC 7489 DMARC aggregate report XML.
 * Vrátí structured data připravená pro DB insert.
 */
export function parseDmarcXml(xml: string): ParsedDmarcReport {
  const obj = parser.parse(xml) as { feedback?: unknown };
  const feedback = obj.feedback as Record<string, unknown> | undefined;
  if (!feedback) throw new Error("DMARC XML: missing <feedback> root");

  const meta = (feedback.report_metadata ?? {}) as Record<string, unknown>;
  const policy = (feedback.policy_published ?? {}) as Record<string, unknown>;
  const dateRange = (meta.date_range ?? {}) as Record<string, unknown>;

  const beginSec = Number(dateRange.begin ?? 0);
  const endSec = Number(dateRange.end ?? 0);

  const recordsRaw = asArray(feedback.record);
  const records: ParsedDmarcRecord[] = recordsRaw.map((rec) => {
    const r = rec as Record<string, unknown>;
    const row = (r.row ?? {}) as Record<string, unknown>;
    const policyEval = (row.policy_evaluated ?? {}) as Record<string, unknown>;
    const reason = ((policyEval.reason ?? {}) as Record<string, unknown>) ?? {};
    const identifiers = (r.identifiers ?? {}) as Record<string, unknown>;
    const authResults = (r.auth_results ?? {}) as Record<string, unknown>;
    const dkim = (asArray(authResults.dkim)[0] ?? {}) as Record<string, unknown>;
    const spf = (asArray(authResults.spf)[0] ?? {}) as Record<string, unknown>;

    return {
      source_ip: String(row.source_ip ?? ""),
      message_count: Number(row.count ?? 0),
      disposition: asString(policyEval.disposition),
      policy_evaluated_dkim: asString(policyEval.dkim),
      policy_evaluated_spf: asString(policyEval.spf),
      header_from: asString(identifiers.header_from),
      auth_dkim_domain: asString(dkim.domain),
      auth_dkim_selector: asString(dkim.selector),
      auth_dkim_result: asString(dkim.result),
      auth_spf_domain: asString(spf.domain),
      auth_spf_result: asString(spf.result),
      override_type: asString(reason.type),
      override_comment: asString(reason.comment),
    };
  });

  return {
    org_name: String(meta.org_name ?? "unknown"),
    org_email: asString(meta.email),
    report_id: String(meta.report_id ?? ""),
    date_range_begin: new Date(beginSec * 1000),
    date_range_end: new Date(endSec * 1000),
    policy_domain: String(policy.domain ?? ""),
    policy_p: asString(policy.p),
    policy_sp: asString(policy.sp),
    policy_pct: policy.pct !== undefined ? Number(policy.pct) : null,
    policy_adkim: asString(policy.adkim),
    policy_aspf: asString(policy.aspf),
    records,
  };
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}
function asString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  return String(v);
}

/** Pre-computed aggregations pro DB. */
export function aggregateReport(report: ParsedDmarcReport): {
  total_count: number;
  pass_count: number;
  fail_count: number;
  unique_source_ips: number;
} {
  let total = 0;
  let pass = 0;
  let fail = 0;
  const ips = new Set<string>();
  for (const r of report.records) {
    total += r.message_count;
    ips.add(r.source_ip);
    const dkimPass = r.policy_evaluated_dkim === "pass";
    const spfPass = r.policy_evaluated_spf === "pass";
    if (dkimPass && spfPass) pass += r.message_count;
    else fail += r.message_count;
  }
  return {
    total_count: total,
    pass_count: pass,
    fail_count: fail,
    unique_source_ips: ips.size,
  };
}
