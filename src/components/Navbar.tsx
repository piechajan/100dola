"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SPORT_COLORS, SPORT_ICONS } from "@/data/events";
import { useEvents } from "@/components/EventsProvider";
import CartButton from "@/components/shop/CartButton";
import CartDrawer from "@/components/shop/CartDrawer";
import SearchBar from "@/components/shop/SearchBar";
import WishlistNavButton from "@/components/shop/WishlistNavButton";
import TopPromoBar from "@/components/TopPromoBar";

// ── Sport mega-menu data ──────────────────────────────────────────────────────

// Mega-menu vede přímo do /shop kategoriálních URL (server-rendered, SEO friendly)
// Stará info-stránka kamenné prodejny: /sport — odkaz dole pod featured tile.
const SPORT_BY_ACTIVITY = [
  {
    label: "Silniční kola",
    icon: "🚴",
    href: "/shop/kola/silnicni",
    sub: ["Endurance", "Aero", "Race"],
  },
  {
    label: "Gravel",
    icon: "🌄",
    href: "/shop/kola/gravel",
    sub: ["Jednopřevodník", "Dvoupřevodník"],
  },
  {
    label: "MTB",
    icon: "⛰️",
    href: "/shop/kola/mtb",
    sub: ["Pevná vidlice", "Celoodpružená"],
  },
  {
    label: "Triatlon / TT",
    icon: "🏊",
    href: "/shop/kola/triatlon",
    sub: ["TT geometrie"],
  },
];

const SPORT_BY_CATEGORY = [
  { label: "Oblečení", icon: "👕", href: "/shop/obleceni" },
  { label: "Dresy", icon: "🎽", href: "/shop/obleceni/obleceni-dresy" },
  { label: "Helmy", icon: "⛑️", href: "/shop/doplnky/helmy" },
  { label: "Výplety & ráfky", icon: "⚙️", href: "/shop/doplnky/vyplety" },
  { label: "Wattmetry", icon: "📡", href: "/shop/doplnky/wattmetry" },
  { label: "Výživa", icon: "⚡", href: "/shop/vyziva" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const events = useEvents();
  // Dnešní datum až po mountu (SSR-safe, žádné build-time zamrznutí). Do té doby
  // se „proběhlá" odvozuje jen z ručního isPast flagu.
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);
  // Auto řazení: nadcházející (dle data vzestupně) první, proběhlé (sestupně)
  // za nimi s fade. Funguje samo pro každou budoucí i proběhlou akci — nic ručně.
  const sortedEvents = useMemo(() => {
    const withMeta = events.map((e) => {
      const iso = e.dateISO ?? "9999-12-31";
      const past = Boolean(e.isPast) || (today != null && iso < today);
      return { event: e, iso, past };
    });
    const upcoming = withMeta.filter((x) => !x.past).sort((a, b) => a.iso.localeCompare(b.iso));
    const done = withMeta.filter((x) => x.past).sort((a, b) => b.iso.localeCompare(a.iso));
    return [...upcoming, ...done];
  }, [events, today]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [kalendarOpen, setKalendarOpen] = useState(false);
  const [sportOpen, setSportOpen] = useState(false);
  const [mobileKalendarOpen, setMobileKalendarOpen] = useState(false);
  const [mobileSportOpen, setMobileSportOpen] = useState(false);

  const kalendarTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sportTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  /**
   * Logo behavior:
   *  - jsem-li na homepage ("/") → smooth scroll na úplný vrch
   *  - na jiných stránkách → standardní router.push("/") na home
   */
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Necháme Link projít — Next router naviguje, ale ujistíme se že po
      // navigaci skrolne nahoru (Next 16 to dělá by default, ale pro jistotu)
      e.preventDefault();
      router.push("/");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  };

  const openDropdown = (setter: (v: boolean) => void, timeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    if (timeout.current) clearTimeout(timeout.current);
    setter(true);
  };
  const closeDropdown = (setter: (v: boolean) => void, timeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    timeout.current = setTimeout(() => setter(false), 140);
  };

  return (
    <>
    <CartDrawer />
    <div className="fixed top-0 left-0 right-0 z-50">
      <TopPromoBar />
    <nav className="bg-white border-b border-[#E2E6F3]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-20">

          {/* Logo — klik na homepage scrolluje nahoru, jinde naviguje na / */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center shrink-0 mt-4 -ml-4 md:-ml-8 lg:-ml-16"
            aria-label="100dola sport — domů / scroll nahoru"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nav.png"
              alt="100dola sport"
              style={{ height: 18, width: "auto" }}
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">

            {/* Sport — mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown(setSportOpen, sportTimeout)}
              onMouseLeave={() => closeDropdown(setSportOpen, sportTimeout)}
            >
              <Link href="/shop" className="flex items-center gap-1 text-[#5A6480] hover:text-[#3B7CF4] transition-colors duration-150">
                E-shop
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  className={`transition-transform duration-150 ${sportOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>

              {sportOpen && (
                <div
                  className="absolute top-full left-0 mt-3 bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden"
                  style={{
                    width: "min(620px, calc(100vw - 3rem))",
                    boxShadow: "0 8px 40px rgba(26,26,46,0.13)",
                    zIndex: 50,
                  }}
                >
                  <div className="grid grid-cols-[1fr_1px_1fr_1px_200px]">

                    {/* Col 1 — by activity */}
                    <div className="p-4">
                      <div className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#9AA3C2] px-2 pb-2">
                        Podle sportu
                      </div>
                      {SPORT_BY_ACTIVITY.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-start gap-2.5 px-2 py-2 rounded-xl hover:bg-[#F5F7FF] transition-colors group"
                          onClick={() => setSportOpen(false)}
                        >
                          <span className="text-base mt-0.5 shrink-0">{item.icon}</span>
                          <div>
                            <div className="text-sm font-bold text-[#1a1a2e]">{item.label}</div>
                            <div className="text-[11px] text-[#9AA3C2] leading-relaxed">
                              {item.sub.join(" · ")}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="bg-[#F0F2FA] my-4" />

                    {/* Col 2 — by product type */}
                    <div className="p-4">
                      <div className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#9AA3C2] px-2 pb-2">
                        Kategorie
                      </div>
                      {SPORT_BY_CATEGORY.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-[#F5F7FF] transition-colors group"
                          onClick={() => setSportOpen(false)}
                        >
                          <span className="text-base shrink-0">{item.icon}</span>
                          <span className="text-sm font-semibold text-[#1a1a2e]">{item.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="bg-[#F0F2FA] my-4" />

                    {/* Col 3 — featured */}
                    <div className="p-4 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#9AA3C2] px-1 pb-2">
                          Výběr
                        </div>
                        <Link
                          href="/shop"
                          className="block rounded-xl overflow-hidden group"
                          onClick={() => setSportOpen(false)}
                        >
                          <div
                            className="h-28 rounded-xl flex flex-col justify-end p-3 relative overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #3B7CF4 100%)" }}
                          >
                            <div className="absolute inset-0 opacity-10 text-[80px] flex items-center justify-center select-none">
                              🛒
                            </div>
                            <div className="relative">
                              <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">E-shop</div>
                              <div className="text-sm font-black text-white leading-tight">Kola, oblečení<br />a doplňky</div>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <Link
                        href="/sport"
                        className="mt-3 flex items-center justify-between text-xs font-bold text-[#3B7CF4] hover:text-[#2563cc] transition-colors px-1"
                        onClick={() => setSportOpen(false)}
                      >
                        Prodejna ve Šternberku
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/malaga" className="text-[#5A6480] hover:text-[#E8431A] transition-colors duration-150">
              Malaga
            </Link>
            <Link href="/lab" className="text-[#5A6480] hover:text-[#1F4937] transition-colors duration-150">
              Lab
            </Link>
            <Link href="/community" className="text-[#5A6480] hover:text-[#2EAA6E] transition-colors duration-150">
              Social rides
            </Link>

            {/* Kalendář */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown(setKalendarOpen, kalendarTimeout)}
              onMouseLeave={() => closeDropdown(setKalendarOpen, kalendarTimeout)}
            >
              <button className="flex items-center gap-1 text-[#5A6480] hover:text-[#1a1a2e] transition-colors duration-150">
                Kalendář
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  className={`transition-transform duration-150 ${kalendarOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {kalendarOpen && (
                <div
                  className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden"
                  style={{ boxShadow: "0 8px 40px rgba(26,26,46,0.12)", zIndex: 50 }}
                >
                  <div className="p-3">
                    <div className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#9AA3C2] px-2 py-2">
                      Nadcházející akce
                    </div>
                    {sortedEvents.map(({ event, past }) => {
                      const color = SPORT_COLORS[event.sport];
                      const icon = SPORT_ICONS[event.sport];
                      return (
                        <Link
                          key={event.slug}
                          href={`/community/event/${event.slug}`}
                          className={`flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F5F7FF] transition-colors group ${past ? "opacity-45" : ""}`}
                          onClick={() => setKalendarOpen(false)}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-[#1a1a2e] truncate">{event.title}</div>
                            <div className="text-xs text-[#9AA3C2]">{event.date} · {event.location}</div>
                          </div>
                          <div
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: `${color}15`, color }}
                          >
                            {event.sport}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#F0F2FA] px-5 py-3">
                    <Link
                      href="/community"
                      className="flex items-center justify-between text-sm font-bold text-[#2EAA6E] hover:text-[#1a9a60] transition-colors"
                      onClick={() => setKalendarOpen(false)}
                    >
                      Všechny akce
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/o-nas" className="text-[#5A6480] hover:text-[#1a1a2e] transition-colors duration-150">
              O nás
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-1">
            <div className="hidden md:flex">
              <SearchBar />
            </div>
            <div className="md:hidden">
              <SearchBar variant="mobile" />
            </div>
            <WishlistNavButton />
            <CartButton />
            <button
              className="md:hidden p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA] ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Zavřít menu" : "Otevřít menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E2E6F3] bg-white">
          <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-col gap-1">

            {/* Mobile Sport accordion */}
            <div>
              <button
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-[#5A6480] hover:bg-[#F0F2FA] transition-colors flex items-center justify-between"
                onClick={() => setMobileSportOpen(!mobileSportOpen)}
              >
                E-shop
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  className={`transition-transform ${mobileSportOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSportOpen && (
                <div className="ml-3 mt-1 flex flex-col gap-0.5">
                  <Link
                    href="/shop"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0F2FA] transition-colors"
                    onClick={() => { setMenuOpen(false); setMobileSportOpen(false); }}
                  >
                    <span className="text-sm">🛒</span>
                    <span className="text-sm font-bold text-[#1a1a2e]">Celý e-shop</span>
                  </Link>
                  <div className="text-[10px] uppercase font-bold text-[#9AA3C2] px-3 pt-2 pb-0.5 tracking-wider">Podle sportu</div>
                  {SPORT_BY_ACTIVITY.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0F2FA] transition-colors"
                      onClick={() => { setMenuOpen(false); setMobileSportOpen(false); }}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm font-semibold text-[#1a1a2e]">{item.label}</span>
                    </Link>
                  ))}
                  <div className="text-[10px] uppercase font-bold text-[#9AA3C2] px-3 pt-2 pb-0.5 tracking-wider">Kategorie</div>
                  {SPORT_BY_CATEGORY.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0F2FA] transition-colors"
                      onClick={() => { setMenuOpen(false); setMobileSportOpen(false); }}
                    >
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-sm font-semibold text-[#1a1a2e]">{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {[
              { label: "Malaga", href: "/malaga" },
              { label: "Lab", href: "/lab" },
              { label: "Social rides", href: "/community" },
              { label: "O nás", href: "/o-nas" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2.5 px-3 rounded-lg text-sm font-semibold text-[#5A6480] hover:bg-[#F0F2FA] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Kalendář */}
            <div>
              <button
                className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-[#5A6480] hover:bg-[#F0F2FA] transition-colors flex items-center justify-between"
                onClick={() => setMobileKalendarOpen(!mobileKalendarOpen)}
              >
                Kalendář
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  className={`transition-transform ${mobileKalendarOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileKalendarOpen && (
                <div className="ml-3 mt-1 flex flex-col gap-0.5">
                  {sortedEvents.map(({ event, past }) => {
                    const color = SPORT_COLORS[event.sport];
                    const icon = SPORT_ICONS[event.sport];
                    return (
                      <Link
                        key={event.slug}
                        href={`/community/event/${event.slug}`}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0F2FA] transition-colors ${past ? "opacity-45" : ""}`}
                        onClick={() => { setMenuOpen(false); setMobileKalendarOpen(false); }}
                        style={{ borderLeft: `3px solid ${color}` }}
                      >
                        <span className="text-sm">{icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-[#1a1a2e]">{event.title}</div>
                          <div className="text-xs text-[#9AA3C2]">{event.date}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
    </div>
    </>
  );
}
