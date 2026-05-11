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

export type EventPayload = z.infer<typeof EventPayloadSchema>;
export type MalagaPayload = z.infer<typeof MalagaPayloadSchema>;

export const HONEYPOT_NAME = HONEYPOT_FIELD;
