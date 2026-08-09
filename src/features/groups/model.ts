export const MAX_GROUPS = 12;
export const MAX_GROUP_NAME_LENGTH = 24;
export type WatchlistGroup = { id: string; name: string; symbols: string[] };
export type GroupState = { version: 1; groups: WatchlistGroup[] };
export type GroupAction =
  | { type: "hydrate"; value: GroupState }
  | { type: "create"; id: string; name: string }
  | { type: "remove"; id: string }
  | { type: "toggle-symbol"; id: string; symbol: string };

export const initialGroupState: GroupState = { version: 1, groups: [] };
export function normalizeGroupName(value: string) { return value.replace(/\s+/g, " ").trim().slice(0, MAX_GROUP_NAME_LENGTH); }

export function groupsReducer(state: GroupState, action: GroupAction): GroupState {
  if (action.type === "hydrate") return action.value;
  if (action.type === "create") {
    const name = normalizeGroupName(action.name);
    if (!name || state.groups.length >= MAX_GROUPS || state.groups.some((group) => group.name.toLowerCase() === name.toLowerCase())) return state;
    return { version: 1, groups: [...state.groups, { id: action.id, name, symbols: [] }] };
  }
  if (action.type === "remove") return { version: 1, groups: state.groups.filter((group) => group.id !== action.id) };
  return { version: 1, groups: state.groups.map((group) => group.id === action.id ? { ...group, symbols: group.symbols.includes(action.symbol) ? group.symbols.filter((symbol) => symbol !== action.symbol) : [...group.symbols, action.symbol] } : group) };
}
