import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

import { initialOnboardingState, onboardingReducer } from "@/features/onboarding/model";
import type { OnboardingAction, OnboardingState } from "@/features/onboarding/model";
import { loadOnboarding, saveOnboarding } from "@/storage/preferences";

type ContextValue = { state: OnboardingState; dispatch: React.Dispatch<OnboardingAction>; hydrated: boolean };
const OnboardingContext = createContext<ContextValue | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(onboardingReducer, initialOnboardingState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { void loadOnboarding().then((saved) => { if (saved) dispatch({ type: "hydrate", value: saved }); setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) void saveOnboarding(state); }, [hydrated, state]);
  const value = useMemo(() => ({ state, dispatch, hydrated }), [state, hydrated]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value) throw new Error("useOnboarding must be used within OnboardingProvider");
  return value;
}
