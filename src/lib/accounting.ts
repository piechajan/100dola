// Per-project accounting aggregations — Phase B dashboard.
//
// Data source: Fakturoid API přímo (vždy fresh). V budoucnu lze přidat
// Supabase `invoices` cache fallback pokud bude potřeba.

import "server-only";

import { listInvoices, type FakturoidInvoice, isFakturoidConfigured } from "./fakturoid";

export type ProjectId = "sport" | "lab" | "malaga" | "omc";

export const PROJECTS: { id: ProjectId; label: string; tag: string; color: string }[] = [
  { id: "sport", label: "100dola sport", tag: "100dola-sport", color: "#3B7CF4" },
  { id: "malaga", label: "100dola Malaga", tag: "100dola-malaga", color: "#E8431A" },
  { id: "lab", label: "100dola Lab", tag: "100dola-lab", color: "#1F4937" },
  { id: "omc", label: "Open Miles Clinic", tag: "100dola-omc", color: "#2EAA6E" },
];

export function getProject(id: ProjectId) {
  return PROJECTS.find((p) => p.id === id)!;
}

export interface ProjectStats {
  projectId: ProjectId;
  invoiceCount: number;
  paidCount: number;
  unpaidCount: number;
  revenueTotal: number;
  revenuePaid: number;
  revenueUnpaid: number;
  averageInvoice: number;
}

export interface MonthBucket {
  /** Format YYYY-MM */
  month: string;
  /** Revenue per project ID (with VAT, paid + unpaid). */
  perProject: Record<ProjectId, number>;
  /** Total across all projects. */
  total: number;
}

export interface AccountingOverview {
  /** Period filter applied. */
  since: string;
  until: string;
  /** Stats per project (4 entries). */
  projectStats: ProjectStats[];
  /** Monthly buckets, oldest first. */
  monthlyBuckets: MonthBucket[];
  /** Top-level KPIs. */
  totals: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
    invoiceCount: number;
  };
  /** Latest 10 invoices for table preview. */
  recentInvoices: Array<{
    fakturoidId: number;
    number: string;
    project: ProjectId | "uncategorized";
    customer: string;
    total: number;
    status: string;
    issuedOn: string;
    htmlUrl: string;
    pdfUrl: string;
  }>;
  isConfigured: boolean;
}

function parseAmount(s: string | number | null | undefined): number {
  if (s === null || s === undefined) return 0;
  return typeof s === "string" ? parseFloat(s) : s;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7); // YYYY-MM
}

function projectFromTags(tags: string[]): ProjectId | null {
  for (const p of PROJECTS) {
    if (tags.includes(p.tag)) return p.id;
  }
  return null;
}

/**
 * Načte všechny faktury za období + agreguje per-project a per-month.
 *
 * @param year volitelné — pokud zadáno, period bude [year-01-01 .. year-12-31].
 *             Pokud ne, period bude posledních 12 měsíců.
 */
export async function getAccountingOverview(year?: number): Promise<AccountingOverview> {
  if (!isFakturoidConfigured()) {
    return emptyOverview("Fakturoid není nakonfigurovaný");
  }

  const today = new Date();
  let sinceDate: Date;
  let untilDate: Date;

  if (year) {
    sinceDate = new Date(year, 0, 1);
    untilDate = new Date(year, 11, 31);
  } else {
    // Posledních 12 měsíců
    untilDate = today;
    sinceDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  }

  const since = sinceDate.toISOString().slice(0, 10);
  const until = untilDate.toISOString().slice(0, 10);

  let invoices: FakturoidInvoice[] = [];
  try {
    invoices = await listInvoices({ since, until, maxPages: 50 });
  } catch (e) {
    console.error("[accounting] listInvoices failed:", e);
    return emptyOverview("Chyba načtení z Fakturoidu");
  }

  // Init project stats
  const projectStatsMap: Record<ProjectId, ProjectStats> = Object.fromEntries(
    PROJECTS.map((p) => [
      p.id,
      {
        projectId: p.id,
        invoiceCount: 0,
        paidCount: 0,
        unpaidCount: 0,
        revenueTotal: 0,
        revenuePaid: 0,
        revenueUnpaid: 0,
        averageInvoice: 0,
      },
    ]),
  ) as Record<ProjectId, ProjectStats>;

  // Init monthly buckets
  const buckets: Record<string, MonthBucket> = {};
  const monthIter = new Date(sinceDate);
  while (monthIter <= untilDate) {
    const key = monthIter.toISOString().slice(0, 7);
    buckets[key] = {
      month: key,
      perProject: { sport: 0, malaga: 0, lab: 0, omc: 0 },
      total: 0,
    };
    monthIter.setMonth(monthIter.getMonth() + 1);
  }

  let totalInvoiceCount = 0;

  // Aggregate
  for (const inv of invoices) {
    const projectId = projectFromTags(inv.tags || []);
    if (!projectId) continue; // skip uncategorized

    const amount = parseAmount(inv.total);
    const month = monthKey(inv.issued_on);
    const stats = projectStatsMap[projectId];

    stats.invoiceCount++;
    stats.revenueTotal += amount;
    if (inv.status === "paid") {
      stats.paidCount++;
      stats.revenuePaid += amount;
    } else if (inv.status !== "cancelled" && inv.status !== "uncollectible") {
      stats.unpaidCount++;
      stats.revenueUnpaid += amount;
    }

    if (buckets[month]) {
      buckets[month].perProject[projectId] += amount;
      buckets[month].total += amount;
    }

    totalInvoiceCount++;
  }

  // Average invoice per project
  for (const stats of Object.values(projectStatsMap)) {
    stats.averageInvoice = stats.invoiceCount > 0 ? stats.revenueTotal / stats.invoiceCount : 0;
  }

  // KPIs
  const thisMonthKey = today.toISOString().slice(0, 7);
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);
  const thisMonth = buckets[thisMonthKey]?.total || 0;
  const lastMonth = buckets[lastMonthKey]?.total || 0;
  const thisYear = Object.entries(buckets)
    .filter(([k]) => k.startsWith(String(today.getFullYear())))
    .reduce((sum, [, b]) => sum + b.total, 0);
  const lastYear = year
    ? 0
    : 0; // computed only if year requested separately

  // Recent invoices (last 10 by issued_on)
  const recent = [...invoices]
    .sort((a, b) => b.issued_on.localeCompare(a.issued_on))
    .slice(0, 10)
    .map((inv) => ({
      fakturoidId: inv.id,
      number: inv.number,
      project: (projectFromTags(inv.tags || []) || "uncategorized") as ProjectId | "uncategorized",
      customer: "—", // Fakturoid invoice nevrátí customer name v list response — bylo by potřeba subjects fetch
      total: parseAmount(inv.total),
      status: inv.status,
      issuedOn: inv.issued_on,
      htmlUrl: inv.html_url,
      pdfUrl: inv.pdf_url,
    }));

  return {
    since,
    until,
    projectStats: Object.values(projectStatsMap),
    monthlyBuckets: Object.values(buckets).sort((a, b) => a.month.localeCompare(b.month)),
    totals: {
      thisMonth,
      lastMonth,
      thisYear,
      lastYear,
      invoiceCount: totalInvoiceCount,
    },
    recentInvoices: recent,
    isConfigured: true,
  };
}

function emptyOverview(reason: string): AccountingOverview {
  console.log("[accounting] empty overview:", reason);
  return {
    since: "",
    until: "",
    projectStats: PROJECTS.map((p) => ({
      projectId: p.id,
      invoiceCount: 0,
      paidCount: 0,
      unpaidCount: 0,
      revenueTotal: 0,
      revenuePaid: 0,
      revenueUnpaid: 0,
      averageInvoice: 0,
    })),
    monthlyBuckets: [],
    totals: { thisMonth: 0, lastMonth: 0, thisYear: 0, lastYear: 0, invoiceCount: 0 },
    recentInvoices: [],
    isConfigured: isFakturoidConfigured(),
  };
}
