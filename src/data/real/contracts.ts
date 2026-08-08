import type { ChartRange, StockSymbol } from "@/data/stocks";

export type DataMode = "REAL" | "DEMO";
export type ClientDataErrorCode =
  | "MISSING_CONFIGURATION"
  | "MISSING_SECRET"
  | "RATE_LIMITED"
  | "NETWORK_FAILURE"
  | "MALFORMED_RESPONSE"
  | "UNSUPPORTED_SYMBOL"
  | "UPSTREAM_UNAVAILABLE"
  | "NOT_FOUND"
  | "INVALID_REQUEST";

export type DataMetadata = {
  source: string;
  provider: string;
  fetchedAt: string;
  asOf: string | null;
  isStale: boolean;
  errorCode?: ClientDataErrorCode;
};
export type DataEnvelope<T> = { data: T; meta: DataMetadata };

export type CompanyIdentity = {
  id: string;
  symbol: StockSymbol;
  name: string;
  exchange: string;
  currency: string;
  cik: string | null;
  sector: string | null;
  industry: string | null;
  logoUrl: string | null;
  logoSource: string | null;
};
export type MarketQuote = {
  companyId: string;
  symbol: StockSymbol;
  price: number;
  change: number | null;
  changePercent: number | null;
  previousClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  exchange: string | null;
  currency: string | null;
  marketStatus: "open" | "closed" | "unknown";
  providerTimestamp: string | null;
};
export type PriceBar = {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};
export type CompanyNewsArticle = {
  id: string;
  headline: string;
  summary: string | null;
  publisher: string;
  publishedAt: string;
  sourceUrl: string;
  relatedSymbols: string[];
  provider: string;
};
export type FilingData = {
  accessionNumber: string;
  formType: "10-K" | "10-Q" | "8-K";
  filingDate: string;
  reportDate: string | null;
  companyId: string;
  company: string;
  cik: string;
  primaryDocument: string;
  canonicalUrl: string | null;
  source: string;
};
export type MarketEventData = {
  id: string;
  companyId: string | null;
  symbol: string | null;
  kind: "earnings" | "filing" | "company" | "macro";
  title: string;
  scheduledAt: string | null;
  timing: "before-open" | "after-close" | "during-market" | "unknown";
  source: string;
  sourceUrl: string | null;
};
export type MarketResource = "quote" | "bars" | "company" | "news" | "filings" | "events";
export type MarketDataRequest = { resource: MarketResource; symbol: StockSymbol; range?: ChartRange };

export type DataResource<T> =
  | { status: "idle" | "loading" }
  | { status: "ready"; data: T; meta: DataMetadata }
  | { status: "stale"; data: T; meta: DataMetadata }
  | { status: "rate-limited" | "unavailable" | "error"; code: ClientDataErrorCode; message: string };
