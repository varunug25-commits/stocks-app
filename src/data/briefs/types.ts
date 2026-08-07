import type { StockSymbol } from "../stocks/companies.ts";

export type BriefType = "morning" | "evening";
export type BriefStatus = "New" | "Read" | "Saved";
export type EvidenceKind = "FACT" | "INTERPRETATION" | "UNCERTAINTY";
export type BriefSourceId = "sec" | "editorial" | "market";

export type BriefSource = {
  id: BriefSourceId;
  name: string;
  type: string;
  timestamp: string;
  relevance: string;
  supports: string[];
};

export type BriefStockImpact = {
  symbol: StockSymbol;
  direction: "up" | "down";
  changePercent: number;
  reason: string;
  impact: "High" | "Medium" | "Low";
  nextCatalyst: string;
  sourceIds: BriefSourceId[];
};

export type BriefEvent = {
  id: string;
  timing: string;
  title: string;
  detail: string;
  kind: "earnings" | "filing" | "economic" | "catalyst";
  symbol?: StockSymbol;
  sourceIds: BriefSourceId[];
};

export type BriefEvidence = {
  kind: EvidenceKind;
  title: string;
  body: string;
  sourceIds: BriefSourceId[];
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
  marketSourceIds: BriefSourceId[];
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
  headline: string;
};
