import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import type { Json } from "../_shared/database.types.ts";
import type {
  IntelligenceCacheRecord,
  IntelligenceCacheStore,
} from "../_shared/intelligence/cache.ts";
import type { MarketBriefIntelligenceResponse } from "../_shared/intelligence/contracts.ts";
import { stableHash } from "../_shared/intelligence/evidence.ts";
import { IntelligenceError } from "../_shared/intelligence/errors.ts";
import { GeminiStructuredAIProvider } from "../_shared/intelligence/gemini.ts";
import { MockStructuredAIProvider } from "../_shared/intelligence/provider.ts";
import { readIntelligenceRequest } from "../_shared/intelligence/request.ts";
import { retrieveEvidence } from "../_shared/intelligence/retrieval.ts";
import { createIntelligenceService } from "../_shared/intelligence/service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "apikey, authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200, extraHeaders: Record<string, string> = {}) => Response.json(body, {
  status,
  headers: { ...corsHeaders, "Cache-Control": "no-store", ...extraHeaders },
});

type CacheRow = {
  cache_key: string;
  evidence_hash: string;
  payload: Json;
  expires_at: string;
};
type QueryError = { message: string } | null;
type IntelligenceCacheTable = {
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<{ data: CacheRow | null; error: QueryError }>;
    };
  };
  upsert(value: Record<string, unknown>): PromiseLike<{ error: QueryError }>;
};

function isCachedResponse(value: unknown): value is MarketBriefIntelligenceResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.sections) && Array.isArray(candidate.sources) &&
    typeof candidate.generatedAt === "string" && !!candidate.meta && typeof candidate.meta === "object";
}

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
    try {
      const publishableKey = req.headers.get("apikey")?.trim();
      const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
      if (!publishableKey || !supabaseUrl)
        throw new IntelligenceError("UPSTREAM_UNAVAILABLE", "MarketBrief intelligence is not configured.", 503);

      const identity = stableHash(`${req.headers.get("x-forwarded-for") ?? "unknown"}:${publishableKey.slice(0, 12)}`);
      const cacheTable = () => (ctx.supabaseAdmin as unknown as {
        from(table: "intelligence_cache"): IntelligenceCacheTable;
      }).from("intelligence_cache");
      const cache: IntelligenceCacheStore = {
        async get(key) {
          const { data, error } = await cacheTable()
            .select("cache_key,evidence_hash,payload,expires_at")
            .eq("cache_key", key)
            .maybeSingle();
          if (error) throw new IntelligenceError("UPSTREAM_UNAVAILABLE", "The intelligence cache is unavailable.", 503);
          if (!data || !isCachedResponse(data.payload)) return null;
          return { key: data.cache_key, evidenceHash: data.evidence_hash, value: data.payload, expiresAt: data.expires_at };
        },
        async put(record: IntelligenceCacheRecord) {
          const { error } = await cacheTable().upsert({
            cache_key: record.key,
            task: record.value.meta.task,
            evidence_hash: record.evidenceHash,
            payload: record.value as unknown as Json,
            generated_at: record.value.generatedAt,
            expires_at: record.expiresAt,
            updated_at: new Date().toISOString(),
          });
          if (error) throw new IntelligenceError("UPSTREAM_UNAVAILABLE", "The intelligence cache could not be updated.", 503);
        },
      };

      const request = await readIntelligenceRequest(req);
      const aiApiKey = Deno.env.get("MARKETBRIEF_AI_API_KEY")?.trim();
      const mockProvider = new MockStructuredAIProvider();
      const service = createIntelligenceService({
        provider: aiApiKey
          ? new GeminiStructuredAIProvider(aiApiKey)
          : mockProvider,
        ...(aiApiKey ? { fallbackProvider: mockProvider } : {}),
        cache,
        async beforeGenerate(provider) {
          if (provider.mode !== "live") return;
          const { data, error } = await (ctx.supabaseAdmin as unknown as {
            rpc(name: "consume_intelligence_request_budget", args: { p_identity_hash: string; p_window_seconds: number; p_identity_max: number; p_global_max: number }): PromiseLike<{ data: unknown; error: QueryError }>;
          }).rpc("consume_intelligence_request_budget", {
            p_identity_hash: identity,
            p_window_seconds: 3600,
            p_identity_max: 12,
            p_global_max: 120,
          });
          const decision = data as { allowed?: unknown } | null;
          if (error || typeof decision?.allowed !== "boolean")
            throw new IntelligenceError("UPSTREAM_UNAVAILABLE", "The intelligence request budget is unavailable.", 503);
          if (!decision.allowed)
            throw new IntelligenceError("RATE_LIMITED", "AI analysis is temporarily unavailable. Real evidence is shown instead.", 429);
        },
        retrieve: (input) => retrieveEvidence({
          request: input,
          marketDataUrl: `${supabaseUrl}/functions/v1/market-data`,
          publishableKey,
        }),
      });
      return json(await service(request));
    } catch (error) {
      const safe = error instanceof IntelligenceError
        ? error
        : new IntelligenceError("UPSTREAM_UNAVAILABLE", "MarketBrief intelligence could not complete the request.", 503);
      return json({ error: { code: safe.code, message: safe.message } }, safe.status);
    }
  }),
};
