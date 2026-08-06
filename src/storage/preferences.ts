import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  clearLocalDemoFrom,
  loadMockSessionFrom,
  loadOnboardingFrom,
  saveMockSessionTo,
  saveOnboardingTo,
} from "@/storage/preferencesCore";

export type { StorageAdapter } from "@/storage/preferencesCore";

export const loadOnboarding = () => loadOnboardingFrom(AsyncStorage);
export const saveOnboarding = (state: Parameters<typeof saveOnboardingTo>[0]) => saveOnboardingTo(state, AsyncStorage);
export const loadMockSession = () => loadMockSessionFrom(AsyncStorage);
export const saveMockSession = (active: boolean) => saveMockSessionTo(active, AsyncStorage);
export const clearLocalDemo = () => clearLocalDemoFrom(AsyncStorage);
