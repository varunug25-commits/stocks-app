import assert from "node:assert/strict";
import test from "node:test";

import {
  briefHistory,
  buildBriefShareText,
  findBriefSeed,
  generateBrief,
  getBriefShareResultMessage,
  latestBriefSeed,
} from "../src/data/briefs/index.ts";
import {
  briefsReducer,
  initialBriefsState,
} from "../src/features/briefs/model.ts";
import {
  selectBriefStatus,
  selectFilteredBriefs,
} from "../src/features/briefs/selectors.ts";
import {
  BRIEFS_STORAGE_KEY,
  loadBriefsFrom,
  parseBriefsState,
  saveBriefsTo,
} from "../src/storage/briefsCore.ts";
import type { StorageAdapter } from "../src/storage/preferencesCore.ts";

test("Morning Brief generation answers the four core questions", () => {
  const brief = generateBrief(latestBriefSeed("morning"), ["NVDA", "AAPL"]);
  assert.equal(brief.type, "morning");
  assert.equal(brief.developments.length, 3);
  assert.ok(brief.marketContext);
  assert.deepEqual(brief.watchlistImpacts.map((item) => item.symbol), ["NVDA", "AAPL"]);
  assert.equal(brief.monitor.length, 3);
  assert.deepEqual(brief.evidence.map((item) => item.kind), ["FACT", "INTERPRETATION", "UNCERTAINTY"]);
});

test("Evening Recap generation includes close context and tomorrow signals", () => {
  const brief = generateBrief(latestBriefSeed("evening"), ["TSLA", "MSFT"]);
  assert.equal(brief.type, "evening");
  assert.match(brief.marketDirection, /Nasdaq|S&P 500/);
  assert.match(brief.headline, /Growth led the close/);
  assert.match(brief.changeSinceMorning ?? "", /opening|close/i);
  assert.ok(brief.positiveScenario);
  assert.ok(brief.riskScenario);
});

test("every historical edition has date-specific editorial content", () => {
  const editions = briefHistory.map((seed) => generateBrief(seed, ["AAPL", "NVDA"]));
  for (const type of ["morning", "evening"] as const) {
    const typed = editions.filter((brief) => brief.type === type);
    const values = [
      typed.map((brief) => brief.headline),
      typed.map((brief) => brief.summary),
      typed.map((brief) => JSON.stringify(brief.developments)),
      typed.map((brief) => brief.marketContext),
      typed.map((brief) => JSON.stringify(brief.monitor)),
      typed.map((brief) => brief.evidence.find((item) => item.kind === "FACT")?.body),
      typed.map((brief) => brief.evidence.find((item) => item.kind === "INTERPRETATION")?.body),
      typed.map((brief) => brief.evidence.find((item) => item.kind === "UNCERTAINTY")?.body),
    ];
    for (const fieldValues of values)
      assert.equal(new Set(fieldValues).size, typed.length);
    if (type === "evening")
      assert.equal(new Set(typed.map((brief) => brief.changeSinceMorning)).size, typed.length);
  }
  for (const edition of editions)
    assert.equal(findBriefSeed(edition.id)?.headline, edition.headline);
});

test("brief generation is deterministic for the same edition and watchlist", () => {
  const seed = findBriefSeed("evening-2026-08-06")!;
  const first = generateBrief(seed, ["NVDA", "AAPL", "AMD"]);
  const second = generateBrief(seed, ["NVDA", "AAPL", "AMD"]);
  assert.deepEqual(first, second);
});

test("brief personalization preserves active watchlist membership and order", () => {
  const brief = generateBrief(latestBriefSeed("morning"), ["PLTR", "AAPL", "AMD"]);
  assert.deepEqual(brief.watchlistImpacts.map((item) => item.symbol), ["PLTR", "AAPL", "AMD"]);
  assert.equal(brief.watchlistImpacts.length, 3);
});

test("empty watchlist keeps useful market context without duplicating membership", () => {
  const brief = generateBrief(latestBriefSeed("morning"), []);
  assert.deepEqual(brief.watchlistImpacts, []);
  assert.match(brief.summary, /shared watchlist/);
  assert.ok(brief.marketContext);
});

test("insufficient evidence never invents a reason", () => {
  const brief = generateBrief(latestBriefSeed("evening"), ["NFLX"], { insufficientEvidence: true });
  assert.equal(brief.sufficientEvidence, false);
  assert.equal(brief.confidence, "Low");
  assert.match(brief.summary, /will not invent/);
  assert.match(brief.evidence[2]?.body ?? "", /filing|statement|source/i);
});

test("every claim references a relevant source included in the edition", () => {
  const brief = generateBrief(latestBriefSeed("morning"), ["AAPL", "NVDA"]);
  const claimSourceIds = [
    ...brief.marketSourceIds,
    ...brief.evidence.flatMap((claim) => claim.sourceIds),
    ...brief.watchlistImpacts.flatMap((claim) => claim.sourceIds),
    ...brief.events.flatMap((claim) => claim.sourceIds),
  ];
  const referenced = [...new Set(claimSourceIds)].sort();
  const resolved = brief.sources.map((source) => source.id).sort();
  assert.deepEqual(resolved, referenced);
  assert.ok(brief.sources.every((source) => source.supports.length > 0));
  assert.ok(brief.events.some((event) => event.kind === "filing" && event.sourceIds.includes("sec")));
  assert.ok(brief.sources.some((source) => source.id === "sec"));

  const noFiling = generateBrief(latestBriefSeed("morning"), []);
  assert.equal(noFiling.events.some((event) => event.sourceIds.includes("sec")), false);
  assert.equal(noFiling.sources.some((source) => source.id === "sec"), false);

  const insufficient = generateBrief(latestBriefSeed("morning"), ["NFLX"], { insufficientEvidence: true });
  assert.deepEqual(insufficient.evidence.find((claim) => claim.kind === "INTERPRETATION")?.sourceIds, []);
  assert.deepEqual(insufficient.watchlistImpacts[0]?.sourceIds, ["market"]);
  const insufficientReferenced = new Set([
    ...insufficient.marketSourceIds,
    ...insufficient.evidence.flatMap((claim) => claim.sourceIds),
    ...insufficient.watchlistImpacts.flatMap((claim) => claim.sourceIds),
    ...insufficient.events.flatMap((claim) => claim.sourceIds),
  ]);
  assert.deepEqual(
    insufficient.sources.map((source) => source.id).sort(),
    [...insufficientReferenced].sort(),
  );
});

test("read, save, unsave and Morning or Evening selection update immediately", () => {
  const id = "morning-2026-08-07";
  let state = briefsReducer(initialBriefsState, { type: "markRead", id });
  assert.equal(selectBriefStatus(id, state), "Read");
  state = briefsReducer(state, { type: "toggleSaved", id });
  assert.equal(selectBriefStatus(id, state), "Saved");
  state = briefsReducer(state, { type: "toggleSaved", id });
  assert.equal(selectBriefStatus(id, state), "Read");
  state = briefsReducer(state, { type: "selectType", value: "evening" });
  assert.equal(state.selectedType, "evening");
});

test("saved and unread filters select the expected brief history", () => {
  const savedId = briefHistory[0]!.id;
  let state = briefsReducer(initialBriefsState, { type: "toggleSaved", id: savedId });
  state = briefsReducer(state, { type: "statusFilter", value: "saved" });
  assert.deepEqual(selectFilteredBriefs(briefHistory, state).map((item) => item.id), [savedId]);
  state = briefsReducer(state, { type: "statusFilter", value: "unread" });
  state = briefsReducer(state, { type: "markRead", id: savedId });
  assert.equal(selectFilteredBriefs(briefHistory, state).some((item) => item.id === savedId), false);
  state = briefsReducer(state, { type: "typeFilter", value: "evening" });
  assert.ok(selectFilteredBriefs(briefHistory, state).every((item) => item.type === "evening"));
});

test("Briefs persistence round-trips and corrupted JSON recovers safely", async () => {
  const values = new Map<string, string>();
  const adapter: StorageAdapter = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
    removeItem: async (key) => { values.delete(key); },
  };
  const state = briefsReducer(initialBriefsState, { type: "toggleSaved", id: "morning-2026-08-07" });
  await saveBriefsTo(state, adapter);
  assert.deepEqual(await loadBriefsFrom(adapter), state);
  values.set(BRIEFS_STORAGE_KEY, "{broken");
  assert.equal(parseBriefsState("{broken"), null);
  assert.equal(await loadBriefsFrom(adapter), null);
  assert.equal(values.has(BRIEFS_STORAGE_KEY), false);
});

test("storage read failures remain catchable by the provider", async () => {
  const adapter: StorageAdapter = {
    getItem: async () => { throw new Error("unavailable"); },
    setItem: async () => undefined,
    removeItem: async () => undefined,
  };
  await assert.rejects(loadBriefsFrom(adapter), /unavailable/);
});

test("share payload identifies demo content and avoids a fake link", () => {
  const brief = generateBrief(latestBriefSeed("morning"), ["NVDA"]);
  const text = buildBriefShareText(brief);
  assert.match(text, /MarketBrief/);
  assert.match(text, /Morning Brief/);
  assert.match(text, /Demo content/);
  assert.match(text, /informational purposes only/);
  assert.doesNotMatch(text, /https?:\/\//);
});

test("share feedback distinguishes success, dismissal and unknown results", () => {
  assert.equal(getBriefShareResultMessage("shared", "shared", "dismissed"), "Demo brief shared.");
  assert.match(getBriefShareResultMessage("dismissed", "shared", "dismissed"), /cancelled/);
  assert.match(getBriefShareResultMessage("unknown", "shared", "dismissed"), /without a confirmed result/);
});
