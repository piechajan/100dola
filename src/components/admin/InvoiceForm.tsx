"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectId = "sport" | "lab" | "malaga" | "omc";

const PROJECTS: { id: ProjectId; label: string; color: string; bg: string }[] = [
  { id: "sport", label: "100dola sport", color: "#3B7CF4", bg: "#3B7CF410" },
  { id: "malaga", label: "100dola Malaga", color: "#E8431A", bg: "#E8431A10" },
  { id: "lab", label: "100dola Lab", color: "#1F4937", bg: "#1F493710" },
  { id: "omc", label: "Open Miles Clinic", color: "#2EAA6E", bg: "#2EAA6E10" },
];

interface Line {
  name: string;
  qty: number;
  unit: string;
  unitPriceWithVat: number;
  vatRate: 0 | 12 | 21;
}

const EMPTY_LINE: Line = {
  name: "",
  qty: 1,
  unit: "ks",
  unitPriceWithVat: 0,
  vatRate: 21,
};

export default function InvoiceForm() {
  const router = useRouter();
  const [project, setProject] = useState<ProjectId>("lab");
  const [ico, setIco] = useState("");
  const [dic, setDic] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [aresLoading, setAresLoading] = useState(false);
  const [aresError, setAresError] = useState<string | null>(null);

  const [lines, setLines] = useState<Line[]>([{ ...EMPTY_LINE }]);
  const [note, setNote] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    pdfUrl?: string;
    htmlUrl?: string;
    number?: string;
  } | null>(null);

  async function lookupAres() {
    if (!/^\d{8}$/.test(ico)) {
      setAresError("Zadej 8místné IČO.");
      return;
    }
    setAresLoading(true);
    setAresError(null);
    try {
      const res = await fetch(`/api/admin/ares?ico=${ico}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setAresError(data.error || "ARES lookup selhal");
        return;
      }
      const s = data.subject;
      setName(s.name || "");
      setDic(s.dic || "");
      setStreet(s.street || "");
      setCity(s.city || "");
      setZip(s.zip || "");
    } catch (e) {
      setAresError(e instanceof Error ? e.message : "Network error");
    } finally {
      setAresLoading(false);
    }
  }

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function addLine() {
    setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  }
  function removeLine(idx: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  const subtotalWithVat = lines.reduce(
    (s, l) => s + l.qty * l.unitPriceWithVat,
    0,
  );

  async function submit() {
    setSubmitting(true);
    setResult(null);
    try {
      const payload = {
        project,
        customer: {
          ico: ico || undefined,
          dic: dic || undefined,
          name,
          email,
          phone: phone || undefined,
          street: street || undefined,
          city: city || undefined,
          zip: zip || undefined,
        },
        lines,
        note: note || undefined,
        sendEmail,
      };
      const res = await fetch("/api/admin/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({
          ok: false,
          message: data.error || "Vytvoření faktury selhalo",
        });
        return;
      }
      setResult({
        ok: true,
        message: `Faktura ${data.invoice.number} vytvořena${sendEmail ? " a odeslána klientovi" : ""}.`,
        pdfUrl: data.invoice.pdfUrl,
        htmlUrl: data.invoice.htmlUrl,
        number: data.invoice.number,
      });
      // Reset form po úspěchu
      setLines([{ ...EMPTY_LINE }]);
      setIco("");
      setDic("");
      setName("");
      setEmail("");
      setPhone("");
      setStreet("");
      setCity("");
      setZip("");
      setNote("");
      router.refresh();
    } catch (e) {
      setResult({
        ok: false,
        message: e instanceof Error ? e.message : "Network error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    !submitting &&
    name.trim().length > 0 &&
    email.includes("@") &&
    lines.every((l) => l.name.trim().length > 0 && l.qty > 0);

  const activeProject = PROJECTS.find((p) => p.id === project)!;

  return (
    <div className="space-y-6">
      {/* Result banner */}
      {result && (
        <div
          className={`rounded-xl p-4 text-sm border ${
            result.ok
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          <strong>{result.message}</strong>
          {result.ok && result.pdfUrl && (
            <div className="mt-2 flex gap-3 text-xs">
              <a
                href={result.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                PDF
              </a>
              <a
                href={result.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline"
              >
                Detail ve Fakturoidu →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Projekt */}
      <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
        <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Projekt</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProject(p.id)}
              className={`p-3 rounded-xl text-left transition border-2 ${
                project === p.id
                  ? "border-current"
                  : "border-transparent hover:border-[#E2E6F3]"
              }`}
              style={{
                backgroundColor: project === p.id ? p.bg : "#F7F9FF",
                color: project === p.id ? p.color : "#5A6480",
              }}
            >
              <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: p.color }} />
              <div className="text-xs font-black uppercase tracking-wider">
                {p.label}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Klient */}
      <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
        <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Klient</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2 flex gap-2">
            <input
              type="text"
              placeholder="IČO (8 číslic) — ARES auto-fill"
              value={ico}
              onChange={(e) => setIco(e.target.value.replace(/\D/g, "").slice(0, 8))}
              className="flex-1 px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
            />
            <button
              type="button"
              onClick={lookupAres}
              disabled={aresLoading || ico.length !== 8}
              className="px-4 py-3 rounded-xl text-sm font-bold bg-[#1a1a2e] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {aresLoading ? "..." : "ARES"}
            </button>
          </div>
          {aresError && (
            <div className="md:col-span-2 text-xs text-red-700">{aresError}</div>
          )}
          <input
            type="text"
            placeholder="Jméno / firma *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="text"
            placeholder="DIČ"
            value={dic}
            onChange={(e) => setDic(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="email"
            placeholder="E-mail klienta *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="tel"
            placeholder="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="text"
            placeholder="Ulice"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="md:col-span-2 px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="text"
            placeholder="Město"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
          <input
            type="text"
            placeholder="PSČ"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
          />
        </div>
      </section>

      {/* Položky */}
      <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-[#1a1a2e]">Položky</h2>
          <button
            type="button"
            onClick={addLine}
            className="text-xs font-bold text-[#3B7CF4] hover:underline"
          >
            + Přidat položku
          </button>
        </div>
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-start bg-[#F7F9FF] rounded-xl p-3"
            >
              <input
                type="text"
                placeholder="Název položky"
                value={line.name}
                onChange={(e) => updateLine(idx, { name: e.target.value })}
                className="col-span-12 md:col-span-5 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Ks"
                value={line.qty}
                onChange={(e) => updateLine(idx, { qty: parseFloat(e.target.value) || 0 })}
                className="col-span-3 md:col-span-1 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
              />
              <input
                type="text"
                placeholder="ks"
                value={line.unit}
                onChange={(e) => updateLine(idx, { unit: e.target.value })}
                className="col-span-3 md:col-span-1 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Cena s DPH"
                value={line.unitPriceWithVat}
                onChange={(e) =>
                  updateLine(idx, { unitPriceWithVat: parseFloat(e.target.value) || 0 })
                }
                className="col-span-4 md:col-span-2 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4]"
              />
              <select
                value={line.vatRate}
                onChange={(e) =>
                  updateLine(idx, {
                    vatRate: parseInt(e.target.value, 10) as 0 | 12 | 21,
                  })
                }
                className="col-span-2 md:col-span-2 px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4] bg-white"
              >
                <option value={21}>21 %</option>
                <option value={12}>12 %</option>
                <option value={0}>0 %</option>
              </select>
              <button
                type="button"
                onClick={() => removeLine(idx)}
                disabled={lines.length === 1}
                className="col-span-12 md:col-span-1 text-xs text-red-600 font-bold hover:underline disabled:opacity-30 disabled:cursor-not-allowed text-right md:text-center"
                title="Smazat"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-[#F0F2FA] flex justify-end text-sm">
          <div className="text-[#5A6480]">
            Celkem s DPH:{" "}
            <strong className="text-[#1a1a2e] text-base ml-1">
              {new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 2 }).format(
                subtotalWithVat,
              )}{" "}
              Kč
            </strong>
          </div>
        </div>
      </section>

      {/* Poznámka + odeslat */}
      <section className="bg-white rounded-2xl border border-[#E2E6F3] p-6">
        <h2 className="text-sm font-black text-[#1a1a2e] mb-3">Poznámka & odeslání</h2>
        <textarea
          placeholder="Poznámka pro klienta (volitelné — objeví se na faktuře)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-[#E2E6F3] text-sm focus:outline-none focus:border-[#3B7CF4] mb-3"
        />
        <label className="flex items-center gap-2 text-sm text-[#5A6480]">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4"
          />
          Odeslat fakturu klientovi e-mailem hned po vytvoření
        </label>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="px-6 py-3 rounded-full font-black text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: activeProject.color }}
        >
          {submitting ? "Vytvářím..." : `Vystavit fakturu — ${activeProject.label}`}
        </button>
      </div>
    </div>
  );
}
