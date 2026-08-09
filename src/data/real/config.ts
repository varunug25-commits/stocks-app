import type { DataMode } from "./contracts.ts";

export type PublicDataConfig = {
  mode: DataMode;
  supabaseUrl: string | null;
  publishableKey: string | null;
  configurationError?: string | null;
};

type RuntimeEnvironment = "development" | "test" | "production";

export const resolveDataMode = (
  value: string | undefined,
  runtime: RuntimeEnvironment = process.env.NODE_ENV === "production" ? "production" : process.env.NODE_ENV === "test" ? "test" : "development",
): DataMode => {
  if (value === "REAL") return "REAL";
  if (value === "DEMO" && runtime !== "production") return "DEMO";
  return runtime === "production" ? "REAL" : "DEMO";
};

export function resolvePublicDataConfig(input: {
  dataMode?: string;
  supabaseUrl?: string;
  publishableKey?: string;
  runtime: RuntimeEnvironment;
}): PublicDataConfig {
  const mode = resolveDataMode(input.dataMode, input.runtime);
  const supabaseUrl = input.supabaseUrl?.trim() || null;
  const publishableKey = input.publishableKey?.trim() || null;
  const productionRequiresExplicitReal = input.runtime === "production" && input.dataMode !== "REAL";
  const realConfigurationMissing = mode === "REAL" && (!supabaseUrl || !publishableKey);
  return {
    mode,
    supabaseUrl,
    publishableKey,
    configurationError: productionRequiresExplicitReal || realConfigurationMissing
      ? "Live market configuration is incomplete."
      : null,
  };
}

export const publicDataConfig = resolvePublicDataConfig({
  dataMode: process.env.EXPO_PUBLIC_MARKETBRIEF_DATA_MODE,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  runtime: process.env.NODE_ENV === "production" ? "production" : process.env.NODE_ENV === "test" ? "test" : "development",
});

export function edgeFunctionUrl(config = publicDataConfig) {
  if (!config.supabaseUrl || !config.publishableKey) return null;
  return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/market-data`;
}

export function intelligenceFunctionUrl(config = publicDataConfig) {
  if (!config.supabaseUrl || !config.publishableKey) return null;
  return `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/market-intelligence`;
}
