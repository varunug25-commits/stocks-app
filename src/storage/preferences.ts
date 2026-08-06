import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  clearLocalDemoFrom,
  loadMockSessionFrom,
  loadOnboardingFrom,
  saveMockSessionTo,
  saveOnboardingTo,
} from "@/storage/preferencesCore";
import { loadWatchlistFrom, saveWatchlistTo } from "@/storage/watchlistCore";
import { loadBriefsFrom, saveBriefsTo } from "@/storage/briefsCore";

export type { StorageAdapter } from "@/storage/preferencesCore";

export const loadOnboarding = () => loadOnboardingFrom(AsyncStorage);
export const saveOnboarding = (state: Parameters<typeof saveOnboardingTo>[0]) => saveOnboardingTo(state, AsyncStorage);
export const loadMockSession = () => loadMockSessionFrom(AsyncStorage);
export const saveMockSession = (active: boolean) => saveMockSessionTo(active, AsyncStorage);
export const clearLocalDemo = () => clearLocalDemoFrom(AsyncStorage);
export const loadWatchlist = () => loadWatchlistFrom(AsyncStorage);
export const saveWatchlist = (state: Parameters<typeof saveWatchlistTo>[0]) => saveWatchlistTo(state, AsyncStorage);
export const loadBriefs = () => loadBriefsFrom(AsyncStorage);
export const saveBriefs = (state: Parameters<typeof saveBriefsTo>[0]) => saveBriefsTo(state, AsyncStorage);
