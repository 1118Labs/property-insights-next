import { ensureJobberAccessToken, fetchRecentJobberRequests } from "@/lib/jobber";
import { isJobberConfigured } from "@/lib/config";
import { FSPlatformClient, FSClientWithProperties, FSProperty, FSJob } from "@/lib/platforms/client";
import { PlatformSlug } from "@/lib/platforms/types";

const SLUG: PlatformSlug = "jobber";

export function createJobberClient(): FSPlatformClient {
  return {
    slug: SLUG,
    name: "Jobber",
    async listClients(limit = 25): Promise<FSClientWithProperties[]> {
      const token = await ensureJobberAccessToken();
      const edges = await fetchRecentJobberRequests(token.accessToken, limit);
      const clients: Record<string, FSClientWithProperties> = {};
      edges.forEach((edge) => {
        const c = edge.node.client;
        if (c?.id) {
          clients[c.id] = clients[c.id] || { id: c.id, firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, properties: [] };
        }
        const p = edge.node.property;
        if (p?.id && p.address) {
          const property: FSProperty = {
            id: p.id,
            address: {
              line1: p.address.line1 || "Unknown",
              line2: p.address.line2 || null,
              city: p.address.city || null,
              province: p.address.province || null,
              postalCode: p.address.postalCode || null,
              country: p.address.country || null,
            },
            clientId: c?.id || null,
          };
          if (c?.id) {
            clients[c.id] = clients[c.id] || { id: c.id, properties: [] };
            clients[c.id].properties = clients[c.id].properties || [];
            clients[c.id].properties?.push(property);
          }
        }
      });
      return Object.values(clients);
    },
    async listPropertiesForClient(clientId: string, limit = 25): Promise<FSProperty[]> {
      const token = await ensureJobberAccessToken();
      const edges = await fetchRecentJobberRequests(token.accessToken, limit);
      return edges
        .map((edge) => edge.node.property)
        .filter((p): p is NonNullable<typeof p> => Boolean(p?.id))
        .filter((p, _idx, arr) => p?.id && arr.findIndex((x) => x?.id === p.id) === _idx)
        .map((p) => ({
          id: p!.id!,
          address: {
            line1: p!.address?.line1 || "Unknown",
            line2: p!.address?.line2 || null,
            city: p!.address?.city || null,
            province: p!.address?.province || null,
            postalCode: p!.address?.postalCode || null,
            country: p!.address?.country || null,
          },
          clientId,
        }));
    },
    async listJobs(limit = 25): Promise<FSJob[]> {
      const token = await ensureJobberAccessToken();
      const edges = await fetchRecentJobberRequests(token.accessToken, limit);
      return edges.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title,
        status: edge.node.status,
        createdAt: edge.node.createdAt || undefined,
        clientId: edge.node.client?.id || undefined,
        propertyId: edge.node.property?.id || undefined,
      }));
    },
    async healthCheck() {
      if (!isJobberConfigured) return { status: "error", detail: "Jobber not configured" };
      try {
        await ensureJobberAccessToken();
        return { status: "ok" };
      } catch (err) {
        return { status: "error", detail: String(err) };
      }
    },
  };
}
