import { z } from "zod";
import { ServiceProfileType } from "@/lib/types";

export const quoteItemSchema = z.object({
  label: z.string(),
  quantity: z.number().nonnegative(),
  unit: z.string(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative(),
  metadata: z.record(z.any()).optional(),
});

export type QuoteItem = z.infer<typeof quoteItemSchema>;

export const quoteSchema = z.object({
  id: z.string(),
  propertyId: z.string().optional().nullable(),
  clientId: z.string().optional().nullable(),
  serviceProfile: z.custom<ServiceProfileType>(),
  items: z.array(quoteItemSchema),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  notes: z.string().optional().nullable(),
  recommendedItems: z.array(quoteItemSchema).optional(),
  confidenceWarnings: z.array(z.string()).optional(),
  version: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export type Quote = z.infer<typeof quoteSchema>;

export const pricingProfileSchema = z.record(
  z.object({
    rate: z.number(),
    multiplier: z.number().optional(),
  })
);

export type PricingProfile = Record<string, { rate: number; multiplier?: number }>;
