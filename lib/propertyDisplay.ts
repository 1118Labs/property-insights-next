import { Address, PropertyProfile, RentcastEnrichment } from "@/lib/types";
import { formatAddress } from "@/lib/utils/address";

export function formatAddressDisplay(address?: Address): string {
  if (!address) return "Unknown address";
  return formatAddress(address) || "Unknown address";
}

export function formatNumber(value?: number | null): string {
  if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString();
  return "–";
}

export function formatMoney(value?: number | null): string {
  if (typeof value === "number" && Number.isFinite(value)) return `$${Math.round(value).toLocaleString()}`;
  return "–";
}

export function deriveEnrichedFields(
  profile: PropertyProfile
): {
  beds: string;
  baths: string;
  sqft: string;
  lot: string;
  year: string;
  estValue: string;
  estRent: string;
  hasLimitedData: boolean;
} {
  const enrichment = profile.enrichment as RentcastEnrichment | undefined;
  const beds = formatNumber(profile.property.beds ?? enrichment?.beds ?? null);
  const baths = formatNumber(profile.property.baths ?? enrichment?.baths ?? null);
  const sqft = formatNumber(profile.property.sqft ?? enrichment?.sqft ?? null);
  const lot = (profile.property.lotSizeSqft ?? enrichment?.lotSizeSqft)
    ? `${formatNumber(profile.property.lotSizeSqft ?? enrichment?.lotSizeSqft)} sqft`
    : "–";
  const year = formatNumber(profile.property.yearBuilt ?? enrichment?.yearBuilt ?? null);
  const estValue = formatMoney(enrichment?.estValue ?? profile.insights?.valuation?.estimate ?? null);
  const estRent = formatMoney(enrichment?.estRent ?? profile.insights?.rentEstimate?.estimate ?? null);

  const hasLimitedData =
    [beds, baths, sqft, year].filter((v) => v === "–").length >= 3 &&
    estValue === "–" &&
    estRent === "–";

  return { beds, baths, sqft, lot, year, estValue, estRent, hasLimitedData };
}
