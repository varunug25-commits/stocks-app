import {
  isBriefsState,
  type BriefsState,
} from "../features/briefs/model.ts";
import type { StorageAdapter } from "./preferencesCore.ts";

export const BRIEFS_STORAGE_KEY = "marketbrief.briefs.v1";

export function parseBriefsState(stored: string): BriefsState | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isBriefsState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function loadBriefsFrom(adapter: StorageAdapter) {
  const stored = await adapter.getItem(BRIEFS_STORAGE_KEY);
  if (!stored) return null;
  const parsed = parseBriefsState(stored);
  if (parsed) return parsed;
  try {
    await adapter.removeItem(BRIEFS_STORAGE_KEY);
  } catch {
    // Invalid local data is ignored even if best-effort cleanup fails.
  }
  return null;
}

export async function saveBriefsTo(
  state: BriefsState,
  adapter: StorageAdapter,
) {
  await adapter.setItem(BRIEFS_STORAGE_KEY, JSON.stringify(state));
}
