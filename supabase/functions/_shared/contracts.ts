export type DataProviderName = "twelve-data" | "finnhub" | "sec-edgar" | "marketbrief-registry";
export type DataErrorCode =
  | "MISSING_SECRET"
  | "RATE_LIMITED"
  | "NETWORK_FAILURE"
  | "MALFORMED_RESPONSE"
  | "UNSUPPORTED_SYMBOL"
  | "UPSTREAM_UNAVAILABLE"
  | "NOT_FOUND"
  | "INVALID_REQUEST";

export type FreshnessMetadata = {
  source: string;
  provider: DataProviderName;
  fetchedAt: string;
  asOf: string | null;
  isStale: boolean;
  errorCode?: DataErrorCode;
};

export type NormalizedResponse<T> = { data: T; meta: FreshnessMetadata };

export type CompanyIdentity = {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  cik: string | null;
  sector: string | null;
  industry: string | null;
  logoUrl: string | null;
  logoSource: string | null;
};

export type StockSearchResult = {
  symbol: string;
  name: string;
  exchange: string | null;
  assetType: string;
};

export type MarketQuote = {
  companyId: string;
  symbol: string;
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

export type ChartRange = "1D" | "1W" | "1M" | "3M" | "1Y";
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
  provider: "finnhub";
};

export type SecFiling = {
  accessionNumber: string;
  formType: "10-K" | "10-Q" | "8-K";
  filingDate: string;
  reportDate: string | null;
  companyId: string;
  company: string;
  cik: string;
  primaryDocument: string;
  canonicalUrl: string;
  source: "SEC";
};

export type MarketEvent = {
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

export type ResourceName = "quote" | "bars" | "company" | "news" | "filings" | "events" | "search";
