import { FSPlatformClient, FSClientWithProperties, FSProperty, FSJob } from "@/lib/platforms/client";
import { PlatformSlug } from "@/lib/platforms/types";

const SLUG: PlatformSlug = "servicetitan";

export function isServiceTitanConfigured() {
  return Boolean(process.env.SERVICETITAN_API_KEY || process.env.SERVICETITAN_BASE_URL);
}

const mockClients: FSClientWithProperties[] = [
  {
    id: "st-1",
    firstName: "Service",
    lastName: "Titan",
    email: "st@example.com",
    phone: "555-1111",
    properties: [
      {
        id: "st-prop-1",
        clientId: "st-1",
        address: { line1: "10 Titan Way", city: "LA", province: "CA", postalCode: "90001", country: "USA" },
      },
    ],
  },
];

export function createServiceTitanClient(): FSPlatformClient {
  return {
    slug: SLUG,
    name: "ServiceTitan",
    async listClients(limit = 20): Promise<FSClientWithProperties[]> {
      if (!isServiceTitanConfigured()) return [];
      return mockClients.slice(0, limit);
    },
    async listPropertiesForClient(clientId: string): Promise<FSProperty[]> {
      if (!isServiceTitanConfigured()) return [];
      return mockClients.find((c) => c.id === clientId)?.properties || [];
    },
    async listJobs(limit = 10): Promise<FSJob[]> {
      if (!isServiceTitanConfigured()) return [];
      return [
        { id: "st-job-1", title: "Service call", status: "completed", clientId: "st-1", propertyId: "st-prop-1", createdAt: new Date().toISOString() },
      ].slice(0, limit);
    },
    async healthCheck() {
      return isServiceTitanConfigured() ? { status: "ok" } : { status: "error", detail: "ServiceTitan not configured" };
    },
  };
}
