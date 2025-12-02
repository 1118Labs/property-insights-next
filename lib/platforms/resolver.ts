import { createJobberClient } from "@/lib/platforms/adapters/jobberClient";
import { createServiceTitanClient, isServiceTitanConfigured } from "@/lib/platforms/adapters/serviceTitanClient";
import { createHousecallProClient, isHousecallProConfigured } from "@/lib/platforms/adapters/housecallProClient";
import { FSPlatformClient } from "@/lib/platforms/client";
import { PlatformSlug } from "@/lib/platforms/types";
import { getActivePlatform } from "@/lib/platforms/config";

export function resolvePlatform(slug?: PlatformSlug): FSPlatformClient {
  const active = slug ?? getActivePlatform();
  switch (active) {
    case "jobber":
      return createJobberClient();
    case "servicetitan":
      if (!isServiceTitanConfigured()) throw new Error("ServiceTitan not configured");
      return createServiceTitanClient();
    case "housecall_pro":
      if (!isHousecallProConfigured()) throw new Error("Housecall Pro not configured");
      return createHousecallProClient();
    default:
      return createJobberClient();
  }
}

export function listPlatforms(): Array<{ slug: PlatformSlug; name: string; configured: boolean }> {
  return [
    { slug: "jobber", name: "Jobber", configured: Boolean(process.env.JOBBER_CLIENT_ID) },
    { slug: "servicetitan", name: "ServiceTitan", configured: isServiceTitanConfigured() },
    { slug: "housecall_pro", name: "Housecall Pro", configured: isHousecallProConfigured() },
  ];
}
