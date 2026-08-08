import type { DataEnvelope, ClientDataErrorCode, MarketDataRequest } from "./contracts.ts";
import type { PublicDataConfig } from "./config.ts";
import { edgeFunctionUrl, publicDataConfig } from "./config.ts";

export class MarketDataClientError extends Error {
  readonly code: ClientDataErrorCode;
  constructor(code: ClientDataErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "MarketDataClientError";
  }
}

function isEnvelope(value: unknown): value is DataEnvelope<unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const envelope = value as Record<string, unknown>;
  if (!("data" in envelope) || !envelope.meta || typeof envelope.meta !== "object") return false;
  const meta = envelope.meta as Record<string, unknown>;
  return typeof meta.source === "string" && typeof meta.provider === "string" &&
    typeof meta.fetchedAt === "string" && (meta.asOf === null || typeof meta.asOf === "string") &&
    typeof meta.isStale === "boolean";
}

export async function requestMarketData<T>(
  request: MarketDataRequest,
  options: { config?: PublicDataConfig; fetcher?: typeof fetch } = {},
): Promise<DataEnvelope<T>> {
  const config = options.config ?? publicDataConfig;
  const url = edgeFunctionUrl(config);
  if (!url || !config.publishableKey)
    throw new MarketDataClientError("MISSING_CONFIGURATION", "Real data is not configured on this build.");
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: config.publishableKey },
      body: JSON.stringify(request),
    });
  } catch {
    throw new MarketDataClientError("NETWORK_FAILURE", "MarketBrief could not reach the data service.");
  }
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MarketDataClientError("MALFORMED_RESPONSE", "The data service returned an unreadable response.");
  }
  if (!response.ok) {
    const error = payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { error?: { code?: unknown; message?: unknown } }).error
      : undefined;
    const code = typeof error?.code === "string" ? error.code as ClientDataErrorCode : "UPSTREAM_UNAVAILABLE";
    throw new MarketDataClientError(code, typeof error?.message === "string" ? error.message : "Real data is unavailable.");
  }
  if (!isEnvelope(payload))
    throw new MarketDataClientError("MALFORMED_RESPONSE", "The data service returned malformed normalized data.");
  return payload as DataEnvelope<T>;
}
