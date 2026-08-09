import type {
  ChartRange,
  CompanyIdentity,
  CompanyNewsArticle,
  MarketEvent,
  MarketQuote,
  NormalizedResponse,
  PriceBar,
  SecFiling,
  StockSearchResult,
} from "../contracts.ts";

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<NormalizedResponse<MarketQuote>>;
  getBars(symbol: string, range: ChartRange): Promise<NormalizedResponse<PriceBar[]>>;
}
export interface NewsProvider {
  getCompanyNews(symbol: string): Promise<NormalizedResponse<CompanyNewsArticle[]>>;
}
export interface FilingsProvider {
  getFilings(company: CompanyIdentity): Promise<NormalizedResponse<SecFiling[]>>;
}
export interface CompanyProvider {
  getCompany(symbol: string): Promise<NormalizedResponse<CompanyIdentity>>;
  search(query: string): Promise<NormalizedResponse<StockSearchResult[]>>;
}
export interface EventsProvider {
  getEvents(company: CompanyIdentity): Promise<NormalizedResponse<MarketEvent[]>>;
}
