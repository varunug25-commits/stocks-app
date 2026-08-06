import { isWatchlistState } from "../features/watchlist/model.ts";
import type { WatchlistState } from "../features/watchlist/model.ts";
import type { StorageAdapter } from "./preferencesCore.ts";
export const WATCHLIST_STORAGE_KEY = "marketbrief.watchlist.v1";
export function parseWatchlistState(stored: string): WatchlistState | null {
  try {
    const parsed: unknown = JSON.parse(stored);
    return isWatchlistState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
export async function loadWatchlistFrom(adapter: StorageAdapter) {
  const stored = await adapter.getItem(WATCHLIST_STORAGE_KEY);
  if (!stored) return null;
  const parsed = parseWatchlistState(stored);
  if (parsed) return parsed;
  try {
    await adapter.removeItem(WATCHLIST_STORAGE_KEY);
  } catch {}
  return null;
}
export async function saveWatchlistTo(
  state: WatchlistState,
  adapter: StorageAdapter,
) {
  await adapter.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(state));
}
