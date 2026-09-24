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
