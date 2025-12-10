import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BaseQuoteResult,
  CleaningQuoteResult,
  Enrichment,
  RequestRow,
  ServiceType,
} from "./types";
import StaticMap from "@/components/maps/StaticMap";
import CleaningQuoteCard from "./CleaningQuoteCard";
import { classifyRequest } from "@/lib/classification/requestClassifier";
import { isFeatureEnabled } from "@/lib/featureFlags";
import PISection from "@/components/ui/PISection";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";
import StatusPill from "@/components/ui/StatusPill";

type RequestDrawerProps = {
  request: RequestRow | null;
  onClose: () => void;
};

function formatAddress(address?: RequestRow["address"], addressString?: string) {
  if (addressString) return addressString;
  const { line1, line2, city, state, postalCode, country } = address ?? {};
  return [line1, line2, city, state, postalCode, country].filter(Boolean).join(", ");
}

function extractCoordinates(
  request: RequestRow
): { latitude: number; longitude: number } | null {
  if (
    typeof request.enrichment?.latitude === "number" &&
    typeof request.enrichment?.longitude === "number"
  ) {
    return {
      latitude: request.enrichment.latitude,
      longitude: request.enrichment.longitude,
    };
  }

  const sources = [request.property?.raw, request.raw];

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const raw = source as Record<string, unknown>;

    const latitude =
      typeof raw.latitude === "number"
        ? raw.latitude
        : typeof raw.lat === "number"
        ? raw.lat
        : typeof raw.location === "object" &&
            raw.location !== null &&
            typeof (raw.location as { lat?: unknown }).lat === "number"
        ? (raw.location as { lat?: number }).lat ?? null
        : null;

    const longitude =
      typeof raw.longitude === "number"
        ? raw.longitude
        : typeof raw.lng === "number"
        ? raw.lng
        : typeof raw.location === "object" &&
            raw.location !== null &&
            typeof (raw.location as { lng?: unknown }).lng === "number"
        ? (raw.location as { lng?: number }).lng ?? null
        : null;

    if (typeof latitude === "number" && typeof longitude === "number") {
      return { latitude, longitude };
    }
  }

  return null;
}

export default function RequestDrawer({ request, onClose }: RequestDrawerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [quote, setQuote] = useState<(BaseQuoteResult & { trade?: ServiceType }) | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType>("cleaning");
  const multiServiceEnabled = isFeatureEnabled("beta_quote_v2");
  const [localEnrichment, setLocalEnrichment] = useState<Enrichment | null>(request?.enrichment ?? null);
  const [enrichmentStatus, setEnrichmentStatus] = useState<RequestRow["enrichmentStatus"]>(
    request?.enrichmentStatus ?? (request?.enrichment ? "enriched" : "pending")
  );
  const [reEnriching, setReEnriching] = useState(false);

  useEffect(() => {
    setIsOpen(Boolean(request));
    setQuote(null);
    setQuoteError(null);
    setQuoteLoading(false);
    setLocalEnrichment(request?.enrichment ?? null);
    setEnrichmentStatus(request?.enrichmentStatus ?? (request?.enrichment ? "enriched" : "pending"));
    if (request) {
      const predicted = classifyRequest({
        title: request.title,
        description: (request.raw as any)?.description,
        message: (request.raw as any)?.message,
      }) as ServiceType;
      setServiceType(multiServiceEnabled ? predicted : "cleaning");
    }
  }, [request, multiServiceEnabled]);

  if (!request) return null;

  const enrichment = localEnrichment ?? request.enrichment ?? null;
  const mapImageUrl = enrichment?.mapImageUrl ?? request.mapImageUrl ?? null;
  const coordinatesFromEnrichment =
    typeof enrichment?.latitude === "number" &&
    typeof enrichment?.longitude === "number"
      ? {
          latitude: enrichment.latitude,
          longitude: enrichment.longitude,
        }
      : null;

  const coordinates = coordinatesFromEnrichment ?? extractCoordinates(request);
  const jobberUrl =
    request.raw && typeof (request.raw as { url?: unknown }).url === "string"
      ? ((request.raw as { url?: string }).url as string)
      : undefined;

  const buildQuoteInput = () => ({
    propertySqft:
          enrichment?.sqft ??
          request.property?.squareFeet ??
          undefined,
    beds: enrichment?.beds ?? request.property?.bedrooms ?? undefined,
    baths: enrichment?.baths ?? request.property?.bathrooms ?? undefined,
    lotSizeSqft: enrichment?.lotSizeSqft ?? request.property?.lotSizeSqFt ?? undefined,
    propertyType: enrichment?.propertyType ?? undefined,
    isFirstTime: true,
    hasPets: false,
    frequency: "one_time",
  });

  const handleGenerateQuote = async () => {
    setQuoteError(null);
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/quote/build", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: serviceType,
          requestId: request.id,
          jobberAccountId: request.jobberAccountId,
          input: buildQuoteInput(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Quote generation failed");
      }

      setQuote((json as { quote?: CleaningQuoteResult }).quote ?? null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not generate quote.";
      setQuoteError(message);
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleReEnrich = async () => {
    if (!request.addressString) return;
    setReEnriching(true);
    try {
      const res = await fetch("/api/property/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: request.addressString }),
      });
      if (!res.ok) {
        setEnrichmentStatus("failed");
        return;
      }
      const data = await res.json();
      const updated: Enrichment = {
        provider: data.provider ?? "rentcast",
        beds: data.beds ?? undefined,
        baths: data.baths ?? undefined,
        sqft: data.sqft ?? undefined,
        lotSizeSqft: data.lotSize ?? undefined,
        yearBuilt: data.yearBuilt ?? undefined,
        estimatedValue: data.estimatedValue ?? undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        mapImageUrl: data.mapImageUrl ?? null,
        valuationLow: data.valuationLow ?? undefined,
        valuationHigh: data.valuationHigh ?? undefined,
      };
      setLocalEnrichment(updated);
      setEnrichmentStatus("enriched");
      queryClient.invalidateQueries({ queryKey: ["jobber-requests"], exact: false });
    } catch (err) {
      console.error("Re-enrichment failed", err);
      setEnrichmentStatus("failed");
    } finally {
      setReEnriching(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm transition ${isOpen ? "" : "pointer-events-none"}`}>
      <div className="flex-1" onClick={onClose} />
      <div
        className={`w-full max-w-md bg-white h-full overflow-y-auto shadow-xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {formatAddress(request.address, request.addressString) || request.title || "Jobber Request"}
            </div>
            <div className="text-sm text-slate-600">{request.title || "Incoming request"}</div>
          </div>
          <PIButton variant="tertiary" onClick={onClose} aria-label="Close drawer">
            Close
          </PIButton>
        </div>

        <div className="flex-1 space-y-5 p-6">
          <PICard>
            <div className="text-sm font-semibold text-slate-800 mb-3">Jobber metadata</div>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between py-1">
                <span>Client</span>
                <span className="font-medium text-slate-900">
                  {request.contactName ?? request.clientName ?? request.title ?? "Unknown"}
                </span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span>Status</span>
                <StatusPill
                  status={request.status ? "connected" : "disconnected"}
                  label={request.status || "Unknown"}
                />
              </div>
              <div className="flex justify-between py-1">
                <span>Created</span>
                <span className="font-medium text-slate-900">
                  {request.createdAt ? new Date(request.createdAt).toLocaleString() : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Request ID</span>
                <span className="font-mono text-slate-800">{request.id}</span>
              </div>
            </div>
          </PICard>

          <PICard>
            <div className="text-sm font-semibold text-slate-800 mb-3">Property details</div>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between py-1">
                <span>Address</span>
                <span className="font-medium text-slate-900 text-right">
                  {formatAddress(request.address, request.addressString) || "Address pending"}
                </span>
              </div>
              <div className="border-b border-slate-200 my-4" />
              <div className="flex justify-between py-1">
                <span>Bedrooms</span>
                <span className="font-medium text-slate-900">
                  {enrichment?.beds ?? request.property?.bedrooms ?? "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Baths</span>
                <span className="font-medium text-slate-900">
                  {enrichment?.baths ?? request.property?.bathrooms ?? "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Square footage</span>
                <span className="font-medium text-slate-900">
                  {typeof (enrichment?.sqft ?? request.property?.squareFeet) === "number"
                    ? (enrichment?.sqft ?? request.property?.squareFeet ?? 0).toLocaleString()
                    : "Not available"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Lot size</span>
                <span className="font-medium text-slate-900">
                  {typeof enrichment?.lotSizeSqft === "number"
                    ? `${enrichment.lotSizeSqft.toLocaleString()} sqft`
                    : typeof request.property?.lotSizeSqFt === "number"
                    ? `${request.property.lotSizeSqFt.toLocaleString()} sqft`
                    : "Not available"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Estimated value</span>
                <span className="font-medium text-slate-900">
                  {typeof enrichment?.estimatedValue === "number"
                    ? `$${enrichment.estimatedValue.toLocaleString()}`
                    : typeof request.property?.priceEstimate === "number"
                    ? `$${request.property.priceEstimate.toLocaleString()}`
                    : "Not available"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Year built</span>
                <span className="font-medium text-slate-900">
                  {enrichment?.yearBuilt ?? request.property?.yearBuilt ?? "—"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <PIButton
                  type="button"
                  onClick={handleReEnrich}
                  disabled={reEnriching || !request.addressString}
                  className="disabled:opacity-60"
                >
                  {reEnriching ? "Re-enriching…" : "Re-run enrichment"}
                </PIButton>
                {!request.addressString && (
                  <span className="text-xs text-slate-500">Address required to run enrichment.</span>
                )}
              </div>
            </div>
          </PICard>

          <PICard>
            <div className="text-sm font-semibold text-slate-800 mb-3">Maps</div>
            {mapImageUrl ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mapImageUrl} alt="Property map snapshot" className="h-full w-full object-cover" />
              </div>
            ) : coordinates ? (
              <div className="space-y-3">
                <StaticMap lat={coordinates.latitude} lng={coordinates.longitude} zoom={16} />
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                  <span className="font-semibold text-slate-900">
                    Lat {coordinates.latitude.toFixed(4)}, Lng {coordinates.longitude.toFixed(4)}
                  </span>
                  <a
                    href={`https://maps.apple.com/?ll=${coordinates.latitude},${coordinates.longitude}&z=16&q=Property`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-[#0A84FF] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#006BE6] transition"
                  >
                    Open in map app
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm">
                No coordinates available yet.
              </div>
            )}
          </PICard>

          <PICard>
            <div className="text-sm font-semibold text-slate-800 mb-3">Notes</div>
            <div className="text-sm text-slate-700">
              {(request.raw as any)?.description ?? (request.raw as any)?.message ?? "No customer notes provided."}
            </div>
          </PICard>

          <PISection title="Quote options">
            {multiServiceEnabled ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">Select service type</div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { label: "Cleaning", value: "cleaning" },
                      { label: "Pressure Washing", value: "pressure_washing" },
                      { label: "Window Washing", value: "window_washing" },
                      { label: "Lawn Care", value: "lawn_care" },
                      { label: "Handyman", value: "handyman" },
                    ] as { label: string; value: ServiceType }[]
                  ).map((option) => (
                    <PIButton
                      key={option.value}
                      type="button"
                      variant={serviceType === option.value ? "primary" : "secondary"}
                      onClick={() => setServiceType(option.value)}
                      className="px-3 py-1 text-sm"
                    >
                      {option.label}
                    </PIButton>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                Multi-service quoting is disabled. Using cleaning quote.
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {`${serviceType.replace(/_/g, " ")} quote (beta)`}
                </div>
                <div className="text-sm text-slate-600">
                  Uses property intel and default configuration for selected service.
                </div>
              </div>
              <PIButton type="button" onClick={handleGenerateQuote} disabled={quoteLoading} className="disabled:opacity-60">
                {quoteLoading
                  ? "Calculating…"
                  : `Generate ${serviceType.replace(/_/g, " ")} quote`}
              </PIButton>
            </div>

            {quoteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {quoteError}
              </div>
            )}

            {quote ? (
              "customerPrice" in quote ? (
                <CleaningQuoteCard quote={quote as CleaningQuoteResult} />
              ) : (
                <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">Placeholder quote</div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {(quote as any).price ? `$${(quote as any).price}` : "Estimate pending"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {(quote as any).type || "service"} — placeholder engine
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    <div className="font-semibold text-slate-800">Assumptions</div>
                    <ul className="mt-1 space-y-1 list-disc pl-4">
                      {(((quote as any).assumptions as string[] | undefined) ??
                        ["Placeholder — implement later"]).map((assumption) => (
                        <li key={assumption}>{assumption}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                No quote yet. Provide basic property intel (sqft, beds, baths) for best accuracy.
              </div>
            )}
          </PISection>

          <PISection title="Full Jobber payload">
            <pre className="max-h-64 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
{JSON.stringify(request.raw ?? request, null, 2)}
            </pre>
          </PISection>
        </div>

        <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3">
            {jobberUrl && (
              <PIButton
                href={jobberUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full justify-center py-3"
              >
                Open in Jobber
              </PIButton>
            )}
            <PIButton variant="secondary" className="w-full justify-center py-3">
              Generate Estimate
            </PIButton>
          </div>
        </div>
      </div>
    </div>
  );
}
