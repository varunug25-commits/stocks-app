import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import type { Database, Json } from "../../database.types.ts";
import type { CacheRecord, CacheStore } from "../_shared/cache.ts";
import type { DataErrorCode, DataProviderName, ResourceName } from "../_shared/contracts.ts";
import { ProviderError } from "../_shared/errors.ts";
import { FinnhubProvider } from "../_shared/providers/finnhub.ts";
import { RegistryCompanyProvider } from "../_shared/providers/company.ts";
import { SecEdgarProvider } from "../_shared/providers/sec.ts";
import { TwelveDataProvider } from "../_shared/providers/twelveData.ts";
import { createMarketDataService, parseMarketDataRequest } from "../_shared/service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const response = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { ...corsHeaders, "Cache-Control": "no-store" },
});

type CacheRow = Database["public"]["Tables"]["market_data_cache"]["Row"];
type CacheInsert = Database["public"]["Tables"]["market_data_cache"]["Insert"];
type CacheQueryError = { message: string } | null;
type CacheTable = {
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<{ data: CacheRow | null; error: CacheQueryError }>;
    };
  };
  upsert(value: CacheInsert): PromiseLike<{ error: CacheQueryError }>;
};

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    if (req.method !== "POST")
      return response({ error: { code: "INVALID_REQUEST", message: "POST is required." } }, 405);

    const cacheTable = () => (ctx.supabaseAdmin as unknown as {
      from(table: "market_data_cache"): CacheTable;
    }).from("market_data_cache");

    const cache: CacheStore = {
      async get<T>(key: string) {
        const { data, error } = await cacheTable()
          .select("cache_key,resource_type,provider,source,payload,fetched_at,as_of,expires_at,error_code")
          .eq("cache_key", key)
          .maybeSingle();
        if (error) throw new ProviderError("UPSTREAM_UNAVAILABLE", "MarketBrief cache is unavailable.", 503);
        if (!data) return null;
        return {
          key: data.cache_key,
          resource: data.resource_type as ResourceName,
          value: data.payload as T,
          expiresAt: data.expires_at,
          meta: {
            provider: data.provider as DataProviderName,
            source: data.source,
            fetchedAt: data.fetched_at,
            asOf: data.as_of,
            isStale: Date.parse(data.expires_at) <= Date.now(),
            ...(data.error_code ? { errorCode: data.error_code as DataErrorCode } : {}),
          },
        } as CacheRecord<T>;
      },
      async put<T>(record: CacheRecord<T>) {
        const { error } = await cacheTable().upsert({
          cache_key: record.key,
          resource_type: record.resource,
          provider: record.meta.provider,
          source: record.meta.source,
          payload: record.value as Json,
          fetched_at: record.meta.fetchedAt,
          as_of: record.meta.asOf,
          expires_at: record.expiresAt,
          error_code: record.meta.errorCode ?? null,
          updated_at: new Date().toISOString(),
        });
        if (error) throw new ProviderError("UPSTREAM_UNAVAILABLE", "MarketBrief cache could not be updated.", 503);
      },
    };

    const service = createMarketDataService({
      cache,
      market: new TwelveDataProvider(Deno.env.get("TWELVE_DATA_API_KEY")),
      news: new FinnhubProvider(Deno.env.get("FINNHUB_API_KEY")),
      events: new FinnhubProvider(Deno.env.get("FINNHUB_API_KEY")),
      filings: new SecEdgarProvider(Deno.env.get("SEC_USER_AGENT")),
      company: new RegistryCompanyProvider(),
    });

    try {
      const request = parseMarketDataRequest(await req.json());
      return response(await service(request));
    } catch (error) {
      const providerError = error instanceof ProviderError
        ? error
        : new ProviderError("UPSTREAM_UNAVAILABLE", "MarketBrief could not complete the request.", 503);
      return response({ error: { code: providerError.code, message: providerError.message } }, providerError.status);
    }
  }),
};
