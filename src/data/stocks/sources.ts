export type SourceMetadata = {
  id: string;
  name: string;
  kind: string;
  timestamp: string;
};
export const sourceMetadata: Record<
  "sec" | "editorial" | "market",
  SourceMetadata
> = {
  sec: {
    id: "sec",
    name: "SEC filings",
    kind: "Primary source",
    timestamp: "Retrieved for local demo",
  },
  editorial: {
    id: "editorial",
    name: "MarketBrief Editorial",
    kind: "Local mock analysis",
    timestamp: "Updated 38 min ago",
  },
  market: {
    id: "market",
    name: "MarketBrief Market Desk",
    kind: "Local mock context",
    timestamp: "Updated 1 hr ago",
  },
};
