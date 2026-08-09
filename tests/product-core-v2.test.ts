import assert from "node:assert/strict";
import test from "node:test";

import { calculatePriceContext } from "../src/features/materiality/unusualMove.ts";
import { detectMaterialChanges } from "../src/features/materiality/engine.ts";
import { createSeenChangeStore, createSnapshotStore } from "../src/features/materiality/storage.ts";
import type { WatchlistSnapshot } from "../src/features/materiality/types.ts";
import { calculateWatchlistBreadth, deriveWatchlistPatterns } from "../src/features/materiality/patterns.ts";
import { buildStockTimeline, groupStockTimeline } from "../src/features/timeline/stockTimeline.ts";
import { createThesisStore, MAX_THESIS_LENGTH } from "../src/features/thesis/storage.ts";
import type { StorageAdapter } from "../src/storage/preferencesCore.ts";
import { MockStructuredAIProvider } from "../supabase/functions/_shared/intelligence/provider.ts";
import { parseIntelligenceRequest } from "../supabase/functions/_shared/intelligence/request.ts";
import { groupsReducer, initialGroupState } from "../src/features/groups/model.ts";
import { createGroupStore } from "../src/features/groups/storage.ts";
import { compareRealBriefs, createRealBriefStore, makeRealBriefRecord } from "../src/features/briefs/realStore.ts";

const at = "2026-08-09T12:00:00.000Z";
const ref = (id: string, title = id, sourceUrl: string | null = `https://example.com/${id}`) => ({ id, title, sourceUrl, occurredAt: at });
const snapshot = (symbols: WatchlistSnapshot["symbols"], capturedAt = at): WatchlistSnapshot => ({ version: 1, capturedAt, symbols });
const quiet = { price: 100, changePercent: 0.4, news: [], filings: [], events: [] };

test("first comparison creates a truthful baseline without invented changes", () => {
  const current = snapshot({ AAPL: quiet });
  const result = detectMaterialChanges({ previous: null, current });
  assert.equal(result.baselineReady, true);
  assert.deepEqual(result.materialChanges, []);
  assert.deepEqual(result.quietSymbols, ["AAPL"]);
});

test("new evidence and an unusual move produce deterministic materiality reasons", () => {
  const previous = snapshot({ ADBE: quiet }, "2026-08-09T09:00:00.000Z");
  const current = snapshot({ ADBE: { ...quiet, changePercent: 5.2, priceContext: { dailyMovePercent: 5.2, fiveSessionMovePercent: 7, periodMovePercent: 9, recentHigh: 280, recentLow: 250, medianAbsoluteDailyMove: 1.8, unusualMoveRatio: 2.9, label: "UNUSUAL MOVE", validSessions: 22 }, news: [ref("adobe-news", "Adobe announces a company update")] } });
  const [change] = detectMaterialChanges({ previous, current }).materialChanges;
  assert.equal(change?.kind, "combined");
  assert.equal(change?.moveLabel, "UNUSUAL MOVE");
  assert.ok((change?.materialityScore ?? 0) >= 35);
  assert.ok(change?.reasons.some((reason) => reason.includes("2.9×")));
  assert.ok(change?.reasons.some((reason) => reason.includes("company news")));
});

test("old, already-seen evidence is penalized below the attention threshold", () => {
  const oldAt = "2026-07-01T12:00:00.000Z";
  const previous = snapshot({ AAPL: quiet }, "2026-06-30T12:00:00.000Z");
  const current = snapshot({ AAPL: { ...quiet, news: [{ id: "old", title: "Old item", sourceUrl: "https://example.com/old", occurredAt: oldAt }] } });
  const first = detectMaterialChanges({ previous, current, threshold: 0, now: Date.parse(at) });
  const seen = new Set(first.materialChanges.map((change) => change.id));
  const penalized = detectMaterialChanges({ previous, current, seenChangeIds: seen, now: Date.parse(at) });
  assert.deepEqual(penalized.materialChanges, []);
});

test("the same syndicated source becomes one cross-symbol development", () => {
  const previous = snapshot({ AMD: quiet, NVDA: quiet }, "2026-08-09T09:00:00.000Z");
  const shared = ref("shared", "Chip companies respond to the same report", "https://wire.example/shared");
  const current = snapshot({ AMD: { ...quiet, news: [shared] }, NVDA: { ...quiet, news: [{ ...shared, id: "shared-copy" }] } });
  const result = detectMaterialChanges({ previous, current });
  assert.equal(result.materialChanges.length, 1);
  assert.deepEqual(result.materialChanges[0]?.affectedSymbols, ["AMD", "NVDA"]);
  assert.match(result.materialChanges[0]?.reasons[0] ?? "", /affects 2 watched companies/);
});

test("unusual move calculations remain factual and handle insufficient bars", () => {
  const bars = Array.from({ length: 22 }, (_, index) => ({ timestamp: new Date(Date.UTC(2026, 6, index + 1)).toISOString(), open: 100 + index, high: 102 + index, low: 99 + index, close: 101 + index, volume: 1000 }));
  const context = calculatePriceContext(bars, 4.2);
  assert.equal(context.validSessions, 22);
  assert.ok(context.medianAbsoluteDailyMove !== null);
  assert.ok(context.unusualMoveRatio !== null);
  assert.equal(calculatePriceContext(bars.slice(0, 1), 4.2).label, null);
});

test("snapshot and seen-state stores validate, persist and recover safely", async () => {
  const values = new Map<string, string>();
  const adapter: StorageAdapter = { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); }, removeItem: async (key) => { values.delete(key); } };
  const store = createSnapshotStore(adapter);
  const value = snapshot({ AAPL: quiet });
  await store.save(value);
  assert.deepEqual(await store.load(), value);
  values.set("marketbrief.snapshot.v1", "{bad json");
  assert.equal(await store.load(), null);
  const seen = createSeenChangeStore(adapter);
  await seen.markSeen(["change-1", "change-2"]);
  assert.deepEqual([...await seen.load()], ["change-1", "change-2"]);
});

test("watchlist patterns describe only supported within-watchlist relationships", () => {
  const quote = (changePercent: number) => ({ changePercent }) as never;
  const quotes = { AMD: quote(-4), NVDA: quote(-3), AAPL: quote(0.2), UBER: quote(0.1) };
  assert.deepEqual(calculateWatchlistBreadth(["AMD", "NVDA", "AAPL", "UBER", "CRM"], quotes), { higher: 2, lower: 2, unchanged: 0, unavailable: 1 });
  const patterns = deriveWatchlistPatterns({
    symbols: ["AMD", "NVDA", "AAPL", "UBER"],
    quotes,
    companies: { AMD: { sector: "Technology" } as never, NVDA: { sector: "Technology" } as never, AAPL: { sector: "Technology" } as never, UBER: { sector: "Industrials" } as never },
    changes: [], events: [], now: Date.parse(at),
  });
  assert.ok(patterns.some((pattern) => pattern.title === "Technology holdings moved lower"));
  assert.ok(patterns.every((pattern) => !pattern.detail.includes("entire sector")));
});

test("stock timeline preserves provider timestamps and never invents price crossing times", () => {
  const timeline = buildStockTimeline({
    symbol: "AAPL",
    quote: { symbol: "AAPL", companyId: "apple", price: 220, change: 4, changePercent: 1.85, previousClose: 216, open: 217, high: 221, low: 215, volume: 10, exchange: "NASDAQ", currency: "USD", marketStatus: "open", providerTimestamp: "2026-08-09T10:31:00.000Z" },
    quoteMeta: { provider: "twelve-data", source: "Twelve Data", fetchedAt: "2026-08-09T10:32:00.000Z", asOf: "2026-08-09T10:31:00.000Z", isStale: false },
    news: [{ id: "n1", headline: "Apple publishes an update", summary: null, publisher: "Publisher", publishedAt: "2026-08-09T10:04:00.000Z", sourceUrl: "https://example.com/n1", relatedSymbols: ["AAPL"], provider: "finnhub" }],
    filings: [{ accessionNumber: "f1", formType: "8-K", filingDate: "2026-08-08", reportDate: null, companyId: "apple", company: "Apple Inc.", cik: "1", primaryDocument: "x.htm", canonicalUrl: "https://sec.gov/f1", source: "SEC" }],
    events: [],
    now: Date.parse("2026-08-09T12:00:00.000Z"),
  });
  assert.deepEqual(timeline.map((item) => item.kind), ["price", "news", "filing"]);
  assert.equal(timeline[0]?.occurredAt, "2026-08-09T10:31:00.000Z");
  assert.match(timeline[0]?.detail ?? "", /quote update, not an inferred intraday threshold crossing/);
  assert.equal(timeline[2]?.precision, "date");
  assert.match(timeline[2]?.detail ?? "", /has not analyzed the filing body/);
  assert.deepEqual(groupStockTimeline(timeline, Date.parse("2026-08-09T12:00:00.000Z")).map((group) => group.label), ["TODAY", "YESTERDAY"]);
});

test("thesis storage validates local user context and enforces the length bound", async () => {
  const values = new Map<string, string>();
  const adapter: StorageAdapter = { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); }, removeItem: async (key) => { values.delete(key); } };
  const store = createThesisStore(adapter);
  await store.save({ version: 1, bySymbol: { AMD: `  ${"data center ".repeat(70)}  ` } });
  const stored = await store.load();
  assert.equal(stored.bySymbol.AMD?.length, MAX_THESIS_LENGTH);
  values.set("marketbrief.theses.v1", JSON.stringify({ version: 1, bySymbol: { "BAD SYMBOL": "ignored", AAPL: 42 } }));
  assert.deepEqual(await store.load(), { version: 1, bySymbol: {} });
  values.set("marketbrief.theses.v1", "{corrupt");
  assert.deepEqual(await store.load(), { version: 1, bySymbol: {} });
});

test("thesis remains user context rather than evidence", async () => {
  const request = parseIntelligenceRequest({ task: "ask", symbols: ["AMD"], question: "What changed vs my thesis?", contextMode: "thesis", userThesis: { symbol: "AMD", text: "I follow data center margins." } });
  assert.equal(request.userThesis?.text, "I follow data center margins.");
  assert.throws(() => parseIntelligenceRequest({ task: "ask", symbols: ["AMD"], question: "Thesis?", contextMode: "thesis", userThesis: { symbol: "AAPL", text: "Mismatch" } }), /match a requested symbol/);
  const provider = new MockStructuredAIProvider();
  const response = await provider.generateStructuredResponse({ request, evidence: [], untrustedContext: "<untrusted_evidence>[]</untrusted_evidence>" });
  const text = JSON.stringify(response);
  assert.match(text, /No new evidence directly relevant/);
  assert.match(text, /context, not evidence/);
  assert.doesNotMatch(text, /thesis is correct|thesis is incorrect/i);
});

test("watchlist groups support overlapping membership and validated persistence", async () => {
  let state = groupsReducer(initialGroupState, { type: "create", id: "ai", name: "AI" });
  state = groupsReducer(state, { type: "create", id: "long", name: "Long term" });
  state = groupsReducer(state, { type: "toggle-symbol", id: "ai", symbol: "AMD" });
  state = groupsReducer(state, { type: "toggle-symbol", id: "long", symbol: "AMD" });
  assert.deepEqual(state.groups.map((group) => group.symbols), [["AMD"], ["AMD"]]);
  assert.equal(groupsReducer(state, { type: "create", id: "duplicate", name: " ai " }), state);
  const values = new Map<string, string>();
  const adapter: StorageAdapter = { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); }, removeItem: async (key) => { values.delete(key); } };
  const store = createGroupStore(adapter);
  await store.save(state);
  assert.deepEqual(await store.load(), state);
  values.set("marketbrief.groups.v1", "{bad json");
  assert.deepEqual(await store.load(), initialGroupState);
});

test("validated REAL brief history persists separately and computes honest deltas", async () => {
  const response = (generatedAt: string, sourceIds: string[], kinds: ("confirmed" | "uncertainty" | "catalyst")[]) => ({
    headline: "Evidence brief", oneLineSummary: "Summary", generatedAt, symbols: ["AAPL"], sourceIds,
    sources: sourceIds.map((id) => ({ id, type: "news" as const })),
    sections: [{ id: "s", title: "Things worth knowing", bullets: kinds.map((kind, index) => ({ id: `b${index}`, text: `${kind} claim`, kind, sourceIds: kind === "uncertainty" ? [] : [sourceIds[Math.min(index, sourceIds.length - 1)]!] })) }],
    meta: { task: "brief" as const, provider: "test", providerMode: "live" as const, cached: false, evidenceCount: sourceIds.length, schemaVersion: "test" },
  });
  const previous = makeRealBriefRecord(response("2026-08-08T12:00:00.000Z", ["old"], ["confirmed", "uncertainty"]), "morning", "2026-08-08T11:59:00.000Z");
  const current = makeRealBriefRecord(response("2026-08-09T12:00:00.000Z", ["old", "new"], ["confirmed", "catalyst"]), "morning", "2026-08-09T11:59:00.000Z");
  assert.deepEqual(compareRealBriefs(current, previous), { newDevelopments: 1, newCatalysts: 1, uncertaintiesResolved: 1 });
  const values = new Map<string, string>();
  const adapter: StorageAdapter = { getItem: async (key) => values.get(key) ?? null, setItem: async (key, value) => { values.set(key, value); }, removeItem: async (key) => { values.delete(key); } };
  const store = createRealBriefStore(adapter);
  await store.save([previous, current]);
  assert.deepEqual((await store.load()).map((record) => record.id), [current.id, previous.id]);
  values.set("marketbrief.real-briefs.v1", "{corrupt");
  assert.deepEqual(await store.load(), []);
});
