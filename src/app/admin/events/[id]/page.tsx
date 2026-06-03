import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAdminContext } from "@/lib/admin-auth";
import { getEventFromDb, type EventRow } from "@/lib/events-db";
import { saveEventAction, deleteEventAction } from "../actions";

export const metadata: Metadata = {
  title: "Admin · Edit event — 100dola",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function AdminEventEditPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx) {
    const { id } = await params;
    redirect(`/admin/login?from=/admin/events/${id}`);
  }

  const { id } = await params;
  const isNew = id === "new";
  let row: EventRow | null = null;

  if (!isNew) {
    row = await getEventFromDb(id);
    if (!row) notFound();
  }

  const sp = await searchParams;
  const saved = sp?.saved === "1";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-[#F7F9FF] py-8">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <Link href="/admin/events" className="text-xs text-[#5A6480] hover:underline">
                ← Zpět na seznam
              </Link>
              <h1 className="text-3xl font-black text-[#1a1a2e] mt-1">
                {isNew ? "Nový event" : row?.title}
              </h1>
              {!isNew && row && (
                <p className="text-xs text-[#9AA3C2] font-mono mt-1">
                  /community/event/{row.slug}
                </p>
              )}
            </div>
            {saved && (
              <span className="text-[10px] uppercase font-bold px-3 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46]">
                ✓ Uloženo
              </span>
            )}
          </div>

          <form action={saveEventAction} className="bg-white rounded-2xl border border-[#E2E6F3] p-6 space-y-5">
            {!isNew && row && <input type="hidden" name="id" value={row.id} />}

            <Section title="Základ">
              <Field name="slug" label="Slug (URL)" value={row?.slug} required mono />
              <Field name="title" label="Titul" value={row?.title} required />
              <Row>
                <Select
                  name="sport"
                  label="Sport"
                  value={row?.sport ?? "Silnice"}
                  options={["Silnice", "Gravel", "MTB", "Skialpy", "Běžky", "Turistika", "Malaga"]}
                />
                <Select
                  name="difficulty"
                  label="Obtížnost"
                  value={row?.difficulty ?? "Střední"}
                  options={["Lehká", "Střední", "Náročná"]}
                />
              </Row>
            </Section>

            <Section title="Datum & čas">
              <Row>
                <Field name="date_iso" label="Datum (ISO YYYY-MM-DD)" value={row?.date_iso} required mono />
                <Field name="time_label" label="Čas (string)" value={row?.time_label} required mono placeholder="09:45" />
              </Row>
              <Field
                name="date_label"
                label="Datum (display label)"
                value={row?.date_label}
                required
                placeholder='např. "So 17. 5. 2026"'
              />
            </Section>

            <Section title="Místo">
              <Field name="location" label="Lokace" value={row?.location} required />
              <Textarea name="location_detail" label="Detail" value={row?.location_detail ?? ""} rows={2} />
              <Row>
                <Field name="distance" label="Vzdálenost" value={row?.distance ?? ""} placeholder="65 km" />
                <Field name="elevation" label="Převýšení" value={row?.elevation ?? ""} placeholder="1 200 m" />
              </Row>
            </Section>

            <Section title="Kapacita">
              <Row>
                <Field name="capacity" label="Kapacita celkem" value={String(row?.capacity ?? 20)} type="number" />
                <Field name="filled" label="Obsazeno" value={String(row?.filled ?? 0)} type="number" />
              </Row>
            </Section>

            <Section title="Popis">
              <Textarea name="description" label="Krátký popis (1-2 věty)" value={row?.description ?? ""} rows={2} required />
              <Textarea
                name="long_description"
                label="Dlouhý popis (markdown OK)"
                value={row?.long_description ?? ""}
                rows={10}
              />
              <Textarea
                name="what_to_bring"
                label="Co s sebou (1 položka per řádek)"
                value={(row?.what_to_bring ?? []).join("\n")}
                rows={5}
              />
              <Textarea name="who_is_it_for" label="Pro koho?" value={row?.who_is_it_for ?? ""} rows={2} />
            </Section>

            <Section title="Organizátor">
              <Row>
                <Field name="organizer_name" label="Jméno" value={row?.organizer_name ?? "Jan Piecha"} />
                <Field name="organizer_role" label="Role" value={row?.organizer_role ?? "Organizátor"} />
              </Row>
            </Section>

            <Section title="Media">
              <Field name="photo" label="Hero foto (cesta)" value={row?.photo ?? "/media/omc-hero-panel.jpg"} mono />
              <Textarea
                name="photo_gallery"
                label="Galerie (1 cesta per řádek)"
                value={(row?.photo_gallery ?? []).join("\n")}
                rows={4}
                mono
              />
            </Section>

            <Section title="Odkazy">
              <Field name="route_url" label="GPX/route URL" value={row?.route_url ?? ""} mono />
              <Field name="map_url" label="Mapa URL (embed)" value={row?.map_url ?? ""} mono />
              <Field name="strava_activity_url" label="Strava activity" value={row?.strava_activity_url ?? ""} mono />
            </Section>

            <Section title="CTA override (volitelné)">
              <Field
                name="external_url"
                label="External URL (CTA jde sem místo registrace)"
                value={row?.external_url ?? ""}
                mono
              />
              <Field
                name="external_cta_label"
                label="Label CTA tlačítka"
                value={row?.external_cta_label ?? ""}
                placeholder='např. "Rezervovat termín"'
              />
            </Section>

            <Section title="Stav">
              <div className="flex gap-6">
                <Checkbox name="is_published" label="Publikováno (live)" checked={row?.is_published ?? true} />
                <Checkbox name="is_past" label="Minulý event (archiv)" checked={row?.is_past ?? false} />
              </div>
            </Section>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E6F3]">
              <Link href="/admin/events" className="text-xs text-[#5A6480] hover:underline">
                Zrušit
              </Link>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1a1a2e] text-white rounded-full text-sm font-bold hover:opacity-90"
              >
                {isNew ? "Vytvořit event" : "Uložit změny"}
              </button>
            </div>
          </form>

          {!isNew && row && (
            <form action={deleteEventAction} className="mt-6 bg-[#FEE2E2] rounded-2xl border border-red-200 p-6">
              <input type="hidden" name="id" value={row.id} />
              <h3 className="text-sm font-black text-red-900 mb-1">Smazat event</h3>
              <p className="text-xs text-red-700 mb-3">
                Permanentně smaže ze DB. Nelze vrátit. (Pokud chceš jen schovat, odškrtni „Publikováno" výše.)
              </p>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-full text-xs font-bold hover:bg-red-700"
              >
                Smazat &laquo;{row.title}&raquo;
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#F0F2FA] pt-5 first:border-t-0 first:pt-0">
      <h2 className="text-[10px] uppercase tracking-wider text-[#9AA3C2] font-bold mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  name,
  label,
  value,
  type = "text",
  required = false,
  mono = false,
  placeholder,
}: {
  name: string;
  label: string;
  value?: string;
  type?: string;
  required?: boolean;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={value ?? ""}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}

function Textarea({
  name,
  label,
  value,
  rows = 4,
  required = false,
  mono = false,
}: {
  name: string;
  label: string;
  value?: string;
  rows?: number;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#5A6480] font-bold block mb-1">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </span>
      <textarea
        name={name}
        defaultValue={value ?? ""}
        rows={rows}
        required={required}
        className={`w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none ${mono ? "font-mono text-xs" : ""}`}
      />
    </label>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-[#5A6480] font-bold block mb-1">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="w-full px-3 py-2 rounded-lg border border-[#E2E6F3] text-sm focus:border-[#3B7CF4] focus:ring-1 focus:ring-[#3B7CF4] outline-none bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-[#1a1a2e]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="w-4 h-4 rounded border-[#E2E6F3] focus:ring-[#3B7CF4]"
      />
      <span>{label}</span>
    </label>
  );
}
