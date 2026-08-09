import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MarketBriefIntelligenceResponse } from "@/data/intelligence";
import type { StorageAdapter } from "@/storage/preferencesCore";

export const REAL_BRIEF_STORAGE_KEY = "marketbrief.real-briefs.v1";
export type RealBriefRecord = {
  id: string;
  edition: "morning" | "evening";
  generatedAt: string;
  symbols: string[];
  headline: string;
  response: MarketBriefIntelligenceResponse;
  evidenceHash: string;
  providerMode: "mock" | "live";
  comparisonAnchor: string | null;
};
export interface RealBriefStore { load(): Promise<RealBriefRecord[]>; save(records: RealBriefRecord[]): Promise<void>; clear(): Promise<void>; }

function isResponse(value: unknown): value is MarketBriefIntelligenceResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Partial<MarketBriefIntelligenceResponse>;
  return Array.isArray(record.sections) && Array.isArray(record.sources) && Array.isArray(record.sourceIds) && Array.isArray(record.symbols) && typeof record.generatedAt === "string" && !!record.meta && (record.meta.providerMode === "live" || record.meta.providerMode === "mock");
}
function parseRecord(value: unknown): RealBriefRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Partial<RealBriefRecord>;
  if (typeof record.id !== "string" || (record.edition !== "morning" && record.edition !== "evening") || typeof record.generatedAt !== "string" || !Number.isFinite(Date.parse(record.generatedAt)) || !Array.isArray(record.symbols) || !record.symbols.every((symbol) => typeof symbol === "string") || typeof record.headline !== "string" || typeof record.evidenceHash !== "string" || (record.providerMode !== "live" && record.providerMode !== "mock") || (record.comparisonAnchor !== null && typeof record.comparisonAnchor !== "string") || !isResponse(record.response)) return null;
  return record as RealBriefRecord;
}
export function createRealBriefStore(adapter: StorageAdapter): RealBriefStore {
  return {
    async load() {
      const stored = await adapter.getItem(REAL_BRIEF_STORAGE_KEY);
      if (!stored) return [];
      try { const parsed: unknown = JSON.parse(stored); if (Array.isArray(parsed)) return parsed.flatMap((value) => parseRecord(value) ?? []).sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)).slice(0, 50); } catch {}
      try { await adapter.removeItem(REAL_BRIEF_STORAGE_KEY); } catch {}
      return [];
    },
    save: async (records) => adapter.setItem(REAL_BRIEF_STORAGE_KEY, JSON.stringify(records.flatMap((value) => parseRecord(value) ?? []).sort((a, b) => Date.parse(b.generatedAt) - Date.parse(a.generatedAt)).slice(0, 50))),
    clear: async () => adapter.removeItem(REAL_BRIEF_STORAGE_KEY),
  };
}
export function makeRealBriefRecord(response: MarketBriefIntelligenceResponse, edition: "morning" | "evening", comparisonAnchor: string | null): RealBriefRecord {
  const evidenceHash = stableHash(JSON.stringify({ sourceIds: [...response.sourceIds].sort(), sections: response.sections.map((section) => section.bullets.map((bullet) => [bullet.kind, bullet.sourceIds])) }));
  return { id: `real-${edition}-${response.generatedAt}`, edition, generatedAt: response.generatedAt, symbols: response.symbols, headline: response.headline ?? `${edition === "morning" ? "Morning brief" : "Evening recap"}`, response, evidenceHash, providerMode: response.meta.providerMode, comparisonAnchor };
}
export function compareRealBriefs(current: RealBriefRecord, previous: RealBriefRecord | undefined) {
  if (!previous) return null;
  const oldSources = new Set(previous.response.sourceIds);
  const newDevelopments = current.response.sourceIds.filter((id) => !oldSources.has(id)).length;
  const countKind = (record: RealBriefRecord, kind: string) => record.response.sections.flatMap((section) => section.bullets).filter((bullet) => bullet.kind === kind).length;
  return { newDevelopments, newCatalysts: Math.max(0, countKind(current, "catalyst") - countKind(previous, "catalyst")), uncertaintiesResolved: Math.max(0, countKind(previous, "uncertainty") - countKind(current, "uncertainty")) };
}
function stableHash(value: string) { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16); }
export const localRealBriefStore = createRealBriefStore(AsyncStorage);
