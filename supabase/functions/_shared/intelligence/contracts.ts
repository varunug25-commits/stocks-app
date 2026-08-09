export const INTELLIGENCE_SCHEMA_VERSION = "m7-v2";

export type IntelligenceTask =
  | "why_moved"
  | "brief"
  | "ask"
  | "news_summary"
  | "filing_summary";

export type EvidenceType =
  | "quote"
  | "price_move"
  | "news"
  | "filing"
  | "event"
  | "company";

export type EvidenceItem = {
  id: string;
  type: EvidenceType;
  symbol?: string;
  title?: string;
  text?: string;
  publisher?: string;
  publishedAt?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  relevanceScore: number;
  contentHash: string;
};

export type ClaimKind = "confirmed" | "interpretation" | "uncertainty" | "catalyst";

export type BulletClaim = {
  id: string;
  text: string;
  kind: ClaimKind;
  sourceIds: string[];
};

export type IntelligenceSection = {
  id: string;
  title: string;
  bullets: BulletClaim[];
};

export type IntelligenceSource = {
  id: string;
  type: EvidenceType;
  symbol?: string;
  title?: string;
  publisher?: string;
  publishedAt?: string;
  sourceUrl?: string;
};

export type MarketBriefIntelligenceResponse = {
  headline?: string;
  oneLineSummary?: string;
  sections: IntelligenceSection[];
  sources: IntelligenceSource[];
  sourceIds: string[];
  symbols: string[];
  generatedAt: string;
  meta: {
    task: IntelligenceTask;
    provider: string;
    providerMode: "mock" | "live";
    cached: boolean;
    evidenceCount: number;
    schemaVersion: string;
  };
};

export type IntelligenceRequest = {
  task: IntelligenceTask;
  symbols: string[];
  edition?: "morning" | "evening";
  question?: string;
  focusId?: string;
  timeWindow?: "1D" | "1W" | "1M";
};

export type ModelCandidate = {
  headline?: unknown;
  oneLineSummary?: unknown;
  sections?: unknown;
  symbols?: unknown;
  generatedAt?: unknown;
  sourceIds?: unknown;
  [key: string]: unknown;
};

export type IntelligenceErrorCode =
  | "INVALID_REQUEST"
  | "UNSUPPORTED_SYMBOL"
  | "RATE_LIMITED"
  | "EVIDENCE_UNAVAILABLE"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_PROVIDER_OUTPUT"
  | "UPSTREAM_UNAVAILABLE";

export type MarketDataEnvelope<T = unknown> = {
  data: T;
  meta: {
    source: string;
    provider: string;
    fetchedAt: string;
    asOf: string | null;
    isStale: boolean;
    errorCode?: string;
  };
};

export type EvidenceBundle = {
  evidence: EvidenceItem[];
  symbols: string[];
  errors: Array<{ resource: string; symbol: string; code: string }>;
};
