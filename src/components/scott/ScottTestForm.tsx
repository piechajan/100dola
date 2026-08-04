"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import Turnstile, { isTurnstileConfigured } from "@/components/Turnstile";
import { SCOTT_TEST_BIKES } from "@/data/scott-test-bikes";

// Rezervace se spouští 1. 8. 2026 — do té doby je konfigurátor viditelný
// (dá se procházet kola/termíny), ale objednat nejde (submit zamčený + banner).
const RESERVATIONS_OPEN_ISO = "2026-08-01";

// Testovací dny (Šternberk) — zápůjčka na 1,5 h, sloty 9:00–16:30.
// Víkendové vyjížďky (Dlouhé stráně / Pustevny) se tu nerozepisují —
// řeší se poptávkou → osobní domluva termínu i předání kola.
const TEST_DAYS = [
  { value: "po-3-8", label: "Po 3. 8." },
  { value: "ut-4-8", label: "Út 4. 8." },
  { value: "st-5-8", label: "St 5. 8." },
  { value: "ct-6-8", label: "Čt 6. 8." },
  { value: "po-10-8", label: "Po 10. 8." },
  { value: "ut-11-8", label: "Út 11. 8." },
  { value: "st-12-8", label: "St 12. 8." },
  { value: "ct-13-8", label: "Čt 13. 8." },
  { value: "pa-14-8", label: "Pá 14. 8." },
  { value: "po-17-8", label: "Po 17. 8." },
  { value: "ut-18-8", label: "Út 18. 8." },
];

const TIME_SLOTS = ["9:00–10:30", "10:30–12:00", "12:00–13:30", "13:30–15:00", "15:00–16:30"];

const RIDE_TERM_LABEL =
  "Víkendová vyjížďka (Dlouhé stráně / Pustevny) — poptávka k osobnímu kontaktu";

export default function ScottTestForm() {
  const [bike, setBike] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [testDay, setTestDay] = useState<string | null>(null);
  const [testSlot, setTestSlot] = useState<string | null>(null);
  const [ride, setRide] = useState(false);
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

  const bikeObj = SCOTT_TEST_BIKES.find((b) => b.slug === bike);
  const termLabel = ride
    ? RIDE_TERM_LABEL
    : testDay && testSlot
      ? `Testovací jízda · ${TEST_DAYS.find((d) => d.value === testDay)?.label} · ${testSlot} (zápůjčka 1,5 h)`
      : null;

  const canSubmit =
    reservationsOpen &&
    !submitting &&
    !!bike &&
    !!size &&
    !!termLabel &&
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
          term: termLabel,
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
      setTestDay(null);
      setTestSlot(null);
      setRide(false);
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
          {SCOTT_TEST_BIKES.map((b) => (
            <div
              key={b.slug}
              className={`rounded-xl border-2 overflow-hidden transition ${
                bike === b.slug ? "border-[#3B7CF4] bg-[#F7F9FF]" : "border-[#E2E6F3] bg-[#F7F9FF] hover:border-[#3B7CF4]/40"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setBike(b.slug);
                  setSize(null);
                }}
                className="text-left w-full block"
              >
                <div className="relative aspect-[4/3] bg-[#E9EEF9] p-2">
                  <Image
                    src={b.photos[0]}
                    alt={b.model}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="object-contain"
                  />
                </div>
                <div className="px-4 pt-4">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#9AA3C2] mb-1">{b.cat}</div>
                  <div className="text-sm font-black text-[#1a1a2e]">{b.model}</div>
                  <ul className="mt-1.5 mb-1 space-y-0.5">
                    {b.specs.map((s) => (
                      <li key={s} className="text-[11px] leading-snug text-[#5A6480] flex gap-1.5">
                        <span className="text-[#3B7CF4] flex-shrink-0">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs font-bold text-[#5A6480] mt-1.5">Velikosti: {b.sizes.join(" · ")}</div>
                </div>
              </button>
              <div className="px-4 pb-4 pt-2">
                <Link
                  href={`/vyzkousej-scott/${b.slug}`}
                  className="text-xs font-bold text-[#3B7CF4] hover:underline"
                >
                  Zobrazit detail a fotky →
                </Link>
              </div>
            </div>
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
        {/* Testovací jízda — vyber den */}
        <div className="text-xs font-bold text-[#5A6480] uppercase tracking-wider mb-2">Testovací jízda — vyber den</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TEST_DAYS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => {
                setTestDay(d.value);
                setRide(false);
              }}
              className={`px-3 py-3 rounded-xl border-2 text-sm font-bold transition ${
                testDay === d.value && !ride ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]" : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Vyber čas — 1,5h slot */}
        {testDay && !ride && (
          <div className="mt-4">
            <div className="text-xs font-bold text-[#5A6480] uppercase tracking-wider mb-2">Vyber čas — zápůjčka na 1,5 h</div>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTestSlot(s)}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-black transition ${
                    testSlot === s ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]" : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* nebo — víkendová vyjížďka řešená poptávkou */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-[#E2E6F3]" />
          <span className="text-xs text-[#9AA3C2] font-bold">nebo</span>
          <div className="h-px flex-1 bg-[#E2E6F3]" />
        </div>
        <button
          type="button"
          onClick={() => {
            setRide(true);
            setTestDay(null);
            setTestSlot(null);
          }}
          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-bold transition ${
            ride ? "border-[#3B7CF4] bg-[#F0F4FF] text-[#1a1a2e]" : "border-[#E2E6F3] bg-white text-[#5A6480] hover:border-[#3B7CF4]/40"
          }`}
        >
          Víkendová vyjížďka (Dlouhé stráně / Pustevny) — pošli poptávku, termín i předání kola domluvíme osobně
        </button>

        <p className="text-xs text-[#9AA3C2] mt-3">
          Testovací zápůjčka je na 1,5 hodiny. U víkendové vyjížďky se ti po odeslání ozveme a domluvíme termín i předání kola osobně.
        </p>
      </section>

      {/* Krok 3: kontakt */}
      <section className={`bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 transition-opacity ${termLabel ? "" : "opacity-50 pointer-events-none"}`}>
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
            {bikeObj && size && termLabel ? (
              <>
                <strong className="text-[#1a1a2e]">{bikeObj.model} · vel. {size}</strong>
                <br />
                {termLabel}
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
