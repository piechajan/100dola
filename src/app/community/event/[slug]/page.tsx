import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationSystem from "@/components/community/RegistrationSystem";
import {
  events,
  getEventBySlug,
  getRelatedEvents,
  SPORT_COLORS,
  SPORT_ICONS,
  DIFFICULTY_COLOR,
} from "@/data/events";

function RichText({ text }: { text: string }) {
  // Split on **bold** and [label](url) patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) return <strong key={i} className="font-bold text-[#1a1a2e]">{bold[1]}</strong>;
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: "var(--community-color, #2EAA6E)" }}>{link[1]}</a>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.title} — Open Miles Clinic | 100dola`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const related = getRelatedEvents(event, 3);
  const color = SPORT_COLORS[event.sport];
  const icon = SPORT_ICONS[event.sport];
  const diffColor = DIFFICULTY_COLOR[event.difficulty];
  const fillPct = (event.filled / event.capacity) * 100;
  const spotsLeft = event.capacity - event.filled;
  const almostFull = fillPct >= 75;

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-[#FAFAFA]">

        {/* ── HERO ─────────────────────────────────── */}
        <section className="relative h-[55vh] min-h-[380px] overflow-hidden bg-[#111]">
          <Image
            src={event.photo}
            alt={event.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }}
          />
          <div className="absolute inset-0 flex flex-col justify-end max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
              <Link href="/community" className="hover:text-white transition-colors">Jedeme spolu</Link>
              <span>/</span>
              <span className="text-white/60">{event.title}</span>
            </div>

            {/* Sport + difficulty badges */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${color}cc`, color: "white" }}
              >
                {icon} {event.sport}
              </span>
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/50 text-white backdrop-blur-sm border"
                style={{ borderColor: `${diffColor}60`, color: diffColor }}
              >
                {event.difficulty}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </section>

        {/* ── MAIN CONTENT ─────────────────────────── */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* LEFT — main info */}
            <div className="lg:col-span-2 space-y-10">

              {/* Key stats bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Datum", value: event.date, icon: "📅" },
                  { label: "Čas startu", value: event.time, icon: "🕐" },
                  { label: "Vzdálenost", value: event.distance, icon: "📏" },
                  { label: "Převýšení", value: event.elevation, icon: "📈" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl p-4 border border-[#E2E6F3]">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="text-xs text-[#9AA3C2] mb-0.5">{stat.label}</div>
                    <div className="font-black text-[#1a1a2e] text-sm">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📍</span>
                  <h3 className="font-black text-[#1a1a2e]">Místo</h3>
                </div>
                <div className="font-semibold text-[#1a1a2e]">{event.location}</div>
                <div className="text-sm text-[#9AA3C2] mt-0.5">{event.locationDetail}</div>

                {/* Map */}
                <div className="mt-4 rounded-xl overflow-hidden h-64">
                  {event.mapUrl ? (
                    <iframe
                      src={event.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      title={`Mapa trasy — ${event.title}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F0F2FA]">
                      <div className="text-center text-[#9AA3C2]">
                        <div className="text-3xl mb-2">🗺️</div>
                        <div className="text-sm font-medium">Mapa trasy</div>
                        <div className="text-xs mt-1">Připravujeme</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">O akci</h3>
                <div className="text-[#5A6480] leading-relaxed space-y-3 text-sm">
                  {event.longDescription.trim().split("\n\n").map((para, i) => (
                    <p key={i}><RichText text={para} /></p>
                  ))}
                </div>
              </div>

              {/* Pro koho */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                <h3 className="font-black text-[#1a1a2e] mb-3 text-lg">Pro koho akce je</h3>
                <p className="text-sm text-[#5A6480] leading-relaxed">{event.whoIsItFor}</p>
              </div>

              {/* Co vzít */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">Co si vzít s sebou</h3>
                <ul className="space-y-2.5">
                  {event.whatToBring.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-[#5A6480]">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gallery */}
              {event.photoGallery && event.photoGallery.length > 0 && (
                <div>
                  <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">Fotky z předchozích ročníků</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {event.photoGallery.map((src, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-[#F0F2FA]">
                        <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — registration sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">

                {/* Registration card */}
                <div className="bg-white rounded-2xl border-2 border-[#E2E6F3] overflow-hidden">
                  {/* Color top bar */}
                  <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

                  <div className="p-6">
                    {/* Registration system */}
                    <RegistrationSystem
                      eventSlug={event.slug}
                      color={color}
                      spotsLeft={spotsLeft}
                      filledCount={event.filled}
                      capacity={event.capacity}
                    />
                  </div>
                </div>

                {/* Organizer */}
                <div className="bg-white rounded-2xl p-5 border border-[#E2E6F3]">
                  <div className="text-xs text-[#9AA3C2] font-medium uppercase tracking-wider mb-3">Organizátor</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {event.organizer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#1a1a2e]">{event.organizer.name}</div>
                      <div className="text-xs text-[#9AA3C2]">{event.organizer.role}</div>
                    </div>
                  </div>
                </div>

                {/* Quick info */}
                <div className="bg-[#F0F2FA] rounded-2xl p-5 space-y-3">
                  {[
                    { label: "Typ aktivity", value: `${icon} ${event.sport}` },
                    { label: "Náročnost", value: event.difficulty },
                    { label: "Datum", value: event.date },
                    { label: "Start", value: `${event.time} · ${event.location}` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-[#9AA3C2]">{item.label}</span>
                      <span className="font-semibold text-[#1a1a2e] text-right max-w-[55%]">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Share */}
                <button className="w-full py-3 rounded-xl border-2 border-[#E2E6F3] text-sm font-semibold text-[#9AA3C2] hover:border-[#1a1a2e] hover:text-[#1a1a2e] transition-colors flex items-center justify-center gap-2">
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Sdílet akci
                </button>
              </div>
            </div>
          </div>

          {/* ── RELATED EVENTS ───────────────────────── */}
          {related.length > 0 && (
            <section className="mt-20 pt-12 border-t border-[#E2E6F3]">
              <h2 className="text-2xl font-black text-[#1a1a2e] mb-8">Další akce</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {related.map((rel) => {
                  const rc = SPORT_COLORS[rel.sport];
                  const ri = SPORT_ICONS[rel.sport];
                  const rFill = (rel.filled / rel.capacity) * 100;
                  return (
                    <Link
                      key={rel.slug}
                      href={`/community/event/${rel.slug}`}
                      className="group bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative h-36 overflow-hidden">
                        <img src={rel.photo} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span
                          className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: `${rc}cc` }}
                        >
                          {ri} {rel.sport}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-[#9AA3C2] mb-1">{rel.date}</div>
                        <div className="font-black text-[#1a1a2e] text-sm mb-1">{rel.title}</div>
                        <div className="text-xs text-[#9AA3C2]">{rel.location}</div>
                        <div className="mt-3 h-1 bg-[#F0F2FA] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${rFill}%`, backgroundColor: rc }} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
