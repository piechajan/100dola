"use client";

import { useState } from "react";
import { MALAGA_BRAND, GROUP_NOTE, EBIKE_SURCHARGE } from "@/data/malaga";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";

const accent = MALAGA_BRAND.color;

type Intent = "transport" | "storage" | "package" | "tour" | "group" | "other";
type PackageInterest = "basic" | "exclusive" | "undecided";

const INTENT_OPTIONS: { value: Intent; label: string }[] = [
  { value: "package", label: "Kompletní balíček (transport + skladování)" },
  { value: "transport", label: "Jen doprava kola" },
  { value: "storage", label: "Jen skladování" },
  { value: "group", label: "Skupina / klub" },
  { value: "tour", label: "Guided tour" },
  { value: "other", label: "Něco jiného" },
];

const MONTH_OPTIONS = [
  "říjen 2026", "listopad 2026", "prosinec 2026",
  "leden 2027", "únor 2027", "březen 2027",
  "duben 2027", "květen 2027",
  "ještě nevím",
];

interface Props {
  defaultIntent?: Intent;
  defaultPackage?: PackageInterest;
  compact?: boolean;
}

export default function MalagaLeadForm({ defaultIntent = "package", defaultPackage, compact = false }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState<Intent>(defaultIntent);
  const [packageInterest, setPackageInterest] = useState<PackageInterest | "">(defaultPackage ?? "");
  const [bikeCount, setBikeCount] = useState<string>("1");
  const [bikeType, setBikeType] = useState("");
  const [preferredMonth, setPreferredMonth] = useState("");
  const [pickupAtHome, setPickupAtHome] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Honeypot — viz lib/schemas (HONEYPOT_NAME = "website"). Pole je v DOM, ale
  // pro skutečné uživatele neviditelné. Bot ho vyplní → server odmítne (tichá 200).
  const [website, setWebsite] = useState("");

  const isGroupy = intent === "group" || (parseInt(bikeCount) || 0) >= 5;
  const isEbike = /e-?bike|elektro|elektrické?/i.test(bikeType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      source: "malaga" as const,
      id: crypto.randomUUID(),
      registeredAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      intent,
      packageInterest: packageInterest || undefined,
      bikeCount: parseInt(bikeCount) || 1,
      bikeType: bikeType.trim() || undefined,
      isEbike,
      preferredMonth: preferredMonth || undefined,
      groupKind: isGroupy ? ("group" as const) : ("individual" as const),
      pickupAtHome,
      message: message.trim() || undefined,
      website, // honeypot — pro reálné uživatele "", bot ho vyplní
    };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server error");
      setDone(true);
      trackMetaEvent("Lead", {
        content_name: "Malaga inquiry",
        content_category: intent,
      });
      trackGoogleEvent("generate_lead", {
        event_category: "malaga",
        event_label: intent,
        value: 1,
      });
    } catch {
      setError("Něco se nepovedlo. Zkus to za chvilku znovu, nebo nám napiš e-mail přímo.");
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl p-8 text-center" style={{ backgroundColor: "#fff", border: `2px solid ${accent}30` }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${accent}15` }}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={accent} strokeWidth={2.5}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="font-black text-lg text-[#1a1a2e] mb-1">Poptávka odeslaná!</div>
        <div className="text-sm text-[#5A6480] max-w-md mx-auto">
          Ozveme se ti do 24 hodin s konkrétním dalším krokem. Pokud spěcháš, napiš rovnou na{" "}
          <a href="mailto:info@100dola.com" className="underline" style={{ color: accent }}>
            info@100dola.com
          </a>{" "}
          nebo volej{" "}
          <a href="tel:+420739045057" className="underline" style={{ color: accent }}>
            +420 739 045 057
          </a>.
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm bg-white border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-[#E8431A] transition-colors";
  const labelClass = "block text-xs font-bold text-[#5A6480] mb-1.5 tracking-wide";

  return (
    <form
      id="poptavka"
      onSubmit={handleSubmit}
      className={`rounded-3xl p-6 md:p-8 ${compact ? "" : "shadow-sm"}`}
      style={{ backgroundColor: "#fff", border: "1px solid #E2E6F3" }}
    >
      <div className="mb-5">
        <h3 className="text-2xl font-black text-[#1a1a2e]">Poslat poptávku</h3>
        <p className="text-sm text-[#9AA3C2] mt-1">
          Stačí pár polí. Nemusíš zatím vědět všechno — doladíme spolu.
        </p>
      </div>

      {/* Honeypot — pro reálné uživatele neviditelné; vyplněné = spam */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
        <label htmlFor="website-url-hp">Web (nevyplňuj)</label>
        <input
          id="website-url-hp"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {/* Intent */}
        <div>
          <label className={labelClass}>Co tě zajímá?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INTENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntent(opt.value)}
                className="text-left px-4 py-3 rounded-xl text-sm border-2 transition-all"
                style={{
                  borderColor: intent === opt.value ? accent : "#E2E6F3",
                  backgroundColor: intent === opt.value ? `${accent}08` : "transparent",
                  color: intent === opt.value ? accent : "#1a1a2e",
                  fontWeight: intent === opt.value ? 700 : 500,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Package interest — show if intent is package */}
        {intent === "package" && (
          <div>
            <label className={labelClass}>Který balíček?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "basic", label: "Basic" },
                { value: "exclusive", label: "Exclusive" },
                { value: "undecided", label: "Ještě nevím" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPackageInterest(opt.value as PackageInterest)}
                  className="px-4 py-2.5 rounded-xl text-sm border-2 transition-all"
                  style={{
                    borderColor: packageInterest === opt.value ? accent : "#E2E6F3",
                    backgroundColor: packageInterest === opt.value ? `${accent}08` : "transparent",
                    color: packageInterest === opt.value ? accent : "#1a1a2e",
                    fontWeight: packageInterest === opt.value ? 700 : 500,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Name + email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Jméno *</label>
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
        </div>

        {/* Phone */}
        <div>
          <label className={labelClass}>Telefon</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+420 ..."
          />
        </div>

        {/* Bike count + type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Počet kol</label>
            <select
              value={bikeCount}
              onChange={(e) => setBikeCount(e.target.value)}
              className={inputClass}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
              <option value="7">7+</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Typ kola</label>
            <input
              type="text"
              value={bikeType}
              onChange={(e) => setBikeType(e.target.value)}
              className={inputClass}
              placeholder="silniční / gravel / MTB / e-bike"
            />
          </div>
        </div>

        {/* Preferred month */}
        <div>
          <label className={labelClass}>Kdy bys chtěl vyrazit?</label>
          <select
            value={preferredMonth}
            onChange={(e) => setPreferredMonth(e.target.value)}
            className={inputClass}
          >
            <option value="">Vyber měsíc</option>
            {MONTH_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Pickup at home */}
        <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3 hover:bg-[#F7F7FA] transition-colors">
          <input
            type="checkbox"
            checked={pickupAtHome}
            onChange={(e) => setPickupAtHome(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#E8431A]"
          />
          <span className="text-sm text-[#1a1a2e]">
            <span className="font-semibold">Mám zájem o vyzvednutí kola u mě doma.</span>{" "}
            <span className="text-[#9AA3C2]">Cenu spočítáme individuálně podle vzdálenosti a způsobu předání.</span>
          </span>
        </label>

        {/* Message */}
        <div>
          <label className={labelClass}>Cokoliv k tomu — kontext, dotazy, časový rámec</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="Např. plánujeme parta 4 lidí, jezdíme road, chceme tam být dvakrát za zimu..."
          />
        </div>

        {/* E-bike hint */}
        {isEbike && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: `${accent}08`, color: "#1a1a2e", border: `1px solid ${accent}30` }}
          >
            <div className="font-bold mb-1" style={{ color: accent }}>⚡ E-bike</div>
            {EBIKE_SURCHARGE.reason} Doprava one-way +{EBIKE_SURCHARGE.oneWayEur} €, round-trip +{EBIKE_SURCHARGE.roundTripEur} €.
          </div>
        )}

        {/* Group hint */}
        {isGroupy && (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ backgroundColor: `${accent}08`, color: "#1a1a2e", border: `1px solid ${accent}30` }}
          >
            <div className="font-bold mb-1" style={{ color: accent }}>Skupina / klub</div>
            {GROUP_NOTE}
          </div>
        )}

        {error && (
          <div className="rounded-xl p-3 text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 text-sm font-black text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: accent, boxShadow: `0 4px 16px ${accent}40` }}
        >
          {submitting ? "Odesílám..." : "Odeslat poptávku"}
        </button>

        <p className="text-[11px] text-[#9AA3C2] text-center leading-relaxed">
          Ozveme se ti do 24 hodin. Konkrétní cenu pošleme podle termínu, počtu kol a způsobu předání.
        </p>
      </div>
    </form>
  );
}
