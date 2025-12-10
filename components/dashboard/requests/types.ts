export type RequestAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type Enrichment = {
  provider: "rentcast" | "zillow" | "fallback";
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSizeSqft?: number;
  yearBuilt?: number;
  propertyType?: string;
  estimatedValue?: number;
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string | null;
  valuationLow?: number;
  valuationHigh?: number;
};

export type RequestRow = {
  id: string;
  jobberRequestId?: string;
  jobberAccountId: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  contactName?: string;
  addressString?: string;
  address?: RequestAddress;
  enrichment?: Enrichment | null;
  enrichmentStatus?: "pending" | "enriched" | "failed";
  mapImageUrl?: string | null;
  estimatedValue?: number | null;
  // Back-compat fields
  clientName?: string;
  property?: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    squareFeet?: number | null;
    lotSizeSqFt?: number | null;
    yearBuilt?: number | null;
    priceEstimate?: number | null;
    propertyType?: string | null;
    raw?: unknown;
  } | null;
  raw?: unknown;
  cleaningQuote?: CleaningQuoteResult | null;
};

export type ServiceType =
  | "cleaning"
  | "pressure_washing"
  | "window_washing"
  | "lawn_care"
  | "handyman";

export type BaseQuoteResult = {
  estimatedMinutes: number;
  recommendedCrewSize: number;
  estimatedHoursPerCrew: number;
  basePrice: number;
  customerPrice: number;
  lowHighRange: { low: number; high: number };
  lineItems: { label: string; amount: number }[];
  riskFlags: string[];
  assumptions: string[];
};

export type CleaningQuoteResult = BaseQuoteResult & { trade?: ServiceType };

export type SortKey =
  | "clientName"
  | "address"
  | "createdAt"
  | "status"
  | "beds"
  | "baths"
  | "sqft"
  | "yearBuilt"
  | "estimatedValue";

export type SortState = {
  key: SortKey;
  direction: "asc" | "desc";
};
