import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { normalizeEvidence, summarizeHistoricalBars } from "../supabase/functions/_shared/intelligence/evidence.ts";
import { parseIntelligenceRequest } from "../supabase/functions/_shared/intelligence/request.ts";
import { normalizeFinnhubCompany, normalizeFinnhubSearch } from "../supabase/functions/_shared/providers/finnhub.ts";
import { ProviderError } from "../supabase/functions/_shared/errors.ts";
import { requireSymbolSyntax } from "../supabase/functions/_shared/symbols.ts";
import { createMarketDataService, parseMarketDataRequest } from "../supabase/functions/_shared/service.ts";
import { clearStockSearchCache, requestStockSearch } from "../src/data/real/search.ts";

const meta = { source: "Provider", provider: "twelve-data", fetchedAt: "2026-08-09T12:00:00.000Z", asOf: "2026-08-09T12:00:00.000Z", isStale: false };
const root = new URL("../", import.meta.url);

test("dynamic symbols normalize safely without a compile-time ticker registry", () => {
  assert.equal(requireSymbolSyntax(" adbe "), "ADBE");
  assert.equal(parseMarketDataRequest({ resource: "quote", symbol: "jpm" }).symbol, "JPM");
  assert.deepEqual(parseIntelligenceRequest({ task: "brief", symbols: ["adbe", "jpm"], edition: "morning" }).symbols, ["ADBE", "JPM"]);
  for (const value of ["BAD SYMBOL", "$AAPL", "TOO-LONG-1"]) assert.throws(() => requireSymbolSyntax(value));
});

test("Finnhub search normalization filters unsupported instruments and bounds results", () => {
  const results = normalizeFinnhubSearch({ result: [
    { symbol: "ADBE", description: "Adobe Inc", type: "Common Stock" },
    { symbol: "JPM", description: "JPMorgan Chase", type: "Common Stock" },
    { symbol: "SPY", description: "SPDR S&P 500 ETF", type: "ETF" },
    { symbol: "EURUSD", description: "Euro", type: "Forex" },
    { symbol: "JPM.MX", description: "JPMorgan Mexico", type: "Common Stock" },
    { symbol: "ADBE", description: "Duplicate", type: "Common Stock" },
  ] }, 2);
  assert.deepEqual(results.map((entry) => entry.symbol), ["ADBE", "JPM"]);
  assert.equal(results.every((entry) => entry.assetType === "Common Stock"), true);
});

test("provider profile validation accepts supported US equities and rejects unsupported markets", () => {
  assert.equal(normalizeFinnhubCompany({ ticker: "ADBE", name: "Adobe Inc.", exchange: "NASDAQ NMS - GLOBAL MARKET", country: "US", currency: "USD" }, "ADBE").symbol, "ADBE");
  assert.throws(() => normalizeFinnhubCompany({ ticker: "7203", name: "Toyota", exchange: "TOKYO", country: "JP" }, "7203"), (error: unknown) => error instanceof ProviderError && error.code === "UNSUPPORTED_SYMBOL");
  assert.throws(() => normalizeFinnhubCompany({}, "ZZZZZZ"), (error: unknown) => error instanceof ProviderError && error.code === "UNSUPPORTED_SYMBOL");
});

test("dynamic resource requests validate the company before an upstream quote", async () => {
  let quoteCalls = 0;
  const unavailable = async () => { throw new Error("unused"); };
  const service = createMarketDataService({
    cache: { get: async () => null, put: async () => undefined },
    limiter: { assertAllowed: async () => undefined } as never,
    company: {
      search: unavailable,
      getCompany: async () => { throw new ProviderError("UNSUPPORTED_SYMBOL", "Unsupported equity", 404); },
    },
    market: { getQuote: async () => { quoteCalls += 1; return { data: {}, meta }; }, getBars: unavailable },
    news: { getCompanyNews: unavailable }, filings: { getFilings: unavailable }, events: { getEvents: unavailable },
  });
  await assert.rejects(service({ resource: "quote", symbol: "ZZZZZZ" }), /Unsupported equity/);
  assert.equal(quoteCalls, 0);
});

test("client stock search caches and deduplicates normalized queries", async () => {
  clearStockSearchCache();
  let calls = 0;
  const fetcher: typeof fetch = async (_url, init) => {
    calls += 1;
    assert.deepEqual(JSON.parse(String(init?.body)), { resource: "search", query: "Adobe" });
    return Response.json({ data: [{ symbol: "ADBE", name: "Adobe Inc.", exchange: null, assetType: "Common Stock" }], meta: { ...meta, provider: "finnhub" } });
  };
  const config = { mode: "REAL" as const, supabaseUrl: "https://example.supabase.co", publishableKey: "public-key" };
  const [first, second] = await Promise.all([
    requestStockSearch(" Adobe ", { config, fetcher, now: () => 100 }),
    requestStockSearch("Adobe", { config, fetcher, now: () => 100 }),
  ]);
  const third = await requestStockSearch("adobe", { config, fetcher, now: () => 101 });
  assert.equal(calls, 1);
  assert.equal(first?.data[0]?.symbol, "ADBE");
  assert.deepEqual(second, first);
  assert.deepEqual(third, first);
});

test("historical bars become one compact factual price-context record", () => {
  const bars = Array.from({ length: 22 }, (_, index) => ({ timestamp: new Date(Date.UTC(2026, 6, index + 1)).toISOString(), open: 100 + index, high: 102 + index, low: 99 + index, close: 101 + index, volume: 1_000 }));
  const evidence = summarizeHistoricalBars("ADBE", { data: bars, meta }, { data: { changePercent: 4.2 }, meta });
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0]?.type, "price_move");
  assert.match(evidence[0]?.text ?? "", /5-day move|median absolute daily move/);
  assert.equal(JSON.stringify(evidence).includes('"open"'), false);
});

test("evidence quotas preserve per-symbol and per-type diversity before global ranking", () => {
  const news = Array.from({ length: 8 }, (_, index) => ({ id: `n${index}`, headline: `ADBE Adobe update ${index}`, summary: "Adobe company development", publisher: "Publisher", publishedAt: `2026-08-0${9 - index}T12:00:00.000Z`, sourceUrl: `https://news.example/${index}`, relatedSymbols: ["ADBE"] }));
  const filings = Array.from({ length: 4 }, (_, index) => ({ accessionNumber: `acc${index}`, formType: "10-Q", filingDate: `2026-0${8 - index}-01`, canonicalUrl: `https://sec.example/${index}`, source: "SEC" }));
  const bundle = normalizeEvidence({ task: "why_moved", symbols: ["ADBE"] }, { ADBE: { company: { data: { name: "Adobe Inc.", exchange: "NASDAQ" }, meta }, quote: { data: { price: 350, change: 10, changePercent: 3 }, meta }, news: { data: news, meta }, filings: { data: filings, meta }, events: { data: Array.from({ length: 4 }, (_, index) => ({ id: `e${index}`, title: `Adobe event ${index}`, scheduledAt: `2026-09-0${index + 1}`, source: "Finnhub" })), meta } } });
  const count = (type: string) => bundle.evidence.filter((entry) => entry.type === type).length;
  assert.equal(count("quote"), 1);
  assert.equal(count("company"), 1);
  assert.equal(count("news"), 3);
  assert.equal(count("filing"), 1);
  assert.equal(count("event"), 2);
});

test("REAL screens gate all static market and brief fixtures behind DEMO mode", async () => {
  const [today, markets, briefs, detail, search] = await Promise.all([
    readFile(new URL("src/app/(tabs)/index.tsx", root), "utf8"),
    readFile(new URL("src/app/(tabs)/markets.tsx", root), "utf8"),
    readFile(new URL("src/app/(tabs)/briefs.tsx", root), "utf8"),
    readFile(new URL("src/app/stock/[symbol].tsx", root), "utf8"),
    readFile(new URL("src/app/search.tsx", root), "utf8"),
  ]);
  assert.match(today, /mode === "DEMO" \? generateBrief/);
  assert.match(today, /useChangeDetection/);
  assert.match(markets, /useChangeDetection/);
  assert.match(markets, /does not claim sector-wide or market-wide causation/);
  assert.doesNotMatch(markets, /marketIndices|sectorPerformance|topGainers/);
  assert.match(briefs, /No earlier generated brief yet/);
  assert.match(detail, /companies\[symbol\]/);
  assert.doesNotMatch(detail, /demo catalog/);
  assert.match(search, /requestSequence\.current !== sequence/);
});

test("durable intelligence budgets are service-role only and generation-cache aware", async () => {
  const [migration, service, edge, panel] = await Promise.all([
    readFile(new URL("supabase/migrations/20260809115943_final_m7_hardening.sql", root), "utf8"),
    readFile(new URL("supabase/functions/_shared/intelligence/service.ts", root), "utf8"),
    readFile(new URL("supabase/functions/market-intelligence/index.ts", root), "utf8"),
    readFile(new URL("src/components/intelligence/IntelligencePanel.tsx", root), "utf8"),
  ]);
  assert.match(migration, /intelligence_request_windows/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /revoke all[\s\S]*anon, authenticated/);
  assert.match(migration, /grant execute[\s\S]*service_role/);
  assert.ok(service.indexOf("cache.get") < service.indexOf("await dependencies.beforeGenerate"));
  assert.match(edge, /consume_intelligence_request_budget/);
  assert.match(panel, /AI analysis temporarily unavailable/);
  assert.match(panel, /EVIDENCE SUMMARY/);
});
