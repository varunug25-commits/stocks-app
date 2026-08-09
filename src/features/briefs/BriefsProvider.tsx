import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  briefsReducer,
  initialBriefsState,
  type BriefsAction,
  type BriefsState,
} from "./model";
import { loadBriefs, saveBriefs } from "../../storage/preferences";
import { localRealBriefStore, makeRealBriefRecord, type RealBriefRecord } from "./realStore";
import type { MarketBriefIntelligenceResponse } from "@/data/intelligence";

type BriefsContextValue = {
  state: BriefsState;
  dispatch: React.Dispatch<BriefsAction>;
  hydrated: boolean;
  realHistory: RealBriefRecord[];
  saveRealBrief(response: MarketBriefIntelligenceResponse, edition: "morning" | "evening", comparisonAnchor: string | null): Promise<void>;
};

const BriefsContext = createContext<BriefsContextValue | null>(null);

export function BriefsProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(briefsReducer, initialBriefsState);
  const [hydrated, setHydrated] = useState(false);
  const [realHistory, setRealHistory] = useState<RealBriefRecord[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all([loadBriefs(), localRealBriefStore.load()])
      .then(([saved, real]) => {
        if (active && saved) dispatch({ type: "hydrate", value: saved });
        if (active) setRealHistory(real);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) void saveBriefs(state).catch(() => undefined);
  }, [hydrated, state]);

  const value = useMemo(() => ({ state, dispatch, hydrated, realHistory, saveRealBrief: async (response: MarketBriefIntelligenceResponse, edition: "morning" | "evening", comparisonAnchor: string | null) => {
    const nextRecord = makeRealBriefRecord(response, edition, comparisonAnchor);
    if (realHistory.some((record) => record.id === nextRecord.id)) return;
    const next = [nextRecord, ...realHistory].slice(0, 50);
    setRealHistory(next);
    await localRealBriefStore.save(next);
  } }), [state, hydrated, realHistory]);
  return (
    <BriefsContext.Provider value={value}>{children}</BriefsContext.Provider>
  );
}

export function useBriefs() {
  const value = useContext(BriefsContext);
  if (!value) throw new Error("useBriefs must be used within BriefsProvider");
  return value;
}
