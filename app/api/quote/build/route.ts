import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { buildQuote as buildLegacyQuote } from "@/lib/quotes/builder";
import { fetchProfileById } from "@/lib/insights";
import { quoteSchema } from "@/lib/quotes/quote";
import { saveQuote } from "@/lib/quotes/store";
import { buildEnrichedProfile } from "@/lib/insights";
import {
  CleaningQuoteInput,
  CleaningQuoteResult,
  buildCleaningQuote,
} from "@/lib/quoting/cleaning";
import { buildQuote } from "@/lib/quoting";
import { supabaseAdmin } from "@/lib/supabase/server";
import { SupportedServiceType } from "@/lib/quoting";
import { getAccountByJobberAccountId, incrementUsage } from "@/lib/accounts";
import { logError, logInfo } from "@/lib/logging";
import { getCurrentUserFromRequest } from "@/lib/currentUser";

const buildSchema = z.object({
  propertyId: z.string().optional(),
  clientId: z.string().optional(),
  serviceProfile: z.string().optional(),
  persist: z.boolean().optional(),
  address: z.string().optional(),
  urgency: z.boolean().optional(),
  highComplexity: z.boolean().optional(),
});

type CleaningBuildRequest = {
  type: "cleaning";
  requestId?: string | null;
  input?: CleaningQuoteInput;
  jobberAccountId?: string | null;
};

type MultiTradeRequest = {
  type: SupportedServiceType;
  requestId?: string | null;
  jobberAccountId?: string | null;
  input?: CleaningQuoteInput | Record<string, unknown>;
};

async function fetchEnrichmentForRequest(
  requestId?: string | null
): Promise<CleaningQuoteInput> {
  if (!requestId || !supabaseAdmin) return {};
  try {
    const { data } = await supabaseAdmin
      .from("property_enrichment")
      .select("*")
      .eq("jobber_request_id", requestId)
      .order("refreshed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return {};
    return {
      propertySqft:
        typeof data.square_feet === "number" ? data.square_feet : undefined,
      beds: typeof data.bedrooms === "number" ? data.bedrooms : undefined,
      baths: typeof data.bathrooms === "number" ? data.bathrooms : undefined,
    };
  } catch (err) {
    console.error("Failed to fetch enrichment for quote build", err);
    return {};
  }
}

function mergeCleaningInput(
  enrichment: CleaningQuoteInput,
  input: CleaningQuoteInput | undefined
): CleaningQuoteInput {
  return {
    propertySqft: input?.propertySqft ?? enrichment.propertySqft,
    beds: input?.beds ?? enrichment.beds,
    baths: input?.baths ?? enrichment.baths,
    propertyType: input?.propertyType ?? enrichment.propertyType,
    isFirstTime: input?.isFirstTime ?? true,
    hasPets: input?.hasPets ?? false,
    frequency: input?.frequency ?? "one_time",
    notes: input?.notes ?? enrichment.notes,
  };
}

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const user = await getCurrentUserFromRequest(req);
    const body = await req.json().catch(() => ({}));

    if (body?.type) {
      const typedBody = body as MultiTradeRequest;
      if (
        typedBody.type === "cleaning" ||
        typedBody.type === "pressure_washing" ||
        typedBody.type === "window_washing" ||
        typedBody.type === "lawn_care" ||
        typedBody.type === "handyman"
      ) {
        if (typedBody.type === "cleaning") {
          const cleaningBody = typedBody as CleaningBuildRequest;
          const enrichment = await fetchEnrichmentForRequest(cleaningBody.requestId);
          const mergedInput = mergeCleaningInput(enrichment, cleaningBody.input);
        const quote: CleaningQuoteResult & { trade: SupportedServiceType } = {
          trade: "cleaning",
          ...buildCleaningQuote(mergedInput),
        };

        const account =
          (user?.accountId && { id: user.accountId }) ||
          (cleaningBody.jobberAccountId
            ? await getAccountByJobberAccountId(cleaningBody.jobberAccountId)
            : null);
        if (account?.id) {
          incrementUsage(account.id, "quotes_generated", 1).catch(() => {});
        }

        logInfo("quote.build", "Built cleaning quote", {
          requestId: cleaningBody.requestId,
          trade: "cleaning",
        });

        return NextResponse.json({
          type: "cleaning",
          requestId: cleaningBody.requestId ?? null,
          quote,
          correlationId,
        });
      }

      const quote = buildQuote(typedBody.type, typedBody.input ?? {});

      const account =
        (user?.accountId && { id: user.accountId }) ||
        (typedBody.jobberAccountId
          ? await getAccountByJobberAccountId(typedBody.jobberAccountId)
          : null);
      if (account?.id) {
        incrementUsage(account.id, "quotes_generated", 1).catch(() => {});
      }

      logInfo("quote.build", "Built quote", {
        requestId: typedBody.requestId,
        trade: typedBody.type,
      });

      return NextResponse.json({
        type: typedBody.type,
        requestId: typedBody.requestId ?? null,
        quote: { ...quote, trade: typedBody.type },
        correlationId,
        });
      }
    }

    const parsed = buildSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid quote build input", details: parsed.error.format(), correlationId });
    }
    const serviceProfile = (parsed.data.serviceProfile as any) || "cleaning";

    let profile = parsed.data.propertyId ? await fetchProfileById(parsed.data.propertyId) : null;
    if (!profile && parsed.data.address) {
      profile = await buildEnrichedProfile(parsed.data.address, false, serviceProfile);
    }
    if (!profile) {
      return jsonError(404, { errorCode: "NOT_FOUND", message: "Property not found for quote", correlationId });
    }

    const quote = buildLegacyQuote(profile, serviceProfile, {
      urgencyMultiplier: parsed.data.urgency ? 1.15 : 1,
      complexityMultiplier: parsed.data.highComplexity ? 1.1 : undefined,
    });
    if (parsed.data.persist) saveQuote(quote);
    return NextResponse.json({ data: quote, correlationId });
  } catch (err) {
    logError("quote.build", "Server error", { err });
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
