// Sdílený helper pro čtení a sledování consent stavu z cookies banneru.
// Client-only — používá localStorage + window event "cookies-consent".

export interface ConsentState {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
}

const STORAGE_KEY = "100dola-cookies-consent";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function subscribeConsent(cb: (state: ConsentState | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const ce = e as CustomEvent<ConsentState>;
    cb(ce.detail || null);
  };
  window.addEventListener("cookies-consent", handler);
  return () => window.removeEventListener("cookies-consent", handler);
}
