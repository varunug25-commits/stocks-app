import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { localThesisStore, normalizeThesis, type ThesisState } from "./storage";

type ThesisContextValue = {
  state: ThesisState;
  hydrated: boolean;
  save(symbol: string, thesis: string): Promise<void>;
  remove(symbol: string): Promise<void>;
};
const Context = createContext<ThesisContextValue | null>(null);

export function ThesisProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ThesisState>({ version: 1, bySymbol: {} });
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { let active = true; void localThesisStore.load().then((value) => { if (active) setState(value); }).catch(() => undefined).finally(() => { if (active) setHydrated(true); }); return () => { active = false; }; }, []);
  const update = useCallback(async (symbol: string, thesis: string) => {
    const clean = normalizeThesis(thesis);
    const bySymbol = { ...state.bySymbol };
    if (clean) bySymbol[symbol] = clean; else delete bySymbol[symbol];
    const next: ThesisState = { version: 1, bySymbol };
    setState(next);
    await localThesisStore.save(next);
  }, [state.bySymbol]);
  const value = useMemo<ThesisContextValue>(() => ({ state, hydrated, save: update, remove: (symbol) => update(symbol, "") }), [hydrated, state, update]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useTheses() {
  const value = useContext(Context);
  if (!value) throw new Error("useTheses must be used within ThesisProvider");
  return value;
}
