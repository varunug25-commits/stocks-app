import type { ChartRange, MarketQuote, NormalizedResponse, PriceBar } from "../contracts.ts";
import { ProviderError, errorFromStatus, toProviderError } from "../errors.ts";
import { isoTimestamp, nullableNumber, nullableString, recordValue, requiredNumber, requiredString } from "./normalization.ts";
import type { MarketDataProvider } from "./types.ts";

type Fetcher = typeof fetch;
const rangeConfig: Record<ChartRange, { interval: string; outputsize: number }> = {
  "1D": { interval: "5min", outputsize: 78 },
  "1W": { interval: "1h", outputsize: 40 },
  "1M": { interval: "1day", outputsize: 31 },
  "3M": { interval: "1day", outputsize: 93 },
  "1Y": { interval: "1week", outputsize: 53 },
};

function providerFailure(payload: Record<string, unknown>) {
  const code = Number(payload.code);
  const message = nullableString(payload.message);
  if (!message && !Number.isFinite(code)) return null;
  if (code === 429) return new ProviderError("RATE_LIMITED", "Twelve Data rate limit reached.", 429);
  return new ProviderError("UPSTREAM_UNAVAILABLE", message ?? "Twelve Data rejected the request.", 502);
}

export function normalizeTwelveDataQuote(payload: unknown, symbol: string): MarketQuote {
  const value = recordValue(payload, "Twelve Data quote");
  const failure = providerFailure(value);
  if (failure) throw failure;
  const status = value.is_market_open === true
    ? "open"
    : value.is_market_open === false
      ? "closed"
      : "unknown";
  const providerTimestamp = [
    value.last_update_at,
    value.last_quote_at,
    value.timestamp,
    value.datetime,
  ].map(isoTimestamp).find((timestamp) => timestamp !== null) ?? null;
  return {
    companyId: `symbol:${symbol}`,
    symbol: requiredString(value.symbol, "symbol").toUpperCase(),
    price: requiredNumber(value.close ?? value.price, "latest price"),
    change: nullableNumber(value.change),
    changePercent: nullableNumber(value.percent_change),
    previousClose: nullableNumber(value.previous_close),
    open: nullableNumber(value.open),
    high: nullableNumber(value.high),
    low: nullableNumber(value.low),
    volume: nullableNumber(value.volume),
    exchange: nullableString(value.exchange),
    currency: nullableString(value.currency),
    marketStatus: status,
    providerTimestamp,
  };
}

export function normalizeTwelveDataBars(payload: unknown): PriceBar[] {
  const value = recordValue(payload, "Twelve Data time series");
  const failure = providerFailure(value);
  if (failure) throw failure;
  if (!Array.isArray(value.values))
    throw new ProviderError("MALFORMED_RESPONSE", "Twelve Data time series omitted bars.");
  return value.values.map((item) => {
    const bar = recordValue(item, "Twelve Data bar");
    const timestamp = isoTimestamp(bar.datetime);
    if (!timestamp)
      throw new ProviderError("MALFORMED_RESPONSE", "Twelve Data bar omitted its timestamp.");
    return {
      timestamp,
      open: requiredNumber(bar.open, "open"),
      high: requiredNumber(bar.high, "high"),
      low: requiredNumber(bar.low, "low"),
      close: requiredNumber(bar.close, "close"),
      volume: nullableNumber(bar.volume),
    };
  }).reverse();
}

export class TwelveDataProvider implements MarketDataProvider {
  private readonly apiKey: string | undefined;
  private readonly fetcher: Fetcher;
  constructor(apiKey: string | undefined, fetcher: Fetcher = fetch) {
    this.apiKey = apiKey;
    this.fetcher = fetcher;
  }

  private key() {
    if (!this.apiKey)
      throw new ProviderError("MISSING_SECRET", "Twelve Data is not configured.", 503);
    return this.apiKey;
  }

  private async request(path: string, params: URLSearchParams) {
    const apiKey = this.key();
    let response: Response;
    try {
      response = await this.fetcher(`https://api.twelvedata.com/${path}?${params}`, {
        headers: { Authorization: `apikey ${apiKey}` },
      });
    } catch (error) {
      throw toProviderError(error, "Twelve Data");
    }
    if (!response.ok) throw errorFromStatus(response.status, "Twelve Data");
    try {
      return await response.json() as unknown;
    } catch {
      throw new ProviderError("MALFORMED_RESPONSE", "Twelve Data returned unreadable JSON.");
    }
  }

  async getQuote(symbol: string): Promise<NormalizedResponse<MarketQuote>> {
    const fetchedAt = new Date().toISOString();
    const data = normalizeTwelveDataQuote(
      await this.request("quote", new URLSearchParams({ symbol })),
      symbol,
    );
    return { data, meta: { source: "Twelve Data quote", provider: "twelve-data", fetchedAt, asOf: data.providerTimestamp, isStale: false } };
  }

  async getBars(symbol: string, range: ChartRange): Promise<NormalizedResponse<PriceBar[]>> {
    const config = rangeConfig[range];
    const fetchedAt = new Date().toISOString();
    const data = normalizeTwelveDataBars(await this.request("time_series", new URLSearchParams({
      symbol,
      interval: config.interval,
      outputsize: String(config.outputsize),
      order: "DESC",
      timezone: "UTC",
    })));
    return { data, meta: { source: "Twelve Data time series", provider: "twelve-data", fetchedAt, asOf: data.at(-1)?.timestamp ?? null, isStale: false } };
  }
}
