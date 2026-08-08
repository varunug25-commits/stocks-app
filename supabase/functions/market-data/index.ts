import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import type { Database, Json } from "../_shared/database.types.ts";
import type { CacheRecord, CacheStore } from "../_shared/cache.ts";
import type { DataErrorCode, DataProviderName, ResourceName } from "../_shared/contracts.ts";
import { ProviderError } from "../_shared/errors.ts";
import { FinnhubProvider } from "../_shared/providers/finnhub.ts";
import { RegistryCompanyProvider } from "../_shared/providers/company.ts";
import { SecEdgarProvider } from "../_shared/providers/sec.ts";
import { TwelveDataProvider } from "../_shared/providers/twelveData.ts";
import { ProviderRequestLimiter } from "../_shared/rateLimit.ts";
import type { ProviderBudgetDecision, ProviderBudgetStore, QuotaProvider } from "../_shared/rateLimit.ts";
import { createMarketDataService, parseMarketDataRequest, readPublicRequestJson } from "../_shared/service.ts";

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
type AdminRpc = {
  rpc(
    name: "consume_provider_request_budget",
    args: { p_provider: QuotaProvider; p_window_seconds: number; p_max_requests: number; p_cooldown_seconds: number },
  ): PromiseLike<{ data: unknown; error: CacheQueryError }>;
};

function isBudgetDecision(value: unknown): value is ProviderBudgetDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const decision = value as Record<string, unknown>;
  return typeof decision.allowed === "boolean" && typeof decision.remaining === "number" &&
    (decision.retryAt === null || typeof decision.retryAt === "string");
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

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

    const budget: ProviderBudgetStore = {
      async consume(provider, limit) {
        const { data, error } = await (ctx.supabaseAdmin as unknown as AdminRpc).rpc(
          "consume_provider_request_budget",
          {
            p_provider: provider,
            p_window_seconds: limit.windowSeconds,
            p_max_requests: limit.maxRequests,
            p_cooldown_seconds: limit.cooldownSeconds,
          },
        );
        if (error || !isBudgetDecision(data))
          throw new ProviderError("UPSTREAM_UNAVAILABLE", "Provider request budget is unavailable.", 503);
        return data;
      },
    };

    const twelveDataKey = Deno.env.get("TWELVE_DATA_API_KEY");
    const finnhubKey = Deno.env.get("FINNHUB_API_KEY");
    const secUserAgent = Deno.env.get("SEC_USER_AGENT");
    const service = createMarketDataService({
      cache,
      market: new TwelveDataProvider(twelveDataKey),
      news: new FinnhubProvider(finnhubKey),
      events: new FinnhubProvider(finnhubKey),
      filings: new SecEdgarProvider(secUserAgent),
      company: new RegistryCompanyProvider(),
      limiter: new ProviderRequestLimiter(budget),
      assertProviderConfigured(provider) {
        if (provider === "twelve-data" && !twelveDataKey)
          throw new ProviderError("MISSING_SECRET", "Twelve Data is not configured.", 503);
        if (provider === "finnhub" && !finnhubKey)
          throw new ProviderError("MISSING_SECRET", "Finnhub is not configured.", 503);
        if (provider === "sec-edgar" && !secUserAgent)
          throw new ProviderError("MISSING_SECRET", "SEC_USER_AGENT is not configured.", 503);
      },
    });

    try {
      const request = parseMarketDataRequest(await readPublicRequestJson(req));
      return response(await service(request));
    } catch (error) {
      const providerError = error instanceof ProviderError
        ? error
        : new ProviderError("UPSTREAM_UNAVAILABLE", "MarketBrief could not complete the request.", 503);
      return response({ error: { code: providerError.code, message: providerError.message } }, providerError.status);
    }
  }),
};
