import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useOnboarding } from "@/features/onboarding/OnboardingProvider";
import {
  initialWatchlistState,
  migrateOnboardingStocks,
  resolveHydratedWatchlist,
  watchlistReducer,
} from "@/features/watchlist/model";
import type {
  WatchlistAction,
  WatchlistState,
} from "@/features/watchlist/model";
import { loadWatchlist, saveWatchlist } from "@/storage/preferences";
type Value = {
  state: WatchlistState;
  dispatch: React.Dispatch<WatchlistAction>;
  hydrated: boolean;
};
const Context = createContext<Value | null>(null);
export function WatchlistProvider({ children }: PropsWithChildren) {
  const { state: onboarding, hydrated: onboardingHydrated } = useOnboarding();
  const [state, dispatch] = useReducer(watchlistReducer, initialWatchlistState);
  const [hydrated, setHydrated] = useState(false);
  const onboardingRef = useRef(onboarding);
  useEffect(() => {
    onboardingRef.current = onboarding;
  }, [onboarding]);
  useEffect(() => {
    if (!onboardingHydrated) return;
    let active = true;
    void loadWatchlist()
      .then((saved) => {
        const current = onboardingRef.current;
        if (active)
          dispatch({
            type: "hydrate",
            value: resolveHydratedWatchlist(
              saved,
              current.stocks,
              current.completed,
            ),
          });
      })
      .catch(() => {
        const current = onboardingRef.current;
        if (active)
          dispatch({
            type: "hydrate",
            value: migrateOnboardingStocks(current.stocks),
          });
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, [onboardingHydrated]);
  useEffect(() => {
    if (!hydrated || onboarding.completed) return;
    dispatch({ type: "syncOnboarding", symbols: migrateOnboardingStocks(onboarding.stocks).symbols });
  }, [hydrated, onboarding.completed, onboarding.stocks]);
  useEffect(() => {
    if (hydrated) void saveWatchlist(state).catch(() => undefined);
  }, [hydrated, state]);
  const value = useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useWatchlist() {
  const value = useContext(Context);
  if (!value)
    throw new Error("useWatchlist must be used within WatchlistProvider");
  return value;
}
