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
  loadStock(symbol: StockSymbol, range: ChartRange): Promise<void>;
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
  const loadStock = useCallback(async (symbol: StockSymbol, range: ChartRange) => {
    await Promise.all([
      loadQuote(symbol),
      loadBars(symbol, range),
      run("company", symbol, setCompanies as React.Dispatch<React.SetStateAction<Record<string, DataResource<CompanyIdentity> | undefined>>>, () => mode === "DEMO" ? demoCompany(symbol) : requestMarketData<CompanyIdentity>({ resource: "company", symbol })),
      run("news", symbol, setNews as React.Dispatch<React.SetStateAction<Record<string, DataResource<CompanyNewsArticle[]> | undefined>>>, () => mode === "DEMO" ? demoNews(symbol) : requestMarketData<CompanyNewsArticle[]>({ resource: "news", symbol })),
      run("filings", symbol, setFilings as React.Dispatch<React.SetStateAction<Record<string, DataResource<FilingData[]> | undefined>>>, () => mode === "DEMO" ? demoFilings(symbol) : requestMarketData<FilingData[]>({ resource: "filings", symbol })),
      run("events", symbol, setEvents as React.Dispatch<React.SetStateAction<Record<string, DataResource<MarketEventData[]> | undefined>>>, () => mode === "DEMO" ? demoEvents(symbol) : requestMarketData<MarketEventData[]>({ resource: "events", symbol })),
    ]);
  }, [loadBars, loadQuote, mode, run]);

  const value = useMemo(() => ({ mode, quotes, companies, news, filings, events, bars, loadQuote, loadQuotes, loadBars, loadStock }), [mode, quotes, companies, news, filings, events, bars, loadQuote, loadQuotes, loadBars, loadStock]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useMarketData() {
  const value = useContext(Context);
  if (!value) throw new Error("useMarketData must be used within MarketDataProvider");
  return value;
}
