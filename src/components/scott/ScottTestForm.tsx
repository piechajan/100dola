"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import Turnstile, { isTurnstileConfigured } from "@/components/Turnstile";

// Rezervace se spouští 1. 8. 2026 — do té doby je konfigurátor viditelný
// (dá se procházet kola/termíny), ale objednat nejde (submit zamčený + banner).
const RESERVATIONS_OPEN_ISO = "2026-08-01";

// Reálný fleet SCOTT k zapůjčení (Šternberk). Velikosti dle skladu.
const SCOTT_BIKES = [
  { slug: "addict-rc-10", model: "SCOTT Addict RC 10", cat: "Silniční · závodní", sizes: ["M", "L", "XL"] },
  { slug: "foil-rc-10", model: "SCOTT Foil RC 10", cat: "Silniční · aero", sizes: ["M", "L", "XL"] },
  { slug: "addict-20", model: "SCOTT Addict 20", cat: "Silniční · endurance", sizes: ["M", "L", "XL"] },
  { slug: "addict-gravel-20", model: "SCOTT Addict Gravel 20", cat: "Gravel", sizes: ["S", "M", "L"] },
];

// Testovací sloty 9:00–16:00 + víkendové vyjížďky Czech Tour.
const TERMS = [
  { value: "test-3-7-8", label: "Testovací jízdy · Po–Pá 3.–7. 8. (9:00–16:00)" },
  { value: "ride-sternberk-15-8", label: "So 15. 8. · vyjížďka Šternberk → Dlouhé stráně" },
  { value: "ride-valmez-16-8", label: "Ne 16. 8. · vyjížďka Valašské Meziříčí → Pustevny" },
  { value: "test-17-19-8", label: "Testovací jízdy · Po–St 17.–19. 8. (9:00–16:00)" },
];

export default function ScottTestForm() {
  const [bike, setBike] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [term, setTerm] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  // Gate se dosadí po mountu (žádný hydration mismatch, žádné build-time zamrznutí).
  const [reservationsOpen, setReservationsOpen] = useState(false);

  useEffect(() => {
    setReservationsOpen(new Date().toISOString().slice(0, 10) >= RESERVATIONS_OPEN_ISO);
  }, []);

  const bikeObj = SCOTT_BIKES.find((b) => b.slug === bike);
  const termObj = TERMS.find((t) => t.value === term);

  const canSubmit =
    reservationsOpen &&
    !submitting &&
    !!bike &&
    !!size &&
    !!term &&
    name.trim().length >= 2 &&
    email.includes("@") &&
    phone.trim().length >= 6 &&
    consentGdpr &&
    (!isTurnstileConfigured || turnstileToken.length > 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/scott-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          bike: bikeObj?.model,
          size,
          term: termObj?.label,
          notes: notes || undefined,
          consentGdpr: true,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, message: data.error || "Odeslání selhalo" });
        return;
      }
      setResult({ ok: true, message: "Rezervace odeslána. Ozveme se ti s potvrzením kola a termínu." });
      trackMetaEvent("Lead", { content_name: "SCOTT test", content_category: "bike" }, data.eventId);
      trackGoogleEvent("generate_lead", { event_category: "scott_test", event_label: bikeObj?.model, value: 1 });
      setBike(null);
      setSize(null);
      setTerm(null);
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setConsentGdpr(false);
    } catch (err) {
      setResult({ ok: false, message: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 md:p-12 text-center">
        <div className="text-5xl mb-4">🚲</div>
        <h2 className="text-2xl md:text-3xl font-black text-[#1a1a2e] mb-3">Rezervace odeslána</h2>
        <p className="text-base text-[#5A6480] max-w-lg mx-auto mb-6">{result.message}</p>
        <button type="button" onClick={() => setResult(null)} className="px-5 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90">
          Poslat další rezervaci
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Banner — rezervace ještě nespuštěné */}
      {!reservationsOpen && (
        <div className="rounded-2xl bg-[#FFF9EB] border border-[#F3E1A8] p-5 text-center">
          <div className="text-sm font-black text-[#1a1a2e] mb-1">Rezervace spouštíme 1. srpna 2026</div>
          <p className="text-xs text-[#5A4A1F] leading-relaxed">
            Kola i termíny už si můžeš prohlédnout. Objednávat půjde od 1. 8. — mrkni sem znovu, nebo
            sleduj{" "}
            <a href="https://www.instagram.com/100dolasport.cz/" target="_blank" rel="noopener noreferrer" className="font-bold underline">
              Instagram
            </a>
            .
          </p>
        </div>
      )}

      {result && !result.ok && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 text-sm text-red-900">
          <strong>{result.message}</strong>
        </div>
      )}

      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden="true" />

      {/* Krok 1: kolo + velikost */}
      <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8">
        <div className="flex items-baseline gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#3B7CF4] text-white text-xs font-black flex items-center justify-center">1</div>
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Vyber kolo a velikost</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SCOTT_BIKES.map((b) => (
            <button
              key={b.slug}
              type="button"
              onClick={() => {
                setBike(b.slug);
                setSize(null);
              }}
              className={`text-left p-4 rounded-xl border-2 transition ${
                bike === b.slug ? "border-[#3B7CF4] bg-[#F7F9FF]" : "border-transparent bg-[#F7F9FF] hover:border-[#E2E6F3]"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AA3C2] mb-1">{b.cat}</div>
              <div className="text-sm font-black text-[#1a1a2e]">{b.model}</div>
              <div className="text-xs text-[#5A6480] mt-0.5">Velikosti: {b.sizes.join(" · ")}</div>
            </button>
          ))}
        </div>

        {bikeObj && (
          <div className="mt-4">
            <div className="text-xs font-bold text-[#5A6480] uppercase tracking-wider mb-2">Velikost — {bikeObj.model}</div>
            <div className="flex flex-wrap gap-2">
              {bikeObj.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`px-5 py-2.5 rounded-xl border-2 text-sm font-black transition ${
                    size === s ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]" : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#9AA3C2] mt-2">Nevíš velikost? Napiš výšku do poznámky, poradíme (nebo doladíme na místě bikefitem).</p>
          </div>
        )}
      </section>

      {/* Krok 2: termín */}
      <section className={`bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 transition-opacity ${size ? "" : "opacity-50 pointer-events-none"}`}>
        <div className="flex items-baseline gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#3B7CF4] text-white text-xs font-black flex items-center justify-center">2</div>
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Vyber termín</h2>
          {!size && <span className="text-xs text-[#9AA3C2]">— nejdřív vyber kolo a velikost</span>}
        </div>
        <div className="space-y-2">
          {TERMS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTerm(t.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition ${
                term === t.value ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]" : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[#9AA3C2] mt-3">U testovacích dní přesnou hodinu (9–16, po hodině) doladíme po odeslání. Na vyjížďky ti kolo připravíme na sraz.</p>
      </section>

      {/* Krok 3: kontakt */}
      <section className={`bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 transition-opacity ${term ? "" : "opacity-50 pointer-events-none"}`}>
        <div className="flex items-baseline gap-3 mb-4">
          <div className="w-7 h-7 rounded-full bg-[#3B7CF4] text-white text-xs font-black flex items-center justify-center">3</div>
          <h2 className="text-lg md:text-xl font-black text-[#1a1a2e]">Kontakt</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="text" placeholder="Celé jméno *" required value={name} onChange={(e) => setName(e.target.value)} className="md:col-span-2 px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]" />
          <input type="email" placeholder="E-mail *" required value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]" />
          <input type="tel" placeholder="Telefon *" required value={phone} onChange={(e) => setPhone(e.target.value)} className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]" />
          <textarea placeholder="Výška / poznámka (volitelné)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="md:col-span-2 px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]" />
        </div>

        {/* Podmínky zápůjčky */}
        <div className="mt-5 rounded-xl bg-[#F7F9FF] border border-[#E2E6F3] p-4 text-xs text-[#5A6480] leading-relaxed">
          <div className="font-black text-[#1a1a2e] mb-1.5">S sebou na test:</div>
          <ul className="space-y-1 list-disc list-inside marker:text-[#3B7CF4]">
            <li><strong>Občanský průkaz</strong> — slouží jako záloha, vrátíme po odevzdání kola</li>
            <li><strong>Helma</strong> — povinná, bez ní jízda nemůže proběhnout</li>
            <li>Vlastní <strong>pedály a tretry</strong> vítány (kola jsou bez pedálů — nasadíme tvoje)</li>
          </ul>
        </div>

        <label className="flex items-start gap-3 text-sm text-[#1a1a2e] cursor-pointer mt-4">
          <input type="checkbox" checked={consentGdpr} onChange={(e) => setConsentGdpr(e.target.checked)} className="mt-1 w-4 h-4 flex-shrink-0" />
          <span>
            Souhlasím se{" "}
            <Link href="/ochrana-osobnich-udaju" target="_blank" className="text-[#3B7CF4] font-bold hover:underline">zpracováním osobních údajů</Link>{" "}
            pro účely rezervace a komunikace o ní.
          </span>
        </label>

        <div className="mt-4">
          <Turnstile onToken={setTurnstileToken} />
        </div>

        <div className="mt-5 pt-5 border-t border-[#F0F2FA] flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm text-[#5A6480]">
            {bikeObj && size && termObj ? (
              <>
                <strong className="text-[#1a1a2e]">{bikeObj.model} · vel. {size}</strong>
                <br />
                {termObj.label}
              </>
            ) : (
              <span className="text-[#9AA3C2]">Vyber kolo, velikost a termín nahoře</span>
            )}
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            title={!reservationsOpen ? "Rezervace spouštíme 1. srpna 2026" : undefined}
            className="px-6 py-3 rounded-full bg-[#3B7CF4] text-white text-sm font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!reservationsOpen ? "Rezervace od 1. 8." : submitting ? "Odesílám..." : "Odeslat rezervaci"}
          </button>
        </div>
      </section>

      <p className="text-xs text-[#9AA3C2] text-center">
        Zápůjčka silničního SCOTTu na vyjížďku je zdarma, počet kol je omezený. Pro rychlé věci volej{" "}
        <a href="tel:+420739045057" className="text-[#3B7CF4] font-bold">+420 739 045 057</a>.
      </p>
    </form>
  );
}
