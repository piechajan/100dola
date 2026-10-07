import { timingSafeEqual } from "node:crypto";

/**
 * Společná kontrola `Authorization: Bearer <CRON_SECRET>` pro cron a admin endpointy.
 * Fail-closed: bez nastaveného CRON_SECRET se odmítne vše (žádné „otevřeno při chybě
 * konfigurace“). Porovnání v konstantním čase.
 */
export function isAuthorizedCron(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authHeader) return false;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
