import { NextResponse } from "next/server";
import crypto from "crypto";

export type ErrorShape = {
  errorCode: string;
  message: string;
  details?: unknown;
  correlationId?: string;
};

export function createCorrelationId() {
  return crypto.randomUUID();
}

export function jsonError(status: number, error: ErrorShape) {
  return NextResponse.json(error, { status, headers: { "x-correlation-id": error.correlationId || "" } });
}

export function jsonOk<T>(data: T, correlationId?: string) {
  return NextResponse.json({ data, correlationId }, { status: 200, headers: correlationId ? { "x-correlation-id": correlationId } : undefined });
}

export type RateLimitState = Map<string, number[]>;

const rateLimitStore: RateLimitState = new Map();

export function rateLimitGuard(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const entries = rateLimitStore.get(key) || [];
  const recent = entries.filter((t) => t > windowStart);
  if (recent.length >= limit) return false;
  recent.push(now);
  rateLimitStore.set(key, recent);
  return true;
}
