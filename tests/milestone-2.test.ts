import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { searchLocalStocks } from "../src/data/search.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root), "utf8");

test("local stock search matches symbols and company names", () => {
  assert.deepEqual(searchLocalStocks("aapl").map(stock => stock.symbol), ["AAPL"]);
  assert.deepEqual(searchLocalStocks("micro").map(stock => stock.symbol), ["MSFT", "AMD"]);
  assert.deepEqual(searchLocalStocks("does-not-exist"), []);
  assert.deepEqual(searchLocalStocks("   "), []);
});

test("Milestone 2 exposes five mobile tabs and global search", async () => {
  const [tabs, layout, rootLayout] = await Promise.all([
    read("src/components/navigation/BottomTabBar.tsx"),
    read("src/app/(tabs)/_layout.tsx"),
    read("src/app/_layout.tsx"),
  ]);
  assert.match(tabs, /accessibilityRole="tab"/);
  for (const label of ["Today", "Markets", "Watchlist", "Briefs", "Profile"]) assert.match(layout, new RegExp(`title: "${label}"`));
  for (const route of ["index", "markets", "watchlist", "briefs", "profile"]) assert.match(layout, new RegExp(`name="${route}"`));
  assert.match(rootLayout, /name="search"/);
});

test("Milestone 2 screens provide required local and failure states", async () => {
  const [today, markets, search, watchlist, briefs, profile] = await Promise.all([
    read("src/app/(tabs)/index.tsx"), read("src/app/(tabs)/markets.tsx"), read("src/app/search.tsx"),
    read("src/app/(tabs)/watchlist.tsx"), read("src/app/(tabs)/briefs.tsx"), read("src/app/(tabs)/profile.tsx"),
  ]);
  assert.match(today, /preview === "loading"/);
  assert.match(today, /preview === "offline"/);
  assert.match(today, /preview === "closed"/);
  assert.match(today, /ErrorState/);
  assert.match(today, /EmptyState/);
  assert.match(today, /state\.stocks/);
  assert.match(today, /Intl\.DateTimeFormat/);
  assert.doesNotMatch(today, /MONDAY, AUGUST 3/);
  assert.match(today, /useReducedMotion/);
  assert.match(markets, /marketIndices\.map/);
  assert.match(markets, /sectors\.map/);
  assert.match(markets, /topGainers/);
  assert.match(search, /searchLocalStocks/);
  assert.match(search, /No matches found/);
  assert.match(watchlist, /state\.stocks/);
  assert.match(briefs, /Milestone 4/);
  assert.match(profile, /Local preferences/);
});
