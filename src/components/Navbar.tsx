"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E2E6F3]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 mt-4">
            <Image
              src="/logo.png"
              alt="100dola"
              width={154}
              height={62}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/shop" className="text-[#5A6480] hover:text-[#3B7CF4] transition-colors duration-150">
              Sport
            </Link>
            <Link href="/malaga" className="text-[#5A6480] hover:text-[#7C5CBF] transition-colors duration-150">
              Malaga
            </Link>
            <Link href="/community" className="text-[#5A6480] hover:text-[#2EAA6E] transition-colors duration-150">
              Social rides
            </Link>
            <Link href="/magazin" className="text-[#5A6480] hover:text-[#1a1a2e] transition-colors duration-150">
              Magazín
            </Link>
            <Link href="/o-nas" className="text-[#5A6480] hover:text-[#1a1a2e] transition-colors duration-150">
              O nás
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button className="hidden md:flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Account */}
            <button className="hidden md:flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* Cart */}
            <button className="relative flex p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3B7CF4]" />
            </button>

            {/* Mobile toggle */}
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
            {[
              { label: "Sport", href: "/shop", color: "#3B7CF4" },
              { label: "Malaga", href: "/malaga", color: "#7C5CBF" },
              { label: "Social rides", href: "/community", color: "#2EAA6E" },
              { label: "Magazín", href: "/magazin", color: "#1a1a2e" },
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
          </div>
        </div>
      )}
    </nav>
  );
}
