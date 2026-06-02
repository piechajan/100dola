"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  productSlug: string;
  productName: string;
  orderIdHint?: string;
}

export default function ReviewForm({ productSlug, productName, orderIdHint = "" }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [orderId, setOrderId] = useState(orderIdHint);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) {
      setError("Vyber prosím hodnocení (1-5 hvězd).");
      return;
    }
    if (body.trim().length < 20) {
      setError("Napiš prosím alespoň pár vět (min. 20 znaků).");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_slug: productSlug,
          product_name_snapshot: productName,
          customer_name: name.trim(),
          customer_email: email.trim().toLowerCase(),
          customer_city: city.trim() || null,
          rating,
          title: title.trim() || null,
          body: body.trim(),
          order_id: orderId.trim() || null,
          website,
        }),
      });
      if (r.status === 429) {
        setError("Recenzi sis odeslal vícekrát. Zkus to za pár hodin.");
        return;
      }
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.error === "invalid_input" ? "Zkontroluj prosím vyplnění." : "Nepovedlo se. Zkus to znovu.");
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F3] p-8 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-black text-[#1a1a2e] mb-2">Díky za recenzi!</h2>
        <p className="text-sm text-[#5A6480] mb-6 max-w-md mx-auto">
          Rychle ji projdeme (typicky do 24 h) a zveřejníme na stránce produktu.
        </p>
        <Link
          href={`/shop/${productSlug}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90"
        >
          Zpět na produkt
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-[#E2E6F3] p-6 space-y-5"
    >
      {/* Honeypot (skrytý) */}
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: "absolute", left: "-9999px", width: 0, height: 0 }}
      />

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-2">
          Tvoje hodnocení *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onMouseEnter={() => setHoverRating(r)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(r)}
              className="p-1"
              aria-label={`${r} z 5 hvězd`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill={(hoverRating || rating) >= r ? "#F5A623" : "none"} stroke={(hoverRating || rating) >= r ? "#F5A623" : "#E2E6F3"} strokeWidth={2}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
            Jméno *
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Novák"
            className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
            E-mail *
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jan@email.cz"
            className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
            Město <span className="font-normal normal-case text-[#9AA3C2]">(volitelné)</span>
          </span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Šternberk"
            className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
            Číslo objednávky <span className="font-normal normal-case text-[#9AA3C2]">(volitelné)</span>
          </span>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="2606020001"
            className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
          Titulek recenze <span className="font-normal normal-case text-[#9AA3C2]">(volitelné)</span>
        </span>
        <input
          type="text"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="např. Bezva kolo na dlouhé jízdy"
          className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
        />
      </label>

      <label className="block">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#5A6480] mb-1.5">
          Recenze * <span className="font-normal normal-case text-[#9AA3C2]">(min. 20 znaků)</span>
        </span>
        <textarea
          required
          minLength={20}
          maxLength={3000}
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Co se ti líbí? Co bys změnil? Komu bys ho doporučil?"
          className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4] resize-y"
        />
        <div className="text-[10px] text-[#9AA3C2] mt-1">{body.length} / 3000 znaků</div>
      </label>

      {error && (
        <div className="rounded-lg bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-5 py-3 rounded-full bg-[#1a1a2e] text-white text-sm font-bold hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? "Posílám…" : "Odeslat recenzi"}
      </button>

      <p className="text-[10px] text-[#9AA3C2] text-center">
        Před zveřejněním ti recenzi rychle projdeme. E-mail nepoužíváme k reklamě.
      </p>
    </form>
  );
}
