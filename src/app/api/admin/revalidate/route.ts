import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminContext } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On-demand revalidate pro admin UI / scripts.
 * GET /api/admin/revalidate?paths=/shop,/admin/suppliers
 * Auth: přihlášená admin session (admin_session cookie)
 *       NEBO Authorization: Bearer CRON_SECRET
 */
export async function GET(request: Request) {
  const adminCtx = await getAdminContext();

  const bearer = request.headers.get("authorization");
  const cronAuth =
    !!process.env.CRON_SECRET && bearer === `Bearer ${process.env.CRON_SECRET}`;

  if (!adminCtx && !cronAuth) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const paths = (searchParams.get("paths") || "/shop")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const p of paths) {
    if (p.includes("[")) {
      revalidatePath(p, "page");
    } else {
      revalidatePath(p);
    }
  }

  // Volitelně bust cache tagy (např. shop-products z get-products unstable_cache).
  const tags = (searchParams.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  for (const t of tags) {
    revalidateTag(t, "hours");
  }

  return Response.json({ ok: true, revalidated: paths, tags });
}
