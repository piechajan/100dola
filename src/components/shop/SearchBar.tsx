"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  priceWithVat: number;
  photo: string;
  kind: "own" | "supplier";
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč";
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced fetch
  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const ac = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/shop/search?q=${encodeURIComponent(query.trim())}`, {
          signal: ac.signal,
        });
        const j = await r.json();
        setHits(j.hits ?? []);
        setActiveIdx(-1);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.warn("search failed", e);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [query, isOpen]);

  // ESC + click outside
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(hits.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter" && activeIdx >= 0 && hits[activeIdx]) {
        e.preventDefault();
        router.push(`/shop/${hits[activeIdx].slug}`);
        setIsOpen(false);
        setQuery("");
      }
    }
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [isOpen, hits, activeIdx, router]);

  // Auto-focus na open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Hledat produkt"
        className="p-2.5 text-[#9AA3C2] hover:text-[#1a1a2e] transition-colors rounded-lg hover:bg-[#F0F2FA]"
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 bg-[#F0F2FA] rounded-full px-3 py-1.5">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-[#9AA3C2]">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Hledat kola, oblečení, doplňky..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent text-sm w-64 outline-none placeholder:text-[#9AA3C2]"
        />
        <button
          type="button"
          onClick={() => { setIsOpen(false); setQuery(""); }}
          aria-label="Zavřít vyhledávání"
          className="text-[#9AA3C2] hover:text-[#1a1a2e] p-0.5"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {query.trim().length >= 2 && (
        <div
          className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-[#E2E6F3] overflow-hidden shadow-xl"
          style={{ zIndex: 60 }}
        >
          {loading && hits.length === 0 ? (
            <div className="p-4 text-xs text-[#9AA3C2] text-center">Hledám…</div>
          ) : hits.length === 0 ? (
            <div className="p-4 text-xs text-[#9AA3C2] text-center">
              Nic jsem nenašel. Zkus jiné slovo.
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {hits.map((hit, i) => (
                <Link
                  key={hit.id}
                  href={`/shop/${hit.slug}`}
                  onClick={() => { setIsOpen(false); setQuery(""); }}
                  className={`flex items-center gap-3 px-3 py-2.5 hover:bg-[#F5F7FF] transition-colors ${
                    i === activeIdx ? "bg-[#F5F7FF]" : ""
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-lg bg-[#F0F2FA] overflow-hidden shrink-0">
                    <Image
                      src={hit.photo}
                      alt={hit.name}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold">
                      {hit.brand}
                    </div>
                    <div className="text-sm font-bold text-[#1a1a2e] truncate">{hit.name}</div>
                  </div>
                  <div className="text-sm font-black text-[#1a1a2e] shrink-0">
                    {formatPrice(hit.priceWithVat)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
