import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ChartRange, StockSymbol } from "@/data/stocks";
import { envelopeToResource, errorToResource, publicDataConfig, requestMarketData } from "@/data/real";
import type {
  CompanyIdentity,
  CompanyNewsArticle,
  DataEnvelope,
  DataMode,
  DataResource,
  FilingData,
  MarketEventData,
  MarketQuote,
  PriceBar,
} from "@/data/real";
import { demoBars, demoCompany, demoEvents, demoFilings, demoNews, demoQuote } from "@/data/real/demo";

type SymbolResources<T> = Partial<Record<StockSymbol, DataResource<T>>>;
type MarketDataContextValue = {
  mode: DataMode;
  quotes: SymbolResources<MarketQuote>;
  companies: SymbolResources<CompanyIdentity>;
  news: SymbolResources<CompanyNewsArticle[]>;
  filings: SymbolResources<FilingData[]>;
  events: SymbolResources<MarketEventData[]>;
  bars: Record<string, DataResource<PriceBar[]> | undefined>;
  loadQuote(symbol: StockSymbol): Promise<void>;
  loadQuotes(symbols: StockSymbol[]): Promise<void>;
  loadBars(symbol: StockSymbol, range: ChartRange): Promise<void>;
  loadCompany(symbol: StockSymbol): Promise<void>;
  loadNews(symbol: StockSymbol): Promise<void>;
  loadFilings(symbol: StockSymbol): Promise<void>;
  loadEvents(symbol: StockSymbol): Promise<void>;
  loadStock(symbol: StockSymbol): Promise<void>;
};

const Context = createContext<MarketDataContextValue | null>(null);
export const barKey = (symbol: StockSymbol, range: ChartRange) => `${symbol}:${range}`;

export function MarketDataProvider({ children }: PropsWithChildren) {
  const mode = publicDataConfig.mode;
  const [quotes, setQuotes] = useState<SymbolResources<MarketQuote>>({});
  const [companies, setCompanies] = useState<SymbolResources<CompanyIdentity>>({});
  const [news, setNews] = useState<SymbolResources<CompanyNewsArticle[]>>({});
  const [filings, setFilings] = useState<SymbolResources<FilingData[]>>({});
  const [events, setEvents] = useState<SymbolResources<MarketEventData[]>>({});
  const [bars, setBars] = useState<Record<string, DataResource<PriceBar[]> | undefined>>({});
  const inFlight = useRef(new Set<string>());

  const run = useCallback(async <T,>(
    resource: string,
    stateKey: string,
    set: React.Dispatch<React.SetStateAction<Record<string, DataResource<T> | undefined>>>,
    loader: () => Promise<DataEnvelope<T>> | DataEnvelope<T>,
  ) => {
    const requestKey = `${resource}:${stateKey}`;
    if (inFlight.current.has(requestKey)) return;
    inFlight.current.add(requestKey);
    set((current) => ({ ...current, [stateKey]: { status: "loading" } }));
    try {
      const loaded = await loader();
      set((current) => ({ ...current, [stateKey]: envelopeToResource(loaded) }));
    } catch (error) {
      set((current) => ({ ...current, [stateKey]: errorToResource(error) }));
    } finally {
      inFlight.current.delete(requestKey);
    }
  }, []);

  const loadQuote = useCallback(async (symbol: StockSymbol) => run(
    "quote",
    symbol,
    setQuotes as React.Dispatch<React.SetStateAction<Record<string, DataResource<MarketQuote> | undefined>>>,
    () => mode === "DEMO" ? demoQuote(symbol) : requestMarketData<MarketQuote>({ resource: "quote", symbol }),
  ), [mode, run]);
  const loadQuotes = useCallback(async (symbols: StockSymbol[]) => {
    await Promise.all(symbols.map(loadQuote));
  }, [loadQuote]);
  const loadBars = useCallback(async (symbol: StockSymbol, range: ChartRange) => run(
    "bars",
    barKey(symbol, range),
    setBars,
    () => mode === "DEMO" ? demoBars(symbol, range) : requestMarketData<PriceBar[]>({ resource: "bars", symbol, range }),
  ), [mode, run]);
  const loadCompany = useCallback(async (symbol: StockSymbol) => run(
    "company",
    symbol,
    setCompanies as React.Dispatch<React.SetStateAction<Record<string, DataResource<CompanyIdentity> | undefined>>>,
    () => mode === "DEMO" ? demoCompany(symbol) : requestMarketData<CompanyIdentity>({ resource: "company", symbol }),
  ), [mode, run]);
  const loadNews = useCallback(async (symbol: StockSymbol) => run(
    "news",
    symbol,
    setNews as React.Dispatch<React.SetStateAction<Record<string, DataResource<CompanyNewsArticle[]> | undefined>>>,
    () => mode === "DEMO" ? demoNews(symbol) : requestMarketData<CompanyNewsArticle[]>({ resource: "news", symbol }),
  ), [mode, run]);
  const loadFilings = useCallback(async (symbol: StockSymbol) => run(
    "filings",
    symbol,
    setFilings as React.Dispatch<React.SetStateAction<Record<string, DataResource<FilingData[]> | undefined>>>,
    () => mode === "DEMO" ? demoFilings(symbol) : requestMarketData<FilingData[]>({ resource: "filings", symbol }),
  ), [mode, run]);
  const loadEvents = useCallback(async (symbol: StockSymbol) => run(
    "events",
    symbol,
    setEvents as React.Dispatch<React.SetStateAction<Record<string, DataResource<MarketEventData[]> | undefined>>>,
    () => mode === "DEMO" ? demoEvents(symbol) : requestMarketData<MarketEventData[]>({ resource: "events", symbol }),
  ), [mode, run]);
  const loadStock = useCallback(async (symbol: StockSymbol) => {
    await Promise.all([
      loadQuote(symbol),
      loadCompany(symbol),
      loadNews(symbol),
      loadFilings(symbol),
      loadEvents(symbol),
    ]);
  }, [loadCompany, loadEvents, loadFilings, loadNews, loadQuote]);

  const value = useMemo(() => ({ mode, quotes, companies, news, filings, events, bars, loadQuote, loadQuotes, loadBars, loadCompany, loadNews, loadFilings, loadEvents, loadStock }), [mode, quotes, companies, news, filings, events, bars, loadQuote, loadQuotes, loadBars, loadCompany, loadNews, loadFilings, loadEvents, loadStock]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useMarketData() {
  const value = useContext(Context);
  if (!value) throw new Error("useMarketData must be used within MarketDataProvider");
  return value;
}
