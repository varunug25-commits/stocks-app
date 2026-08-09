import type { DataErrorCode, FreshnessMetadata, NormalizedResponse, ResourceName } from "./contracts.ts";
import { ProviderError } from "./errors.ts";

export const CACHE_TTLS_SECONDS: Record<ResourceName, number> = {
  quote: 60,
  bars: 300,
  company: 60 * 60 * 24 * 7,
  news: 60 * 15,
  filings: 60 * 60 * 6,
  events: 60 * 60,
  search: 60 * 60 * 6,
};

export type CacheRecord<T> = {
  key: string;
  resource: ResourceName;
  value: T;
  meta: FreshnessMetadata;
  expiresAt: string;
};

export interface CacheStore {
  get<T>(key: string): Promise<CacheRecord<T> | null>;
  put<T>(record: CacheRecord<T>): Promise<void>;
}

export function isFresh(record: CacheRecord<unknown>, now = Date.now()) {
  return Date.parse(record.expiresAt) > now;
}

export async function loadWithCache<T>(options: {
  cache: CacheStore;
  key: string;
  resource: ResourceName;
  loader: () => Promise<NormalizedResponse<T>>;
  now?: () => number;
}): Promise<NormalizedResponse<T>> {
  const now = options.now?.() ?? Date.now();
  const cached = await options.cache.get<T>(options.key);
  if (cached && isFresh(cached, now)) return { data: cached.value, meta: cached.meta };
  try {
    const loaded = await options.loader();
    await options.cache.put({
      key: options.key,
      resource: options.resource,
      value: loaded.data,
      meta: loaded.meta,
      expiresAt: new Date(now + CACHE_TTLS_SECONDS[options.resource] * 1000).toISOString(),
    });
    return loaded;
  } catch (error) {
    if (!cached) throw error;
    const code: DataErrorCode = error instanceof ProviderError ? error.code : "UPSTREAM_UNAVAILABLE";
    return {
      data: cached.value,
      meta: { ...cached.meta, isStale: true, errorCode: code },
    };
  }
}
