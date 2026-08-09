import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageAdapter } from "@/storage/preferencesCore";
import { initialGroupState, MAX_GROUPS, normalizeGroupName, type GroupState } from "./model.ts";

export const GROUP_STORAGE_KEY = "marketbrief.groups.v1";
export interface GroupStore { load(): Promise<GroupState>; save(state: GroupState): Promise<void>; clear(): Promise<void>; }

function parseState(value: unknown): GroupState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Partial<GroupState>;
  if (input.version !== 1 || !Array.isArray(input.groups)) return null;
  const ids = new Set<string>();
  const groups = input.groups.flatMap((group) => {
    if (!group || typeof group !== "object" || Array.isArray(group)) return [];
    const record = group as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.slice(0, 64) : "";
    const name = typeof record.name === "string" ? normalizeGroupName(record.name) : "";
    if (!id || !name || ids.has(id)) return [];
    ids.add(id);
    const symbols = Array.isArray(record.symbols) ? [...new Set(record.symbols.filter((symbol): symbol is string => typeof symbol === "string" && /^[A-Z][A-Z0-9.-]{0,7}$/.test(symbol)))].slice(0, 30) : [];
    return [{ id, name, symbols }];
  }).slice(0, MAX_GROUPS);
  return { version: 1, groups };
}

export function createGroupStore(adapter: StorageAdapter): GroupStore {
  return {
    async load() {
      const stored = await adapter.getItem(GROUP_STORAGE_KEY);
      if (!stored) return initialGroupState;
      try { const parsed = parseState(JSON.parse(stored) as unknown); if (parsed) return parsed; } catch {}
      try { await adapter.removeItem(GROUP_STORAGE_KEY); } catch {}
      return initialGroupState;
    },
    save: async (state) => adapter.setItem(GROUP_STORAGE_KEY, JSON.stringify(parseState(state) ?? initialGroupState)),
    clear: async () => adapter.removeItem(GROUP_STORAGE_KEY),
  };
}
export const localGroupStore = createGroupStore(AsyncStorage);
