import type { PropsWithChildren } from "react";
import {
  useCallback,
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

type BriefsContextValue = {
  state: BriefsState;
  dispatch: React.Dispatch<BriefsAction>;
  hydrated: boolean;
  reload: () => Promise<void>;
};

const BriefsContext = createContext<BriefsContextValue | null>(null);

export function BriefsProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(briefsReducer, initialBriefsState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    void loadBriefs()
      .then((saved) => {
        if (active && saved) dispatch({ type: "hydrate", value: saved });
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

  const reload = useCallback(async () => {
    try {
      const saved = await loadBriefs();
      if (saved) dispatch({ type: "hydrate", value: saved });
    } catch {
      // The current in-memory state remains the safe fallback.
    }
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, hydrated, reload }),
    [state, hydrated, reload],
  );
  return (
    <BriefsContext.Provider value={value}>{children}</BriefsContext.Provider>
  );
}

export function useBriefs() {
  const value = useContext(BriefsContext);
  if (!value) throw new Error("useBriefs must be used within BriefsProvider");
  return value;
}
