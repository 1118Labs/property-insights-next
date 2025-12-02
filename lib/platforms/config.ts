import { PlatformSlug, PLATFORM_SLUGS } from "@/lib/platforms/types";

let selectedPlatform: PlatformSlug | null = null;

export function setActivePlatform(slug: PlatformSlug) {
  selectedPlatform = slug;
}

export function getActivePlatform(): PlatformSlug {
  const envValue = (process.env.PLATFORM || "").toLowerCase();
  const envSlug = PLATFORM_SLUGS.find((p) => p === envValue) || null;
  return selectedPlatform || envSlug || "jobber";
}
