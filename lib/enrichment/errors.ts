export type ProviderErrorCode =
  | "ECONNREFUSED"
  | "ETIMEDOUT"
  | "EAI_AGAIN"
  | "EHOSTUNREACH"
  | "ENOTFOUND"
  | "RATE_LIMIT"
  | "UNAUTHORIZED"
  | "SERVER_ERROR"
  | "CIRCUIT_OPEN"
  | "UNKNOWN";

export const PROVIDER_ERROR_MAP: Record<ProviderErrorCode, string> = {
  ECONNREFUSED: "provider unreachable",
  ETIMEDOUT: "provider timeout",
  EAI_AGAIN: "provider DNS failure",
  EHOSTUNREACH: "provider host unreachable",
  ENOTFOUND: "provider not found",
  RATE_LIMIT: "rate limited",
  UNAUTHORIZED: "unauthorized",
  SERVER_ERROR: "provider error",
  CIRCUIT_OPEN: "circuit open",
  UNKNOWN: "unknown provider error",
};

export function normalizeProviderError(label: string, err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    if (code && PROVIDER_ERROR_MAP[code as ProviderErrorCode]) {
      return `${label}: ${PROVIDER_ERROR_MAP[code as ProviderErrorCode]}`;
    }
    const status = (err as { status?: number }).status;
    if (status === 401) return `${label}: ${PROVIDER_ERROR_MAP.UNAUTHORIZED}`;
    if (status === 429) return `${label}: ${PROVIDER_ERROR_MAP.RATE_LIMIT}`;
    if (status && status >= 500) return `${label}: ${PROVIDER_ERROR_MAP.SERVER_ERROR}`;
    return `${label}: ${err.message}`;
  }
  const code = (err as { code?: string })?.code;
  if (code && PROVIDER_ERROR_MAP[code as ProviderErrorCode]) {
    return `${label}: ${PROVIDER_ERROR_MAP[code as ProviderErrorCode]}`;
  }
  return `${label}: ${String(err)}`;
}
