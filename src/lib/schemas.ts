// Zod schémata pro API endpoints. Server-side validace přijatého payloadu.
// Pozor: zod v4 API (z.email() místo z.string().email()).

import { z } from "zod";

const HONEYPOT_FIELD = "website" as const;
const Honeypot = z.object({
  [HONEYPOT_FIELD]: z
    .string()
    .max(0, "Honeypot field must be empty")
    .optional()
    .nullable(),
});

export const EventPayloadSchema = z
  .object({
    id: z.string().max(200).optional(),
    registeredAt: z.string().max(64).optional(),
    firstName: z.string().min(1).max(80).trim(),
    lastName: z.string().min(1).max(80).trim(),
    nickname: z.string().max(80).trim().optional(),
    club: z.string().max(120).trim().optional(),
    city: z.string().max(120).trim().optional(),
    phone: z.string().max(40).trim().optional(),
    email: z.email().max(254).toLowerCase(),
    isVip: z.boolean().optional(),
    eventSlug: z.string().min(1).max(120),
    source: z.literal("event").optional(),
  })
  .merge(Honeypot);

export const MalagaPayloadSchema = z
  .object({
    id: z.string().max(200).optional(),
    registeredAt: z.string().max(64).optional(),
    source: z.literal("malaga"),
    name: z.string().min(1).max(120).trim(),
    email: z.email().max(254).toLowerCase(),
    phone: z.string().max(40).trim().optional(),
    intent: z.enum(["transport", "storage", "package", "tour", "group", "other"]),
    packageInterest: z.enum(["basic", "exclusive", "undecided"]).optional(),
    bikeCount: z.number().int().min(1).max(50).optional(),
    bikeType: z.string().max(120).trim().optional(),
    isEbike: z.boolean().optional(),
    preferredMonth: z.string().max(32).trim().optional(),
    groupKind: z.enum(["individual", "group", "club"]).optional(),
    pickupAtHome: z.boolean().optional(),
    message: z.string().max(2000).trim().optional(),
  })
  .merge(Honeypot);

export const LabPayloadSchema = z
  .object({
    id: z.string().max(200).optional(),
    registeredAt: z.string().max(64).optional(),
    source: z.literal("lab"),
    name: z.string().min(1).max(120).trim(),
    email: z.email().max(254).toLowerCase(),
    phone: z.string().max(40).trim().optional(),
    bikeBrand: z.string().max(120).trim().optional(),
    bikeValue: z.enum(["under100k", "100to200k", "200kPlus", "undecided"]).optional(),
    services: z
      .array(z.enum(["bearings", "shield", "glaze", "wax", "cleanup", "fit"]))
      .max(6)
      .optional(),
    preferredWindow: z.string().max(64).trim().optional(),
    pickupInPrague: z.boolean().optional(),
    message: z.string().max(2000).trim().optional(),
  })
  .merge(Honeypot);

export const NewsletterPayloadSchema = z
  .object({
    id: z.string().max(200).optional(),
    registeredAt: z.string().max(64).optional(),
    source: z.literal("newsletter"),
    email: z.email().max(254).toLowerCase(),
    consent: z.literal(true),
  })
  .merge(Honeypot);

// ── E-shop order ────────────────────────────────────────────────────────────

export const SHIPPING_METHODS = [
  "personal-sternberk",
  "personal-olomouc",
  "personal-valasske-mezirici",
  "zasilkovna",
  "gls",
] as const;

export const PAYMENT_METHODS = [
  "qr",            // QR platba (SPAYD) — připraveno, klient sám naskenuje
  "bank-transfer", // klasický převod, VS = order ID
  "cash-pickup",   // hotovost při osobním převzetí (jen pro personal-*)
  "card",          // Phase 1.5 přes ComGate
  "apple-pay",     // Phase 1.5 přes ComGate
  "google-pay",    // Phase 1.5 přes ComGate
] as const;

const OrderItemSchema = z.object({
  productId: z.number().int().min(0),
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  priceWithVat: z.number().min(0),
  vatRate: z.number().int().min(0).max(50),
  qty: z.number().int().min(1).max(99),
  bulky: z.boolean().optional(),
});

export const OrderPayloadSchema = z
  .object({
    source: z.literal("order"),
    registeredAt: z.string().max(64).optional(),
    items: z.array(OrderItemSchema).min(1).max(50),

    // Contact
    name: z.string().min(1).max(120).trim(),
    email: z.email().max(254).toLowerCase(),
    phone: z.string().min(6).max(40).trim(),

    // Optional company fields (B2B)
    companyName: z.string().max(200).trim().optional(),
    companyIco: z.string().max(20).trim().optional(),
    companyDic: z.string().max(20).trim().optional(),

    // Shipping address (vyžadováno pro zasilkovna / gls, volitelné pro personal-*)
    street: z.string().max(200).trim().optional(),
    city: z.string().max(120).trim().optional(),
    zip: z.string().max(20).trim().optional(),

    // Pickup point pro Zásilkovna — zatím text, později widget integration
    zasilkovnaPickup: z.string().max(300).trim().optional(),

    shippingMethod: z.enum(SHIPPING_METHODS),
    paymentMethod: z.enum(PAYMENT_METHODS),

    discountCode: z.string().max(40).trim().optional(),

    notes: z.string().max(2000).trim().optional(),

    gdprConsent: z.literal(true),
  })
  .merge(Honeypot);

export const IsaacTestPayloadSchema = z
  .object({
    bikeSlug: z.string().min(3).max(80),
    slotStart: z.string().datetime(),
    fullName: z.string().min(2).max(120).trim(),
    email: z.email().max(254).toLowerCase(),
    phone: z.string().min(6).max(40).trim(),
    notes: z.string().max(500).trim().optional(),
    consentTerms: z.literal(true),
    consentGdpr: z.literal(true),
    subscribeNewsletter: z.boolean().optional().default(false),
  })
  .merge(Honeypot);

export type EventPayload = z.infer<typeof EventPayloadSchema>;
export type MalagaPayload = z.infer<typeof MalagaPayloadSchema>;
export type LabPayload = z.infer<typeof LabPayloadSchema>;
export type NewsletterPayload = z.infer<typeof NewsletterPayloadSchema>;
export type OrderPayload = z.infer<typeof OrderPayloadSchema>;
export type OrderItemPayload = z.infer<typeof OrderItemSchema>;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type IsaacTestPayload = z.infer<typeof IsaacTestPayloadSchema>;

export const HONEYPOT_NAME = HONEYPOT_FIELD;
