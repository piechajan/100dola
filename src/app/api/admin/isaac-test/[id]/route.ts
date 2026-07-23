import { NextRequest, NextResponse } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { cancelReservation, loadCancelableReservation } from "@/lib/isaac-cancel";
import { getAdminContext } from "@/lib/admin-auth";

async function checkAuth(): Promise<boolean> {
  const ctx = await getAdminContext();
  return Boolean(ctx);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
  }

  const { id } = await params;
  const rid = parseInt(id, 10);
  if (!Number.isFinite(rid)) {
    return NextResponse.json({ error: "Neplatné ID" }, { status: 400 });
  }

  const sb = getSupabase();
  const { error } = await sb.from("isaac_test_reservations").delete().eq("id", rid);
  if (error) {
    console.error("[admin/isaac-test] DELETE failed:", error);
    return NextResponse.json({ error: "Smazání selhalo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "DB nedostupná" }, { status: 503 });
  }

  const { id } = await params;
  const rid = parseInt(id, 10);
  if (!Number.isFinite(rid)) {
    return NextResponse.json({ error: "Neplatné ID" }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const ALLOWED_STATUSES = ["reserved", "completed", "no_show", "cancelled"];
  if (!body.status || !ALLOWED_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `Status musí být jeden z: ${ALLOWED_STATUSES.join(", ")}` },
      { status: 400 },
    );
  }

  // Pro cancelled použij plný cancelReservation flow:
  // (1) DB update + invalidate token, (2) zruš scheduled reminder, (3) e-maily klientovi i adminovi
  if (body.status === "cancelled") {
    const row = await loadCancelableReservation(rid);
    if (!row) {
      return NextResponse.json({ error: "Rezervace nenalezena" }, { status: 404 });
    }
    await cancelReservation(row);
    return NextResponse.json({ ok: true });
  }

  // Ostatní statusy — jen prostý update
  const sb = getSupabase();
  const { error } = await sb
    .from("isaac_test_reservations")
    .update({ status: body.status })
    .eq("id", rid);
  if (error) {
    console.error("[admin/isaac-test] PATCH failed:", error);
    return NextResponse.json({ error: "Aktualizace selhala" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
