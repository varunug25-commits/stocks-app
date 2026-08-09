import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { groupsReducer, initialGroupState } from "./model";
import { localGroupStore } from "./storage";

type Value = { state: typeof initialGroupState; hydrated: boolean; create(name: string): void; remove(id: string): void; toggleSymbol(id: string, symbol: string): void };
const Context = createContext<Value | null>(null);
export function GroupProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(groupsReducer, initialGroupState);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { let active = true; void localGroupStore.load().then((value) => { if (active) dispatch({ type: "hydrate", value }); }).catch(() => undefined).finally(() => { if (active) setHydrated(true); }); return () => { active = false; }; }, []);
  useEffect(() => { if (hydrated) void localGroupStore.save(state).catch(() => undefined); }, [hydrated, state]);
  const value = useMemo<Value>(() => ({ state, hydrated, create: (name) => dispatch({ type: "create", id: `group-${Date.now().toString(36)}`, name }), remove: (id) => dispatch({ type: "remove", id }), toggleSymbol: (id, symbol) => dispatch({ type: "toggle-symbol", id, symbol }) }), [hydrated, state]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useGroups() { const value = useContext(Context); if (!value) throw new Error("useGroups must be used within GroupProvider"); return value; }
