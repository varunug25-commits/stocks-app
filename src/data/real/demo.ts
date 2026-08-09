import { catalysts, demoCompanyForSymbol, filings, getChartSeries, prices, stockStories } from "@/data/stocks";
import type { ChartRange, StockSymbol } from "@/data/stocks";
import type {
  CompanyIdentity,
  CompanyNewsArticle,
  DataEnvelope,
  FilingData,
  MarketEventData,
  MarketQuote,
  PriceBar,
} from "./contracts";

const ids: Record<StockSymbol, string> = {
  AAPL: "10000000-0000-4000-8000-000000000001", MSFT: "10000000-0000-4000-8000-000000000002",
  NVDA: "10000000-0000-4000-8000-000000000003", TSLA: "10000000-0000-4000-8000-000000000004",
  AMZN: "10000000-0000-4000-8000-000000000005", GOOGL: "10000000-0000-4000-8000-000000000006",
  META: "10000000-0000-4000-8000-000000000007", AMD: "10000000-0000-4000-8000-000000000008",
  PLTR: "10000000-0000-4000-8000-000000000009", NFLX: "10000000-0000-4000-8000-000000000010",
};
const ciks: Record<StockSymbol, string> = {
  AAPL: "0000320193", MSFT: "0000789019", NVDA: "0001045810", TSLA: "0001318605", AMZN: "0001018724",
  GOOGL: "0001652044", META: "0001326801", AMD: "0000002488", PLTR: "0001321655", NFLX: "0001065280",
};
const demoMeta = () => ({ source: "Demo data", provider: "demo", fetchedAt: new Date().toISOString(), asOf: null, isStale: false });
const envelope = <T,>(data: T): DataEnvelope<T> => ({ data, meta: demoMeta() });
const required = <T,>(value: T | undefined, label: string): T => {
  if (value === undefined) throw new Error(`No demo ${label} is available.`);
  return value;
};

export const demoCompany = (symbol: StockSymbol): DataEnvelope<CompanyIdentity> => {
  const company = demoCompanyForSymbol(symbol);
  return envelope({ id: required(ids[symbol], `${symbol} id`), symbol, name: company.name, exchange: company.exchange, currency: "USD", cik: required(ciks[symbol], `${symbol} CIK`), sector: company.sector, industry: null, logoUrl: null, logoSource: null });
};
export const demoQuote = (symbol: StockSymbol): DataEnvelope<MarketQuote> => {
  const price = required(prices[symbol], `${symbol} quote`);
  return envelope({ companyId: required(ids[symbol], `${symbol} id`), symbol, price: price.price, change: price.change, changePercent: price.changePercent, previousClose: price.previousClose, open: null, high: null, low: null, volume: null, exchange: demoCompanyForSymbol(symbol).exchange, currency: "USD", marketStatus: price.status === "Market open" ? "open" : "closed", providerTimestamp: null });
};
export const demoBars = (symbol: StockSymbol, range: ChartRange): DataEnvelope<PriceBar[]> => envelope(
  getChartSeries(symbol, range, required(prices[symbol], `${symbol} quote`).price).map((point, index) => ({
    timestamp: new Date(Date.UTC(2026, 7, 7, index)).toISOString(),
    open: point.value, high: point.value, low: point.value, close: point.value, volume: null,
  })),
);
export const demoFilings = (symbol: StockSymbol): DataEnvelope<FilingData[]> => envelope(required(filings[symbol], `${symbol} filings`).map((filing) => ({
  accessionNumber: filing.id, formType: filing.form as FilingData["formType"], filingDate: filing.filed,
  reportDate: null, companyId: required(ids[symbol], `${symbol} id`), company: demoCompanyForSymbol(symbol).name, cik: required(ciks[symbol], `${symbol} CIK`), primaryDocument: "Illustrative", canonicalUrl: null, source: "Demo data",
})));
export const demoNews = (symbol: StockSymbol): DataEnvelope<CompanyNewsArticle[]> => envelope(required(stockStories[symbol], `${symbol} news`).map((story) => ({
  id: story.id, headline: story.title, summary: null, publisher: "Demo data", publishedAt: story.published,
  sourceUrl: "", relatedSymbols: [symbol], provider: "demo",
})));
export const demoEvents = (symbol: StockSymbol): DataEnvelope<MarketEventData[]> => envelope(required(catalysts[symbol], `${symbol} events`).slice(0, 1).map((event) => ({
  id: `${symbol}-${event.id}`, companyId: required(ids[symbol], `${symbol} id`), symbol, kind: "earnings", title: event.title, scheduledAt: null,
  timing: "unknown", source: "Demo data", sourceUrl: null,
})));
