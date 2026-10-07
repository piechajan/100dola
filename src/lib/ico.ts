/** Kontrolní součet IČO (modulo 11) — odhalí překlepy dřív, než se zeptáme ARES. */
export function isValidIco(ico: string): boolean {
  if (!/^\d{8}$/.test(ico)) return false;
  const d = ico.split("").map(Number);
  const sum = d.slice(0, 7).reduce((s, n, i) => s + n * (8 - i), 0);
  const mod = sum % 11;
  const check = (11 - mod) % 10;
  return check === d[7];
}
