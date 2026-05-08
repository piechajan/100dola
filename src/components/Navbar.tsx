"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { events, SPORT_COLORS, SPORT_ICONS } from "@/data/events";

// ── Sport mega-menu data ──────────────────────────────────────────────────────

const SPORT_BY_ACTIVITY = [
  {
    label: "Cyklistika",
    icon: "🚴",
    href: "/sport/cyklistika",
    sub: ["Road & Gravel", "MTB", "Triatlon"],
  },
  {
    label: "Běh & Trail",
    icon: "🏃",
    href: "/sport/beh",
    sub: ["Road running", "Trail & Ultra"],
  },
  {
    label: "Turistika & Trek",
    icon: "🥾",
    href: "/sport/turistika",
    sub: ["Jednodenní túry", "Via ferrata"],
  },
  {
    label: "Zimní sporty",
    icon: "⛷️",
    href: "/sport/zima",
    sub: ["Skialpy", "Běžky & Skitouring"],
  },
];

const SPORT_BY_CATEGORY = [
  { label: "Oblečení", icon: "👕", href: "/sport/obleceni" },
  { label: "Obuv", icon: "👟", href: "/sport/obuv" },
  { label: "Helmy & přilby", icon: "⛑️", href: "/sport/helmy" },
  { label: "Výživa & doplňky", icon: "⚡", href: "/sport/vyziva" },
  { label: "Vybavení & doplňky", icon: "🎒", href: "/sport/vybaveni" },
  { label: "Elektronika & GPS", icon: "📡", href: "/sport/elektronika" },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [kalendarOpen, setKalendarOpen] = useState(false);
  const [sportOpen, setSportOpen] = useState(false);
  const [mobileKalendarOpen, setMobileKalendarOpen] = useState(false);
  const [mobileSportOpen, setMobileSportOpen] = useState(false);

  const kalendarTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sportTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = (setter: (v: boolean) => void, timeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    if (timeout.current) clearTimeout(timeout.current);
    setter(true);
  };
  const closeDropdown = (setter: (v: boolean) => void, timeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    timeout.current = setTimeout(() => setter(false), 140);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E2E6F3]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mt-4 -ml-4 md:-ml-8 lg:-ml-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-nav.png"
              alt="100dola sport"
              style={{ height: 22, width: "auto" }}
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
              <button className="flex items-center gap-1 text-[#5A6480] hover:text-[#3B7CF4] transition-colors duration-150">
                Sport
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  className={`transition-transform duration-150 ${sportOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {sportOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden"
                  style={{ width: 620, boxShadow: "0 8px 40px rgba(26,26,46,0.13)", zIndex: 50 }}
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
                          href="/sport/kolekce"
                          className="block rounded-xl overflow-hidden group"
                          onClick={() => setSportOpen(false)}
                        >
                          <div
                            className="h-28 rounded-xl flex flex-col justify-end p-3 relative overflow-hidden"
                            style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #3B7CF4 100%)" }}
                          >
                            <div className="absolute inset-0 opacity-10 text-[80px] flex items-center justify-center select-none">
                              🚴
                            </div>
                            <div className="relative">
                              <div className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Jarní kolekce</div>
                              <div className="text-sm font-black text-white leading-tight">Road & Gravel<br />2025</div>
                            </div>
                          </div>
                        </Link>
                      </div>
                      <Link
                        href="/sport"
                        className="mt-3 flex items-center justify-between text-xs font-bold text-[#3B7CF4] hover:text-[#2563cc] transition-colors px-1"
                        onClick={() => setSportOpen(false)}
                      >
                        Celý obchod
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
                    {events.map((event) => {
                      const color = SPORT_COLORS[event.sport];
                      const icon = SPORT_ICONS[event.sport];
                      return (
                        <Link
                          key={event.slug}
                          href={`/community/event/${event.slug}`}
                          className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#F5F7FF] transition-colors group"
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
            <button className="hidden md:flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className="hidden md:flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <button className="relative flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3B7CF4]" />
            </button>
            <button
              className="md:hidden p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA] ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
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
                Sport
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  className={`transition-transform ${mobileSportOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {mobileSportOpen && (
                <div className="ml-3 mt-1 flex flex-col gap-0.5">
                  <div className="text-[10px] uppercase font-bold text-[#9AA3C2] px-3 pt-1 pb-0.5 tracking-wider">Podle sportu</div>
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
              { label: "Malaga", href: "/malaga", color: "#E8431A" },
              { label: "Social rides", href: "/community", color: "#2EAA6E" },
              { label: "O nás", href: "/o-nas", color: "#1a1a2e" },
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
                  {events.map((event) => {
                    const color = SPORT_COLORS[event.sport];
                    const icon = SPORT_ICONS[event.sport];
                    return (
                      <Link
                        key={event.slug}
                        href={`/community/event/${event.slug}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#F0F2FA] transition-colors"
                        onClick={() => { setMenuOpen(false); setMobileKalendarOpen(false); }}
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
  );
}
