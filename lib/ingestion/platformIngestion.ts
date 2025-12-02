import { resolvePlatform } from "@/lib/platforms/resolver";
import { PlatformSlug } from "@/lib/platforms/types";
import { FSPlatformClient } from "@/lib/platforms/client";
import { normalizeJobberClient, normalizeJobberProperty, normalizeJobberJobs } from "@/lib/platforms/normalizers/jobberNormalizer";
import { normalizeServiceTitanClient, normalizeServiceTitanProperty, normalizeServiceTitanJobs } from "@/lib/platforms/normalizers/serviceTitanNormalizer";
import { normalizeHousecallProClient, normalizeHousecallProProperty, normalizeHousecallProJobs } from "@/lib/platforms/normalizers/housecallProNormalizer";
import { ClientRecord, PropertyRecord, ServiceRequestRecord } from "@/lib/types";
import { logIngestionEvent } from "@/lib/utils/ingestion";
import { logStructured } from "@/lib/utils/logging";

type IngestResult = {
  platform: PlatformSlug;
  clients: ClientRecord[];
  properties: PropertyRecord[];
  jobs: ServiceRequestRecord[];
};

function getNormalizers(client: FSPlatformClient) {
  switch (client.slug) {
    case "servicetitan":
      return {
        client: normalizeServiceTitanClient,
        property: normalizeServiceTitanProperty,
        jobs: normalizeServiceTitanJobs,
      };
    case "housecall_pro":
      return {
        client: normalizeHousecallProClient,
        property: normalizeHousecallProProperty,
        jobs: normalizeHousecallProJobs,
      };
    case "jobber":
    default:
      return {
        client: normalizeJobberClient,
        property: normalizeJobberProperty,
        jobs: normalizeJobberJobs,
      };
  }
}

export async function ingestFromPlatform(options: { platform?: PlatformSlug; limit?: number; dryRun?: boolean } = {}): Promise<IngestResult> {
  const client = resolvePlatform(options.platform);
  const normalizers = getNormalizers(client);
  const limit = options.limit ?? 25;

  const fsClients = await client.listClients(limit);
  const normalizedClients: ClientRecord[] = fsClients.map(normalizers.client);
  const normalizedProperties: PropertyRecord[] = [];
  fsClients.forEach((c) => {
    (c.properties || []).forEach((p) => normalizedProperties.push(normalizers.property(p)));
  });

  const fsJobs = client.listJobs ? await client.listJobs(limit) : [];
  const normalizedJobs: ServiceRequestRecord[] = normalizers.jobs(fsJobs);

  if (!options.dryRun) {
    try {
      await logIngestionEvent({
        source: "platform-ingest",
        status: "success",
        platform: client.slug,
        detail: { clients: normalizedClients.length, properties: normalizedProperties.length, jobs: normalizedJobs.length },
      });
    } catch {
      // swallow logging
    }
  }

  logStructured("info", "platform_ingest", { platform: client.slug, clients: normalizedClients.length, properties: normalizedProperties.length, jobs: normalizedJobs.length });

  return {
    platform: client.slug,
    clients: normalizedClients,
    properties: normalizedProperties,
    jobs: normalizedJobs,
  };
}
