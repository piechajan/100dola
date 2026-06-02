import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * On-demand revalidate pro admin UI / scripts.
 * GET /api/admin/revalidate?paths=/shop,/admin/suppliers
 * Auth: cookie preview_auth=100dola2025  (stejně jako admin UI)
 *       NEBO Authorization: Bearer CRON_SECRET
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const cookieAuth = cookieStore.get("preview_auth")?.value === "100dola2025";

  const bearer = request.headers.get("authorization");
  const cronAuth =
    !!process.env.CRON_SECRET && bearer === `Bearer ${process.env.CRON_SECRET}`;

  if (!cookieAuth && !cronAuth) {
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

  return Response.json({ ok: true, revalidated: paths });
}
