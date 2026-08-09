import type { EvidenceBundle, IntelligenceRequest, MarketDataEnvelope } from "./contracts.ts";
import { normalizeEvidence, type RetrievedMarketData } from "./evidence.ts";

type Fetcher = typeof fetch;
type Resource = "company" | "quote" | "bars" | "news" | "filings" | "events";

function safeCode(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return fallback;
  const error = (payload as { error?: { code?: unknown } }).error;
  return typeof error?.code === "string" ? error.code : fallback;
}

function quoteMove(envelope: MarketDataEnvelope | undefined) {
  if (!envelope?.data || typeof envelope.data !== "object" || Array.isArray(envelope.data)) return -1;
  const move = (envelope.data as Record<string, unknown>).changePercent;
  return typeof move === "number" && Number.isFinite(move) ? Math.abs(move) : -1;
}

export async function retrieveEvidence(options: {
  request: IntelligenceRequest;
  marketDataUrl: string;
  publishableKey: string;
  fetcher?: Fetcher;
}): Promise<EvidenceBundle> {
  const fetcher = options.fetcher ?? fetch;
  const resources: RetrievedMarketData = {};
  const errors: EvidenceBundle["errors"] = [];
  const load = async (symbol: string, resource: Resource) => {
    let response: Response;
    try {
      response = await fetcher(options.marketDataUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: options.publishableKey, Authorization: `Bearer ${options.publishableKey}` },
        body: JSON.stringify(resource === "bars" ? { resource, symbol, range: "1M" } : { resource, symbol }),
      });
    } catch {
      errors.push({ resource, symbol, code: "NETWORK_FAILURE" });
      return false;
    }
    let payload: unknown;
    try { payload = await response.json(); } catch { payload = null; }
    if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload) || !("data" in payload)) {
      errors.push({ resource, symbol, code: safeCode(payload, "UPSTREAM_UNAVAILABLE") });
      return false;
    }
    resources[symbol] = { ...resources[symbol], [resource]: payload as MarketDataEnvelope };
    return true;
  };

  const validity = await Promise.all(options.request.symbols.map(async (symbol) => ({ symbol, valid: await load(symbol, "company") })));
  const validSymbols = validity.filter((entry) => entry.valid).map((entry) => entry.symbol);
  if (!validSymbols.length) return normalizeEvidence({ ...options.request, symbols: [] }, resources, errors);

  if (options.request.task === "news_summary") {
    await Promise.all(validSymbols.map((symbol) => load(symbol, "news")));
  } else if (options.request.task === "filing_summary") {
    await Promise.all(validSymbols.map((symbol) => load(symbol, "filings")));
  } else {
    await Promise.all(validSymbols.map((symbol) => load(symbol, "quote")));
    const selected = [...validSymbols]
      .sort((left, right) => quoteMove(resources[right]?.quote) - quoteMove(resources[left]?.quote))
      .slice(0, options.request.task === "why_moved" ? 1 : 5);
    await Promise.all(selected.flatMap((symbol) => (["news", "filings", "events", "bars"] as const).map((resource) => load(symbol, resource))));
  }
  return normalizeEvidence({ ...options.request, symbols: validSymbols }, resources, errors);
}
