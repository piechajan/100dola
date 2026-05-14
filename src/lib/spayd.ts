// SPAYD (Short Payment Descriptor) — český standard pro platební QR kódy.
// Čte FIO Banka, KB, Air Bank, Česká Spořitelna, mBank, Revolut, Wise atd.
//
// Spec: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
//
// FUTUNATU s.r.o. — účet 2001508163/2010 (FIO Banka)

import QRCode from "qrcode";

const FUTUNATU_ACCOUNT = "2001508163";
const FUTUNATU_BANK_CODE = "2010"; // FIO Banka

/**
 * Vypočítá IBAN ze starého-CZ formátu účet/banka.
 * Spec: https://www.cnb.cz/cs/platebni-styk/iban/
 *
 * Czech BBAN structure: bank_code(4) + prefix(6, zeros if none) + account_number(10, left-padded)
 */
export function czIban(account: string, bankCode: string): string {
  // Split account on '-' if has prefix (e.g. "19-2000145399")
  const parts = account.split("-");
  const prefix = parts.length === 2 ? parts[0] : "";
  const accountNumber = parts.length === 2 ? parts[1] : parts[0];

  const prefixPadded = prefix.padStart(6, "0");
  const accountPadded = accountNumber.padStart(10, "0");
  const bban = `${bankCode}${prefixPadded}${accountPadded}`;

  // ISO 13616: move "CZ00" to the end, replace letters with digits (C=12, Z=35), then check = 98 - (num mod 97)
  const rearranged = `${bban}CZ00`;
  const numeric = rearranged
    .split("")
    .map((c) => {
      if (/\d/.test(c)) return c;
      return String(c.charCodeAt(0) - 55); // A=10, B=11, ..., Z=35
    })
    .join("");

  // mod 97 on big number (string-based)
  let remainder = "";
  for (const digit of numeric) {
    remainder = remainder + digit;
    if (remainder.length >= 9) {
      remainder = String(Number(remainder) % 97);
    }
  }
  const mod = Number(remainder) % 97;
  const check = (98 - mod).toString().padStart(2, "0");

  return `CZ${check}${bban}`;
}

export const FUTUNATU_IBAN = czIban(FUTUNATU_ACCOUNT, FUTUNATU_BANK_CODE);

/**
 * SPAYD payment string.
 * - `amount` v Kč, max 2 desetinná místa (formátováno jako X.XX)
 * - `vs` (variabilní symbol) max 10 znaků, jen číslice
 * - `message` max 60 znaků (bez diakritiky pro nejlepší kompatibilitu)
 */
export interface SpaydInput {
  amount: number;
  vs: string;
  message?: string;
  recipientName?: string;
}

export function buildSpayd({ amount, vs, message, recipientName }: SpaydInput): string {
  const parts: string[] = ["SPD*1.0"];
  parts.push(`ACC:${FUTUNATU_IBAN}`);
  parts.push(`AM:${amount.toFixed(2)}`);
  parts.push(`CC:CZK`);
  if (vs) parts.push(`X-VS:${vs}`);
  if (recipientName) parts.push(`RN:${stripDiacritics(recipientName).slice(0, 35)}`);
  if (message) parts.push(`MSG:${stripDiacritics(message).slice(0, 60)}`);
  return parts.join("*");
}

function stripDiacritics(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\*/g, "")
    .trim();
}

/**
 * Generuje QR kód jako data URL (base64 PNG).
 * Velikost 240×240, error correction level M (recovery 15 %) — ideál pro tisk i obrazovku.
 */
export async function buildSpaydQrDataUrl(input: SpaydInput): Promise<string> {
  const spayd = buildSpayd(input);
  return QRCode.toDataURL(spayd, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1a1a2e", light: "#ffffff" },
  });
}

/**
 * Vygeneruje order ID ve formátu YYMMDD<3-digit-seq>.
 * Sekvence předaná zvenku (z DB count() per day). Default 1.
 *
 * Příklad: 2026-11-14, prvni objednavka -> "2611140001"
 *
 * @returns numerický string, max 10 znaků (vejde se do VS)
 */
export function buildOrderId(date: Date = new Date(), seq: number = 1): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seqStr = String(seq).padStart(4, "0");
  return `${yy}${mm}${dd}${seqStr}`;
}
