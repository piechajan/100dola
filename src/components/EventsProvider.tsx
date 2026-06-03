"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Event } from "@/data/events";

const EventsContext = createContext<Event[] | null>(null);

export function EventsProvider({ events, children }: { events: Event[]; children: ReactNode }) {
  return <EventsContext.Provider value={events}>{children}</EventsContext.Provider>;
}

/**
 * Server-fetched, hydrated do client comps (Navbar, EventsSection).
 * Pokud provider chybí (např. nějaká orphan page), spadne na static import.
 */
export function useEvents(): Event[] {
  const ctx = useContext(EventsContext);
  if (ctx !== null) return ctx;
  // Fallback — neměl by nastat, ale aby SSR + ojedinělé page-y bez providera
  // neházely runtime error. Loaduje se synchronně z bundle (data/events.ts).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fallback = require("@/data/events") as { events: Event[] };
  return fallback.events;
}
