import type { CacheStore } from "./cache.ts";
import { loadWithCache } from "./cache.ts";
import type { ChartRange, NormalizedResponse, ResourceName } from "./contracts.ts";
import { ProviderError } from "./errors.ts";
import type { QuotaProvider } from "./rateLimit.ts";
import type { ProviderRequestLimiter } from "./rateLimit.ts";
import { companyForSymbol } from "./registry.ts";
import type {
  CompanyProvider,
  EventsProvider,
  FilingsProvider,
  MarketDataProvider,
  NewsProvider,
} from "./providers/types.ts";

const ranges = new Set<ChartRange>(["1D", "1W", "1M", "3M", "1Y"]);
const resources = new Set<ResourceName>(["quote", "bars", "company", "news", "filings", "events"]);
const providerForResource: Partial<Record<ResourceName, QuotaProvider>> = {
  quote: "twelve-data",
  bars: "twelve-data",
  news: "finnhub",
  filings: "sec-edgar",
  events: "finnhub",
};
const MAX_PUBLIC_BODY_BYTES = 4096;

export type MarketDataRequest = {
  resource: ResourceName;
  symbol: string;
  range?: ChartRange;
};

export function parseMarketDataRequest(value: unknown): MarketDataRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ProviderError("INVALID_REQUEST", "A JSON request body is required.", 400);
  const input = value as Record<string, unknown>;
  if (typeof input.resource !== "string" || !resources.has(input.resource as ResourceName))
    throw new ProviderError("INVALID_REQUEST", "Unsupported market-data resource.", 400);
  if (typeof input.symbol !== "string" || !input.symbol.trim())
    throw new ProviderError("INVALID_REQUEST", "A symbol is required.", 400);
  const range = input.range;
  if (input.resource === "bars" && (typeof range !== "string" || !ranges.has(range as ChartRange)))
    throw new ProviderError("INVALID_REQUEST", "A supported chart range is required.", 400);
  const symbol = input.symbol.trim().toUpperCase();
  companyForSymbol(symbol);
  return { resource: input.resource as ResourceName, symbol, range: range as ChartRange | undefined };
}

export function validatePublicRequest(request: Request) {
  if (request.method !== "POST")
    throw new ProviderError("INVALID_REQUEST", "POST is required.", 405);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    throw new ProviderError("INVALID_REQUEST", "Content-Type must be application/json.", 415);
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_PUBLIC_BODY_BYTES)
    throw new ProviderError("INVALID_REQUEST", "Request body is too large.", 413);
}

export async function readPublicRequestJson(request: Request) {
  validatePublicRequest(request);
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_PUBLIC_BODY_BYTES)
    throw new ProviderError("INVALID_REQUEST", "Request body is too large.", 413);
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new ProviderError("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }
}

export function createMarketDataService(dependencies: {
  cache: CacheStore;
  market: MarketDataProvider;
  news: NewsProvider;
  filings: FilingsProvider;
  company: CompanyProvider;
  events: EventsProvider;
  limiter: ProviderRequestLimiter;
  assertProviderConfigured?: (provider: QuotaProvider) => void;
}) {
  return async function getResource(request: MarketDataRequest): Promise<NormalizedResponse<unknown>> {
    const company = companyForSymbol(request.symbol);
    const suffix = request.range ? `:${request.range}` : "";
    const key = `${request.resource}:${request.symbol}${suffix}`;
    return loadWithCache<unknown>({
      cache: dependencies.cache,
      key,
      resource: request.resource,
      loader: async (): Promise<NormalizedResponse<unknown>> => {
        const provider = providerForResource[request.resource];
        if (provider) {
          dependencies.assertProviderConfigured?.(provider);
          await dependencies.limiter.assertAllowed(provider);
        }
        switch (request.resource) {
          case "quote":
            return dependencies.market.getQuote(request.symbol);
          case "bars":
            return dependencies.market.getBars(request.symbol, request.range!);
          case "company":
            return dependencies.company.getCompany(request.symbol);
          case "news":
            return dependencies.news.getCompanyNews(request.symbol);
          case "filings":
            return dependencies.filings.getFilings(company);
          case "events":
            return dependencies.events.getEvents(company);
        }
      },
    });
  };
}
