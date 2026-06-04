"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminContext } from "@/lib/admin-auth";
import { upsertEvent, deleteEvent, type EventInput } from "@/lib/events-db";
import type { Difficulty, Sport } from "@/data/events";

const SPORTS: Sport[] = ["Silnice", "Gravel", "MTB", "Skialpy", "Běžky", "Turistika", "Malaga"];
const DIFFS: Difficulty[] = ["Lehká", "Střední", "Náročná"];

function parseFormData(fd: FormData): EventInput {
  const sport = String(fd.get("sport") ?? "Silnice") as Sport;
  if (!SPORTS.includes(sport)) throw new Error(`invalid sport: ${sport}`);

  const difficulty = String(fd.get("difficulty") ?? "Střední") as Difficulty;
  if (!DIFFS.includes(difficulty)) throw new Error(`invalid difficulty: ${difficulty}`);

  const whatToBringRaw = String(fd.get("what_to_bring") ?? "");
  const photoGalleryRaw = String(fd.get("photo_gallery") ?? "");

  return {
    slug: String(fd.get("slug") ?? "").trim(),
    title: String(fd.get("title") ?? "").trim(),
    sport,
    date_label: String(fd.get("date_label") ?? "").trim(),
    date_iso: String(fd.get("date_iso") ?? "").trim(),
    time_label: String(fd.get("time_label") ?? "").trim(),
    location: String(fd.get("location") ?? "").trim(),
    location_detail: nullable(fd.get("location_detail")),
    distance: nullable(fd.get("distance")),
    elevation: nullable(fd.get("elevation")),
    difficulty,
    capacity: parseInt(String(fd.get("capacity") ?? "0"), 10) || 0,
    filled: parseInt(String(fd.get("filled") ?? "0"), 10) || 0,
    description: String(fd.get("description") ?? "").trim(),
    long_description: nullable(fd.get("long_description")),
    what_to_bring: whatToBringRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    who_is_it_for: nullable(fd.get("who_is_it_for")),
    organizer_name: String(fd.get("organizer_name") ?? "Jan Piecha").trim(),
    organizer_role: String(fd.get("organizer_role") ?? "Organizátor").trim(),
    photo: String(fd.get("photo") ?? "/media/omc-hero-panel.jpg").trim(),
    photo_gallery: photoGalleryRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    route_url: nullable(fd.get("route_url")),
    map_url: nullable(fd.get("map_url")),
    strava_activity_url: nullable(fd.get("strava_activity_url")),
    external_url: nullable(fd.get("external_url")),
    external_cta_label: nullable(fd.get("external_cta_label")),
    is_past: fd.get("is_past") === "on",
    is_published: fd.get("is_published") === "on",
  };
}

function nullable(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export async function saveEventAction(formData: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/events");

  const id = (formData.get("id") as string | null) || undefined;
  const input = parseFormData(formData);

  if (!input.slug || !input.title || !input.date_iso) {
    throw new Error("slug, title a date_iso jsou povinné");
  }

  const result = await upsertEvent(input, ctx.email, id);
  if (!result.ok) {
    throw new Error(result.error);
  }

  revalidatePath("/admin/events", "page");
  revalidateTag("events", "minutes");
  redirect(`/admin/events/${result.id}?saved=1`);
}

export async function deleteEventAction(formData: FormData) {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login?from=/admin/events");

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("id chybí");

  const result = await deleteEvent(id);
  if (!result.ok) throw new Error(result.error);

  revalidatePath("/admin/events", "page");
  revalidateTag("events", "minutes");
  redirect("/admin/events?deleted=1");
}
