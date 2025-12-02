import { z } from "zod";

export const jobberAddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});

export const jobberClientSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export const jobberPropertySchema = z.object({
  id: z.string().optional(),
  address: jobberAddressSchema.optional().nullable(),
});

export const jobberRequestNodeSchema = z.object({
  id: z.string(),
  title: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  client: jobberClientSchema.optional().nullable(),
  property: jobberPropertySchema.optional().nullable(),
});

export type JobberRequestNode = z.infer<typeof jobberRequestNodeSchema>;

export function validateJobberNode(node: unknown): JobberRequestNode {
  const parsed = jobberRequestNodeSchema.safeParse(node);
  if (!parsed.success) {
    throw new Error("Invalid Jobber node: " + JSON.stringify(parsed.error.format()));
  }
  return parsed.data;
}
