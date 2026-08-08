import { intelligenceFunctionUrl, publicDataConfig } from "@/data/real/config";
import type { PublicDataConfig } from "@/data/real/config";
import type { IntelligenceRequest, MarketBriefIntelligenceResponse } from "./contracts";

export class IntelligenceClientError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "IntelligenceClientError";
  }
}

function isResponse(value: unknown): value is MarketBriefIntelligenceResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.sections) && Array.isArray(candidate.sources) &&
    Array.isArray(candidate.symbols) && typeof candidate.generatedAt === "string" &&
    !!candidate.meta && typeof candidate.meta === "object";
}

export async function requestIntelligence(
  request: IntelligenceRequest,
  options: { config?: PublicDataConfig; fetcher?: typeof fetch } = {},
) {
  const config = options.config ?? publicDataConfig;
  const url = intelligenceFunctionUrl(config);
  if (!url || !config.publishableKey)
    throw new IntelligenceClientError("MISSING_CONFIGURATION", "Grounded intelligence is not configured on this build.");
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new IntelligenceClientError("NETWORK_FAILURE", "MarketBrief could not reach the intelligence service.");
  }
  let payload: unknown;
  try { payload = await response.json(); } catch {
    throw new IntelligenceClientError("MALFORMED_RESPONSE", "The intelligence service returned an unreadable response.");
  }
  if (!response.ok) {
    const error = payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as { error?: { code?: unknown; message?: unknown } }).error
      : undefined;
    throw new IntelligenceClientError(
      typeof error?.code === "string" ? error.code : "UPSTREAM_UNAVAILABLE",
      typeof error?.message === "string" ? error.message : "Grounded intelligence is unavailable.",
    );
  }
  if (!isResponse(payload))
    throw new IntelligenceClientError("MALFORMED_RESPONSE", "The intelligence service returned malformed data.");
  return payload;
}
