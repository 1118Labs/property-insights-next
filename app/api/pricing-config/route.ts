import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getAllPricingProfiles, setPricingOverride, setTaxRate, getTaxRate } from "@/lib/quotes/pricingProfiles";
import { platformEnum } from "@/lib/platforms/types";
import { z } from "zod";
import { assertAdminAuthorized } from "@/lib/utils/auth";

const overrideSchema = z.object({
  serviceProfile: z.string(),
  profile: z.record(z.any()).optional(),
  taxRate: z.number().optional(),
});

export async function GET() {
  const correlationId = createCorrelationId();
  return NextResponse.json({ data: { profiles: getAllPricingProfiles(), taxRate: getTaxRate() }, correlationId });
}

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    return jsonError((err as { status?: number })?.status ?? 401, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = overrideSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid pricing override", details: parsed.error.format(), correlationId });
    }
    const slug = parsed.data.serviceProfile as any;
    if (parsed.data.taxRate !== undefined) setTaxRate(parsed.data.taxRate);
    if (parsed.data.profile) setPricingOverride(slug, parsed.data.profile as any);
    return NextResponse.json({ data: { profiles: getAllPricingProfiles(), taxRate: getTaxRate() }, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
