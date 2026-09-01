import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Admin · 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Card {
  href: string;
  label: string;
  description: string;
  emoji: string;
  count?: number | string;
  countLabel?: string;
  badge?: { text: string; color: string };
}

export default async function AdminHubPage() {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin");

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fetch counts in parallel pokud máme env vars
  let counts: {
    pendingOrders: number;
    pendingReviews: number;
    pendingStock: number;
    activeIsaacReg: number;
    recentDmarcReports: number;
    pricingProposals: number;
    cronFailures7d: number;
    newMessages: number;
  } = {
    pendingOrders: 0,
    pendingReviews: 0,
    pendingStock: 0,
    activeIsaacReg: 0,
    recentDmarcReports: 0,
    pricingProposals: 0,
    cronFailures7d: 0,
    newMessages: 0,
  };

  if (url && key) {
    const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    // eslint-disable-next-line react-hooks/purity
    const since30d = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    // eslint-disable-next-line react-hooks/purity
    const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [orders, reviews, stock, isaac, dmarc, pricing, cronFails, messages] = await Promise.all([
      sb.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "paid"]),
      sb.from("product_reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      sb.from("stock_notifications").select("id", { count: "exact", head: true }).is("notified_at", null).is("unsubscribed_at", null),
      sb.from("isaac_registrations").select("id", { count: "exact", head: true }).is("cancelled_at", null),
      sb.from("dmarc_reports").select("id", { count: "exact", head: true }).gte("date_range_end", since30d),
      sb.from("price_proposals").select("id", { count: "exact", head: true }).eq("status", "pending"),
      sb.from("cron_runs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("started_at", since7d),
      sb.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
    ]);

    counts = {
      pendingOrders: orders.count ?? 0,
      pendingReviews: reviews.count ?? 0,
      pendingStock: stock.count ?? 0,
      activeIsaacReg: isaac.count ?? 0,
      recentDmarcReports: dmarc.count ?? 0,
      pricingProposals: pricing.count ?? 0,
      cronFailures7d: cronFails.count ?? 0,
      newMessages: messages.count ?? 0,
    };
  }

  const cards: Card[] = [
    {
      href: "/admin/orders",
      label: "Objednávky",
      description: "Stav, faktury, platby, zrušení",
      emoji: "📦",
      count: counts.pendingOrders,
      countLabel: "aktivních",
    },
    {
      href: "/admin/prihlasky",
      label: "Přihlášky na akce",
      description: "Rychleby + Malaga — stav (zpracovává se / posláno / zaplaceno / nedořešeno), poznámky",
      emoji: "📝",
    },
    {
      href: "/admin/suppliers",
      label: "Dodavatelé",
      description: "ISAAC, FFWD, 4iiii, ALE — toggle import + web visibility, historie importů",
      emoji: "🏭",
    },
    {
      href: "/admin/reviews",
      label: "Recenze",
      description: "Schvalování zákaznických recenzí",
      emoji: "⭐",
      count: counts.pendingReviews,
      countLabel: "ke schválení",
      badge: counts.pendingReviews > 0 ? { text: "Pozor", color: "#FEF3C7" } : undefined,
    },
    {
      href: "/admin/stock-notifications",
      label: "Stock notifikace",
      description: "Kdo čeká na naskladnění — priority pro restock",
      emoji: "🔔",
      count: counts.pendingStock,
      countLabel: "pending",
    },
    {
      href: "/admin/pricing",
      label: "Cenový monitoring",
      description: "Heureka konkurence + schvalování návrhů úprav cen",
      emoji: "💰",
      count: counts.pricingProposals,
      countLabel: "návrhů",
    },
    {
      href: "/admin/dmarc",
      label: "DMARC",
      description: "E-mail security monitoring (pass rate, source IPs)",
      emoji: "📧",
      count: counts.recentDmarcReports,
      countLabel: "reportů (30d)",
    },
    {
      href: "/admin/isaac-test",
      label: "ISAAC test rezervace",
      description: "Test víkend rezervační systém",
      emoji: "🚴",
      count: counts.activeIsaacReg,
      countLabel: "aktivních",
    },
    {
      href: "/admin/strava",
      label: "Strava",
      description: "OAuth, klubové events, athlete management",
      emoji: "🏃",
    },
    {
      href: "/admin/ucto",
      label: "Fakturoid",
      description: "Účetnictví, faktury, vystavení nových",
      emoji: "🧾",
    },
    {
      href: "/admin/audit",
      label: "Audit log",
      description: "Kdo dělal co, kdy — přehled admin akcí",
      emoji: "🔍",
    },
    {
      href: "/admin/cron-monitoring",
      label: "Cron monitoring",
      description: "Healthcheck všech background jobs (runs, failures, stale)",
      emoji: "⏱️",
      count: counts.cronFailures7d,
      countLabel: "failů (7d)",
      badge: counts.cronFailures7d > 0 ? { text: "Fail", color: "#FEE2E2" } : undefined,
    },
    {
      href: "/admin/events",
      label: "Events (community)",
      description: "Editor eventů Open Miles Clinic — datum, kapacita, popis, foto. Frontend zatím čte z data/events.ts (swap přijde).",
      emoji: "📅",
    },
    {
      href: "/admin/newsletter",
      label: "Newsletter",
      description: "Vytvořit/editovat newsletter kampaň + test-send. „Send to all“ zatím čeká na subscriber model s GDPR opt-inem.",
      emoji: "✉️",
    },
    {
      href: "/admin/messages",
      label: "Inbox (chat widget)",
      description: "Zprávy z bubliny Napiš nám. Každá obsahuje AI návrh odpovědi (Claude Haiku).",
      emoji: "💬",
      count: counts.newMessages,
      countLabel: "nových",
      badge: counts.newMessages > 0 ? { text: "New", color: "#FEF3C7" } : undefined,
    },
    {
      href: "/admin/bookings",
      label: "Servis rezervace",
      description: "Servis / bikefit / detailing rezervace ze /sport/servis. Confirm → completed flow.",
      emoji: "🔧",
    },
    {
      href: "/admin/returns",
      label: "Vrácení & reklamace",
      description: "Žádosti o vrácení zboží — odstoupení, reklamace, poškození. Schválit → přijmout → refund flow.",
      emoji: "↩️",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-2">
            <h1 className="text-3xl font-black text-[#1a1a2e]">Administrace</h1>
            <div className="text-xs text-[#9AA3C2]">
              Přihlášen: <strong>{ctx.email}</strong>{" "}
              <span className="px-1.5 py-0.5 rounded-full bg-[#F0F2FA] text-[10px] font-bold">
                {ctx.via}
              </span>
            </div>
          </div>
          <p className="text-sm text-[#5A6480] mb-6">
            Centrální přístup ke všem nástrojům. Počty se aktualizují živě.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="block bg-white rounded-2xl border border-[#E2E6F3] p-5 hover:border-[#3B7CF4]/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-3xl">{card.emoji}</div>
                  {card.badge && (
                    <span
                      className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full text-[#92400E]"
                      style={{ backgroundColor: card.badge.color }}
                    >
                      {card.badge.text}
                    </span>
                  )}
                </div>
                <h2 className="text-base font-black text-[#1a1a2e] mb-1 group-hover:text-[#3B7CF4] transition-colors">
                  {card.label}
                </h2>
                <p className="text-xs text-[#5A6480] leading-relaxed line-clamp-2">
                  {card.description}
                </p>
                {card.count !== undefined && (
                  <div className="mt-3 pt-3 border-t border-[#F0F2FA] flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-[#1a1a2e] tabular-nums">
                      {card.count}
                    </span>
                    <span className="text-[10px] text-[#9AA3C2]">{card.countLabel}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-[#E2E6F3]">
            <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Cron jobs status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {[
                { name: "Supplier feed import", schedule: "03:00 UTC" },
                { name: "DMARC health check", schedule: "04:00 UTC" },
                { name: "Stock notify", schedule: "09:00 UTC" },
                { name: "Sync paid invoices", schedule: "06:00 UTC + 15min" },
                { name: "Orders cleanup", schedule: "08:00 UTC" },
                { name: "Price watchlist", schedule: "06:00 UTC · gated" },
                { name: "IndexNow ping", schedule: "Po 05:00 UTC" },
                { name: "ISAAC test summary", schedule: "04:00 + 20:00 UTC" },
                { name: "E2E smoke test (GH Actions)", schedule: "06:00 UTC + push" },
              ].map((c) => (
                <div key={c.name} className="bg-white rounded-lg border border-[#E2E6F3] p-2">
                  <div className="font-bold text-[#1a1a2e] text-[11px]">{c.name}</div>
                  <div className="text-[10px] font-mono text-[#9AA3C2]">{c.schedule}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
