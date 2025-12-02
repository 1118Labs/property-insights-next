import { z } from "zod";

export const addressInputSchema = z.object({
  address: z.string().trim().min(3, "address must be at least 3 characters"),
  persist: z.boolean().optional(),
  enrich: z.boolean().optional(),
  dryRun: z.boolean().optional(),
  serviceProfile: z
    .enum([
      "cleaning",
      "lawncare",
      "roofing",
      "painting",
      "pressure_washing",
      "window_washing",
      "gutter_cleaning",
      "snow_removal",
      "pool_service",
    ])
    .optional(),
});

export type AddressInput = z.infer<typeof addressInputSchema>;

export const enrichRequestSchema = addressInputSchema.extend({
  providers: z.array(z.string().min(1)).optional(),
  forceRefresh: z.boolean().optional(),
});

export const ingestRequestSchema = z.object({
  dryRun: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export const adminSecretHeaderSchema = z.string().min(8, "admin secret too short");
