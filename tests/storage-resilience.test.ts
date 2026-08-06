import assert from "node:assert/strict";
import test from "node:test";
import { initialOnboardingState } from "../src/features/onboarding/model.ts";
import { resolveSplashRoute } from "../src/features/splash/resolveSplashRoute.ts";
import { loadOnboardingFrom, saveOnboardingTo } from "../src/storage/preferencesCore.ts";
import type { StorageAdapter } from "../src/storage/preferencesCore.ts";

function adapter(overrides: Partial<StorageAdapter> = {}): StorageAdapter {
  return {
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
    ...overrides,
  };
}

test("corrupted and structurally invalid onboarding JSON are rejected and removed", async () => {
  const removed: string[] = [];
  const corrupted = adapter({ getItem: async () => "{broken", removeItem: async (key) => { removed.push(key); } });
  assert.equal(await loadOnboardingFrom(corrupted), null);
  assert.equal(removed.length, 1);

  const invalidShape = adapter({ getItem: async () => JSON.stringify({ ...initialOnboardingState, completed: "yes" }) });
  assert.equal(await loadOnboardingFrom(invalidShape), null);
});

test("valid onboarding JSON is accepted", async () => {
  const valid = { ...initialOnboardingState, experience: "Intermediate" as const, stocks: ["AAPL", "MSFT", "NVDA"] };
  assert.deepEqual(await loadOnboardingFrom(adapter({ getItem: async () => JSON.stringify(valid) })), valid);
});

test("rejected storage reads and writes remain observable to their callers", async () => {
  const failure = new Error("storage unavailable");
  await assert.rejects(loadOnboardingFrom(adapter({ getItem: async () => { throw failure; } })), failure);
  await assert.rejects(saveOnboardingTo(initialOnboardingState, adapter({ setItem: async () => { throw failure; } })), failure);
});

test("invalid-data cleanup failure still returns a safe empty state", async () => {
  const failingCleanup = adapter({ getItem: async () => "not-json", removeItem: async () => { throw new Error("read only"); } });
  assert.equal(await loadOnboardingFrom(failingCleanup), null);
});

test("splash routes to login when either storage read rejects", async () => {
  const failure = async () => { throw new Error("storage unavailable"); };
  assert.equal(await resolveSplashRoute({ loadSession: failure, loadOnboarding: async () => initialOnboardingState }), "/(auth)/login");
  assert.equal(await resolveSplashRoute({ loadSession: async () => true, loadOnboarding: failure }), "/(auth)/login");
});
