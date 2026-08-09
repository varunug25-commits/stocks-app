import type { IntelligenceRequest, MarketBriefIntelligenceResponse } from "./contracts.ts";
import { INTELLIGENCE_SCHEMA_VERSION } from "./contracts.ts";
import { evidenceHash, stableHash } from "./evidence.ts";
import type { EvidenceItem } from "./contracts.ts";

export type IntelligenceCacheRecord = {
  key: string;
  evidenceHash: string;
  expiresAt: string;
  value: MarketBriefIntelligenceResponse;
};

export interface IntelligenceCacheStore {
  get(key: string): Promise<IntelligenceCacheRecord | null>;
  put(record: IntelligenceCacheRecord): Promise<void>;
}

const TTL_SECONDS: Record<IntelligenceRequest["task"], number> = {
  why_moved: 15 * 60,
  brief: 30 * 60,
  ask: 15 * 60,
  news_summary: 15 * 60,
  filing_summary: 60 * 60,
};

export function intelligenceCacheKey(request: IntelligenceRequest, evidence: EvidenceItem[], provider = "unspecified") {
  const currentEvidenceHash = evidenceHash(evidence);
  const requestFingerprint = stableHash(JSON.stringify({
    task: request.task,
    symbols: request.symbols,
    edition: request.edition,
    question: request.question?.toLowerCase().replace(/\s+/g, " ").trim(),
    focusId: request.focusId,
    timeWindow: request.timeWindow,
    provider,
    schema: INTELLIGENCE_SCHEMA_VERSION,
  }));
  return { key: `intelligence:${requestFingerprint}:${currentEvidenceHash}`, evidenceHash: currentEvidenceHash };
}

export function intelligenceExpiry(task: IntelligenceRequest["task"], now = Date.now()) {
  return new Date(now + TTL_SECONDS[task] * 1000).toISOString();
}

export function isFreshIntelligence(record: IntelligenceCacheRecord, now = Date.now()) {
  return Date.parse(record.expiresAt) > now;
}

export class MemoryIntelligenceCache implements IntelligenceCacheStore {
  private readonly records = new Map<string, IntelligenceCacheRecord>();
  async get(key: string) { return this.records.get(key) ?? null; }
  async put(record: IntelligenceCacheRecord) { this.records.set(record.key, record); }
}

const inFlight = new Map<string, Promise<MarketBriefIntelligenceResponse>>();

export function dedupeIntelligenceRequest(key: string, load: () => Promise<MarketBriefIntelligenceResponse>) {
  const existing = inFlight.get(key);
  if (existing) return existing;
  const current = load().finally(() => inFlight.delete(key));
  inFlight.set(key, current);
  return current;
}
