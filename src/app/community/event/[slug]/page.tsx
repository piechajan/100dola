import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegistrationSystem from "@/components/community/RegistrationSystem";
import EventGroupSignup from "@/components/community/EventGroupSignup";
import MalagaEventSignup from "@/components/community/MalagaEventSignup";
import EventParticipants from "@/components/community/EventParticipants";
import { getEventParticipants } from "@/lib/event-participants";
import RouteMapClient from "@/components/community/RouteMapClient";
import GpxRouteMap from "@/components/community/GpxRouteMap";
import {
  type Event,
  SPORT_COLORS,
  SPORT_ICONS,
  DIFFICULTY_COLOR,
} from "@/data/events";
import { getPublishedEvents } from "@/lib/events-db";

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

export async function generateStaticParams() {
  const list = await getPublishedEvents();
  return list.map((e) => ({ slug: e.slug }));
}

function findEvent(list: Event[], slug: string): Event | undefined {
  return list.find((e) => e.slug === slug);
}

/**
 * Převede mapy.cz / mapy.com share link (`mapy.com/s/<slug>`) na embeddable
 * frame URL (`frame.mapy.cz/s/<slug>`). Frame renderuje trasu na reálné mapě
 * přímo na naší stránce (drží uživatele na 100dola.com místo odkazu ven).
 * Vrací null pro ne-mapy URL (např. rychlebstezky.cz) → fallback na placeholder.
 */
function toMapyFrameUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/mapy\.(?:cz|com)\/s\/([a-z0-9]+)/i);
  return m ? `https://frame.mapy.cz/s/${m[1]}` : null;
}

function relatedEvents(list: Event[], event: Event, count = 3): Event[] {
  return list
    .filter((e) => e.slug !== event.slug)
    .sort((a, b) => {
      if (a.sport === event.sport && b.sport !== event.sport) return -1;
      if (b.sport === event.sport && a.sport !== event.sport) return 1;
      return 0;
    })
    .slice(0, count);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getPublishedEvents();
  const event = findEvent(list, slug);
  if (!event) return {};
  return {
    title: `${event.title} — Open Miles Clinic | 100dola`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const list = await getPublishedEvents();
  const event = findEvent(list, slug);
  if (!event) notFound();

  const related = relatedEvents(list, event, 3);
  const color = SPORT_COLORS[event.sport];
  const icon = SPORT_ICONS[event.sport];
  const diffColor = DIFFICULTY_COLOR[event.difficulty];
  const spotsLeft = event.capacity - event.filled;
  const mapyFrameUrl = toMapyFrameUrl(event.routeUrl);
  // Proběhlá akce se pozná automaticky z data (nebo ručního isPast). Build-time
  // porovnání stačí — web se redeployuje při každé změně eventů.
  const eventIsPast =
    Boolean(event.isPast) ||
    (!!event.dateISO && event.dateISO < new Date().toISOString().slice(0, 10));

  // Veřejný seznam účastníků (social proof) — jen pro komunitní skupinové akce.
  const participants =
    event.groupSignup && !eventIsPast ? await getEventParticipants(event.slug) : null;

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
                <div className="mt-4">
                  {event.slug === "season-opening" ? (
                    <RouteMapClient accentColor={color} />
                  ) : event.gpxPath ? (
                    <GpxRouteMap
                      gpxPath={event.gpxPath}
                      accentColor={color}
                      startLabel={event.location}
                    />
                  ) : mapyFrameUrl ? (
                    <>
                      <div className="rounded-xl overflow-hidden h-80 border border-[#E2E6F3]">
                        <iframe
                          src={mapyFrameUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Trasa — ${event.title}`}
                        />
                      </div>
                      {event.routeUrl && (
                        <a
                          href={event.routeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold hover:underline"
                          style={{ color }}
                        >
                          Otevřít trasu v Mapy.cz (profil převýšení, export GPX) →
                        </a>
                      )}
                    </>
                  ) : event.mapUrl ? (
                    <>
                      <div className="rounded-xl overflow-hidden h-64 border border-[#E2E6F3]">
                        <iframe
                          src={event.mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`Mapa — ${event.title}`}
                        />
                      </div>
                      <a
                        href="https://www.google.com/maps/place/Partyz%C3%A1nsk%C3%A1+2,+785+01+%C5%A0ternberk/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-[#3B7CF4] hover:underline"
                      >
                        📍 Navigovat (Google Mapy) →
                      </a>
                    </>
                  ) : event.sport === "Malaga" ? (
                    <Link
                      href="/malaga/trasy"
                      className="block rounded-xl bg-[#FFF7F3] border border-[#FBC9A8] p-6 hover:border-[#E8431A] transition-colors"
                    >
                      <div className="text-3xl mb-2">🚴‍♂️🗺️</div>
                      <div className="font-black text-[#1a1a2e]">
                        V Malaze jezdíš každý den jinou trasu
                      </div>
                      <p className="text-sm text-[#5A6480] mt-1 leading-snug">
                        Od pobřežních okruhů po královské etapy. Nemá smysl jedna mapa — máme{" "}
                        <strong>12 tras s mapami, výškovými profily a GPX</strong>, roztříděné podle
                        obtížnosti, km i převýšení.
                      </p>
                      <div className="text-sm font-bold mt-2 text-[#E8431A]">
                        Prohlédnout trasy a okruhy v Malaze →
                      </div>
                    </Link>
                  ) : (
                    <div className="rounded-xl h-52 flex items-center justify-center bg-[#F0F2FA]">
                      <div className="text-center text-[#9AA3C2]">
                        <div className="text-3xl mb-2">🗺️</div>
                        <div className="text-sm font-medium">Mapa trasy připravujeme</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trasa/GPX/Strava data (profil je teď součástí GpxRouteMap nahoře) */}
              {(event.gpxPath || event.routeUrl || event.stravaActivityUrl) && (
                <div className="space-y-4">
                  {/* Route / GPX / Strava buttons + účast */}
                  <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🚴</span>
                      <h3 className="font-black text-[#1a1a2e]">Trasa a data</h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {(event.stravaActivityUrl || event.routeUrl) && (
                        <a
                          href={event.stravaActivityUrl ?? event.routeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[140px] py-2.5 px-4 text-sm font-bold rounded-xl text-white text-center transition-all hover:shadow-md"
                          style={{ backgroundColor: event.stravaActivityUrl ? "#FC4C02" : color }}
                        >
                          {event.stravaActivityUrl ? "Zobrazit na Stravě →" : "Zobrazit trasu →"}
                        </a>
                      )}
                      {event.gpxPath && (
                        <a
                          href={event.gpxPath}
                          download
                          className="flex-1 min-w-[140px] py-2.5 px-4 text-sm font-bold rounded-xl text-center border-2 transition-colors"
                          style={{ borderColor: `${color}55`, color }}
                        >
                          Stáhnout GPX
                        </a>
                      )}
                    </div>

                    {typeof event.participants === "number" && event.participants > 0 && (
                      <div className="mt-4 pt-4 border-t border-[#F0F2FA] flex items-center gap-2 text-sm">
                        <span className="text-lg">👥</span>
                        <span className="font-black text-[#1a1a2e]">{event.participants}</span>
                        <span className="text-[#9AA3C2]">přihlášených na Stravě</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCOTT test CTA — pouze Pustevny jízda */}
              {event.scottCta && (
                <Link
                  href="/vyzkousej-scott"
                  className="block rounded-2xl p-6 text-white transition-all hover:shadow-xl group"
                  style={{ background: "linear-gradient(135deg, #E8431A 0%, #C4622D 100%)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.18em] opacity-80 mb-2">
                    Vyzkoušej SCOTT
                  </div>
                  <div className="text-xl md:text-2xl font-black leading-tight mb-1">
                    Vyzkoušej SCOTT na Czech Tour — půjč si kolo zdarma →
                  </div>
                  <div className="text-sm opacity-90">
                    Testovací jízdy na topových SCOTT kolech. Rezervuj si termín online.
                  </div>
                </Link>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">O akci</h3>
                <div className="text-[#5A6480] leading-relaxed space-y-3 text-sm">
                  {event.longDescription.trim().split("\n\n").map((para, i) => (
                    <p key={i}><RichText text={para} /></p>
                  ))}
                </div>
              </div>

              {/* Varianty trasy (obtížnost / délka) */}
              {event.difficultyVariants && event.difficultyVariants.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                  <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">Varianty trasy</h3>
                  <div className="space-y-2.5">
                    {event.difficultyVariants.map((v) => (
                      <div key={v.label} className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-sm">
                        <span className="font-black text-[#1a1a2e] w-16 shrink-0">{v.label}</span>
                        <span className="font-bold" style={{ color }}>{v.distance}</span>
                        {v.elevationM ? <span className="text-[#9AA3C2]">· {v.elevationM} m</span> : null}
                        {v.note ? <span className="text-[#9AA3C2]">— {v.note}</span> : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kde se sejdeme / kde končíme — restaurace s prokliky */}
              {(event.startVenue || event.endVenue) && (
                <div className="bg-white rounded-2xl p-6 border border-[#E2E6F3]">
                  <h3 className="font-black text-[#1a1a2e] mb-4 text-lg">Kde se sejdeme</h3>
                  <div className="space-y-4">
                    {[event.startVenue, event.endVenue]
                      .filter((v): v is NonNullable<typeof v> => Boolean(v))
                      .map((v, i) => (
                        <div key={v.name} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <span className="text-lg" aria-hidden>{i === 0 ? "🏁" : "🍺"}</span>
                          <div className="min-w-0">
                            <div className="font-black text-[#1a1a2e] text-sm">{v.name}</div>
                            {v.role && <div className="text-xs text-[#9AA3C2]">{v.role}</div>}
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            {v.instagram && (
                              <a href={v.instagram} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#F0F2FA] text-[#5A6480] hover:bg-[#1a1a2e] hover:text-white transition-colors">
                                Instagram
                              </a>
                            )}
                            {v.web && (
                              <a href={v.web} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#F0F2FA] text-[#5A6480] hover:bg-[#1a1a2e] hover:text-white transition-colors">
                                Web
                              </a>
                            )}
                            {v.facebook && !v.web && (
                              <a href={v.facebook} target="_blank" rel="noopener noreferrer"
                                className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-[#F0F2FA] text-[#5A6480] hover:bg-[#1a1a2e] hover:text-white transition-colors">
                                Facebook
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

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
                      <span><RichText text={item} /></span>
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`${event.title} — fotka ${i + 1} z předchozího ročníku`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
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
                    {eventIsPast ? (
                      <div className="text-center">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#9AA3C2] mb-2">
                          Proběhlá akce
                        </div>
                        <div className="font-black text-[#1a1a2e] text-2xl">
                          {event.filled} <span className="text-[#9AA3C2] font-medium">z {event.capacity}</span>
                        </div>
                        <div className="text-sm text-[#5A6480] mt-1">účastníků</div>
                        <div className="mt-4 h-2 w-full rounded-full bg-[#EEF1F8] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, (event.filled / event.capacity) * 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <p className="text-xs text-[#9AA3C2] mt-4 leading-relaxed">
                          Tato akce už proběhla. Sleduj{" "}
                          <Link href="/community" className="font-bold" style={{ color }}>
                            nadcházející eventy
                          </Link>
                          .
                        </p>
                      </div>
                    ) : event.malagaSignup ? (
                      /* Prodejní Malaga přihláška (doprava / uskladnění / ubytování / výživa) */
                      <MalagaEventSignup
                        eventSlug={event.slug}
                        eventTitle={event.title}
                        eventDate={event.date}
                        color={color}
                      />
                    ) : event.groupSignup ? (
                      /* Skupinová přihláška (lead + členové + pobyt) */
                      <EventGroupSignup
                        eventSlug={event.slug}
                        eventTitle={event.title}
                        color={color}
                        venue={event.signupVenue || "naše základna"}
                        startISO={event.dateISO}
                      />
                    ) : (
                      /* Standardní registrace */
                      <RegistrationSystem
                        eventSlug={event.slug}
                        color={color}
                        spotsLeft={spotsLeft}
                        filledCount={event.filled}
                        capacity={event.capacity}
                      />
                    )}
                  </div>
                </div>

                {/* Účastníci — kdo jede (social proof, jen se souhlasem) */}
                {participants && (
                  <div className="bg-white rounded-2xl p-5 border border-[#E2E6F3]">
                    <EventParticipants data={participants} color={color} />
                  </div>
                )}

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

          {/* ── MALAGA SORTIMENT (cross-sell na Malaga eventech) ── */}
          {event.sport === "Malaga" && (
            <section className="mt-16 pt-12 border-t border-[#E2E6F3]">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8431A] mb-2">
                Celý 100dola Malaga
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">
                Jeď v Malaze na svém kole
              </h2>
              <p className="text-[#5A6480] leading-relaxed mb-6 max-w-2xl">
                Kolo ti dovezeme z Česka a uskladníme přes celou sezónu — ty přiletíš s příručákem a
                jedeš na svém. Doprava i uskladnění jsou pojištěné (v ceně). Tady je všechno, co
                k Malaze nabízíme:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { href: "/malaga", t: "Jak to funguje", d: "Dovezeme, uskladníme, ty létáš light. Celý model za minutu." },
                  { href: "/malaga/preprava", t: "Přeprava kola", d: "One-way od 150 €, round-trip od 250 €. Pojištěná, po blocích." },
                  { href: "/malaga/uskladneni", t: "Uskladnění", d: "Monitorovaný sklad od 69 €/měsíc. Kolo čeká připravené." },
                  { href: "/malaga/trasy", t: "Trasy a okruhy", d: "12 tras s mapou, profilem a GPX. Od rozjezdu po královské etapy." },
                  { href: "/malaga/trasy/voda", t: "Počasí a voda", d: "5denní předpověď + mapa všech pramenů a doplnění na trasách." },
                  { href: "/malaga/balicky", t: "Balíčky a ceny", d: "Basic i Exkluzivní full-service. Vyber si úroveň komfortu." },
                ].map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="block rounded-2xl border border-[#E2E6F3] bg-white p-5 hover:border-[#E8431A] transition-colors"
                  >
                    <div className="font-black text-[#1a1a2e]">{c.t} →</div>
                    <div className="text-sm text-[#5A6480] mt-1 leading-snug">{c.d}</div>
                  </Link>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/malaga#poptavka"
                  className="inline-block bg-[#E8431A] hover:bg-[#F05A2E] text-white font-bold text-sm px-6 py-3 rounded-xl transition"
                >
                  Nezávazně poptat Malagu →
                </Link>
              </div>
            </section>
          )}

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
                        <Image src={rel.photo} alt={rel.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
