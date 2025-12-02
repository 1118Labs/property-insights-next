import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { addressInputSchema } from "@/lib/utils/validationSchema";

const serviceProfileState: { profile: string | null } = { profile: null };

export async function GET() {
  const correlationId = createCorrelationId();
  return NextResponse.json({ data: serviceProfileState.profile, correlationId });
}

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json();
    const parsed = addressInputSchema.pick({ serviceProfile: true }).safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid service profile", details: parsed.error.format(), correlationId });
    }
    serviceProfileState.profile = parsed.data.serviceProfile || null;
    return NextResponse.json({ data: serviceProfileState.profile, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
