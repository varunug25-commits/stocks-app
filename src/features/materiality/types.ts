import type { PriceContext } from "./unusualMove";

export type ChangeKind = "price_move" | "news" | "filing" | "event" | "combined";
export type SnapshotEvidenceRef = {
  id: string;
  occurredAt: string;
  title?: string;
  sourceUrl?: string | null;
  relatedSymbols?: string[];
};
export type SymbolSnapshot = {
  price?: number;
  changePercent?: number | null;
  priceContext?: PriceContext;
  news: SnapshotEvidenceRef[];
  filings: SnapshotEvidenceRef[];
  events: SnapshotEvidenceRef[];
};
export type WatchlistSnapshot = {
  version: 1;
  capturedAt: string;
  symbols: Record<string, SymbolSnapshot>;
};
export type MaterialChange = {
  id: string;
  symbol: string;
  affectedSymbols: string[];
  kind: ChangeKind;
  occurredAt: string;
  firstSeenAt: string;
  materialityScore: number;
  reasons: string[];
  evidenceIds: string[];
  seen: boolean;
  title: string;
  movePercent: number | null;
  moveLabel: PriceContext["label"];
};
export type ChangeDetectionResult = {
  baselineReady: boolean;
  comparedAt: string;
  previousCapturedAt: string | null;
  materialChanges: MaterialChange[];
  quietSymbols: string[];
};
