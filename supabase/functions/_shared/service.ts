import type { CacheStore } from "./cache.ts";
import { loadWithCache } from "./cache.ts";
import type { ChartRange, NormalizedResponse, ResourceName } from "./contracts.ts";
import { ProviderError } from "./errors.ts";
import type { QuotaProvider } from "./rateLimit.ts";
import type { ProviderRequestLimiter } from "./rateLimit.ts";
import { requireSymbolSyntax } from "./symbols.ts";
import type {
  CompanyProvider,
  EventsProvider,
  FilingsProvider,
  MarketDataProvider,
  NewsProvider,
} from "./providers/types.ts";

const ranges = new Set<ChartRange>(["1D", "1W", "1M", "3M", "1Y"]);
const resources = new Set<ResourceName>(["quote", "bars", "company", "news", "filings", "events", "search"]);
const providerForResource: Partial<Record<ResourceName, QuotaProvider>> = {
  quote: "twelve-data",
  bars: "twelve-data",
  news: "finnhub",
  filings: "sec-edgar",
  events: "finnhub",
  company: "finnhub",
  search: "finnhub",
};
const MAX_PUBLIC_BODY_BYTES = 4096;

export type MarketDataRequest =
  | { resource: Exclude<ResourceName, "search">; symbol: string; range?: ChartRange }
  | { resource: "search"; query: string };

export function parseMarketDataRequest(value: unknown): MarketDataRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ProviderError("INVALID_REQUEST", "A JSON request body is required.", 400);
  const input = value as Record<string, unknown>;
  if (typeof input.resource !== "string" || !resources.has(input.resource as ResourceName))
    throw new ProviderError("INVALID_REQUEST", "Unsupported market-data resource.", 400);
  if (input.resource === "search") {
    if (typeof input.query !== "string")
      throw new ProviderError("INVALID_REQUEST", "A search query is required.", 400);
    const query = input.query.trim().replace(/\s+/g, " ");
    if (query.length < 2 || query.length > 64)
      throw new ProviderError("INVALID_REQUEST", "Search requires between 2 and 64 characters.", 400);
    return { resource: "search", query };
  }
  const range = input.range;
  if (input.resource === "bars" && (typeof range !== "string" || !ranges.has(range as ChartRange)))
    throw new ProviderError("INVALID_REQUEST", "A supported chart range is required.", 400);
  const symbol = requireSymbolSyntax(input.symbol);
  return { resource: input.resource as Exclude<ResourceName, "search">, symbol, range: range as ChartRange | undefined };
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
    if (request.resource === "search") {
      const normalizedQuery = request.query.toLowerCase();
      return loadWithCache({
        cache: dependencies.cache,
        key: `search:${normalizedQuery}`,
        resource: "search",
        loader: async () => {
          dependencies.assertProviderConfigured?.("finnhub");
          await dependencies.limiter.assertAllowed("finnhub");
          return dependencies.company.search(request.query);
        },
      });
    }
    const loadValidatedCompany = () => loadWithCache({
      cache: dependencies.cache,
      key: `company:${request.symbol}`,
      resource: "company" as const,
      loader: async () => {
        dependencies.assertProviderConfigured?.("finnhub");
        await dependencies.limiter.assertAllowed("finnhub");
        return dependencies.company.getCompany(request.symbol);
      },
    });
    if (request.resource === "company") return loadValidatedCompany();
    const suffix = request.range ? `:${request.range}` : "";
    const key = `${request.resource}:${request.symbol}${suffix}`;
    return loadWithCache<unknown>({
      cache: dependencies.cache,
      key,
      resource: request.resource,
      loader: async (): Promise<NormalizedResponse<unknown>> => {
        const company = (await loadValidatedCompany()).data;
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
          case "news":
            return dependencies.news.getCompanyNews(request.symbol);
          case "filings":
            return dependencies.filings.getFilings(company);
          case "events":
            return dependencies.events.getEvents(company);
        }
        throw new ProviderError("INVALID_REQUEST", "Unsupported market-data resource.", 400);
      },
    });
  };
}
