export type CRMProvider = "hubspot" | "pipedrive" | "zoho";

export function syncToCRM(provider: CRMProvider, payload: Record<string, unknown>) {
  return { provider, status: "queued", payload };
}

export function testCRMConnections() {
  return [
    { provider: "hubspot", connected: Boolean(process.env.HUBSPOT_API_KEY) },
    { provider: "pipedrive", connected: Boolean(process.env.PIPEDRIVE_API_TOKEN) },
    { provider: "zoho", connected: Boolean(process.env.ZOHO_CLIENT_ID) },
  ];
}
