import { isOnboardingState } from "../features/onboarding/model.ts";
import type { OnboardingState } from "../features/onboarding/model.ts";

export type StorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

export const STORAGE_KEYS = {
  onboarding: "marketbrief.onboarding.v1",
  mockSession: "marketbrief.mock-session.v1",
} as const;

export function parseOnboardingState(stored: string): OnboardingState | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isOnboardingState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function loadOnboardingFrom(adapter: StorageAdapter): Promise<OnboardingState | null> {
  const stored = await adapter.getItem(STORAGE_KEYS.onboarding);
  if (!stored) return null;
  const parsed = parseOnboardingState(stored);
  if (parsed) return parsed;
  try {
    await adapter.removeItem(STORAGE_KEYS.onboarding);
  } catch {
    // Invalid local data is ignored even when best-effort cleanup is unavailable.
  }
  return null;
}

export async function saveOnboardingTo(state: OnboardingState, adapter: StorageAdapter) {
  await adapter.setItem(STORAGE_KEYS.onboarding, JSON.stringify(state));
}

export async function loadMockSessionFrom(adapter: StorageAdapter) {
  return (await adapter.getItem(STORAGE_KEYS.mockSession)) === "active";
}

export async function saveMockSessionTo(active: boolean, adapter: StorageAdapter) {
  if (active) await adapter.setItem(STORAGE_KEYS.mockSession, "active");
  else await adapter.removeItem(STORAGE_KEYS.mockSession);
}

export async function clearLocalDemoFrom(adapter: StorageAdapter) {
  await Promise.all([adapter.removeItem(STORAGE_KEYS.onboarding), adapter.removeItem(STORAGE_KEYS.mockSession)]);
}
