import { z } from "zod";

export const portalInviteSchema = z.object({
  token: z.string(),
  clientId: z.string(),
  propertyId: z.string(),
  quoteId: z.string().optional().nullable(),
  expiresAt: z.string(),
  createdAt: z.string(),
  status: z.enum(["pending", "approved", "changes_requested", "expired"]).default("pending"),
  approvedAt: z.string().optional().nullable(),
});

export type PortalInvite = z.infer<typeof portalInviteSchema>;

export const portalSessionSchema = z.object({
  token: z.string(),
  clientId: z.string(),
  propertyId: z.string(),
  quoteId: z.string().optional().nullable(),
  expiresAt: z.string(),
  status: z.enum(["pending", "approved", "changes_requested", "expired"]).default("pending"),
});

export type PortalSession = z.infer<typeof portalSessionSchema>;

export const portalViewStateSchema = z.object({
  token: z.string(),
  viewedAt: z.string(),
  durationMs: z.number().optional(),
});

export type PortalViewState = z.infer<typeof portalViewStateSchema>;
