type ClassifiableRequest = {
  message?: string | null;
  title?: string | null;
  description?: string | null;
} | null | undefined;

export function classifyRequest(req: ClassifiableRequest) {
  const parts = [
    req?.message ?? "",
    req?.title ?? "",
    req?.description ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (parts.includes("clean") || parts.includes("maid")) return "cleaning";
  if (parts.includes("window")) return "window_washing";
  if (parts.includes("pressure") || parts.includes("power wash"))
    return "pressure_washing";
  if (parts.includes("lawn") || parts.includes("yard")) return "lawn_care";

  return "cleaning";
}
