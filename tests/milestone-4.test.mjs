import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("Milestone 4 registers Briefs home and detail routes", async () => {
  const [layout, tabs, home, detail] = await Promise.all([
    read("src/app/_layout.tsx"),
    read("src/app/(tabs)/_layout.tsx"),
    read("src/app/(tabs)/briefs.tsx"),
    read("src/app/brief/[briefId].tsx"),
  ]);
  assert.match(layout, /BriefsProvider/);
  assert.match(layout, /name="brief\/\[briefId\]"/);
  assert.match(tabs, /name="briefs"/);
  assert.match(home, /BriefTypeSelector/);
  assert.match(home, /BriefFilterSheet/);
  assert.match(detail, /Share\.share/);
  assert.match(detail, /markRead/);
});

test("Briefs and Today personalize from the persistent shared watchlist", async () => {
  const [today, home, detail] = await Promise.all([
    read("src/app/(tabs)/index.tsx"),
    read("src/app/(tabs)/briefs.tsx"),
    read("src/app/brief/[briefId].tsx"),
  ]);
  for (const source of [today, home, detail]) {
    assert.match(source, /useWatchlist/);
    assert.match(source, /watchlistState\.symbols/);
    assert.doesNotMatch(source, /onboardingState\.stocks/);
  }
  assert.match(today, /latestBriefSeed\("morning"\)/);
  assert.match(today, /router\.push\(`\/brief\/\$\{morningBrief\.id\}`/);
  assert.doesNotMatch(today, /briefingOpen|briefingPoints/);
  assert.match(detail, /router\.push\(`\/stock\/\$\{impact\.symbol\}`/);
});

test("Milestone 4 routes expose working states and actions", async () => {
  const [home, detail, provider] = await Promise.all([
    read("src/app/(tabs)/briefs.tsx"),
    read("src/app/brief/[briefId].tsx"),
    read("src/features/briefs/BriefsProvider.tsx"),
  ]);
  for (const state of ["loading", "offline", "error", "empty-watchlist"]) {
    assert.match(home + detail, new RegExp(state));
  }
  assert.match(home, /router\.replace\("\/briefs"/);
  assert.match(home, /RefreshControl/);
  assert.match(detail, /insufficient/);
  assert.match(detail, /toggleSaved/);
  assert.match(provider, /catch\(\(\) => undefined\)/);
  assert.match(provider, /finally/);
  assert.match(provider, /setHydrated\(true\)/);
});

test("Milestone 4 reusable brief components and typed modules exist", async () => {
  const componentFiles = await readdir(new URL("src/components/briefs/", root));
  for (const component of [
    "BriefHeroCard.tsx",
    "BriefTypeSelector.tsx",
    "BriefStatusBadge.tsx",
    "BriefHistoryRow.tsx",
    "BriefFilterSheet.tsx",
    "BriefStockImpactRow.tsx",
    "BriefEvidenceCard.tsx",
    "BriefEventRow.tsx",
    "BriefActions.tsx",
    "BriefEmptyState.tsx",
  ]) assert.ok(componentFiles.includes(component), `${component} should exist`);
  for (const module of [
    "src/data/briefs/types.ts",
    "src/data/briefs/templates.ts",
    "src/data/briefs/generator.ts",
    "src/features/briefs/model.ts",
    "src/storage/briefsCore.ts",
  ]) await access(new URL(module, root));
});

test("Milestone 4 remains a local illustrative shell", async () => {
  const files = [
    "src/data/briefs/generator.ts",
    "src/features/briefs/BriefsProvider.tsx",
    "src/app/(tabs)/briefs.tsx",
    "src/app/brief/[briefId].tsx",
  ];
  const source = (await Promise.all(files.map(read))).join("\n");
  assert.doesNotMatch(source, /fetch\(|axios|supabase|openai|stripe|pushToken|brokerage/i);
  assert.match(source, /local|illustrative|demo/i);
  assert.match(source, /Not investment advice/i);
});
