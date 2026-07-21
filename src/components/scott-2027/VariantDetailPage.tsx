"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import BikeInquiryForm from "./BikeInquiryForm";
import {
  eurToCzk,
  type Scott2027Platform,
  type Scott2027Variant,
} from "@/data/scott-2027";

interface Props {
  platform: Scott2027Platform;
  variant: Scott2027Variant;
}

// Mapování názvů barev Scott → hex pro vizuální vzorník na detailu modelu.
const COLOR_HEX: Record<string, string> = {
  "Carbon Black": "#1b1b1e",
  "Spectral Black": "#242529",
  "Sunbeam Black": "#2b2b2d",
  White: "#f1f2f4",
  "Azure White": "#e9eef4",
  "Cumulus White": "#eef1f5",
  "Whisper Grey": "#b7bcc3",
  "Raw Grey": "#888b90",
  "Cream Green": "#c9d1a6",
  Sage: "#b9c3a3",
};
function colorHex(name: string): string {
  return COLOR_HEX[name] ?? "#c4c9d4";
}

export default function VariantDetailPage({ platform, variant }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const platformLabel =
    platform.platform === "mtb" ? "MTB" : platform.platform === "road" ? "Silnice" : "Gravel";
  const gallery = variant.gallery.length > 0 ? variant.gallery : [variant.photo];

  const otherVariants = platform.variants.filter((v) => v.slug !== variant.slug);

  return (
    <article className="max-w-[1180px] mx-auto px-4 md:px-6 pt-16 pb-24">
      <nav className="text-xs text-[#5A6480] mb-6 flex flex-wrap gap-1">
        <Link href="/clanky" className="hover:text-[#3B7CF4]">
          Magazín
        </Link>
        <span>/</span>
        <Link href="/clanky/scott-2027" className="hover:text-[#3B7CF4]">
          Scott 2027
        </Link>
        <span>/</span>
        <Link href={`/clanky/scott-2027/${platform.slug}`} className="hover:text-[#3B7CF4]">
          {platform.name}
        </Link>
        <span>/</span>
        <span className="text-[#1a1a2e] font-semibold">{variant.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Galerie */}
        <div className="lg:col-span-7">
          <button
            type="button"
            onClick={() => setZoom(true)}
            className="group relative aspect-square w-full bg-white rounded-2xl overflow-hidden mb-3 border border-[#E2E6F3] shadow-sm cursor-zoom-in"
            aria-label="Zvětšit fotku"
          >
            <Image
              src={gallery[activeImg] ?? variant.photo}
              alt={`${platform.name} ${variant.name} — fotka ${activeImg + 1}`}
              fill
              sizes="(min-width: 1024px) 700px, 100vw"
              className="object-contain p-8 md:p-12 transition-transform duration-300 group-hover:scale-[1.04]"
              priority
            />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur border border-[#E2E6F3] text-[#5A6480] text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3M11 8v6M8 11h6" />
              </svg>
              Zvětšit
            </span>
          </button>
          {gallery.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition ${
                    activeImg === i ? "border-[#3B7CF4]" : "border-[#E2E6F3] hover:border-[#C9DCFC]"
                  }`}
                  aria-label={`Zobrazit fotku ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Souhrn + CTA */}
        <div className="lg:col-span-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#3B7CF4] mb-2">
            Scott {platform.name} · {platformLabel}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1a1a2e] mb-3 leading-tight">
            {variant.name}
            <span className="text-[#5A6480] font-normal"> 2027</span>
          </h1>

          <div className="bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-5 mb-5">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-[#5A6480]">Groupset</dt>
              <dd className="font-bold text-[#1a1a2e]">{variant.groupset}</dd>
              <dt className="text-[#5A6480]">Kola</dt>
              <dd className="font-bold text-[#1a1a2e]">{variant.wheels}</dd>
              {variant.fork && (
                <>
                  <dt className="text-[#5A6480]">Vidlice</dt>
                  <dd className="font-bold text-[#1a1a2e]">{variant.fork}</dd>
                </>
              )}
              {variant.weightKg !== null && (
                <>
                  <dt className="text-[#5A6480]">Váha</dt>
                  <dd className="font-bold text-[#1a1a2e]">{variant.weightKg.toFixed(1)} kg</dd>
                </>
              )}
              <dt className="text-[#5A6480]">Velikosti</dt>
              <dd className="font-bold text-[#1a1a2e]">{variant.sizes.join(" / ")}</dd>
              {variant.colors.length > 0 && (
                <>
                  <dt className="text-[#5A6480]">Barvy</dt>
                  <dd className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {variant.colors.map((c) => (
                      <span key={c} className="flex items-center gap-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-[#D5DAE6] shrink-0"
                          style={{ backgroundColor: colorHex(c) }}
                        />
                        <span className="font-semibold text-[#1a1a2e] text-xs">{c}</span>
                      </span>
                    ))}
                  </dd>
                </>
              )}
            </dl>
          </div>

          <div className="bg-[#1a1a2e] text-white rounded-2xl p-5 mb-5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#7AA3FF] mb-1">
              Orientační cena
            </div>
            <div className="text-2xl font-black mb-1">{eurToCzk(variant.priceEur)}</div>
            {variant.priceEur && (
              <div className="text-xs text-white/60 mb-3">
                € {variant.priceEur.toLocaleString("cs-CZ")} MSRP · kurz orientačně 25 Kč/€
              </div>
            )}
            <p className="text-xs text-white/70 leading-snug">
              Finální Kč potvrdíme po poptávce podle aktuální alokace od distributora a kurzu v
              den objednávky.
            </p>
          </div>

          <a
            href="#inquiry"
            className="block w-full bg-[#3B7CF4] hover:bg-[#5C92F6] text-white font-bold text-base px-6 py-4 rounded-xl transition text-center mb-3"
          >
            Poptat tento model →
          </a>
          <div className="flex gap-2">
            <a
              href="tel:+420739045057"
              className="flex-1 bg-white border-2 border-[#E2E6F3] hover:border-[#3B7CF4] text-[#1a1a2e] font-bold text-sm px-4 py-3 rounded-xl transition text-center"
            >
              +420 739 045 057
            </a>
            {variant.scottUrl && (
              <a
                href={variant.scottUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white border-2 border-[#E2E6F3] hover:border-[#3B7CF4] text-[#1a1a2e] font-bold text-sm px-4 py-3 rounded-xl transition text-center"
              >
                Scott Sports ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Componentry */}
      {variant.componentry && (
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-1">
            Componentry — kompletní výbava
          </h2>
          <p className="text-sm text-[#5A6480] mb-6">
            Plná specifikace ze Scott Sports oficiální stránky. Neměníme, jen překládáme.
          </p>
          <dl className="bg-white border border-[#E2E6F3] rounded-2xl overflow-hidden divide-y divide-[#E2E6F3]">
            {variant.componentry.frame && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Rám</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.frame}</dd>
              </div>
            )}
            {variant.componentry.fork && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Vidlice</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.fork}</dd>
              </div>
            )}
            {variant.componentry.shock && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Tlumič</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.shock}</dd>
              </div>
            )}
            {variant.componentry.drivetrain && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Pohon</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.drivetrain}</dd>
              </div>
            )}
            {variant.componentry.brakes && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Brzdy</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.brakes}</dd>
              </div>
            )}
            {variant.componentry.wheels && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Kola</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.wheels}</dd>
              </div>
            )}
            {variant.componentry.tires && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Pláště</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.tires}</dd>
              </div>
            )}
            {variant.componentry.cockpit && (
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-2 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">Kokpit</dt>
                <dd className="text-sm text-[#1a1a2e]">{variant.componentry.cockpit}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* O platformě */}
      <section className="mb-12 bg-[#F7F9FF] border border-[#E2E6F3] rounded-2xl p-6">
        <h2 className="text-xl md:text-2xl font-black text-[#1a1a2e] mb-2">
          O platformě {platform.name}
        </h2>
        <p className="text-sm text-[#1a1a2e] leading-relaxed mb-3">{platform.claim}</p>
        <p className="text-sm text-[#5A6480] leading-snug mb-4">{platform.geometry}</p>
        <Link
          href={`/clanky/scott-2027/${platform.slug}`}
          className="text-sm font-bold text-[#3B7CF4] hover:text-[#5C92F6]"
        >
          Otevřít přehled platformy →
        </Link>
      </section>

      {/* Inquiry form */}
      <section id="inquiry" className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">Mám zájem</h2>
        <p className="text-sm text-[#5A6480] mb-6">
          Pošli nám poptávku, ozveme se ti s dostupností, finální cenou v Kč a termínem dodání.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BikeInquiryForm bikeModel={platform.name} bikeVariant={variant.name} />
          <div className="bg-[#EAF1FE] border border-[#C9DCFC] rounded-2xl p-6">
            <h3 className="text-base font-black text-[#1a1a2e] mb-3">Proč přes nás</h3>
            <ul className="space-y-2 text-sm text-[#1a1a2e]">
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Servis a bikefit přímo u nás ve Šternberku
              </li>
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Osobní převzetí — kolo si můžeš vyzkoušet před převzetím
              </li>
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Po domluvě dovezeme složené po celé Moravě
              </li>
              <li className="flex gap-2">
                <span className="text-[#3B7CF4] font-black">✓</span>
                Voskování řetězu, Lab detailing, keramická ložiska
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Další varianty platformy */}
      {otherVariants.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-1">
            Další varianty {platform.name}
          </h2>
          <p className="text-sm text-[#5A6480] mb-6">Levnější i prémiovější specifikace.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherVariants.map((v) => (
              <Link
                key={v.slug}
                href={`/clanky/scott-2027/${platform.slug}/${v.slug}`}
                className="block bg-white border border-[#E2E6F3] rounded-2xl overflow-hidden hover:shadow-md transition group"
              >
                <div className="relative aspect-square bg-gradient-to-br from-[#EAF1FE] to-[#F7F9FF]">
                  <Image
                    src={v.photo}
                    alt={v.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-contain p-4 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <div className="text-sm font-black text-[#1a1a2e] mb-0.5">{v.name}</div>
                  <div className="text-[11px] text-[#5A6480] line-clamp-1">{v.groupset}</div>
                  <div className="text-xs font-bold text-[#3B7CF4] mt-1">
                    {eurToCzk(v.priceEur)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox / zoom */}
      {zoom && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 cursor-zoom-out"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${platform.name} ${variant.name} — zvětšená fotka`}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl leading-none transition"
            aria-label="Zavřít"
          >
            ×
          </button>
          <div
            className="relative w-full h-full max-w-[1200px] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[activeImg] ?? variant.photo}
              alt={`${platform.name} ${variant.name} — detail`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
            Klikni kamkoli pro zavření
          </div>
        </div>
      )}
    </article>
  );
}
