import type { DataMode } from "./contracts.ts";

export type PublicDataConfig = {
  mode: DataMode;
  supabaseUrl: string | null;
  publishableKey: string | null;
};

export const resolveDataMode = (value: string | undefined): DataMode => value === "REAL" ? "REAL" : "DEMO";

export const publicDataConfig: PublicDataConfig = {
  mode: resolveDataMode(process.env.EXPO_PUBLIC_MARKETBRIEF_DATA_MODE),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || null,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || null,
};

export function edgeFunctionUrl(config = publicDataConfig) {
  if (!config.supabaseUrl || !config.publishableKey) return null;
  return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/market-data`;
}

export function intelligenceFunctionUrl(config = publicDataConfig) {
  if (!config.supabaseUrl || !config.publishableKey) return null;
  return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/market-intelligence`;
}
