import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StorageAdapter } from "@/storage/preferencesCore";

export const THESIS_STORAGE_KEY = "marketbrief.theses.v1";
export const MAX_THESIS_LENGTH = 500;
export type ThesisState = { version: 1; bySymbol: Record<string, string> };

export interface ThesisStore {
  load(): Promise<ThesisState>;
  save(state: ThesisState): Promise<void>;
  clear(): Promise<void>;
}

export function normalizeThesis(value: string) { return value.replace(/\s+/g, " ").trim().slice(0, MAX_THESIS_LENGTH); }

function parseState(value: unknown): ThesisState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Partial<ThesisState>;
  if (input.version !== 1 || !input.bySymbol || typeof input.bySymbol !== "object" || Array.isArray(input.bySymbol)) return null;
  const bySymbol: Record<string, string> = {};
  for (const [symbol, thesis] of Object.entries(input.bySymbol)) {
    if (!/^[A-Z][A-Z0-9.-]{0,7}$/.test(symbol) || typeof thesis !== "string") continue;
    const normalized = normalizeThesis(thesis);
    if (normalized) bySymbol[symbol] = normalized;
  }
  return { version: 1, bySymbol };
}

export function createThesisStore(adapter: StorageAdapter): ThesisStore {
  return {
    async load() {
      const stored = await adapter.getItem(THESIS_STORAGE_KEY);
      if (!stored) return { version: 1, bySymbol: {} };
      try {
        const parsed = parseState(JSON.parse(stored) as unknown);
        if (parsed) return parsed;
      } catch {}
      try { await adapter.removeItem(THESIS_STORAGE_KEY); } catch {}
      return { version: 1, bySymbol: {} };
    },
    save: async (state) => adapter.setItem(THESIS_STORAGE_KEY, JSON.stringify(parseState(state) ?? { version: 1, bySymbol: {} })),
    clear: async () => adapter.removeItem(THESIS_STORAGE_KEY),
  };
}

export const localThesisStore = createThesisStore(AsyncStorage);
