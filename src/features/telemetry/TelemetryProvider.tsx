import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { publicDataConfig } from "@/data/real";
import { sendIntelligenceFeedback, sendTelemetryEvent } from "./client";
import type { IntelligenceTask } from "@/data/intelligence";
import type { TelemetryEventName, TelemetryProperties } from "./contracts";

type Value = { track(name: TelemetryEventName, properties?: TelemetryProperties): void; feedback(input: { responseHash: string; task: IntelligenceTask; symbols: string[]; helpful: boolean; reason: string | null }): Promise<boolean> };
const Context = createContext<Value | null>(null);
export function TelemetryProvider({ children }: PropsWithChildren) {
  const track = useCallback((name: TelemetryEventName, properties: TelemetryProperties = {}) => { void sendTelemetryEvent(name, properties); }, []);
  const feedback = useCallback((input: Parameters<typeof sendIntelligenceFeedback>[0]) => sendIntelligenceFeedback(input), []);
  useEffect(() => { track("app_opened", { mode: publicDataConfig.mode }); }, [track]);
  const value = useMemo(() => ({ track, feedback }), [feedback, track]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useTelemetry() { const value = useContext(Context); if (!value) throw new Error("useTelemetry must be used within TelemetryProvider"); return value; }
