import type { DataEnvelope, StockSearchResult } from "./contracts.ts";
import type { PublicDataConfig } from "./config.ts";
import { requestMarketData } from "./client.ts";

const clientCache = new Map<string, { expiresAt: number; value: DataEnvelope<StockSearchResult[]> }>();
const inFlight = new Map<string, Promise<DataEnvelope<StockSearchResult[]>>>();
const CLIENT_SEARCH_TTL_MS = 5 * 60_000;

export function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, " ");
}

export function requestStockSearch(
  query: string,
  options: { config?: PublicDataConfig; fetcher?: typeof fetch; now?: () => number } = {},
) {
  const normalized = normalizeSearchQuery(query);
  if (normalized.length < 2) return Promise.resolve(null);
  const key = normalized.toLowerCase();
  const now = options.now?.() ?? Date.now();
  const cached = clientCache.get(key);
  if (cached && cached.expiresAt > now) return Promise.resolve(cached.value);
  const existing = inFlight.get(key);
  if (existing) return existing;
  const request = requestMarketData<StockSearchResult[]>({ resource: "search", query: normalized }, options)
    .then((value) => {
      clientCache.set(key, { value, expiresAt: now + CLIENT_SEARCH_TTL_MS });
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

export function clearStockSearchCache() {
  clientCache.clear();
  inFlight.clear();
}
