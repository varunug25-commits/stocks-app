import type {
  EvidenceBundle,
  IntelligenceRequest,
  MarketBriefIntelligenceResponse,
} from "./contracts.ts";
import { buildUntrustedEvidenceContext } from "./evidence.ts";
import type { StructuredAIProvider } from "./provider.ts";
import type { IntelligenceCacheStore } from "./cache.ts";
import {
  dedupeIntelligenceRequest,
  intelligenceCacheKey,
  intelligenceExpiry,
  isFreshIntelligence,
} from "./cache.ts";
import { validateProviderOutput } from "./validation.ts";
import { IntelligenceError } from "./errors.ts";

const fallbackCodes = new Set(["PROVIDER_UNAVAILABLE", "RATE_LIMITED", "INVALID_PROVIDER_OUTPUT"]);

export function createIntelligenceService(dependencies: {
  provider: StructuredAIProvider;
  fallbackProvider?: StructuredAIProvider;
  cache: IntelligenceCacheStore;
  retrieve(request: IntelligenceRequest): Promise<EvidenceBundle>;
  now?: () => number;
}) {
  return async function generate(request: IntelligenceRequest): Promise<MarketBriefIntelligenceResponse> {
    const bundle = await dependencies.retrieve(request);
    const now = dependencies.now?.() ?? Date.now();
    const runProvider = async (provider: StructuredAIProvider) => {
      const { key, evidenceHash } = intelligenceCacheKey(request, bundle.evidence, provider.name);
      const cached = await dependencies.cache.get(key);
      if (cached && cached.evidenceHash === evidenceHash && isFreshIntelligence(cached, now)) {
        return { ...cached.value, meta: { ...cached.value.meta, cached: true } };
      }
      return dedupeIntelligenceRequest(key, async () => {
        const candidate = await provider.generateStructuredResponse({
          request,
          evidence: bundle.evidence,
          untrustedContext: buildUntrustedEvidenceContext(bundle.evidence),
        });
        const value = validateProviderOutput({
          candidate,
          request,
          evidence: bundle.evidence,
          provider,
          generatedAt: new Date(now).toISOString(),
        });
        await dependencies.cache.put({
          key,
          evidenceHash,
          expiresAt: intelligenceExpiry(request.task, now),
          value,
        });
        return value;
      });
    };
    try {
      return await runProvider(dependencies.provider);
    } catch (error) {
      if (!dependencies.fallbackProvider || !(error instanceof IntelligenceError) || !fallbackCodes.has(error.code)) throw error;
      return runProvider(dependencies.fallbackProvider);
    }
  };
}

export class InMemoryRateLimiter {
  private readonly windows = new Map<string, { count: number; startsAt: number }>();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 20, windowMs = 60_000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identity: string, now = Date.now()) {
    const current = this.windows.get(identity);
    if (!current || now - current.startsAt >= this.windowMs) {
      this.windows.set(identity, { count: 1, startsAt: now });
      return { allowed: true, retryAfterSeconds: 0 };
    }
    if (current.count >= this.maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((current.startsAt + this.windowMs - now) / 1000)) };
    }
    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
