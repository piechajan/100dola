// Server-side sloučení attribution snapshotu z klienta + fbp/fbc z cookie hlaviček.
// JEDEN standard pro všechny konverzní endpointy — nový endpoint = jeden import + jeden řádek.
//
// Použití v route.ts:
//   const { attribution, fbp, fbc } = resolveAttribution(req.headers, data.attribution);
//   ...insert({ ..., attribution })        // nebo vnořit do options JSONB
//   ...sendMetaCapiEvent({ userData: { ..., fbp, fbc } })
//
// Proč merge: in-app prohlížeče (Strava/IG) nemusí poslat _fbp/_fbc v cookie hlavičce,
// ale klient je zachytil do snapshotu → bereme je jako fallback pro lepší CAPI match.

import type { Attribution } from "./attribution";
import { extractFbCookies } from "./meta-capi";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export function resolveAttribution(
  headers: Headers,
  clientAttribution?: Partial<Attribution> | null,
): { attribution: Attribution | null; fbp?: string; fbc?: string } {
  const { fbp: fbpCookie, fbc: fbcCookie } = extractFbCookies(headers);
  const merged: Attribution = { ...(clientAttribution ?? {}) };

  const fbp = fbpCookie ?? merged.fbp;
  const fbc = fbcCookie ?? merged.fbc;
  if (fbp) merged.fbp = fbp;
  if (fbc) merged.fbc = fbc;

  const attribution = Object.keys(merged).length ? merged : null;
  return { attribution, fbp, fbc };
}

export type ConversionType =
  | "order"
  | "malaga-signup"
  | "event-signup"
  | "service-booking"
  | "bike-inquiry"
  | "newsletter"
  | "return"
  | "stock-notify"
  | "contact"
  | "pojisteni";

// JEDINÝ zápis zdroje pro VŠECHNY konverze → tabulka conversion_attribution (migrace 039).
// Fire-and-forget a error-tolerant: NIKDY nezhodí reálnou konverzi. Když tabulka ještě
// neexistuje / Supabase je down / není zdroj → tiše přeskočí. Nový endpoint = jeden await.
export async function logConversionAttribution(params: {
  type: ConversionType;
  id?: string | null;
  email?: string | null;
  headers: Headers;
  clientAttribution?: Partial<Attribution> | null;
}): Promise<void> {
  try {
    const { attribution } = resolveAttribution(params.headers, params.clientAttribution);
    if (!attribution) return; // není z čeho určit zdroj (přímý přístup bez UTM/referrer)
    if (!isSupabaseConfigured()) return;
    const { error } = await getSupabase().from("conversion_attribution").insert({
      conversion_type: params.type,
      conversion_id: params.id ?? null,
      email: params.email ?? null,
      attribution,
    });
    if (error) console.error("[attribution] log insert error:", error.message);
  } catch (e) {
    // Logování zdroje je best-effort — reálná konverze proběhla, tohle je jen měření.
    console.error("[attribution] log failed:", e);
  }
}
