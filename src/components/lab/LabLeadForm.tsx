"use client";

import { useState } from "react";
import { LAB_BRAND, LAB_SERVICES, LAB_CONTACT } from "@/data/lab";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";

const accent = LAB_BRAND.color;

type ServiceSlug = "bearings" | "shield" | "glaze" | "wax" | "cleanup" | "fit";
type BikeValue = "under100k" | "100to200k" | "200kPlus" | "undecided";

const BIKE_VALUE_OPTIONS: { value: BikeValue; label: string }[] = [
  { value: "under100k", label: "do 100k" },
  { value: "100to200k", label: "100–200k" },
  { value: "200kPlus", label: "nad 200k" },
  { value: "undecided", label: "neuvedeno" },
];

const WINDOW_OPTIONS = [
  "co nejdřív",
  "tento měsíc",
  "do měsíce",
  "pre-sezónní příprava (březen–duben)",
  "post-sezónní cleanup (říjen–listopad)",
  "ještě nevím",
];

export default function LabLeadForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bikeBrand, setBikeBrand] = useState("");
  const [bikeValue, setBikeValue] = useState<BikeValue | "">("");
  const [services, setServices] = useState<ServiceSlug[]>([]);
  const [preferredWindow, setPreferredWindow] = useState("");
  const [pickupInPrague, setPickupInPrague] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState("");

  const toggleService = (slug: ServiceSlug) => {
    setServices((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      source: "lab" as const,
      id: crypto.randomUUID(),
      registeredAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      bikeBrand: bikeBrand.trim() || undefined,
      bikeValue: bikeValue || undefined,
      services: services.length ? services : undefined,
      preferredWindow: preferredWindow || undefined,
      pickupInPrague,
      message: message.trim() || undefined,
      website,
    };

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json().catch(() => ({}));
      setDone(true);
      trackMetaEvent(
        "Lead",
        {
          content_name: "Lab inquiry",
          content_category: services.join(",") || "undecided",
        },
        data.eventId, // shodné s CAPI Lead → Meta dedup
      );
      trackGoogleEvent("generate_lead", {
        event_category: "lab",
        event_label: services.join(",") || "undecided",
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
          Ozveme se ti do 48 hodin s konkrétním termínem a finální cenou po prohlídce kola. Pokud spěcháš, napiš rovnou na{" "}
          <a href={`mailto:${LAB_CONTACT.email}`} className="underline" style={{ color: accent }}>
            {LAB_CONTACT.email}
          </a>{" "}
          nebo volej{" "}
          <a href={`tel:${LAB_CONTACT.phoneHref}`} className="underline" style={{ color: accent }}>
            {LAB_CONTACT.phone}
          </a>.
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm bg-white border border-[#E2E6F3] text-[#1a1a2e] placeholder-[#C0C7D8] focus:outline-none focus:border-[#1F4937] transition-colors";
  const labelClass = "block text-xs font-bold text-[#5A6480] mb-1.5 tracking-wide";

  return (
    <form
      id="poptavka"
      onSubmit={handleSubmit}
      className="rounded-3xl p-6 md:p-8 shadow-sm"
      style={{ backgroundColor: "#fff", border: "1px solid #E2E6F3" }}
    >
      <div className="mb-5">
        <h3 className="text-2xl font-black text-[#1a1a2e]">Poslat poptávku</h3>
        <p className="text-sm text-[#9AA3C2] mt-1">
          Vyber služby, doplň pár polí. Cenu a termín potvrdíme po krátké prohlídce kola.
        </p>
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: "-9999px", height: 0, width: 0, overflow: "hidden" }}>
        <label htmlFor="website-url-hp-lab">Web (nevyplňuj)</label>
        <input
          id="website-url-hp-lab"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="space-y-5">
        {/* Services */}
        <div>
          <label className={labelClass}>Co chceš s kolem udělat?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {LAB_SERVICES.map((svc) => {
              const active = services.includes(svc.slug as ServiceSlug);
              return (
                <button
                  key={svc.slug}
                  type="button"
                  onClick={() => toggleService(svc.slug as ServiceSlug)}
                  className="text-left px-4 py-3 rounded-xl text-sm border-2 transition-all"
                  style={{
                    borderColor: active ? accent : "#E2E6F3",
                    backgroundColor: active ? `${accent}08` : "transparent",
                    color: active ? accent : "#1a1a2e",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{svc.label}</span>
                    <span className="text-[11px] font-bold opacity-70">{svc.priceFrom}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#9AA3C2] mt-2">
            Vyber jednu nebo více. Klidně zaškrtni vše — diagnostika a doporučení jsou součástí.
          </p>
        </div>

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

        {/* Bike brand + value */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Značka / model kola</label>
            <input
              type="text"
              value={bikeBrand}
              onChange={(e) => setBikeBrand(e.target.value)}
              className={inputClass}
              placeholder="např. Scott Addict RC, Pinarello F12 …"
            />
          </div>
          <div>
            <label className={labelClass}>Orientační hodnota</label>
            <div className="grid grid-cols-4 gap-1.5">
              {BIKE_VALUE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBikeValue(opt.value)}
                  className="px-2 py-2.5 rounded-xl text-xs border-2 transition-all"
                  style={{
                    borderColor: bikeValue === opt.value ? accent : "#E2E6F3",
                    backgroundColor: bikeValue === opt.value ? `${accent}08` : "transparent",
                    color: bikeValue === opt.value ? accent : "#1a1a2e",
                    fontWeight: bikeValue === opt.value ? 700 : 500,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferred window */}
        <div>
          <label className={labelClass}>Kdy bys to chtěl řešit?</label>
          <select
            value={preferredWindow}
            onChange={(e) => setPreferredWindow(e.target.value)}
            className={inputClass}
          >
            <option value="">Vyber termín</option>
            {WINDOW_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Pickup in Prague */}
        <label className="flex items-start gap-3 cursor-pointer rounded-xl p-3 hover:bg-[#F7F7FA] transition-colors">
          <input
            type="checkbox"
            checked={pickupInPrague}
            onChange={(e) => setPickupInPrague(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#1F4937]"
          />
          <span className="text-sm text-[#1a1a2e]">
            <span className="font-semibold">Mám zájem o svoz kola.</span>{" "}
            <span className="text-[#9AA3C2]">Cenu spočítáme individuálně podle lokality a způsobu předání.</span>
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
            placeholder="Např. kolo po dvou sezónách bez péče, chci ho nachystat na Malagu …"
          />
        </div>

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
          Ozveme se ti do 48 hodin. Konkrétní cenu pošleme po krátké prohlídce kola — bez překvapení.
        </p>
      </div>
    </form>
  );
}
