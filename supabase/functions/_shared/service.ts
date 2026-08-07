import type { CacheStore } from "./cache.ts";
import { loadWithCache } from "./cache.ts";
import type { ChartRange, NormalizedResponse, ResourceName } from "./contracts.ts";
import { ProviderError } from "./errors.ts";
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

export function createMarketDataService(dependencies: {
  cache: CacheStore;
  market: MarketDataProvider;
  news: NewsProvider;
  filings: FilingsProvider;
  company: CompanyProvider;
  events: EventsProvider;
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
