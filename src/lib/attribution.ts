// Attribution capture — fbp/fbc cookies + UTM tagy z URL, perzistované přes
// sessionStorage. Pro retrospektivní vyhodnocení zdroje leadu/rezervace.
//
// Klient používá `captureLandingAttribution()` jednou na mount layoutu
// (přes <AttributionTracker />) a `getAttribution()` v okamžiku submitu formuláře.

export type Attribution = {
  fbp?: string;
  fbc?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  gclid?: string;
  landing_url?: string;
  landing_referrer?: string;
  landing_at?: string; // ISO datetime první návštěvy
};

const STORAGE_KEY = "attribution_v1";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const parts = document.cookie.split(";");
  for (const p of parts) {
    const [k, ...v] = p.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

function readSessionAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

function writeSessionAttribution(a: Attribution): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    // sessionStorage může selhat (privacy mode) — fallback je server-side fbp/fbc z cookies.
  }
}

// Capture jednou na první page load v session. Pokud už něco uloženo, neoverwrituj
// UTM (landing values jsou definiční), ale aktualizuj fbp/fbc (mohou se nastavit pozdě
// po Pixel init).
export function captureLandingAttribution(): void {
  if (typeof window === "undefined") return;
  const existing = readSessionAttribution() ?? {};
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const next: Attribution = { ...existing };

  // UTM + click IDs — jen pokud session ještě nemá (zachovat landing values)
  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
  ] as const;
  let touchedLanding = false;
  for (const k of utmKeys) {
    const v = params.get(k);
    if (v && !next[k]) {
      next[k] = v;
      touchedLanding = true;
    }
  }
  if (!next.landing_url) {
    next.landing_url = url.pathname + url.search;
    touchedLanding = true;
  }
  if (!next.landing_referrer && document.referrer) {
    next.landing_referrer = document.referrer;
    touchedLanding = true;
  }
  if (!next.landing_at) {
    next.landing_at = new Date().toISOString();
    touchedLanding = true;
  }

  // fbp/fbc — vždy refresh (Pixel je může nastavit po prvním renderu)
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  if (fbp) next.fbp = fbp;
  if (fbc) next.fbc = fbc;

  if (touchedLanding || fbp || fbc) {
    writeSessionAttribution(next);
  }
}

// Vrátí aktuální snapshot pro form submit — sloučí session storage + live fbp/fbc.
export function getAttribution(): Attribution {
  const fromSession = readSessionAttribution() ?? {};
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  return {
    ...fromSession,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}
