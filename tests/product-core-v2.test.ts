import assert from "node:assert/strict";
import test from "node:test";

import { calculatePriceContext } from "../src/features/materiality/unusualMove.ts";
import { detectMaterialChanges } from "../src/features/materiality/engine.ts";
import { createSeenChangeStore, createSnapshotStore } from "../src/features/materiality/storage.ts";
import type { WatchlistSnapshot } from "../src/features/materiality/types.ts";
import type { StorageAdapter } from "../src/storage/preferencesCore.ts";

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
