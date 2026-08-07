import assert from "node:assert/strict";
import test from "node:test";

import { loadWithCache, type CacheRecord, type CacheStore } from "../supabase/functions/_shared/cache.ts";
import { ProviderError } from "../supabase/functions/_shared/errors.ts";
import { companyForSymbol } from "../supabase/functions/_shared/registry.ts";
import { normalizeFinnhubNews } from "../supabase/functions/_shared/providers/finnhub.ts";
import { normalizeSecSubmissions, SecEdgarProvider } from "../supabase/functions/_shared/providers/sec.ts";
import { normalizeTwelveDataBars, normalizeTwelveDataQuote, TwelveDataProvider } from "../supabase/functions/_shared/providers/twelveData.ts";
import { parseMarketDataRequest } from "../supabase/functions/_shared/service.ts";
import { edgeFunctionUrl, resolveDataMode } from "../src/data/real/config.ts";
import { MarketDataClientError, requestMarketData } from "../src/data/real/client.ts";
import { formatFreshness } from "../src/data/real/freshness.ts";
import { errorToResource } from "../src/data/real/resource.ts";

test("Twelve Data quote normalization preserves available values and unknowns", () => {
  const quote = normalizeTwelveDataQuote({
    symbol: "AAPL", close: "231.42", change: "1.17", percent_change: "0.51",
    previous_close: "230.25", open: "230.60", high: "232.10", low: "229.90",
    volume: "45678901", exchange: "NASDAQ", currency: "USD", timestamp: 1_722_998_400,
    is_market_open: true,
  }, "AAPL");
  assert.equal(quote.companyId, companyForSymbol("AAPL").id);
  assert.equal(quote.price, 231.42);
  assert.equal(quote.volume, 45_678_901);
  assert.equal(quote.marketStatus, "open");
  assert.equal(quote.providerTimestamp, "2024-08-07T02:40:00.000Z");

  const withoutOptional = normalizeTwelveDataQuote({ symbol: "AAPL", close: "231.42" }, "AAPL");
  assert.equal(withoutOptional.open, null);
  assert.equal(withoutOptional.volume, null);
  assert.equal(withoutOptional.marketStatus, "unknown");
});

test("Twelve Data chart normalization returns chronological OHLCV bars", () => {
  const bars = normalizeTwelveDataBars({ values: [
    { datetime: "2026-08-07 15:55:00", open: "102", high: "104", low: "101", close: "103", volume: "20" },
    { datetime: "2026-08-07 15:50:00", open: "100", high: "103", low: "99", close: "102", volume: "10" },
  ] });
  assert.deepEqual(bars.map((bar) => bar.close), [102, 103]);
  assert.ok(Date.parse(bars[0]!.timestamp) < Date.parse(bars[1]!.timestamp));
  assert.equal(bars[0]!.volume, 10);
});

test("SEC filing normalization uses stable company identity and canonical SEC references", () => {
  const company = companyForSymbol("AAPL");
  const filings = normalizeSecSubmissions({
    cik: "320193", name: "Apple Inc.", filings: { recent: {
      accessionNumber: ["0000320193-26-000001", "0000320193-26-000002", "0000320193-26-000003"],
      form: ["10-Q", "4", "8-K"], filingDate: ["2026-08-01", "2026-08-02", "2026-08-03"],
      reportDate: ["2026-06-30", "", "2026-08-03"], primaryDocument: ["aapl-20260630.htm", "ownership.xml", "aapl-8k.htm"],
    } },
  }, company);
  assert.deepEqual(filings.map((filing) => filing.formType), ["10-Q", "8-K"]);
  assert.ok(filings.every((filing) => filing.companyId === company.id && filing.cik === "0000320193"));
  assert.match(filings[0]!.canonicalUrl, /^https:\/\/www\.sec\.gov\/Archives\/edgar\/data\/320193\//);
});

test("SEC requests share a conservative request gate across provider instances", async () => {
  const requestTimes: number[] = [];
  const payload = {
    cik: "320193", name: "Apple Inc.", filings: { recent: {
      accessionNumber: [], form: [], filingDate: [], reportDate: [], primaryDocument: [],
    } },
  };
  const fetcher = async () => {
    requestTimes.push(Date.now());
    return Response.json(payload);
  };
  const company = companyForSymbol("AAPL");
  await Promise.all([
    new SecEdgarProvider("MarketBrief test contact@example.com", fetcher, 20).getFilings(company),
    new SecEdgarProvider("MarketBrief test contact@example.com", fetcher, 20).getFilings(company),
  ]);
  assert.equal(requestTimes.length, 2);
  assert.ok(requestTimes[1]! - requestTimes[0]! >= 15);
});

test("Finnhub normalization stores metadata only and never invents article content", () => {
  const news = normalizeFinnhubNews([{
    id: 42, headline: "Company schedules product event", summary: "", source: "Example Wire",
    datetime: 1_722_998_400, url: "https://example.com/story", related: "AAPL,MSFT",
  }], "AAPL");
  assert.equal(news[0]!.summary, null);
  assert.deepEqual(news[0]!.relatedSymbols, ["AAPL", "MSFT"]);
  assert.equal(news[0]!.sourceUrl, "https://example.com/story");
});

test("malformed provider responses and unsupported requests fail explicitly", () => {
  assert.throws(() => normalizeTwelveDataQuote({ symbol: "AAPL" }, "AAPL"), (error: unknown) => error instanceof ProviderError && error.code === "MALFORMED_RESPONSE");
  assert.throws(() => normalizeTwelveDataBars({ values: [{ datetime: "bad" }] }), (error: unknown) => error instanceof ProviderError && error.code === "MALFORMED_RESPONSE");
  assert.throws(() => companyForSymbol("INVALID"), (error: unknown) => error instanceof ProviderError && error.code === "UNSUPPORTED_SYMBOL");
  assert.throws(() => parseMarketDataRequest({ resource: "bars", symbol: "AAPL", range: "5Y" }), /supported chart range/);
});

test("rate limits and missing provider secrets remain structured errors", async () => {
  const limited = new TwelveDataProvider("server-only", async () => new Response("{}", { status: 429 }));
  await assert.rejects(limited.getQuote("AAPL"), (error: unknown) => error instanceof ProviderError && error.code === "RATE_LIMITED");
  const missing = new TwelveDataProvider(undefined, async () => new Response("{}"));
  await assert.rejects(missing.getQuote("AAPL"), (error: unknown) => error instanceof ProviderError && error.code === "MISSING_SECRET");
});

test("transport failures and unreadable provider JSON remain distinct errors", async () => {
  const networkFailure = new TwelveDataProvider("server-only", async () => { throw new Error("offline"); });
  await assert.rejects(networkFailure.getQuote("AAPL"), (error: unknown) => error instanceof ProviderError && error.code === "NETWORK_FAILURE");
  const unreadable = new TwelveDataProvider("server-only", async () => new Response("not-json", { status: 200 }));
  await assert.rejects(unreadable.getQuote("AAPL"), (error: unknown) => error instanceof ProviderError && error.code === "MALFORMED_RESPONSE");
});

test("cache serves fresh data, refreshes expired data, and labels stale recovery", async () => {
  const records = new Map<string, CacheRecord<unknown>>();
  const cache: CacheStore = {
    get: async <T,>(key: string) => records.get(key) as CacheRecord<T> | undefined ?? null,
    put: async <T,>(record: CacheRecord<T>) => { records.set(record.key, record); },
  };
  const meta = { source: "Provider", provider: "twelve-data" as const, fetchedAt: "2026-08-07T09:00:00.000Z", asOf: "2026-08-07T09:00:00.000Z", isStale: false };
  records.set("quote:AAPL", { key: "quote:AAPL", resource: "quote", value: { price: 1 }, meta, expiresAt: "2026-08-07T09:02:00.000Z" });
  let loads = 0;
  const fresh = await loadWithCache({ cache, key: "quote:AAPL", resource: "quote", now: () => Date.parse("2026-08-07T09:01:00.000Z"), loader: async () => { loads += 1; return { data: { price: 2 }, meta }; } });
  assert.equal((fresh.data as { price: number }).price, 1);
  assert.equal(loads, 0);

  records.set("quote:AAPL", { key: "quote:AAPL", resource: "quote", value: { price: 1 }, meta, expiresAt: "2026-08-07T09:00:00.000Z" });
  const stale = await loadWithCache({ cache, key: "quote:AAPL", resource: "quote", now: () => Date.parse("2026-08-07T09:03:00.000Z"), loader: async () => { throw new ProviderError("RATE_LIMITED", "limited", 429); } });
  assert.equal(stale.meta.isStale, true);
  assert.equal(stale.meta.errorCode, "RATE_LIMITED");
  assert.equal((stale.data as { price: number }).price, 1);
});

test("REAL configuration never silently falls back to DEMO", async () => {
  assert.equal(edgeFunctionUrl({ mode: "REAL", supabaseUrl: null, publishableKey: null }), null);
  await assert.rejects(
    requestMarketData({ resource: "quote", symbol: "AAPL" }, { config: { mode: "REAL", supabaseUrl: null, publishableKey: null }, fetcher: async () => { throw new Error("must not run"); } }),
    (error: unknown) => error instanceof MarketDataClientError && error.code === "MISSING_CONFIGURATION",
  );
  assert.equal(errorToResource(new MarketDataClientError("MISSING_CONFIGURATION", "missing")).status, "unavailable");
  assert.equal(resolveDataMode("DEMO"), "DEMO");
  assert.equal(resolveDataMode("REAL"), "REAL");
});

test("freshness labels distinguish recent, timestamped and stale data", () => {
  const base = { source: "Provider", provider: "provider", fetchedAt: "2026-08-07T10:00:00.000Z", asOf: "2026-08-07T10:00:00.000Z", isStale: false };
  assert.equal(formatFreshness(base, Date.parse("2026-08-07T10:03:00.000Z")), "Updated 3 min ago");
  assert.equal(formatFreshness({ ...base, isStale: true }), "Stale cached data");
});
