import AsyncStorage from "@react-native-async-storage/async-storage";

import type { OnboardingState } from "@/features/onboarding/model";

export type StorageAdapter = Pick<typeof AsyncStorage, "getItem" | "setItem" | "removeItem">;

const KEYS = {
  onboarding: "marketbrief.onboarding.v1",
  mockSession: "marketbrief.mock-session.v1",
} as const;

export async function loadOnboarding(adapter: StorageAdapter = AsyncStorage): Promise<OnboardingState | null> {
  const stored = await adapter.getItem(KEYS.onboarding);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as OnboardingState;
  } catch {
    await adapter.removeItem(KEYS.onboarding);
    return null;
  }
}

export async function saveOnboarding(state: OnboardingState, adapter: StorageAdapter = AsyncStorage) {
  await adapter.setItem(KEYS.onboarding, JSON.stringify(state));
}

export async function loadMockSession(adapter: StorageAdapter = AsyncStorage) {
  return (await adapter.getItem(KEYS.mockSession)) === "active";
}

export async function saveMockSession(active: boolean, adapter: StorageAdapter = AsyncStorage) {
  if (active) await adapter.setItem(KEYS.mockSession, "active");
  else await adapter.removeItem(KEYS.mockSession);
}

export async function clearLocalDemo(adapter: StorageAdapter = AsyncStorage) {
  await Promise.all([adapter.removeItem(KEYS.onboarding), adapter.removeItem(KEYS.mockSession)]);
}
