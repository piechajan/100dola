import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getPublishedSocialRides, getSocialRideBySlug } from "@/data/social-rides";
import { COMMUNITY_ROUTES } from "@/data/community-routes";
import { breadcrumbSchema, faqPageSchema } from "@/lib/seo/schema-helpers";

const INSTAGRAM = "https://www.instagram.com/100dolasport.cz/";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedSocialRides().map((r) => ({ mesto: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mesto: string }>;
}): Promise<Metadata> {
  const { mesto } = await params;
  const r = getSocialRideBySlug(mesto);
  if (!r || !r.published) return { title: "Social rides — 100dola sport" };
  const url = `/social-rides/${r.slug}`;
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    keywords: r.keywords,
    alternates: { canonical: url },
    openGraph: { title: r.metaTitle, description: r.metaDescription, url, type: "website", locale: "cs_CZ" },
  };
}

export default async function SocialRidePage({
  params,
}: {
  params: Promise<{ mesto: string }>;
}) {
  const { mesto } = await params;
  const r = getSocialRideBySlug(mesto);
  if (!r || !r.published) notFound();

  const breadcrumb = breadcrumbSchema([
    { name: "100dola sport", url: "/" },
    { name: `Social rides ${r.city}`, url: `/social-rides/${r.slug}` },
  ]);
  const faq = faqPageSchema(r.faq.map((f) => ({ question: f.q, answer: f.a })));

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faq} />

      <Navbar />
      <main className="pt-20 bg-white">
        <section className="bg-gradient-to-b from-[#F7F9FF] to-white border-b border-[#E2E6F3]">
          <div className="max-w-[900px] mx-auto px-4 md:px-6 py-14 md:py-20">
            <nav className="text-xs text-[#9AA3C2] mb-4">
              <Link href="/" className="hover:text-[#3B7CF4]">
                100dola sport
              </Link>{" "}
              / <span className="text-[#5A6480]">Social rides {r.city}</span>
            </nav>
            <div className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-[#3B7CF4] mb-3">
              Komunita · společné vyjížďky
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#1a1a2e] leading-tight mb-5">{r.h1}</h1>
            <p className="text-base md:text-lg text-[#5A6480] leading-relaxed max-w-[720px]">
              {r.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Termíny na Instagramu →
              </a>
              <Link
                href="/community"
                className="inline-flex items-center px-6 py-3 rounded-full border-2 border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4] transition-colors"
              >
                Naše komunita
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-[900px] mx-auto px-4 md:px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {r.bullets.map((b) => (
              <div key={b.title} className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6">
                <h2 className="text-base font-black text-[#1a1a2e] mb-2">{b.title}</h2>
                <p className="text-sm text-[#5A6480] leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {r.story.length > 0 && (
          <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-6">
            <div className="space-y-4 text-sm md:text-base text-[#5A6480] leading-relaxed">
              {r.story.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {/* Czech Tour 2026 — proklik na zápůjčku SCOTT */}
        <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-6">
          <Link
            href="/vyzkousej-scott"
            className="block bg-[#3B7CF4] text-white rounded-2xl p-6 md:p-7 hover:opacity-95 transition-opacity"
          >
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/70 mb-1.5">
              Czech Tour 2026 · 15.–16. srpna
            </div>
            <h2 className="text-lg md:text-xl font-black mb-1.5">
              Přidej se na etapu Dlouhé stráně / Pustevny — a půjč si SCOTT zdarma
            </h2>
            <p className="text-sm text-white/85 leading-relaxed">
              O víkendu Czech Tour si s námi vyjeď kultovní stoupání a silniční kolo SCOTT ti na
              vyjížďku půjčíme zdarma. Podívej se na termíny a modely →
            </p>
          </Link>
        </section>

        {/* Trasy vyjížděk — proklik na Stravu + GPX ke stažení */}
        {COMMUNITY_ROUTES.length > 0 && (
          <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-6">
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-1.5">Trasy vyjížděk ke stažení</h2>
            <p className="text-sm text-[#5A6480] mb-5">
              Osvědčené okruhy, co jezdíme. Otevři na Stravě, nebo si stáhni GPX do cyklopočítače.
            </p>
            <div className="space-y-3">
              {COMMUNITY_ROUTES.map((r) => (
                <div
                  key={r.slug}
                  className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] uppercase tracking-wider font-bold text-[#3B7CF4] mb-1">{r.area}</div>
                    <h3 className="text-base font-black text-[#1a1a2e]">{r.name}</h3>
                    <p className="text-sm text-[#5A6480] leading-relaxed mt-1">{r.note}</p>
                    <div className="text-xs text-[#9AA3C2] mt-1.5">
                      {r.distance}
                      {r.climb ? ` · ${r.climb}` : ""}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <a
                      href={r.stravaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#FC4C02] text-white text-sm font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                    >
                      Zobrazit na Stravě
                    </a>
                    <a
                      href={r.gpx}
                      download
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border-2 border-[#E2E6F3] text-[#1a1a2e] text-sm font-bold hover:border-[#3B7CF4] transition-colors whitespace-nowrap"
                    >
                      Stáhnout GPX
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="max-w-[900px] mx-auto px-4 md:px-6 pb-6">
          <div className="bg-[#1a1a2e] text-white rounded-2xl p-7 md:p-9">
            <h2 className="text-xl md:text-2xl font-black mb-3">Jak se přidat</h2>
            <p className="text-sm md:text-base text-white/80 leading-relaxed mb-5">
              Sleduj náš Instagram, kde vypisujeme termíny nejbližších vyjížděk. Přijeď na sraz ke
              kavárně ve Valašském Meziříčí, sedni na kolo a jeď s námi. Žádné přihlášky, žádné
              poplatky — jen dobrá parta a valašské kopce.
            </p>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-white text-[#1a1a2e] text-sm font-bold hover:opacity-90 transition-opacity"
            >
              @100dolasport.cz
            </a>
          </div>
        </section>

        {r.faq.length > 0 && (
          <section className="max-w-[900px] mx-auto px-4 md:px-6 py-8 pb-16">
            <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-5">Časté dotazy</h2>
            <div className="space-y-4">
              {r.faq.map((f) => (
                <div key={f.q} className="border-b border-[#E2E6F3] pb-4">
                  <h3 className="text-base font-bold text-[#1a1a2e] mb-1.5">{f.q}</h3>
                  <p className="text-sm text-[#5A6480] leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
