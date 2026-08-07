import { ProviderError } from "../errors.ts";

export function recordValue(value: unknown, context: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ProviderError("MALFORMED_RESPONSE", `${context} returned malformed data.`);
  return value as Record<string, unknown>;
}

export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim())
    throw new ProviderError("MALFORMED_RESPONSE", `Missing ${field} in provider response.`);
  return value;
}

export function nullableString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

export function requiredNumber(value: unknown, field: string) {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed))
    throw new ProviderError("MALFORMED_RESPONSE", `Missing ${field} in provider response.`);
  return parsed;
}

export function nullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isoTimestamp(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value))
    return new Date(value > 10_000_000_000 ? value : value * 1000).toISOString();
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value.includes("T") ? value : value.replace(" ", "T") + "Z");
    if (Number.isFinite(parsed)) return new Date(parsed).toISOString();
  }
  return null;
}
