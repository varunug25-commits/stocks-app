import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("uses Expo Router as the native application foundation", async () => {
  const [packageJson, appConfig, rootLayout, tabsLayout] = await Promise.all([
    read("package.json"),
    read("app.json"),
    read("src/app/_layout.tsx"),
    read("src/app/(tabs)/_layout.tsx"),
  ]);

  assert.match(packageJson, /"main": "expo-router\/entry"/);
  assert.match(appConfig, /"userInterfaceStyle": "dark"/);
  assert.match(rootLayout, /GestureHandlerRootView/);
  assert.match(tabsLayout, /<Tabs/);
  assert.match(tabsLayout, /Haptics\.selectionAsync/);
});

test("keeps forbidden integrations out of the design shell", async () => {
  const packageJson = await read("package.json");
  const sourceFiles = await readdir(new URL("src/", root), { recursive: true });
  const source = await Promise.all(
    sourceFiles
      .filter((path) => path.endsWith(".ts") || path.endsWith(".tsx"))
      .map((path) => read(`src/${path}`)),
  ).then((files) => `${packageJson}\n${files.join("\n")}`);

  assert.doesNotMatch(source, /supabase/i);
  assert.doesNotMatch(source, /openai/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /@supabase|supabase-js|openai|stripe/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
});

test("ships every Phase 2 Milestone 1 route and preserves the Today tabs", async () => {
  const files = await readdir(new URL("src/app/", root), { recursive: true });
  for (const route of [
    "splash.tsx", "login.tsx", "sign-up.tsx", "forgot-password.tsx", "verify-email.tsx",
    "welcome.tsx", "experience.tsx", "goals.tsx", "interests.tsx", "stocks.tsx", "notifications.tsx", "complete.tsx",
    "(tabs)/index.tsx", "(tabs)/markets.tsx", "(tabs)/watchlist.tsx", "(tabs)/profile.tsx",
  ]) assert.ok(files.some((file) => file.endsWith(route)), `${route} should exist`);
});

test("labels interactive auth and onboarding controls for assistive technology", async () => {
  const [fields, selections, providers, stocks] = await Promise.all([
    read("src/components/foundation/FormField.tsx"), read("src/components/foundation/Selections.tsx"),
    read("src/components/foundation/AuthProviderButton.tsx"), read("src/app/(onboarding)/stocks.tsx"),
  ]);
  assert.match(fields, /accessibilityLabel=\{label\}/);
  assert.match(selections, /accessibilityRole="radio"/);
  assert.match(selections, /accessibilityRole="checkbox"/);
  assert.match(providers, /accessibilityLabel/);
  assert.match(stocks, /accessibilityState/);
});

test("ships the Today feed as typed reusable mobile components", async () => {
  const [todayScreen, inventory] = await Promise.all([
    read("src/app/(tabs)/index.tsx"),
    readdir(new URL("src/components/", root), { recursive: true }),
  ]);

  for (const component of [
    "CompanyLogo.tsx",
    "MarketIndexCard.tsx",
    "StockRow.tsx",
    "StoryCard.tsx",
    "EditorialHero.tsx",
    "AIBriefingCard.tsx",
    "EventCard.tsx",
    "SourceCitation.tsx",
    "EmptyState.tsx",
    "SkeletonState.tsx",
    "AppBottomSheet.tsx",
    "SubscriptionPaywall.tsx",
  ]) {
    assert.ok(inventory.some((path) => path.endsWith(component)), `${component} should exist`);
  }

  assert.match(todayScreen, /RefreshControl/);
  assert.match(todayScreen, /briefingOpen/);
  assert.match(todayScreen, /marketIndices\.map/);
  assert.match(todayScreen, /watchlist\.map/);
});

test("onboarding hydration and splash routing fail safely", async () => {
  const [provider, splash] = await Promise.all([
    read("src/features/onboarding/OnboardingProvider.tsx"),
    read("src/app/splash.tsx"),
  ]);
  assert.match(provider, /catch\s*\{/);
  assert.match(provider, /finally\s*\{/);
  assert.match(provider, /setHydrated\(true\)/);
  assert.match(splash, /resolveSplashRoute/);
});
