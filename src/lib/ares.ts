// ARES (Administrativní registr ekonomických subjektů) — public REST API.
// Docs: https://ares.gov.cz/swagger-ui/
//
// Žádný auth, ale rate-limit ~50 req/min — volat z serveru, nikdy z klienta.

import "server-only";

const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty";

export interface AresSubject {
  ico: string;
  name: string;
  dic: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  country: string;
  vatPayer: boolean;
}

interface AresRawResponse {
  ico: string;
  obchodniJmeno: string;
  dic?: string;
  sidlo?: {
    nazevUlice?: string;
    cisloDomovni?: number | string;
    cisloOrientacni?: number | string;
    cisloOrientacniPismeno?: string;
    nazevObce?: string;
    psc?: number | string;
    nazevStatu?: string;
  };
  seznamRegistraci?: {
    stavZdrojeDph?: string; // "AKTIVNI" pokud plátce
  };
}

function joinAddress(sidlo: AresRawResponse["sidlo"]): {
  street: string | null;
  city: string | null;
  zip: string | null;
} {
  if (!sidlo) return { street: null, city: null, zip: null };

  const parts: string[] = [];
  if (sidlo.nazevUlice) parts.push(sidlo.nazevUlice);
  const numParts: string[] = [];
  if (sidlo.cisloDomovni) numParts.push(String(sidlo.cisloDomovni));
  if (sidlo.cisloOrientacni) {
    numParts.push(`/${sidlo.cisloOrientacni}${sidlo.cisloOrientacniPismeno || ""}`);
  }
  if (numParts.length > 0) parts.push(numParts.join(""));

  return {
    street: parts.length > 0 ? parts.join(" ") : null,
    city: sidlo.nazevObce || null,
    zip: sidlo.psc ? String(sidlo.psc) : null,
  };
}

function normalizeIco(ico: string): string {
  return ico.replace(/\D/g, "").padStart(8, "0");
}

export async function lookupAresByIco(ico: string): Promise<AresSubject | null> {
  const cleanIco = normalizeIco(ico);
  if (cleanIco.length !== 8) {
    throw new Error("Neplatné IČO (musí být 8 číslic)");
  }

  const res = await fetch(`${ARES_BASE}/${cleanIco}`, {
    headers: { Accept: "application/json" },
    // Krátký cache — ARES data se mění pomalu
    next: { revalidate: 3600 },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`ARES request failed (${res.status})`);
  }

  const data = (await res.json()) as AresRawResponse;
  const addr = joinAddress(data.sidlo);

  return {
    ico: data.ico,
    name: data.obchodniJmeno,
    dic: data.dic || null,
    street: addr.street,
    city: addr.city,
    zip: addr.zip,
    country: data.sidlo?.nazevStatu || "Česká republika",
    vatPayer: data.seznamRegistraci?.stavZdrojeDph === "AKTIVNI",
  };
}
