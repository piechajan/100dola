import { cookies } from "next/headers";
import { ingestDmarcFile } from "@/lib/dmarc/ingest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/dmarc/upload — multipart formdata
 * Field 'file' = ZIP / GZ / XML DMARC aggregate report
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, error: "invalid_form_data" }, { status: 400 });
  }

  const files = formData.getAll("file");
  if (files.length === 0) {
    return Response.json({ ok: false, error: "no_files" }, { status: 400 });
  }

  const results: Array<{
    filename: string;
    inserted: number;
    duplicates: number;
    errors: string[];
  }> = [];

  for (const f of files) {
    if (!(f instanceof File)) continue;
    const buf = new Uint8Array(await f.arrayBuffer());
    try {
      const r = await ingestDmarcFile(f.name, buf, "admin:upload");
      results.push({
        filename: f.name,
        inserted: r.successCount,
        duplicates: r.duplicateCount,
        errors: r.errors,
      });
    } catch (e) {
      results.push({
        filename: f.name,
        inserted: 0,
        duplicates: 0,
        errors: [e instanceof Error ? e.message : String(e)],
      });
    }
  }

  return Response.json({ ok: true, results });
}
