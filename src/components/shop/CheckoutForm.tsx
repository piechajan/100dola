"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, getCartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/data/products";
import {
  calcShippingFee,
  isPaymentAvailable,
} from "@/lib/orders";
import type { ShippingMethod, PaymentMethod } from "@/lib/schemas";
import ZasilkovnaPicker from "./ZasilkovnaPicker";

const accent = "#3B7CF4";

const SHIPPING_OPTIONS: { id: ShippingMethod; label: string; description: string }[] = [
  {
    id: "personal-sternberk",
    label: "Osobní vyzvednutí — Šternberk",
    description: "Vyzvedneš si na místě, předem informujeme.",
  },
  {
    id: "personal-olomouc",
    label: "Osobní vyzvednutí — Olomouc",
    description: "Vyzvedneš si na místě, předem informujeme.",
  },
  {
    id: "personal-valasske-mezirici",
    label: "Osobní vyzvednutí — Valašské Meziříčí",
    description: "Vyzvedneš si na místě, předem informujeme.",
  },
  { id: "zasilkovna", label: "Zásilkovna", description: "Doručení na pobočku Zásilkovny v ČR." },
  { id: "gls", label: "GLS", description: "Doručení na adresu v ČR." },
];

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: "qr", label: "QR platba", description: "Naskenuješ QR v bankovní aplikaci. Připraveno hned po objednávce." },
  { id: "bank-transfer", label: "Bankovní převod", description: "Klasický převod, VS = číslo objednávky." },
  { id: "cash-pickup", label: "Hotovost při převzetí", description: "Jen pro osobní vyzvednutí." },
];

const COMING_SOON_PAYMENTS: { label: string; description: string }[] = [
  { label: "Platební karta", description: "Připravujeme přes ComGate" },
  { label: "Apple Pay", description: "Připravujeme přes ComGate" },
  { label: "Google Pay", description: "Připravujeme přes ComGate" },
];

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const { subtotalWithVat, vatAmount, subtotalWithoutVat, hasBulky } = getCartTotals(items);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyIco, setCompanyIco] = useState("");
  const [companyDic, setCompanyDic] = useState("");
  const [showCompany, setShowCompany] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [zasilkovnaPickup, setZasilkovnaPickup] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("zasilkovna");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qr");
  const [notes, setNotes] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-přepni platbu pokud nesedí s dopravou
  useEffect(() => {
    if (!isPaymentAvailable(paymentMethod, shippingMethod)) {
      setPaymentMethod("qr");
    }
  }, [shippingMethod, paymentMethod]);

  const shippingFee = calcShippingFee(shippingMethod, hasBulky);
  const total = subtotalWithVat + shippingFee;
  const isPersonal = shippingMethod.startsWith("personal-");
  const isZasilkovna = shippingMethod === "zasilkovna";
  const needsAddress = !isPersonal;

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto text-center py-20">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="text-2xl font-black text-[#1a1a2e] mb-3">Košík je prázdný</h2>
        <p className="text-sm text-[#5A6480] mb-6">
          Nejdřív si přidej něco do košíku, pak se vrať k objednávce.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-full bg-[#3B7CF4] hover:opacity-90 transition-opacity"
        >
          Do shopu
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!gdprConsent) {
      setError("Musíš souhlasit se zpracováním osobních údajů.");
      return;
    }
    if (needsAddress && (!street.trim() || !city.trim() || !zip.trim())) {
      setError("Vyplň prosím doručovací adresu.");
      return;
    }
    if (isZasilkovna && !zasilkovnaPickup.trim()) {
      setError("Vyber prosím pobočku Zásilkovny.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      source: "order" as const,
      items: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        priceWithVat: i.priceWithVat,
        vatRate: i.vatRate,
        qty: i.qty,
        bulky: i.bulky,
      })),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: showCompany ? companyName.trim() || undefined : undefined,
      companyIco: showCompany ? companyIco.trim() || undefined : undefined,
      companyDic: showCompany ? companyDic.trim() || undefined : undefined,
      street: needsAddress ? street.trim() : undefined,
      city: needsAddress ? city.trim() : undefined,
      zip: needsAddress ? zip.trim() : undefined,
      zasilkovnaPickup: isZasilkovna ? zasilkovnaPickup.trim() : undefined,
      shippingMethod,
      paymentMethod,
      notes: notes.trim() || undefined,
      gdprConsent: true as const,
      website,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Něco se nepovedlo. Zkus to znovu.");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/objednavka/${data.orderId}`);
    } catch {
      setError("Nepodařilo se odeslat objednávku. Zkus to znovu.");
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm bg-white border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-[#3B7CF4] transition-colors";
  const labelClass = "block text-xs font-bold text-[#5A6480] mb-1.5 tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* LEFT — form */}
      <div className="space-y-8">
        {/* Honeypot */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        {/* Kontaktní údaje */}
        <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-7">
          <h2 className="text-lg font-black text-[#1a1a2e] mb-5">1. Kontakt</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Jméno a příjmení *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Jan Novák"
              />
            </div>
            <div>
              <label className={labelClass}>E-mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                placeholder="ty@email.cz"
              />
            </div>
            <div>
              <label className={labelClass}>Telefon *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClass}
                placeholder="+420 ..."
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCompany(!showCompany)}
            className="mt-4 text-xs font-bold text-[#5A6480] hover:text-[#3B7CF4] flex items-center gap-1"
          >
            {showCompany ? "−" : "+"} Objednávám na firmu (IČO / DIČ)
          </button>
          {showCompany && (
            <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-4 border-t border-[#F0F2FA]">
              <div className="sm:col-span-3">
                <label className={labelClass}>Název firmy</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>IČO</label>
                <input type="text" value={companyIco} onChange={(e) => setCompanyIco(e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>DIČ</label>
                <input type="text" value={companyDic} onChange={(e) => setCompanyDic(e.target.value)} className={inputClass} />
              </div>
            </div>
          )}
        </section>

        {/* Doprava */}
        <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-7">
          <h2 className="text-lg font-black text-[#1a1a2e] mb-1">2. Doprava</h2>
          <p className="text-xs text-[#9AA3C2] mb-5">
            Mnoho položek je u externích dodavatelů — konkrétní termín dodání upřesníme po přijetí objednávky.
          </p>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map((opt) => {
              const fee = calcShippingFee(opt.id, hasBulky);
              const active = shippingMethod === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setShippingMethod(opt.id)}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between gap-4"
                  style={{
                    borderColor: active ? accent : "#E2E6F3",
                    backgroundColor: active ? `${accent}08` : "transparent",
                  }}
                >
                  <div>
                    <div className="text-sm font-bold text-[#1a1a2e]">{opt.label}</div>
                    <div className="text-[11px] text-[#9AA3C2] mt-0.5">{opt.description}</div>
                  </div>
                  <div className="text-sm font-black text-[#1a1a2e] shrink-0">
                    {fee === 0 ? "zdarma" : formatPrice(fee)}
                  </div>
                </button>
              );
            })}
          </div>

          {needsAddress && (
            <div className="mt-5 grid sm:grid-cols-[1fr_140px_120px] gap-3 pt-5 border-t border-[#F0F2FA]">
              <div className="sm:col-span-3 text-xs font-bold text-[#5A6480] tracking-wide mb-1">
                Doručovací adresa
              </div>
              <div className="sm:col-span-3">
                <label className={labelClass}>Ulice a č.p. *</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required={needsAddress} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Město *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required={needsAddress} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>PSČ *</label>
                <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} required={needsAddress} className={inputClass} />
              </div>
            </div>
          )}

          {isZasilkovna && (
            <div className="mt-4 pt-4 border-t border-[#F0F2FA]">
              <label className={labelClass}>Pobočka Zásilkovny *</label>
              <ZasilkovnaPicker
                value={zasilkovnaPickup}
                onChange={(display) => setZasilkovnaPickup(display)}
                required={isZasilkovna}
              />
            </div>
          )}
        </section>

        {/* Platba */}
        <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-7">
          <h2 className="text-lg font-black text-[#1a1a2e] mb-5">3. Platba</h2>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const available = isPaymentAvailable(opt.id, shippingMethod);
              const active = paymentMethod === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => available && setPaymentMethod(opt.id)}
                  disabled={!available}
                  className="w-full text-left px-4 py-3 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: active ? accent : "#E2E6F3",
                    backgroundColor: active && available ? `${accent}08` : "transparent",
                  }}
                >
                  <div className="text-sm font-bold text-[#1a1a2e]">{opt.label}</div>
                  <div className="text-[11px] text-[#9AA3C2] mt-0.5">{opt.description}</div>
                </button>
              );
            })}
            {COMING_SOON_PAYMENTS.map((opt) => (
              <div
                key={opt.label}
                className="w-full text-left px-4 py-3 rounded-xl border-2 border-[#E2E6F3] opacity-50 cursor-not-allowed"
              >
                <div className="text-sm font-bold text-[#1a1a2e]">{opt.label} <span className="ml-2 text-[10px] uppercase tracking-wider text-[#9AA3C2]">brzy</span></div>
                <div className="text-[11px] text-[#9AA3C2] mt-0.5">{opt.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Poznámka */}
        <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-7">
          <h2 className="text-lg font-black text-[#1a1a2e] mb-5">4. Poznámka (nepovinné)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Cokoliv k objednávce, doporučená velikost, specifika dopravy..."
          />
        </section>

        {/* GDPR */}
        <label className="flex items-start gap-3 cursor-pointer rounded-xl p-4 bg-white border border-[#E2E6F3]">
          <input
            type="checkbox"
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#3B7CF4]"
            required
          />
          <span className="text-xs text-[#5A6480] leading-relaxed">
            Souhlasím se zpracováním osobních údajů za účelem zpracování této objednávky. Údaje uchováváme po dobu nezbytnou k vyřízení objednávky a v rozsahu zákonných povinností (faktury 10 let). Kdykoliv můžeš požádat o jejich výmaz. Provozovatel: FUTUNATU s.r.o., IČO 07376766.
          </span>
        </label>

        {error && (
          <div className="rounded-xl p-3 text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
      </div>

      {/* RIGHT — order summary */}
      <aside className="lg:sticky lg:top-24 self-start space-y-4">
        <div className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
          <h3 className="text-base font-black text-[#1a1a2e] mb-4">Souhrn objednávky</h3>

          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative w-14 h-14 rounded-lg bg-[#F0F2FA] overflow-hidden shrink-0">
                  <Image src={item.photo} alt={item.name} fill sizes="56px" className="object-contain p-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#1a1a2e] leading-tight line-clamp-2">{item.name}</div>
                  <div className="text-[10px] text-[#9AA3C2] mt-0.5">{item.qty} ks</div>
                </div>
                <div className="text-xs font-black text-[#1a1a2e] self-center">
                  {formatPrice(item.priceWithVat * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-[#F0F2FA] text-sm">
            <div className="flex justify-between text-[#5A6480]">
              <span>Mezisoučet</span>
              <span>{formatPrice(subtotalWithVat)}</span>
            </div>
            <div className="flex justify-between text-[#5A6480]">
              <span>Doprava</span>
              <span>{shippingFee === 0 ? "zdarma" : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#9AA3C2] pt-2">
              <span>v tom DPH</span>
              <span>{formatPrice(vatAmount)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-[#9AA3C2]">
              <span>cena bez DPH</span>
              <span>{formatPrice(subtotalWithoutVat)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#F0F2FA]">
              <span className="text-base font-black text-[#1a1a2e]">Celkem</span>
              <span className="text-xl font-black text-[#1a1a2e]">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-4 text-sm font-black text-white rounded-full transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: accent, boxShadow: `0 4px 16px ${accent}40` }}
          >
            {submitting ? "Odesílám..." : `Objednat za ${formatPrice(total)}`}
          </button>

          <p className="text-[10px] text-[#9AA3C2] text-center mt-3 leading-relaxed">
            Kliknutím odešleš objednávku. Mailem dostaneš potvrzení a platební info (QR kód, IBAN, VS).
          </p>
        </div>
      </aside>
    </form>
  );
}
