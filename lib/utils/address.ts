import { Address } from "@/lib/types";
import { isNonEmptyString } from "@/lib/utils/validation";

export function normalizeAddress(address: Partial<Address>): Address {
  return {
    line1: (address.line1 || "").trim(),
    line2: address.line2?.trim() || null,
    city: address.city?.trim() || null,
    province: address.province?.trim() || null,
    postalCode: address.postalCode?.trim() || null,
    country: address.country?.trim() || null,
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
  };
}

export function formatAddress(address: Address): string {
  const parts = [address.line1, address.line2, address.city, address.province, address.postalCode, address.country]
    .filter(isNonEmptyString)
    .map((p) => p!.trim());
  return parts.join(", ");
}

export function normalizeAddressWithDiagnostics(address: Partial<Address>) {
  const normalized = normalizeAddress(address);
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!normalized.line1) missing.push("line1");
  if (!normalized.city) missing.push("city");
  if (!normalized.province) missing.push("province");
  if (!normalized.postalCode) warnings.push("postal code missing");
  if (!normalized.country) warnings.push("country missing");

  if (normalized.line1 && normalized.line1.length < 4) {
    warnings.push("line1 appears short");
  }

  return { normalized, missing, warnings, formatted: formatAddress(normalized) };
}
