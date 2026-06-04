"use client";

import { useState } from "react";

const SERVICE_OPTIONS = [
  { value: "servis", label: "Servis kola" },
  { value: "bikefit", label: "Bikefit" },
  { value: "detailing", label: "Detailing / mytí" },
  { value: "jine", label: "Jiný požadavek" },
];

const BIKE_KIND_OPTIONS = [
  { value: "silnicni", label: "Silniční" },
  { value: "gravel", label: "Gravel" },
  { value: "mtb", label: "MTB" },
  { value: "elektrokolo", label: "Elektrokolo" },
  { value: "jine", label: "Jiné" },
];

const TIME_OPTIONS = [
  { value: "dopoledne", label: "Dopoledne (do 12 h)" },
  { value: "odpoledne", label: "Odpoledne (12-16 h)" },
  { value: "po-prac-dob", label: "Po 16 h" },
  { value: "kdykoliv", label: "Kdykoliv" },
];

export default function ServiceBookingForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      serviceType: String(fd.get("serviceType") ?? "").trim(),
      bikeBrand: String(fd.get("bikeBrand") ?? "").trim(),
      bikeModel: String(fd.get("bikeModel") ?? "").trim(),
      bikeKind: String(fd.get("bikeKind") ?? "").trim(),
      preferredDate: String(fd.get("preferredDate") ?? "").trim(),
      preferredTimeLabel: String(fd.get("preferredTimeLabel") ?? "").trim(),
      flexibility: String(fd.get("flexibility") ?? "").trim(),
      description: String(fd.get("description") ?? "").trim(),
      honeypot: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/service-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(errorLabel(data.error ?? "unknown"));
        setSubmitting(false);
        return;
      }
      setDone(true);
      setSubmitting(false);
    } catch {
      setError("Něco se pokazilo. Zkus to znovu nebo zavolej +420 739 045 057.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-[#A7F3D0] p-8 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-xl font-black text-[#065F46] mb-2">Dostal jsem to.</h3>
        <p className="text-sm text-[#5A6480] leading-relaxed">
          Ozvu se do 24 hodin s potvrzením termínu. Mezitím ti přišel potvrzovací e-mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 md:p-8 space-y-5">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <Section title="Kontakt">
        <Row>
          <Field name="name" label="Jméno a příjmení" required />
          <Field name="phone" type="tel" label="Telefon" required placeholder="+420 …" />
        </Row>
        <Field name="email" type="email" label="E-mail" required />
      </Section>

      <Section title="Co potřebuješ">
        <Select name="serviceType" label="Typ služby" required options={SERVICE_OPTIONS} />
        <Textarea name="description" label="Popis (co se děje / co od bikefitu čekáš)" rows={4} required />
      </Section>

      <Section title="Tvoje kolo (volitelné)">
        <Row>
          <Field name="bikeBrand" label="Značka" placeholder="Scott / Isaac / Pinarello…" />
          <Field name="bikeModel" label="Model" placeholder="Addict RC 10" />
        </Row>
        <Select name="bikeKind" label="Druh kola" options={[{ value: "", label: "— vyber —" }, ...BIKE_KIND_OPTIONS]} />
      </Section>

      <Section title="Kdy se ti to hodí">
        <Row>
          <Field name="preferredDate" type="date" label="Preferovaný den" />
          <Select name="preferredTimeLabel" label="Čas" options={[{ value: "", label: "— vyber —" }, ...TIME_OPTIONS]} />
        </Row>
        <Field name="flexibility" label="Flexibilita / poznámka k termínu" placeholder="Kdykoliv tento týden, jen víkend…" />
      </Section>

      {error && (
        <div className="rounded-lg p-3 text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#F0F2FA]">
        <p className="text-[11px] text-[#9AA3C2] max-w-md leading-relaxed">
          Odesláním souhlasíš se zpracováním údajů za účelem domluvení termínu.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {submitting ? "Odesílám…" : "Rezervovat termín"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#F0F2FA] pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field(props: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
        {props.label}
        {props.required && <span className="text-red-600"> *</span>}
      </span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        placeholder={props.placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
      />
    </label>
  );
}

function Textarea(props: { name: string; label: string; rows: number; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
        {props.label}
        {props.required && <span className="text-red-600"> *</span>}
      </span>
      <textarea
        name={props.name}
        rows={props.rows}
        required={props.required}
        className="w-full px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none"
      />
    </label>
  );
}

function Select(props: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
        {props.label}
        {props.required && <span className="text-red-600"> *</span>}
      </span>
      <select
        name={props.name}
        required={props.required}
        className="w-full px-3 py-2.5 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none bg-white"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function errorLabel(code: string): string {
  switch (code) {
    case "name_required": return "Doplň prosím jméno.";
    case "invalid_email": return "E-mail nevypadá platně.";
    case "phone_required": return "Telefon je povinný — koordinuju termíny po telefonu.";
    case "invalid_service_type": return "Vyber typ služby.";
    case "description_too_short": return "Napiš ještě pár slov o tom, co potřebuješ.";
    case "rate_limited": return "Příliš mnoho rezervací z této IP. Zkus to za chvíli nebo zavolej.";
    case "no_db": return "Něco se pokazilo na backendu. Zavolej +420 739 045 057.";
    default: return "Něco se pokazilo. Zkus to znovu, nebo zavolej +420 739 045 057.";
  }
}
