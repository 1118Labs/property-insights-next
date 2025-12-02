export function isNonEmptyString(value: unknown, min = 3): value is string {
  return typeof value === "string" && value.trim().length >= min;
}

export function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function clampNumber(value: number | null | undefined, min: number, max: number) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.min(Math.max(value, min), max);
}

export function pickFirst<T>(...values: Array<T | null | undefined>): T | null {
  for (const v of values) {
    if (v !== null && v !== undefined && v !== "") return v as T;
  }
  return null;
}
