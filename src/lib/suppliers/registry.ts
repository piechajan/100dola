// Registry registrovaných supplier adapters.
// Pro přidání nového dodavatele: import adaptér, přidej do `ADAPTERS` mapy.

import type { SupplierAdapter } from "./types";
import { sportimport } from "./sportimport";

export const ADAPTERS: Record<string, SupplierAdapter> = {
  sportimport,
  // Další: velocikon, czechrespeito, ...
};

export function getAdapter(adapterId: string): SupplierAdapter | undefined {
  return ADAPTERS[adapterId];
}

export function listAdapters(): SupplierAdapter[] {
  return Object.values(ADAPTERS);
}
