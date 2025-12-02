import { FSPlatformClient, FSClientWithProperties, FSProperty, FSJob } from "@/lib/platforms/client";
import { PlatformSlug } from "@/lib/platforms/types";

const SLUG: PlatformSlug = "housecall_pro";

export function isHousecallProConfigured() {
  return Boolean(process.env.HCP_API_KEY || process.env.HCP_BASE_URL);
}

const mockData: FSClientWithProperties[] = [
  {
    id: "hcp-1",
    firstName: "Housecall",
    lastName: "Pro",
    email: "hcp@example.com",
    phone: "555-2222",
    properties: [
      { id: "hcp-prop-1", clientId: "hcp-1", address: { line1: "55 Pro Ave", city: "Denver", province: "CO", postalCode: "80012", country: "USA" } },
    ],
  },
];

export function createHousecallProClient(): FSPlatformClient {
  return {
    slug: SLUG,
    name: "Housecall Pro",
    async listClients(limit = 20): Promise<FSClientWithProperties[]> {
      if (!isHousecallProConfigured()) return [];
      return mockData.slice(0, limit);
    },
    async listPropertiesForClient(clientId: string): Promise<FSProperty[]> {
      if (!isHousecallProConfigured()) return [];
      return mockData.find((c) => c.id === clientId)?.properties || [];
    },
    async listJobs(limit = 10): Promise<FSJob[]> {
      if (!isHousecallProConfigured()) return [];
      return [
        { id: "hcp-job-1", title: "Tune-up", status: "completed", clientId: "hcp-1", propertyId: "hcp-prop-1", createdAt: new Date().toISOString() },
      ].slice(0, limit);
    },
    async healthCheck() {
      return isHousecallProConfigured() ? { status: "ok" } : { status: "error", detail: "Housecall Pro not configured" };
    },
  };
}
