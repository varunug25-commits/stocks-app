import type { StockSymbol } from "../stocks/companies.ts";

export type BriefType = "morning" | "evening";
export type BriefStatus = "New" | "Read" | "Saved";
export type EvidenceKind = "FACT" | "INTERPRETATION" | "UNCERTAINTY";

export type BriefSource = {
  id: string;
  name: string;
  type: string;
  timestamp: string;
  relevance: string;
};

export type BriefStockImpact = {
  symbol: StockSymbol;
  direction: "up" | "down";
  changePercent: number;
  reason: string;
  impact: "High" | "Medium" | "Low";
  nextCatalyst: string;
};

export type BriefEvent = {
  id: string;
  timing: string;
  title: string;
  detail: string;
  kind: "earnings" | "filing" | "economic" | "catalyst";
  symbol?: StockSymbol;
};

export type BriefEvidence = {
  kind: EvidenceKind;
  title: string;
  body: string;
};

export type GeneratedBrief = {
  id: string;
  type: BriefType;
  dateKey: string;
  dateLabel: string;
  timestamp: string;
  readingMinutes: number;
  headline: string;
  summary: string;
  developments: string[];
  marketContext: string;
  marketDirection: string;
  changeSinceMorning?: string;
  watchlistImpacts: BriefStockImpact[];
  events: BriefEvent[];
  monitor: string[];
  positiveScenario: string;
  riskScenario: string;
  evidence: BriefEvidence[];
  sources: BriefSource[];
  sufficientEvidence: boolean;
  confidence: "Medium" | "Low";
};

export type BriefHistorySeed = {
  id: string;
  type: BriefType;
  dateKey: string;
  dateLabel: string;
  timestamp: string;
};
