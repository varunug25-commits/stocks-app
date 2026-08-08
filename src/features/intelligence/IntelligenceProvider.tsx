import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { demoIntelligence, IntelligenceClientError, requestIntelligence } from "@/data/intelligence";
import type { IntelligenceRequest, IntelligenceResource } from "@/data/intelligence";
import { publicDataConfig } from "@/data/real";

export function intelligenceRequestKey(request: IntelligenceRequest) {
  return JSON.stringify({
    task: request.task,
    symbols: request.symbols,
    edition: request.edition,
    question: request.question?.trim().toLowerCase(),
    focusId: request.focusId,
    timeWindow: request.timeWindow,
  });
}

type IntelligenceContextValue = {
  resources: Record<string, IntelligenceResource | undefined>;
  load(request: IntelligenceRequest, force?: boolean): Promise<void>;
};

const Context = createContext<IntelligenceContextValue | null>(null);

export function IntelligenceProvider({ children }: PropsWithChildren) {
  const [resources, setResources] = useState<Record<string, IntelligenceResource | undefined>>({});
  const inFlight = useRef(new Set<string>());
  const resolved = useRef(new Set<string>());
  const load = useCallback(async (request: IntelligenceRequest, force = false) => {
    const key = intelligenceRequestKey(request);
    if (inFlight.current.has(key)) return;
    if (!force && resolved.current.has(key)) return;
    if (force) resolved.current.delete(key);
    inFlight.current.add(key);
    setResources((current) => ({ ...current, [key]: { status: "loading" } }));
    try {
      const data = publicDataConfig.mode === "DEMO" ? demoIntelligence(request) : await requestIntelligence(request);
      resolved.current.add(key);
      setResources((current) => ({ ...current, [key]: { status: "ready", data } }));
    } catch (error) {
      const code = error instanceof IntelligenceClientError ? error.code : "UPSTREAM_UNAVAILABLE";
      const message = error instanceof Error ? error.message : "Grounded intelligence is unavailable.";
      setResources((current) => ({ ...current, [key]: { status: code === "RATE_LIMITED" ? "rate-limited" : "error", code, message } }));
    } finally {
      inFlight.current.delete(key);
    }
  }, []);
  const value = useMemo(() => ({ resources, load }), [load, resources]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useIntelligence() {
  const value = useContext(Context);
  if (!value) throw new Error("useIntelligence must be used within IntelligenceProvider");
  return value;
}
