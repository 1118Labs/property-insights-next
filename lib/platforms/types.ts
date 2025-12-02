import { z } from "zod";

export const PLATFORM_SLUGS = ["jobber", "servicetitan", "housecall_pro"] as const;
export type PlatformSlug = (typeof PLATFORM_SLUGS)[number];

export const platformEnum = z.enum(PLATFORM_SLUGS);

export const fieldServicePlatformSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: platformEnum,
  capabilities: z.object({
    clients: z.boolean().default(true),
    properties: z.boolean().default(true),
    jobs: z.boolean().default(false),
    webhooks: z.boolean().default(false),
  }),
});

export type FieldServicePlatform = z.infer<typeof fieldServicePlatformSchema>;
