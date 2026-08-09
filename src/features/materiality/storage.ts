import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageAdapter } from "@/storage/preferencesCore";
import type { WatchlistSnapshot } from "./types";

export const SNAPSHOT_STORAGE_KEY = "marketbrief.snapshot.v1";
export const SEEN_CHANGES_STORAGE_KEY = "marketbrief.seen-changes.v1";

export interface SnapshotStore {
  load(): Promise<WatchlistSnapshot | null>;
  save(snapshot: WatchlistSnapshot): Promise<void>;
  clear(): Promise<void>;
}

function isSnapshot(value: unknown): value is WatchlistSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const snapshot = value as Partial<WatchlistSnapshot>;
  return snapshot.version === 1 && typeof snapshot.capturedAt === "string" && Number.isFinite(Date.parse(snapshot.capturedAt)) && !!snapshot.symbols && typeof snapshot.symbols === "object" && !Array.isArray(snapshot.symbols);
}

export function createSnapshotStore(adapter: StorageAdapter): SnapshotStore {
  return {
    async load() {
      const stored = await adapter.getItem(SNAPSHOT_STORAGE_KEY);
      if (!stored) return null;
      try {
        const parsed: unknown = JSON.parse(stored);
        if (isSnapshot(parsed)) return parsed;
      } catch {}
      try { await adapter.removeItem(SNAPSHOT_STORAGE_KEY); } catch {}
      return null;
    },
    save: async (snapshot) => adapter.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot)),
    clear: async () => adapter.removeItem(SNAPSHOT_STORAGE_KEY),
  };
}

export function createSeenChangeStore(adapter: StorageAdapter) {
  return {
    async load() {
      try {
        const stored = await adapter.getItem(SEEN_CHANGES_STORAGE_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string").slice(-500) : []);
      } catch { return new Set<string>(); }
    },
    async markSeen(ids: string[]) {
      const current = await this.load();
      ids.forEach((id) => current.add(id));
      await adapter.setItem(SEEN_CHANGES_STORAGE_KEY, JSON.stringify([...current].slice(-500)));
    },
  };
}

export const localSnapshotStore = createSnapshotStore(AsyncStorage);
export const localSeenChangeStore = createSeenChangeStore(AsyncStorage);
