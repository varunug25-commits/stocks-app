import { chartRanges } from "../../data/stocks/charts.ts";
import type { ChartRange } from "../../data/stocks/charts.ts";
import { isStockSymbol } from "../../data/stocks/companies.ts";
import type { StockSymbol } from "../../data/stocks/companies.ts";

export const WATCHLIST_LIMIT = 15;
export type WatchlistState = {
  symbols: StockSymbol[];
  recentSearches: StockSymbol[];
  selectedRanges: Partial<Record<StockSymbol, ChartRange>>;
  dismissedNotices: string[];
};
export const initialWatchlistState: WatchlistState = {
  symbols: [],
  recentSearches: [],
  selectedRanges: {},
  dismissedNotices: [],
};
export type WatchlistAction =
  | { type: "hydrate"; value: WatchlistState }
  | { type: "syncOnboarding"; symbols: StockSymbol[] }
  | { type: "add"; symbol: StockSymbol }
  | { type: "remove"; symbol: StockSymbol }
  | { type: "move"; symbol: StockSymbol; direction: -1 | 1 }
  | { type: "recent"; symbol: StockSymbol }
  | { type: "clearRecent" }
  | { type: "range"; symbol: StockSymbol; range: ChartRange }
  | { type: "dismiss"; id: string };
export function addStock(
  symbols: StockSymbol[],
  symbol: StockSymbol,
  limit = WATCHLIST_LIMIT,
) {
  if (symbols.includes(symbol) || symbols.length >= limit) return symbols;
  return [...symbols, symbol];
}
export function removeStock(symbols: StockSymbol[], symbol: StockSymbol) {
  return symbols.filter((item) => item !== symbol);
}
export function moveStock(
  symbols: StockSymbol[],
  symbol: StockSymbol,
  direction: -1 | 1,
) {
  const index = symbols.indexOf(symbol);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= symbols.length) return symbols;
  const next = [...symbols];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}
export function migrateOnboardingStocks(symbols: string[]): WatchlistState {
  return {
    ...initialWatchlistState,
    symbols: symbols.filter(isStockSymbol).slice(0, WATCHLIST_LIMIT),
  };
}
export function resolveHydratedWatchlist(
  saved: WatchlistState | null,
  onboardingSymbols: string[],
  onboardingCompleted: boolean,
) {
  const migrated = migrateOnboardingStocks(onboardingSymbols);
  if (!saved) return migrated;
  if (!onboardingCompleted)
    return { ...saved, symbols: migrated.symbols };
  return saved;
}
export function isWatchlistState(value: unknown): value is WatchlistState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return (
    Array.isArray(state.symbols) &&
    state.symbols.every(isStockSymbol) &&
    new Set(state.symbols).size === state.symbols.length &&
    state.symbols.length <= WATCHLIST_LIMIT &&
    Array.isArray(state.recentSearches) &&
    state.recentSearches.every(isStockSymbol) &&
    Array.isArray(state.dismissedNotices) &&
    state.dismissedNotices.every((item) => typeof item === "string") &&
    typeof state.selectedRanges === "object" &&
    state.selectedRanges !== null &&
    Object.entries(state.selectedRanges).every(
      ([symbol, range]) =>
        isStockSymbol(symbol) && chartRanges.includes(range as ChartRange),
    )
  );
}
export function watchlistReducer(
  state: WatchlistState,
  action: WatchlistAction,
): WatchlistState {
  switch (action.type) {
    case "hydrate":
      return action.value;
    case "syncOnboarding":
      if (action.symbols.length === state.symbols.length && action.symbols.every((symbol, index) => symbol === state.symbols[index])) return state;
      return { ...state, symbols: action.symbols.slice(0, WATCHLIST_LIMIT) };
    case "add":
      return { ...state, symbols: addStock(state.symbols, action.symbol) };
    case "remove":
      return { ...state, symbols: removeStock(state.symbols, action.symbol) };
    case "move":
      return {
        ...state,
        symbols: moveStock(state.symbols, action.symbol, action.direction),
      };
    case "recent":
      return {
        ...state,
        recentSearches: [
          action.symbol,
          ...state.recentSearches.filter((item) => item !== action.symbol),
        ].slice(0, 6),
      };
    case "clearRecent":
      return { ...state, recentSearches: [] };
    case "range":
      return {
        ...state,
        selectedRanges: {
          ...state.selectedRanges,
          [action.symbol]: action.range,
        },
      };
    case "dismiss":
      return {
        ...state,
        dismissedNotices: state.dismissedNotices.includes(action.id)
          ? state.dismissedNotices
          : [...state.dismissedNotices, action.id],
      };
  }
}
