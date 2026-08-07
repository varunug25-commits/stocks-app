import type { DataEnvelope, DataResource } from "./contracts.ts";
import { MarketDataClientError } from "./client.ts";

export function envelopeToResource<T>(envelope: DataEnvelope<T>): DataResource<T> {
  return envelope.meta.isStale
    ? { status: "stale", data: envelope.data, meta: envelope.meta }
    : { status: "ready", data: envelope.data, meta: envelope.meta };
}

export function errorToResource(error: unknown): DataResource<never> {
  const clientError = error instanceof MarketDataClientError
    ? error
    : new MarketDataClientError("UPSTREAM_UNAVAILABLE", "Real data is unavailable.");
  const status = clientError.code === "RATE_LIMITED"
    ? "rate-limited"
    : clientError.code === "MISSING_CONFIGURATION" || clientError.code === "MISSING_SECRET" || clientError.code === "NOT_FOUND"
      ? "unavailable"
      : "error";
  return { status, code: clientError.code, message: clientError.message };
}
