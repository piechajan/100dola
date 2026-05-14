// Manuální vytvoření faktury — endpoint pro /admin/ucto/nova-faktura.
// Pro Lab / Malaga / OMC / Sport příjmy, které nejdou přes e-shop.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  findOrCreateSubject,
  createInvoice,
  isFakturoidConfigured,
  type InvoiceLine,
} from "@/lib/fakturoid";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const LineSchema = z.object({
  name: z.string().min(1).max(200),
  qty: z.number().positive().max(10000),
  unit: z.string().max(20).default("ks"),
  unitPriceWithVat: z.number().min(-1_000_000).max(10_000_000),
  vatRate: z.union([z.literal(0), z.literal(12), z.literal(21)]),
});

const PayloadSchema = z.object({
  project: z.enum(["sport", "lab", "malaga", "omc"]),
  customer: z.object({
    ico: z.string().regex(/^\d{8}$/).optional().or(z.literal("")),
    dic: z.string().max(20).optional().or(z.literal("")),
    name: z.string().min(1).max(200),
    email: z.string().email(),
    phone: z.string().max(40).optional().or(z.literal("")),
    street: z.string().max(200).optional().or(z.literal("")),
    city: z.string().max(120).optional().or(z.literal("")),
    zip: z.string().max(20).optional().or(z.literal("")),
  }),
  lines: z.array(LineSchema).min(1).max(50),
  note: z.string().max(500).optional().or(z.literal("")),
  variableSymbol: z.string().max(20).optional().or(z.literal("")),
  sendEmail: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const auth = req.cookies.get("preview_auth");
  if (auth?.value !== "100dola2025") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isFakturoidConfigured()) {
    return NextResponse.json(
      { error: "Fakturoid není nakonfigurovaný" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;

  try {
    // Customer
    const customId = data.customer.ico
      ? `ico:${data.customer.ico}`
      : `email:${data.customer.email}`;
    const subject = await findOrCreateSubject({
      customId,
      name: data.customer.name,
      email: data.customer.email,
      phone: data.customer.phone || undefined,
      street: data.customer.street || undefined,
      city: data.customer.city || undefined,
      zip: data.customer.zip || undefined,
      registrationNo: data.customer.ico || undefined,
      vatNo: data.customer.dic || undefined,
    });

    // Lines
    const lines: InvoiceLine[] = data.lines.map((l) => ({
      name: l.name,
      quantity: l.qty,
      unit_name: l.unit || "ks",
      // unit_price musí být bez DPH ve Fakturoidu — počítáme z s-DPH hodnoty
      unit_price: (l.unitPriceWithVat / (1 + l.vatRate / 100)).toFixed(2),
      vat_rate: l.vatRate,
    }));

    const vs = data.variableSymbol || `${Date.now()}`.slice(-10);

    const invoice = await createInvoice({
      subjectId: subject.id,
      variableSymbol: vs,
      lines,
      project: data.project,
      note: data.note || undefined,
      sendEmail: data.sendEmail,
    });

    // Cache do Supabase invoices table (pro analytics)
    if (isSupabaseConfigured()) {
      try {
        const sb = getSupabase();
        await sb.from("invoices").insert({
          fakturoid_id: invoice.id,
          number: invoice.number,
          project: data.project,
          order_id: null, // manuální = bez vazby na order
          subject_id: subject.id,
          status: invoice.status,
          total_with_vat_kc: parseFloat(invoice.total),
          issued_on: invoice.issued_on,
          due_on: invoice.due_on,
          paid_on: invoice.paid_on,
          pdf_url: invoice.pdf_url,
          html_url: invoice.html_url,
          raw_payload: invoice,
        });
      } catch (e) {
        console.warn("[admin/invoices/create] Supabase cache failed:", e);
        // Nehodit — faktura ve Fakturoidu existuje, cache je vedlejší
      }
    }

    return NextResponse.json({
      ok: true,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        total: invoice.total,
        pdfUrl: invoice.pdf_url,
        htmlUrl: invoice.html_url,
        publicUrl: invoice.public_html_url,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[admin/invoices/create] failed:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
