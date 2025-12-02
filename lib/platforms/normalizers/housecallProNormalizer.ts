import { FSClientWithProperties, FSProperty, FSJob } from "@/lib/platforms/client";
import { ClientRecord, PropertyRecord, ServiceRequestRecord } from "@/lib/types";
import { normalizeAddress } from "@/lib/utils/address";

export function normalizeHousecallProClient(client: FSClientWithProperties): ClientRecord {
  return {
    id: client.id,
    firstName: client.firstName || undefined,
    lastName: client.lastName || undefined,
    email: client.email || undefined,
    phone: client.phone || undefined,
  };
}

export function normalizeHousecallProProperty(property: FSProperty): PropertyRecord {
  const address = normalizeAddress(property.address);
  return {
    id: property.id,
    jobberPropertyId: property.id,
    address,
  };
}

export function normalizeHousecallProJobs(jobs: FSJob[]): ServiceRequestRecord[] {
  return jobs.map((j) => ({
    id: j.id,
    title: j.title || undefined,
    status: j.status || undefined,
    requestedAt: j.createdAt || undefined,
    jobberRequestId: j.id,
    clientId: j.clientId || undefined,
    propertyId: j.propertyId || undefined,
  }));
}
