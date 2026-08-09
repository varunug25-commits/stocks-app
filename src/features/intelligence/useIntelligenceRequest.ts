import { useCallback, useEffect, useMemo } from "react";
import type { IntelligenceRequest } from "@/data/intelligence";
import { intelligenceRequestKey, useIntelligence } from "./IntelligenceProvider";

export function useIntelligenceRequest(request: IntelligenceRequest, enabled = true) {
  const { resources, load } = useIntelligence();
  const key = useMemo(() => intelligenceRequestKey(request), [request]);
  useEffect(() => {
    if (enabled) void load(JSON.parse(key) as IntelligenceRequest);
  }, [enabled, key, load]);
  const retry = useCallback(() => load(JSON.parse(key) as IntelligenceRequest, true), [key, load]);
  return { resource: resources[key] ?? { status: "idle" as const }, retry };
}
