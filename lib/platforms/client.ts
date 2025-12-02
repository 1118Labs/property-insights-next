import { PlatformSlug } from "@/lib/platforms/types";

export type FSClient = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type FSProperty = {
  id: string;
  address: {
    line1: string;
    line2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  clientId?: string | null;
};

export type FSJob = {
  id: string;
  title?: string | null;
  status?: string | null;
  createdAt?: string | null;
  clientId?: string | null;
  propertyId?: string | null;
};

export type FSClientWithProperties = FSClient & { properties?: FSProperty[] };

export type PlatformOperation =
  | "list_clients"
  | "get_client"
  | "list_properties"
  | "get_property"
  | "list_jobs"
  | "webhook";

export type PlatformError = {
  platform: PlatformSlug;
  operation: PlatformOperation;
  message: string;
  detail?: unknown;
};

export interface FSPlatformClient {
  slug: PlatformSlug;
  name: string;
  listClients(limit?: number): Promise<FSClientWithProperties[]>;
  getClientById?(id: string): Promise<FSClientWithProperties | null>;
  listPropertiesForClient?(clientId: string, limit?: number): Promise<FSProperty[]>;
  getPropertyById?(id: string): Promise<FSProperty | null>;
  listJobs?(limit?: number): Promise<FSJob[]>;
  healthCheck?(): Promise<{ status: "ok" | "error"; detail?: string }>;
}
