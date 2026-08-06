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

type BriefsContextValue = {
  state: BriefsState;
  dispatch: React.Dispatch<BriefsAction>;
  hydrated: boolean;
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

  const value = useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated],
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
