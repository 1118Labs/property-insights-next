export type Address = {
  line1: string;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type EnrichedProperty = {
  address: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSize?: number;
  yearBuilt?: number;
  latitude?: number;
  longitude?: number;
  estimatedValue?: number;
};

export type ClientRecord = {
  id?: string;
  jobberClientId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type PropertyRecord = {
  id?: string;
  jobberPropertyId?: string | null;
  address: Address;
  beds?: number | null;
  baths?: number | null;
  yearBuilt?: number | null;
  sqft?: number | null;
  lotSizeSqft?: number | null;
  lotShape?: string | null;
  renovatedAt?: string | null;
  images?: string[];
  updatedAt?: string | null;
};

export type ServiceRequestRecord = {
  id?: string;
  jobberRequestId?: string | null;
  title?: string | null;
  status?: string | null;
  description?: string | null;
  requestedAt?: string | null;
  clientId?: string | null;
  propertyId?: string | null;
};

export type Valuation = {
  estimate: number;
  currency: string;
  source: string;
};

export type ScoreBreakdown = {
  livability: number;
  efficiency: number;
  marketStrength: number;
  risk: number;
  lotAppeal?: number;
  ageFactor?: number;
  equityDelta?: number;
  priceToRent?: number | null;
  cashflowRisk?: number | null;
};

export type ScoreWeights = {
  livability: number;
  efficiency: number;
  marketStrength: number;
  riskPenalty: number;
};

export type ScorePreset = "conservative" | "normal" | "aggressive";

export type ScoringContext = {
  currentYear: number;
  weights: ScoreWeights;
  scoreVersion: string;
};

export type RiskFlag = {
  code: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  detail?: string;
};

export type AerialInsight = {
  provider: string;
  confidence: number;
  yardSqft?: number;
  drivewaySqft?: number;
  roofSqft?: number;
  treeDensity?: number;
  poolDetected?: boolean;
  poolShape?: string;
};

export type ServiceProfileType =
  | "cleaning"
  | "lawncare"
  | "roofing"
  | "painting"
  | "pressure_washing"
  | "window_washing"
  | "gutter_cleaning"
  | "snow_removal"
  | "pool_service";

export type PropertyInsight = {
  score: number;
  breakdown: ScoreBreakdown;
  valuation?: Valuation;
  rentEstimate?: Valuation;
  summary: string;
  riskFlags: RiskFlag[];
  recommendations: string[];
  lastUpdated: string;
  source: string;
  scoreVersion?: string;
  narrative?: string;
  confidenceScore?: number;
  qualityIndex?: number;
  taxonomy?: "single-family" | "multi-family" | "condo" | "commercial" | "unknown";
  trends?: {
    valuation3mo?: number | null;
    valuation12mo?: number | null;
    rent3mo?: number | null;
    rent12mo?: number | null;
    risk3mo?: number | null;
    risk12mo?: number | null;
  };
  mistrustScore?: number;
  serviceProfile?: ServiceProfileType;
  serviceSpecific?: Record<string, unknown>;
  qualityLabel?: "high" | "medium" | "low";
  provenance?: {
    sources?: string[];
    errors?: string[];
    warnings?: string[];
    meta?: {
      providerErrors?: Record<string, string>;
      providerDurations?: Record<string, number>;
      qualityScore?: number;
      fallbackUsed?: boolean;
      cacheHit?: boolean;
      circuitOpen?: boolean;
    };
  };
  aerialInsights?: AerialInsight;
};

export type RentcastEnrichment = {
  provider: "rentcast";
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSizeSqft?: number;
  yearBuilt?: number;
  propertyType?: string;
  estRent?: number;
  estValue?: number;
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string | null;
  raw?: unknown;
};

export type EnrichmentMeta = {
  enrichment?: RentcastEnrichment | null;
  cacheHit?: boolean;
  fallbackUsed?: boolean;
};

export type PropertyProfile = {
  property: PropertyRecord;
  client?: ClientRecord | null;
  requests?: ServiceRequestRecord[];
  insights: PropertyInsight;
  enrichment?: {
    sources?: string[];
    errors?: string[];
    meta?: {
      providerErrors?: Record<string, string>;
      qualityScore?: number;
      durationMs?: number;
      providerDurations?: Record<string, number>;
      fallbackUsed?: boolean;
      cacheHit?: boolean;
      circuitOpen?: boolean;
    };
    aerial?: AerialInsight;
  };
};

export type JobberTokenRow = {
  id?: string;
  jobber_account_id?: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  created_at?: string;
};

export type IngestionResult = {
  ingested: number;
  skipped: number;
  errors?: string[];
};

export type ExternalPlatform = {
  id: string;
  name: string;
  slug: "jobber" | "servicetitan" | "housecall_pro";
  capabilities: {
    clients: boolean;
    properties: boolean;
    jobs: boolean;
    webhooks: boolean;
  };
};

export type ExternalClient = {
  id: string;
  platform: ExternalPlatform["slug"];
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type ExternalProperty = {
  id: string;
  platform: ExternalPlatform["slug"];
  address: Address;
  clientId?: string | null;
};

export type ExternalJob = {
  id: string;
  platform: ExternalPlatform["slug"];
  title?: string | null;
  status?: string | null;
  propertyId?: string | null;
  clientId?: string | null;
  createdAt?: string | null;
};
