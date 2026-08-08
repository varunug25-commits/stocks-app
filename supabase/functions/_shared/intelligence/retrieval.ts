import type { EvidenceBundle, IntelligenceRequest, MarketDataEnvelope } from "./contracts.ts";
import { normalizeEvidence, type RetrievedMarketData } from "./evidence.ts";

type Fetcher = typeof fetch;

function resourcesForTask(task: IntelligenceRequest["task"]) {
  switch (task) {
    case "news_summary": return ["company", "news"] as const;
    case "filing_summary": return ["company", "filings"] as const;
    case "brief": return ["company", "quote", "news", "filings", "events"] as const;
    case "why_moved": return ["company", "quote", "news", "filings", "events"] as const;
    case "ask": return ["company", "quote", "news", "filings", "events"] as const;
  }
}

function safeCode(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return fallback;
  const error = (payload as { error?: { code?: unknown } }).error;
  return typeof error?.code === "string" ? error.code : fallback;
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
  await Promise.all(options.request.symbols.flatMap((symbol) => resourcesForTask(options.request.task).map(async (resource) => {
    let response: Response;
    try {
      response = await fetcher(options.marketDataUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: options.publishableKey,
          Authorization: `Bearer ${options.publishableKey}`,
        },
        body: JSON.stringify({ resource, symbol }),
      });
    } catch {
      errors.push({ resource, symbol, code: "NETWORK_FAILURE" });
      return;
    }
    let payload: unknown;
    try { payload = await response.json(); } catch { payload = null; }
    if (!response.ok || !payload || typeof payload !== "object" || Array.isArray(payload) || !("data" in payload)) {
      errors.push({ resource, symbol, code: safeCode(payload, "UPSTREAM_UNAVAILABLE") });
      return;
    }
    resources[symbol] = { ...resources[symbol], [resource]: payload as MarketDataEnvelope };
  })));
  return normalizeEvidence(options.request, resources, errors);
}
