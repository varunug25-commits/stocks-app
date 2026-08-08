import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("premium foundation stays dark, restrained, and semantically colored", async () => {
  const [tokens, screen, tabs] = await Promise.all([
    read("src/theme/tokens.ts"),
    read("src/components/foundation/Screen.tsx"),
    read("src/components/navigation/BottomTabBar.tsx"),
  ]);
  assert.match(tokens, /background: "#050708"/);
  assert.match(tokens, /textPrimary: "#F4F1E8"/);
  assert.match(tokens, /positive: "#49D98A"/);
  assert.match(tokens, /negative: "#FF6B74"/);
  assert.match(screen, /backgroundColor: colors\.background/);
  assert.match(tabs, /activeIndicator/);
  assert.doesNotMatch(tabs, /sparkles/);
  assert.doesNotMatch(tabs, /iconWrapActive/);
});

test("Today uses the approved finance-first information order", async () => {
  const today = await read("src/app/(tabs)/index.tsx");
  const sections = ["Watchlist summary", "What changed", "Next up", "MORNING BRIEF", "Market context"];
  let previous = -1;
  for (const section of sections) {
    const next = today.indexOf(section);
    assert.ok(next > previous, `${section} should follow the previous Today section`);
    previous = next;
  }
  assert.match(today, /ResourceStateNotice/);
  assert.match(today, /1D moves/);
  assert.match(today, /ILLUSTRATIVE PREVIEW/);
  assert.doesNotMatch(today, /DataModeBanner|EditorialHero|AIBriefingCard/);
});

test("Markets removes unsupported mood scoring and reports unavailable coverage", async () => {
  const markets = await read("src/app/(tabs)/markets.tsx");
  assert.doesNotMatch(markets, /MarketMoodCard|marketMood/);
  assert.match(markets, /Commodities & currencies/);
  assert.match(markets, /does not display invented values/);
  assert.match(markets, /Top movers/);
});

test("Watchlist management is explicit and default rows stay compact", async () => {
  const [screen, row] = await Promise.all([
    read("src/app/(tabs)/watchlist.tsx"),
    read("src/components/stock/WatchlistRow.tsx"),
  ]);
  assert.match(screen, /setEditing/);
  assert.match(screen, /editing \? "Done" : "Edit"/);
  assert.match(screen, /trend=\{localWatchlistRows/);
  assert.match(row, /editing \?/);
  assert.match(row, /Sparkline/);
  assert.match(row, /formatFreshness/);
  assert.match(row, /caret-up/);
  assert.match(row, /caret-down/);
});

test("all five bottom-tab destinations remain registered", async () => {
  const layout = await read("src/app/(tabs)/_layout.tsx");
  for (const route of ["index", "markets", "watchlist", "briefs", "profile"]) {
    assert.match(layout, new RegExp(`name="${route}"`));
  }
});

test("stock stories preserve non-ISO provider labels instead of showing Invalid Date", async () => {
  const storyRow = await read("src/components/stock/StoryRow.tsx");
  assert.match(storyRow, /Number\.isFinite\(parsedPublishedAt\)/);
  assert.match(storyRow, /: story\.publishedAt/);
});
