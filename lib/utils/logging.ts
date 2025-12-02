import { createCorrelationId } from "@/lib/utils/api";

type LogLevel = "info" | "warn" | "error";

export function logStructured(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const payload = {
    level,
    message,
    correlationId: context?.correlationId || createCorrelationId(),
    ...context,
    ts: new Date().toISOString(),
  };
  const output = JSON.stringify(payload);
  if (level === "error") console.error(output);
  else if (level === "warn") console.warn(output);
  else console.log(output);
  return payload.correlationId;
}
