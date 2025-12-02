import { NextResponse } from "next/server";
import { listPlatforms, resolvePlatform } from "@/lib/platforms/resolver";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { logStructured } from "@/lib/utils/logging";

export async function GET() {
  const correlationId = createCorrelationId();
  try {
    const platforms = listPlatforms();
    const results = await Promise.all(
      platforms.map(async (p) => {
        try {
          const client = resolvePlatform(p.slug);
          const health = client.healthCheck ? await client.healthCheck() : { status: "ok" as const };
          return { ...p, health };
        } catch (err) {
          return { ...p, health: { status: "error", detail: String(err) } };
        }
      })
    );
    const notifications = { status: process.env.NOTIFICATIONS_DISABLED === "true" ? "disabled" : "ok" };
    logStructured("info", "platform_health", { correlationId, platforms: results.map((r) => ({ slug: r.slug, status: r.health.status })) });
    return NextResponse.json({ data: results, notifications, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
