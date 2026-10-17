import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { colors } from "../src/theme/tokens.ts";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

function luminance(hex) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

const contrast = (left, right) => (Math.max(luminance(left), luminance(right)) + 0.05) / (Math.min(luminance(left), luminance(right)) + 0.05);

test("premium foundation stays dark, restrained, and semantically colored", async () => {
  const [screen, tabs] = await Promise.all([
    read("src/components/foundation/Screen.tsx"),
    read("src/components/navigation/BottomTabBar.tsx"),
  ]);
  assert.ok(luminance(colors.background) < 0.02, "The app canvas must remain near-black");
  for (const surface of [colors.background, colors.surface, colors.surfaceElevated, colors.surfaceSoft]) {
    for (const foreground of [colors.textPrimary, colors.textSecondary, colors.textTertiary, colors.teal, colors.positive, colors.negative]) {
      assert.ok(contrast(foreground, surface) >= 4.5, `${foreground} must have readable small-text contrast on ${surface}`);
    }
  }
  assert.notEqual(colors.teal, colors.positive, "Brand actions must be distinguishable from market gains");
  assert.notEqual(colors.teal, colors.negative);
  assert.match(screen, /backgroundColor: colors\.background/);
  assert.match(tabs, /activeIndicator/);
  assert.doesNotMatch(tabs, /sparkles/);
  assert.doesNotMatch(tabs, /iconWrapActive/);
});

test("Today uses the approved finance-first information order", async () => {
  const today = await read("src/app/(tabs)/index.tsx");
  const sections = ["SINCE YOU LAST CHECKED", "Your other stocks", "What matters next", "Morning brief", 'label="Ask MarketBrief"'];
  let previous = -1;
  for (const section of sections) {
    const next = today.indexOf(section);
    assert.ok(next > previous, `${section} should follow the previous Today section`);
    previous = next;
  }
  assert.match(today, /MaterialChangeRow/);
  assert.match(today, /Nothing material changed/);
  assert.match(today, /Your baseline is ready/);
  assert.doesNotMatch(today, /DataModeBanner|EditorialHero|AIBriefingCard/);
});

test("Pulse derives truthful watchlist intelligence without market-wide fixtures", async () => {
  const markets = await read("src/app/(tabs)/markets.tsx");
  assert.doesNotMatch(markets, /MarketMoodCard|marketMood/);
  assert.match(markets, /calculateWatchlistBreadth/);
  assert.match(markets, /deriveWatchlistPatterns/);
  assert.match(markets, /within your watchlist/);
  assert.doesNotMatch(markets, /marketIndices|sectorPerformance|topGainers/);
});

test("Watchlist management is explicit and default rows stay compact", async () => {
  const [screen, row] = await Promise.all([
    read("src/app/(tabs)/watchlist.tsx"),
    read("src/components/stock/WatchlistRow.tsx"),
  ]);
  assert.match(screen, /setEditing/);
  assert.match(screen, /editing \? "Done" : "Edit"/);
  assert.match(screen, /trend=\{mode === "DEMO" \? localWatchlistRows/);
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

test("selected mobile controls expose equivalent native and web accessibility state", async () => {
  const [chart, editions, tabs, actions] = await Promise.all([
    read("src/components/stock/ChartRangeSelector.tsx"),
    read("src/components/briefs/BriefTypeSelector.tsx"),
    read("src/components/navigation/BottomTabBar.tsx"),
    read("src/components/briefs/BriefActions.tsx"),
  ]);
  // React Native Web does not serialize accessibilityState for these controls.
  for (const [source, expression] of [[chart, "value === range"], [editions, "selected"]]) {
    assert.ok(source.includes(`accessibilityState={{ checked: ${expression} }}`));
    assert.ok(source.includes(`aria-checked={${expression}}`));
    assert.match(source, /accessibilityRole="radio"/);
  }
  assert.match(tabs, /accessibilityState=\{\{ selected: focused \}\}/);
  assert.match(tabs, /aria-selected=\{focused\}/);
  assert.match(actions, /aria-pressed=\{saved\}/);
  const chartView = await read("src/components/stock/PriceChart.tsx");
  assert.match(chartView, /new ResizeObserver\(measure\)/);
  assert.match(chartView, /observer\?\.disconnect\(\)/);
  assert.match(chartView, /\}, \[unavailable\]\)/);
  assert.match(chartView, /viewBox=\{`0 0 \$\{width\} \$\{H\}`\}/);
});

test("stock stories preserve non-ISO provider labels instead of showing Invalid Date", async () => {
  const storyRow = await read("src/components/stock/StoryRow.tsx");
  assert.match(storyRow, /Number\.isFinite\(parsedPublishedAt\)/);
  assert.match(storyRow, /: story\.publishedAt/);
});

test("final product polish keeps debug and implementation language out of customer screens", async () => {
  const [today, watchlist, profile, demo, tabs] = await Promise.all([
    read("src/app/(tabs)/index.tsx"),
    read("src/app/(tabs)/watchlist.tsx"),
    read("src/app/(tabs)/profile.tsx"),
    read("src/data/real/demo.ts"),
    read("src/components/navigation/BottomTabBar.tsx"),
  ]);
  assert.match(today, /SINCE YOU LAST CHECKED/);
  assert.match(today, /baselineMovers[\s\S]*slice\(0, 3\)/);
  assert.doesNotMatch(today, /investor view|settings|bug-outline/);
  assert.doesNotMatch(watchlist, /Watchlist limit reached/);
  assert.doesNotMatch(profile, /Subscription|Not connected|M7 AI/);
  assert.doesNotMatch(`${today}${watchlist}${profile}${demo}`, /demo fixtures|local fixtures|this milestone/i);
  assert.match(tabs, /GlassBackdrop/);
});

test("Pulse uses supported watchlist resources and avoids market-wide claims", async () => {
  const markets = await read("src/app/(tabs)/markets.tsx");
  assert.match(markets, /useChangeDetection/);
  assert.match(markets, /quotes\[symbol\]/);
  assert.match(markets, /events\[symbol\]/);
  assert.match(markets, /does not claim sector-wide or market-wide causation/);
});
