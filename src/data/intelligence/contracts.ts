import type { StockSymbol } from "@/data/stocks";

export type IntelligenceTask = "why_moved" | "brief" | "ask" | "news_summary" | "filing_summary";
export type ClaimKind = "confirmed" | "interpretation" | "uncertainty" | "catalyst";
export type IntelligenceRequest = {
  task: IntelligenceTask;
  symbols: StockSymbol[];
  edition?: "morning" | "evening";
  question?: string;
  focusId?: string;
  timeWindow?: "1D" | "1W" | "1M";
};
export type BulletClaim = { id: string; text: string; kind: ClaimKind; sourceIds: string[] };
export type IntelligenceSection = { id: string; title: string; bullets: BulletClaim[] };
export type IntelligenceSource = {
  id: string;
  type: "quote" | "price_move" | "news" | "filing" | "event" | "company";
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
export type IntelligenceResource =
  | { status: "idle" | "loading" }
  | { status: "ready"; data: MarketBriefIntelligenceResponse }
  | { status: "error" | "rate-limited"; code: string; message: string };
