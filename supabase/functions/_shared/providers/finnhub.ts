import type { CompanyNewsArticle, MarketEvent, NormalizedResponse, StockSearchResult } from "../contracts.ts";
import { ProviderError, errorFromStatus, toProviderError } from "../errors.ts";
import type { CompanyIdentity } from "../contracts.ts";
import { isoTimestamp, nullableString, recordValue, requiredString } from "./normalization.ts";
import type { CompanyProvider, EventsProvider, NewsProvider } from "./types.ts";
import { isSupportedUsEquity, normalizeSymbol } from "../symbols.ts";

type Fetcher = typeof fetch;

export function normalizeFinnhubNews(payload: unknown, symbol: string): CompanyNewsArticle[] {
  if (!Array.isArray(payload))
    throw new ProviderError("MALFORMED_RESPONSE", "Finnhub news returned malformed data.");
  return payload.map((item) => {
    const article = recordValue(item, "Finnhub article");
    const publishedAt = isoTimestamp(article.datetime);
    if (!publishedAt)
      throw new ProviderError("MALFORMED_RESPONSE", "Finnhub article omitted its timestamp.");
    return {
      id: String(article.id ?? requiredString(article.url, "article ID")),
      headline: requiredString(article.headline, "headline"),
      summary: nullableString(article.summary),
      publisher: requiredString(article.source, "publisher"),
      publishedAt,
      sourceUrl: requiredString(article.url, "source URL"),
      relatedSymbols: nullableString(article.related)?.split(",").map((value) => value.trim()).filter(Boolean) ?? [symbol],
      provider: "finnhub" as const,
    };
  });
}

export function normalizeFinnhubEarnings(payload: unknown, company: CompanyIdentity): MarketEvent[] {
  const value = recordValue(payload, "Finnhub earnings calendar");
  if (!Array.isArray(value.earningsCalendar))
    throw new ProviderError("MALFORMED_RESPONSE", "Finnhub earnings calendar omitted events.");
  return value.earningsCalendar.map((item, index) => {
    const event = recordValue(item, "Finnhub earnings event");
    const date = nullableString(event.date);
    const hour = nullableString(event.hour);
    return {
      id: `finnhub-${company.symbol}-${date ?? index}`,
      companyId: company.id,
      symbol: company.symbol,
      kind: "earnings" as const,
      title: `${company.name} earnings`,
      scheduledAt: date ? `${date}T00:00:00.000Z` : null,
      timing: hour === "bmo" ? "before-open" as const : hour === "amc" ? "after-close" as const : "unknown" as const,
      source: "Finnhub earnings calendar",
      sourceUrl: null,
    };
  });
}

export function normalizeFinnhubSearch(payload: unknown, limit = 20): StockSearchResult[] {
  const value = recordValue(payload, "Finnhub symbol lookup");
  if (!Array.isArray(value.result))
    throw new ProviderError("MALFORMED_RESPONSE", "Finnhub symbol lookup omitted results.");
  const seen = new Set<string>();
  return value.result.flatMap((raw) => {
    const result = recordValue(raw, "Finnhub symbol result");
    const symbol = normalizeSymbol(nullableString(result.symbol) ?? "");
    const name = nullableString(result.description);
    const type = nullableString(result.type);
    const suffix = symbol.includes(".") ? symbol.split(".").at(-1) : null;
    const likelyUsTicker = !/^\d+$/.test(symbol) && (!suffix || suffix === "A" || suffix === "B");
    if (!name || !type || !likelyUsTicker || !isSupportedUsEquity({ symbol, type }) || seen.has(symbol)) return [];
    seen.add(symbol);
    return [{ symbol, name, exchange: null, assetType: type }];
  }).slice(0, limit);
}

export function normalizeFinnhubCompany(payload: unknown, symbol: string): CompanyIdentity {
  const profile = recordValue(payload, "Finnhub company profile");
  const rawTicker = nullableString(profile.ticker);
  const name = nullableString(profile.name);
  const exchange = nullableString(profile.exchange);
  if (!rawTicker || !name || !exchange)
    throw new ProviderError("UNSUPPORTED_SYMBOL", "MarketBrief could not validate this as a supported US equity.", 404);
  const ticker = normalizeSymbol(rawTicker);
  const country = nullableString(profile.country);
  if (ticker !== symbol || !isSupportedUsEquity({ symbol: ticker, country, exchange }))
    throw new ProviderError("UNSUPPORTED_SYMBOL", "MarketBrief currently supports validated US equities.", 404);
  return {
    id: `finnhub:${ticker}`,
    symbol: ticker,
    name,
    exchange,
    currency: nullableString(profile.currency) ?? "USD",
    cik: null,
    sector: nullableString(profile.finnhubIndustry),
    industry: nullableString(profile.finnhubIndustry),
    logoUrl: nullableString(profile.logo),
    logoSource: nullableString(profile.logo) ? "Finnhub company profile" : null,
  };
}

export class FinnhubProvider implements NewsProvider, EventsProvider, CompanyProvider {
  private readonly apiKey: string | undefined;
  private readonly fetcher: Fetcher;
  constructor(apiKey: string | undefined, fetcher: Fetcher = fetch) {
    this.apiKey = apiKey;
    this.fetcher = fetcher;
  }
  private key() {
    if (!this.apiKey) throw new ProviderError("MISSING_SECRET", "Finnhub is not configured.", 503);
    return this.apiKey;
  }
  private async request(path: string, params: URLSearchParams) {
    const apiKey = this.key();
    let response: Response;
    try {
      response = await this.fetcher(`https://finnhub.io/api/v1/${path}?${params}`, {
        headers: { "X-Finnhub-Token": apiKey },
      });
    } catch (error) {
      throw toProviderError(error, "Finnhub");
    }
    if (!response.ok) throw errorFromStatus(response.status, "Finnhub");
    try {
      return await response.json() as unknown;
    } catch {
      throw new ProviderError("MALFORMED_RESPONSE", "Finnhub returned unreadable JSON.");
    }
  }
  async getCompanyNews(symbol: string): Promise<NormalizedResponse<CompanyNewsArticle[]>> {
    const fetchedAt = new Date().toISOString();
    const to = fetchedAt.slice(0, 10);
    const from = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const data = normalizeFinnhubNews(await this.request("company-news", new URLSearchParams({ symbol, from, to })), symbol);
    return { data, meta: { source: "Finnhub company news", provider: "finnhub", fetchedAt, asOf: data[0]?.publishedAt ?? null, isStale: false } };
  }
  async getEvents(company: CompanyIdentity): Promise<NormalizedResponse<MarketEvent[]>> {
    const fetchedAt = new Date().toISOString();
    const from = fetchedAt.slice(0, 10);
    const to = new Date(Date.now() + 120 * 86_400_000).toISOString().slice(0, 10);
    const data = normalizeFinnhubEarnings(await this.request("calendar/earnings", new URLSearchParams({ symbol: company.symbol, from, to })), company);
    return { data, meta: { source: "Finnhub earnings calendar", provider: "finnhub", fetchedAt, asOf: fetchedAt, isStale: false } };
  }

  async search(query: string): Promise<NormalizedResponse<StockSearchResult[]>> {
    const fetchedAt = new Date().toISOString();
    const data = normalizeFinnhubSearch(await this.request("search", new URLSearchParams({ q: query })), 20);
    return { data, meta: { source: "Finnhub symbol lookup", provider: "finnhub", fetchedAt, asOf: fetchedAt, isStale: false } };
  }

  async getCompany(symbol: string): Promise<NormalizedResponse<CompanyIdentity>> {
    const fetchedAt = new Date().toISOString();
    const data = normalizeFinnhubCompany(await this.request("stock/profile2", new URLSearchParams({ symbol })), symbol);
    return { data, meta: { source: "Finnhub company profile", provider: "finnhub", fetchedAt, asOf: fetchedAt, isStale: false } };
  }
}
