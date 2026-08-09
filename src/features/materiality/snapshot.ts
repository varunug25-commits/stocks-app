import type { CompanyNewsArticle, DataResource, FilingData, MarketEventData, MarketQuote } from "@/data/real";
import type { PriceContext } from "./unusualMove";
import type { SymbolSnapshot, WatchlistSnapshot } from "./types";

const data = <T,>(resource: DataResource<T> | undefined): T | null => resource?.status === "ready" || resource?.status === "stale" ? resource.data : null;

export function buildWatchlistSnapshot(input: {
  symbols: string[];
  capturedAt: string;
  quotes: Record<string, DataResource<MarketQuote> | undefined>;
  news: Record<string, DataResource<CompanyNewsArticle[]> | undefined>;
  filings: Record<string, DataResource<FilingData[]> | undefined>;
  events: Record<string, DataResource<MarketEventData[]> | undefined>;
  priceContexts?: Record<string, PriceContext | undefined>;
  previous?: WatchlistSnapshot | null;
}): WatchlistSnapshot {
  const symbols: Record<string, SymbolSnapshot> = {};
  for (const symbol of input.symbols) {
    const previous = input.previous?.symbols[symbol];
    const quote = data(input.quotes[symbol]);
    const news = data(input.news[symbol]);
    const filings = data(input.filings[symbol]);
    const events = data(input.events[symbol]);
    symbols[symbol] = {
      price: quote?.price ?? previous?.price,
      changePercent: quote?.changePercent ?? previous?.changePercent ?? null,
      priceContext: input.priceContexts?.[symbol] ?? previous?.priceContext,
      news: news ? news.map((item) => ({ id: item.id, occurredAt: item.publishedAt, title: item.headline, sourceUrl: item.sourceUrl, relatedSymbols: item.relatedSymbols })) : previous?.news ?? [],
      filings: filings ? filings.map((item) => ({ id: item.accessionNumber, occurredAt: item.filingDate, title: `${item.formType} filing`, sourceUrl: item.canonicalUrl })) : previous?.filings ?? [],
      events: events ? events.filter((item) => item.scheduledAt).map((item) => ({ id: item.id, occurredAt: item.scheduledAt!, title: item.title, sourceUrl: item.sourceUrl })) : previous?.events ?? [],
    };
  }
  return { version: 1, capturedAt: input.capturedAt, symbols };
}
