import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GpxRouteMap from "@/components/community/GpxRouteMap";
import { MALAGA_ROUTES_V2 } from "@/data/malaga/routes";
import {
  TIER_LABEL,
  TIER_COLOR,
  TRAFFIC_LABEL,
  TRAFFIC_COLOR,
  FLAG_META,
} from "@/data/malaga/routes/types";

const SITE = "https://www.100dola.com";
const accent = "#E8431A";

export function generateStaticParams() {
  return MALAGA_ROUTES_V2.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = MALAGA_ROUTES_V2.find((x) => x.slug === slug);
  if (!r) return {};
  return {
    title: `${r.name_cs} — cyklotrasa z Malagy (${r.distance_km} km, ${r.ascent_m} m) | 100dola`,
    description: `${r.who_it_suits_cs} ${r.distance_km} km, ${r.ascent_m} m převýšení, obtížnost ${TIER_LABEL[r.tier]}. GPX ke stažení, mapa, výškový profil, voda a provoz na trase.`,
    alternates: { canonical: `/malaga/trasy/${r.slug}` },
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E2E6F3] bg-white p-3 text-center">
      <div className="text-lg font-black text-[#1a1a2e]">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mt-0.5">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#E2E6F3] pt-6 mt-6">
      <h2 className="text-lg font-black text-[#1a1a2e] mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default async function TrasaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = MALAGA_ROUTES_V2.find((x) => x.slug === slug);
  if (!r) notFound();

  const activeFlags = FLAG_META.filter((f) => r.flags[f.key]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ExerciseAction",
    name: r.name_cs,
    description: r.story_cs,
    distance: `${r.distance_km} km`,
    url: `${SITE}/malaga/trasy/${r.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main className="pt-20 bg-[#FAFAFA]">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 py-10 md:py-14">
          {/* Breadcrumb */}
          <div className="text-xs text-[#9AA3C2] mb-5">
            <Link href="/malaga" className="hover:text-[#1a1a2e]">100dola Malaga</Link>
            {" / "}
            <Link href="/malaga/trasy" className="hover:text-[#1a1a2e]">Trasy</Link>
            {" / "}
            <span className="text-[#5A6480]">{r.name_cs}</span>
          </div>

          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="text-[11px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full"
              style={{ background: TIER_COLOR[r.tier] }}
            >
              {TIER_LABEL[r.tier]} · DS {r.difficulty_score}
            </span>
            {activeFlags.map((f) => (
              <span key={f.key} className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#FFF1EA] text-[#B8460F]">
                {f.emoji} {f.label}
              </span>
            ))}
            {r.confidence !== "high" && (
              <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#FFF7ED] text-[#7A5615] border border-[#FBD38D]">
                ⚠ trasu projedeme v terénu
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] leading-tight mb-2">{r.name_cs}</h1>
          <p className="text-[#5A6480] leading-relaxed mb-6">{r.story_cs}</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <Stat label="vzdálenost" value={`${r.distance_km} km`} />
            <Stat label="převýšení" value={`${r.ascent_m} m`} />
            <Stat label="max výška" value={`${r.max_altitude_m} m`} />
            <Stat label="max sklon" value={`${r.max_gradient_pct} %`} />
          </div>

          {/* Mapa + profil + GPX */}
          {r.gpx ? (
            <GpxRouteMap gpxPath={r.gpx} accentColor={accent} startLabel={r.start.name} />
          ) : (
            <div className="rounded-xl h-52 flex items-center justify-center bg-[#F0F2FA] text-[#9AA3C2] text-sm">
              GPX připravujeme
            </div>
          )}

          {/* Komu sedne */}
          <Section title="Komu sedne">
            <p className="text-sm text-[#1a1a2e] leading-relaxed">{r.who_it_suits_cs}</p>
          </Section>

          {/* Provoz */}
          {r.traffic.length > 0 && (
            <Section title="Provoz na trase">
              <div className="space-y-2">
                {r.traffic.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span
                      className="mt-0.5 shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                      style={{ background: TRAFFIC_COLOR[t.level] }}
                    >
                      {TRAFFIC_LABEL[t.level]}
                    </span>
                    <span className="text-[#5A6480]">
                      <span className="font-semibold text-[#1a1a2e]">{t.from_km}–{t.to_km} km:</span> {t.note_cs}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Voda */}
          {r.water.length > 0 && (
            <Section title="Voda a doplnění">
              {r.longest_dry_stretch_km != null && (
                <div className="mb-3 inline-block text-xs font-bold px-3 py-1.5 rounded-full bg-[#FFF1EA] text-[#B8460F]">
                  💧 nejdelší úsek bez vody: ~{r.longest_dry_stretch_km} km
                </div>
              )}
              <ul className="space-y-1.5">
                {r.water.map((w, i) => (
                  <li key={i} className="text-sm text-[#5A6480]">
                    <span className="font-semibold text-[#1a1a2e]">{w.km != null ? `${w.km} km` : "—"}</span> · {w.name}
                    {w.reliable ? <span className="text-[#E8431A]"> ({w.reliable})</span> : null}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Kavárny */}
          {r.cafes.length > 0 && (
            <Section title="Kavárny a zastávky">
              <ul className="space-y-1.5">
                {r.cafes.map((c, i) => (
                  <li key={i} className="text-sm text-[#5A6480]">
                    <span className="font-semibold text-[#1a1a2e]">{c.name}</span> ({c.town})
                    {c.closed ? <span className="text-[#E8431A]"> — zavřeno: {c.closed}</span> : null}
                    {c.note_cs ? ` — ${c.note_cs}` : ""}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Stoupání */}
          {r.climbs.length > 0 && (
            <Section title="Stoupání">
              <div className="space-y-3">
                {r.climbs.map((cl, i) => (
                  <div key={i} className="rounded-xl border border-[#E2E6F3] bg-white p-4">
                    <div className="font-bold text-[#1a1a2e]">{cl.name} <span className="text-[#9AA3C2] font-normal text-sm">z {cl.from}</span></div>
                    <div className="text-sm text-[#5A6480] mt-1">
                      {[cl.length_km != null ? `${cl.length_km} km` : null, cl.avg_pct != null ? `⌀ ${cl.avg_pct} %` : null, cl.max_pct != null ? `max ${cl.max_pct} %` : null, cl.top_m != null ? `vrchol ${cl.top_m} m` : null].filter(Boolean).join(" · ")}
                    </div>
                    {cl.climbfinder_url && (
                      <a href={cl.climbfinder_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#3B7CF4] hover:underline mt-1 inline-block">
                        Detail na Climbfinder →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Bail-out */}
          {r.bailout.length > 0 && (
            <Section title="Když dojdou nohy (bail-out)">
              <ul className="space-y-1.5">
                {r.bailout.map((b, i) => (
                  <li key={i} className="text-sm text-[#5A6480]">
                    <span className="font-semibold text-[#1a1a2e]">{b.km != null ? `${b.km} km` : ""} {b.line ?? b.type}</span>
                    {b.station ? ` (${b.station})` : ""} — {b.note_cs}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Vítr, sezóna, výbava */}
          <Section title="Vítr, sezóna a výbava">
            <div className="space-y-2 text-sm text-[#5A6480]">
              {r.wind.best_direction_cs && <p><span className="font-semibold text-[#1a1a2e]">Vítr:</span> {r.wind.best_direction_cs}</p>}
              {r.best_time_of_day_cs && <p><span className="font-semibold text-[#1a1a2e]">Kdy vyrazit:</span> {r.best_time_of_day_cs}</p>}
              {r.season.note_cs && <p><span className="font-semibold text-[#1a1a2e]">Sezóna:</span> {r.season.note_cs}</p>}
              {r.gearing_cs && <p><span className="font-semibold text-[#1a1a2e]">Převody:</span> {r.gearing_cs}</p>}
              {r.tyres_cs && <p><span className="font-semibold text-[#1a1a2e]">Pláště:</span> {r.tyres_cs}</p>}
            </div>
          </Section>

          {/* Varování */}
          {r.warnings_cs.length > 0 && (
            <Section title="Na co si dát pozor">
              <ul className="space-y-1.5">
                {r.warnings_cs.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#1a1a2e]">
                    <span className="mt-0.5 shrink-0">⚠</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* CTA */}
          <div className="mt-10 rounded-2xl bg-[#1a0e08] p-6 md:p-8 text-white">
            <h2 className="text-xl font-black mb-2">Kolo tě čeká v Malaze</h2>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Tuhle trasu jedeš na svém kole od dveří — přivezeme ho a uskladníme, ty přiletíš s příručákem.
              Poradíme, kam podle formy, a když se něco pokazí, zavoláš a vyzvedneme tě.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/malaga" className="bg-[#E8431A] hover:bg-[#F05A2E] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition">
                Jak funguje 100dola Malaga →
              </Link>
              <Link href="/malaga/trasy" className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition">
                ← Všechny trasy
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-[#9AA3C2] mt-6 leading-relaxed">
            Metriky jsou spočítané ze stopy. Trasa je zatím naplánovaná přes routing engine —
            {" "}<strong>projedeme ji v terénu a ověříme</strong> (voda, povrch, provoz), pak sem doplníme reálné GPX a fotky.
            {r.sources.length > 0 && <> Zdroje: {r.sources.join(", ")}.</>}
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
