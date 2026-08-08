import type { CompanyNewsArticle, MarketEvent, NormalizedResponse } from "../contracts.ts";
import { ProviderError, errorFromStatus, toProviderError } from "../errors.ts";
import type { CompanyIdentity } from "../contracts.ts";
import { isoTimestamp, nullableString, recordValue, requiredString } from "./normalization.ts";
import type { EventsProvider, NewsProvider } from "./types.ts";

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

export class FinnhubProvider implements NewsProvider, EventsProvider {
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
    params.set("token", this.key());
    let response: Response;
    try {
      response = await this.fetcher(`https://finnhub.io/api/v1/${path}?${params}`);
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
}
