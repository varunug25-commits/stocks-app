import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  const [packageJson, todayScreen] = await Promise.all([
    read("package.json"),
    read("src/app/(tabs)/index.tsx"),
  ]);

  const source = `${packageJson}\n${todayScreen}`;
  assert.doesNotMatch(source, /supabase/i);
  assert.doesNotMatch(source, /openai/i);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /signIn|signUp|auth/i);
});

