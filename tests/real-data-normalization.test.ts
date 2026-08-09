import assert from "node:assert/strict";
import test from "node:test";

import { loadWithCache, type CacheRecord, type CacheStore } from "../supabase/functions/_shared/cache.ts";
import { ProviderError } from "../supabase/functions/_shared/errors.ts";
import { ProviderRequestLimiter, type ProviderBudgetStore } from "../supabase/functions/_shared/rateLimit.ts";
import { companyForSymbol } from "../supabase/functions/_shared/registry.ts";
import { FinnhubProvider, normalizeFinnhubNews } from "../supabase/functions/_shared/providers/finnhub.ts";
import { normalizeSecSubmissions, SecEdgarProvider } from "../supabase/functions/_shared/providers/sec.ts";
import { normalizeTwelveDataBars, normalizeTwelveDataQuote, TwelveDataProvider } from "../supabase/functions/_shared/providers/twelveData.ts";
import { createMarketDataService, parseMarketDataRequest, readPublicRequestJson, validatePublicRequest } from "../supabase/functions/_shared/service.ts";
import { edgeFunctionUrl, resolveDataMode } from "../src/data/real/config.ts";
import { MarketDataClientError, requestMarketData } from "../src/data/real/client.ts";
import { formatFreshness } from "../src/data/real/freshness.ts";
import { errorToResource } from "../src/data/real/resource.ts";
import { latestFilingsForPresentation, latestNewsForPresentation, presentFiling, presentNewsArticle } from "../src/data/real/presentation.ts";

test("Twelve Data quote normalization preserves available values and unknowns", () => {
  const quote = normalizeTwelveDataQuote({
    symbol: "AAPL", close: "231.42", change: "1.17", percent_change: "0.51",
    previous_close: "230.25", open: "230.60", high: "232.10", low: "229.90",
    volume: "45678901", exchange: "NASDAQ", currency: "USD", timestamp: 1_722_998_400,
    is_market_open: true,
  }, "AAPL");
  assert.equal(quote.companyId, "symbol:AAPL");
  assert.equal(quote.price, 231.42);
  assert.equal(quote.volume, 45_678_901);
  assert.equal(quote.marketStatus, "open");
  assert.equal(quote.providerTimestamp, "2024-08-07T02:40:00.000Z");

  const withoutOptional = normalizeTwelveDataQuote({ symbol: "AAPL", close: "231.42" }, "AAPL");
  assert.equal(withoutOptional.open, null);
  assert.equal(withoutOptional.volume, null);
  assert.equal(withoutOptional.marketStatus, "unknown");
});

test("Twelve Data quote freshness prefers latest-update metadata over legacy timestamps", () => {
  const withLastUpdate = normalizeTwelveDataQuote({
    symbol: "AAPL", close: "231.42",
    last_update_at: "2026-08-08 15:45:00",
    last_quote_at: "2026-08-08 15:44:00",
    timestamp: 1_786_200_000,
    datetime: "2026-08-08 13:30:00",
  }, "AAPL");
  assert.equal(withLastUpdate.providerTimestamp, "2026-08-08T15:45:00.000Z");

  const withLastQuote = normalizeTwelveDataQuote({
    symbol: "AAPL", close: "231.42",
    last_quote_at: "2026-08-08 15:44:00",
    timestamp: 1_786_200_000,
    datetime: "2026-08-08 13:30:00",
  }, "AAPL");
  assert.equal(withLastQuote.providerTimestamp, "2026-08-08T15:44:00.000Z");
});

test("provider credentials are sent only in supported authentication headers", async () => {
  const twelveSecret = "twelve-server-secret";
  let twelveUrl = "";
  let twelveAuthorization: string | null = null;
  const twelve = new TwelveDataProvider(twelveSecret, async (input, init) => {
    twelveUrl = String(input);
    twelveAuthorization = new Headers(init?.headers).get("Authorization");
    return Response.json({ symbol: "AAPL", close: "231.42", last_update_at: "2026-08-08 15:45:00" });
  });
  const quote = await twelve.getQuote("AAPL");
  assert.equal(new URL(twelveUrl).searchParams.has("apikey"), false);
  assert.doesNotMatch(twelveUrl, new RegExp(twelveSecret));
  assert.equal(twelveAuthorization, `apikey ${twelveSecret}`);
  assert.doesNotMatch(JSON.stringify(quote), new RegExp(twelveSecret));

  const finnhubSecret = "finnhub-server-secret";
  let finnhubUrl = "";
  let finnhubToken: string | null = null;
  const finnhub = new FinnhubProvider(finnhubSecret, async (input, init) => {
    finnhubUrl = String(input);
    finnhubToken = new Headers(init?.headers).get("X-Finnhub-Token");
    return Response.json([]);
  });
  const news = await finnhub.getCompanyNews("AAPL");
  assert.equal(new URL(finnhubUrl).searchParams.has("token"), false);
  assert.doesNotMatch(finnhubUrl, new RegExp(finnhubSecret));
  assert.equal(finnhubToken, finnhubSecret);
  assert.doesNotMatch(JSON.stringify(news), new RegExp(finnhubSecret));
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

test("provider publisher, source URL and SEC canonical URL survive UI presentation", () => {
  const article = presentNewsArticle({
    id: "real-42", headline: "Actual provider headline", summary: null,
    publisher: "Example Wire", publishedAt: "2026-08-07T10:00:00.000Z",
    sourceUrl: "https://example.com/original", relatedSymbols: ["AAPL"], provider: "finnhub",
  });
  assert.equal(article.publisher, "Example Wire");
  assert.equal(article.publishedAt, "2026-08-07T10:00:00.000Z");
  assert.equal(article.sourceUrl, "https://example.com/original");
  assert.equal(article.external, true);

  const filing = presentFiling({
    accessionNumber: "0000320193-26-000001", formType: "10-Q", filingDate: "2026-08-01",
    reportDate: "2026-06-30", companyId: "company-id", company: "Apple Inc.", cik: "0000320193",
    primaryDocument: "aapl.htm", canonicalUrl: "https://www.sec.gov/Archives/example", source: "SEC",
  });
  assert.equal(filing.source, "SEC");
  assert.equal(filing.canonicalUrl, "https://www.sec.gov/Archives/example");
});

test("Stock Detail presentation keeps only the ten newest provider records", () => {
  const articles = Array.from({ length: 12 }, (_, index) => ({
    id: `news-${index}`, headline: `Story ${index}`, summary: null,
    publisher: "Example Wire", publishedAt: `2026-08-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`,
    sourceUrl: `https://example.com/${index}`, relatedSymbols: ["AAPL"], provider: "finnhub",
  }));
  const latestNews = latestNewsForPresentation(articles);
  assert.equal(latestNews.length, 10);
  assert.equal(latestNews[0]!.id, "news-11");
  assert.equal(latestNews.at(-1)!.id, "news-2");
  assert.equal(latestNews[0]!.provider, "finnhub");
  assert.equal(articles[0]!.id, "news-0");

  const filings = Array.from({ length: 12 }, (_, index) => ({
    accessionNumber: `accession-${index}`, formType: "8-K" as const,
    filingDate: `2026-07-${String(index + 1).padStart(2, "0")}`, reportDate: null,
    companyId: "company-id", company: "Apple Inc.", cik: "0000320193",
    primaryDocument: `aapl-${index}.htm`, canonicalUrl: `https://www.sec.gov/Archives/${index}`, source: "SEC",
  }));
  const latestFilings = latestFilingsForPresentation(filings);
  assert.equal(latestFilings.length, 10);
  assert.equal(latestFilings[0]!.accessionNumber, "accession-11");
  assert.equal(latestFilings.at(-1)!.accessionNumber, "accession-2");
  assert.equal(latestFilings[0]!.source, "SEC");
  assert.equal(filings[0]!.accessionNumber, "accession-0");
});

test("malformed provider responses and unsupported requests fail explicitly", () => {
  assert.throws(() => normalizeTwelveDataQuote({ symbol: "AAPL" }, "AAPL"), (error: unknown) => error instanceof ProviderError && error.code === "MALFORMED_RESPONSE");
  assert.throws(() => normalizeTwelveDataBars({ values: [{ datetime: "bad" }] }), (error: unknown) => error instanceof ProviderError && error.code === "MALFORMED_RESPONSE");
  assert.throws(() => companyForSymbol("INVALID"), (error: unknown) => error instanceof ProviderError && error.code === "UNSUPPORTED_SYMBOL");
  assert.throws(() => parseMarketDataRequest({ resource: "bars", symbol: "AAPL", range: "5Y" }), /supported chart range/);
});

test("public request boundary rejects invalid methods, content and oversized bodies", async () => {
  assert.throws(() => validatePublicRequest(new Request("https://example.com", { method: "GET" })), (error: unknown) => error instanceof ProviderError && error.status === 405);
  assert.throws(() => validatePublicRequest(new Request("https://example.com", { method: "POST", body: "{}", headers: { "content-type": "text/plain" } })), (error: unknown) => error instanceof ProviderError && error.status === 415);
  await assert.rejects(
    readPublicRequestJson(new Request("https://example.com", { method: "POST", body: "x".repeat(4097), headers: { "content-type": "application/json" } })),
    (error: unknown) => error instanceof ProviderError && error.status === 413,
  );
  await assert.rejects(
    readPublicRequestJson(new Request("https://example.com", { method: "POST", body: "not-json", headers: { "content-type": "application/json" } })),
    (error: unknown) => error instanceof ProviderError && error.code === "INVALID_REQUEST",
  );
});

test("shared provider budgets enforce concurrent limits and cooldown decisions", async () => {
  let count = 0;
  let blockedUntil: string | null = null;
  const sharedStore: ProviderBudgetStore = {
    async consume(_provider, limit) {
      if (blockedUntil) return { allowed: false, remaining: 0, retryAt: blockedUntil };
      if (count >= 3) {
        blockedUntil = new Date(Date.now() + limit.cooldownSeconds * 1000).toISOString();
        return { allowed: false, remaining: 0, retryAt: blockedUntil };
      }
      count += 1;
      return { allowed: true, remaining: 3 - count, retryAt: null };
    },
  };
  const firstInstance = new ProviderRequestLimiter(sharedStore);
  const secondInstance = new ProviderRequestLimiter(sharedStore);
  const results = await Promise.allSettled(Array.from({ length: 10 }, (_, index) =>
    (index % 2 ? firstInstance : secondInstance).assertAllowed("twelve-data")
  ));
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 3);
  assert.equal(results.filter((result) => result.status === "rejected").length, 7);
  await assert.rejects(firstInstance.assertAllowed("twelve-data"), (error: unknown) => error instanceof ProviderError && error.code === "RATE_LIMITED");
});

test("cache hits skip provider budget and stale real data survives exhausted quota", async () => {
  const meta = { source: "Twelve Data", provider: "twelve-data" as const, fetchedAt: "2026-08-07T10:00:00.000Z", asOf: "2026-08-07T10:00:00.000Z", isStale: false };
  const quote = { companyId: companyForSymbol("AAPL").id, symbol: "AAPL", price: 200, change: 1, changePercent: .5, previousClose: 199, open: 199, high: 201, low: 198, volume: 1_000, exchange: "NASDAQ", currency: "USD", marketStatus: "open" as const, providerTimestamp: meta.asOf };
  const records = new Map<string, CacheRecord<unknown>>([["quote:AAPL", { key: "quote:AAPL", resource: "quote", value: quote, meta, expiresAt: "2999-01-01T00:00:00.000Z" }]]);
  const cache: CacheStore = {
    get: async <T,>(key: string) => records.get(key) as CacheRecord<T> | undefined ?? null,
    put: async <T,>(record: CacheRecord<T>) => { records.set(record.key, record); },
  };
  let budgetCalls = 0;
  const limiter = new ProviderRequestLimiter({
    async consume() { budgetCalls += 1; return { allowed: false, remaining: 0, retryAt: "2026-08-07T10:01:00.000Z" }; },
  });
  const unavailable = async () => { throw new Error("provider should not run"); };
  const service = createMarketDataService({
    cache, limiter,
    market: { getQuote: unavailable, getBars: unavailable },
    news: { getCompanyNews: unavailable }, filings: { getFilings: unavailable },
    company: { getCompany: unavailable }, events: { getEvents: unavailable },
  });
  const fresh = await service({ resource: "quote", symbol: "AAPL" });
  assert.equal((fresh.data as { price: number }).price, 200);
  assert.equal(budgetCalls, 0);

  records.set("quote:AAPL", { key: "quote:AAPL", resource: "quote", value: quote, meta, expiresAt: "2000-01-01T00:00:00.000Z" });
  const stale = await service({ resource: "quote", symbol: "AAPL" });
  assert.equal(stale.meta.isStale, true);
  assert.equal(stale.meta.errorCode, "RATE_LIMITED");
  assert.equal(budgetCalls, 1);
});

test("missing provider configuration fails before consuming shared budget", async () => {
  const cache: CacheStore = { get: async () => null, put: async () => undefined };
  let budgetCalls = 0;
  const limiter = new ProviderRequestLimiter({
    async consume() { budgetCalls += 1; return { allowed: true, remaining: 1, retryAt: null }; },
  });
  const unavailable = async () => { throw new Error("provider should not run"); };
  const service = createMarketDataService({
    cache, limiter,
    assertProviderConfigured() { throw new ProviderError("MISSING_SECRET", "not configured", 503); },
    market: { getQuote: unavailable, getBars: unavailable },
    news: { getCompanyNews: unavailable }, filings: { getFilings: unavailable },
    company: { getCompany: unavailable }, events: { getEvents: unavailable },
  });
  await assert.rejects(service({ resource: "quote", symbol: "AAPL" }), (error: unknown) => error instanceof ProviderError && error.code === "MISSING_SECRET");
  assert.equal(budgetCalls, 0);
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
