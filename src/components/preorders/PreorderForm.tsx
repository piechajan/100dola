"use client";

import { useState } from "react";
import Link from "next/link";
import { trackMetaEvent } from "@/components/analytics/MetaPixel";
import { trackGoogleEvent } from "@/components/analytics/GoogleAnalytics";
import { getAttribution } from "@/lib/attribution";

interface Props {
  modelSlug: string;
  modelLabel: string;
}

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "Nevím / poradíte"];

export default function PreorderForm({ modelSlug, modelLabel }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [variantInterest, setVariantInterest] = useState("");
  const [sizeInterest, setSizeInterest] = useState("");
  const [notes, setNotes] = useState("");
  const [consentGdpr, setConsentGdpr] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  // honeypot
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const canSubmit =
    !submitting &&
    fullName.trim().length >= 2 &&
    email.includes("@") &&
    phone.trim().length >= 6 &&
    consentGdpr;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/preorders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelSlug,
          modelLabel,
          fullName,
          email,
          phone,
          variantInterest: variantInterest || undefined,
          sizeInterest: sizeInterest || undefined,
          notes: notes || undefined,
          consentGdpr: true,
          subscribeNewsletter,
          website,
          attribution: getAttribution(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({
          ok: false,
          message: data.error || "Něco se pokazilo, zkuste to prosím znovu.",
        });
        setSubmitting(false);
        return;
      }

      // Tracking events (browser side; CAPI běží server-side)
      trackMetaEvent(
        "Lead",
        {
          content_name: modelLabel,
          content_category: "preorder",
          content_ids: [modelSlug],
          currency: "CZK",
          value: 150000,
        },
        data.eventId, // shodné s CAPI Lead → Meta dedup
      );
      // GA4 Enhanced Conversions — průměrná hodnota XC kola Scott Spark RC ~150k CZK.
      // Aktualizovat až bude finální ceník (varianty 80-260k). Slouží pro
      // Google Ads conversion value bidding / ROAS optimalizaci.
      trackGoogleEvent("generate_lead", {
        currency: "CZK",
        value: 150000,
        item_id: modelSlug,
        item_name: modelLabel,
      });

      setResult({
        ok: true,
        message:
          "Předobjednávka přijata! Brzy se Ti ozveme. Potvrzení jsme poslali na Tvůj e-mail.",
      });
      // Reset
      setFullName("");
      setEmail("");
      setPhone("");
      setVariantInterest("");
      setSizeInterest("");
      setNotes("");
      setSubscribeNewsletter(false);
    } catch (err) {
      console.error("[preorder] submit failed", err);
      setResult({
        ok: false,
        message: "Nepodařilo se odeslat. Zkus to prosím znovu nebo nám zavolej.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <div className="bg-[#E8F7EE] border border-[#A6D9B8] rounded-2xl p-7 text-center">
        <div className="text-3xl mb-3">🚲</div>
        <h3 className="text-lg font-black text-[#1a1a2e] mb-2">Předobjednávka přijata</h3>
        <p className="text-sm text-[#1F4937] leading-relaxed mb-4">{result.message}</p>
        <p className="text-xs text-[#5A6480]">
          Pokud potřebuješ rychlejší odpověď, zavolej Janu Piechovi —{" "}
          <a
            href="tel:+420739045057"
            className="font-bold text-[#3B7CF4] underline hover:no-underline"
          >
            +420 739 045 057
          </a>
          .
        </p>
        <div className="mt-5">
          <Link
            href="/clanky/scott-spark-rc-2027"
            className="text-sm font-bold text-[#3B7CF4] hover:underline"
          >
            ← Zpět na článek o Spark RC 2027
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* honeypot */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px overflow-hidden"
        aria-hidden
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            Jméno a příjmení *
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            minLength={2}
            maxLength={120}
            placeholder="Jan Novák"
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            E-mail *
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            placeholder="jan@email.cz"
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            Telefon *
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            minLength={6}
            maxLength={40}
            placeholder="+420 ___ ___ ___"
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            Velikost rámu
          </span>
          <select
            value={sizeInterest}
            onChange={(e) => setSizeInterest(e.target.value)}
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] focus:outline-none focus:border-[#3B7CF4]"
          >
            <option value="">Vyberte (nebo "Poradíte")</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            Varianta / preferovaný model
          </span>
          <input
            type="text"
            value={variantInterest}
            onChange={(e) => setVariantInterest(e.target.value)}
            maxLength={200}
            placeholder="např. RC Pro, RC SL, top model, nejlevnější verze, nevím…"
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A6480]">
            Poznámka / dotazy
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1500}
            rows={4}
            placeholder="Zajímá mě konkrétní varianta, mám preferovaný termín dodání, dotaz k osazení…"
            className="mt-1.5 w-full px-4 py-3 rounded-xl bg-white border border-[#E2E6F3] text-sm text-[#1a1a2e] placeholder:text-[#9AA3C2] focus:outline-none focus:border-[#3B7CF4] resize-none"
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm text-[#5A6480]">
        <input
          type="checkbox"
          checked={consentGdpr}
          onChange={(e) => setConsentGdpr(e.target.checked)}
          required
          className="mt-1 w-4 h-4 accent-[#3B7CF4]"
        />
        <span>
          Souhlasím se zpracováním osobních údajů pro účely vyřízení předobjednávky a
          následné komunikace.{" "}
          <Link
            href="/ochrana-osobnich-udaju"
            className="font-bold text-[#3B7CF4] underline hover:no-underline"
          >
            Podrobnosti
          </Link>
          . *
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm text-[#5A6480]">
        <input
          type="checkbox"
          checked={subscribeNewsletter}
          onChange={(e) => setSubscribeNewsletter(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#3B7CF4]"
        />
        <span>
          Chci dostávat novinky od 100dola sport — nová kola, akce, eventy. Můžeš se kdykoli
          odhlásit.
        </span>
      </label>

      {result && !result.ok && (
        <div className="bg-[#FFF1EA] border border-[#FBC9A8] rounded-xl p-4 text-sm text-[#9B3D17]">
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-[#1a1a2e] hover:bg-[#2C3047] disabled:bg-[#9AA3C2] disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition"
      >
        {submitting ? "Odesílám…" : "Předobjednat Spark RC 2027"}
      </button>

      <p className="text-xs text-[#9AA3C2] text-center">
        Po odeslání Vám zavoláme nebo napíšeme z 100dola sport. Předobjednávka Tě
        nezavazuje k nákupu — slouží k rezervaci a domluvě podrobností.
      </p>
    </form>
  );
}
