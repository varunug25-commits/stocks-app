import type { BriefType } from "../../data/briefs/types.ts";

export type BriefStatusFilter = "all" | "saved" | "unread";
export type BriefTypeFilter = "all" | BriefType;
export type BriefsState = {
  readIds: string[];
  savedIds: string[];
  selectedType: BriefType;
  statusFilter: BriefStatusFilter;
  typeFilter: BriefTypeFilter;
  dismissedNotices: string[];
};

export const initialBriefsState: BriefsState = {
  readIds: [],
  savedIds: [],
  selectedType: "morning",
  statusFilter: "all",
  typeFilter: "all",
  dismissedNotices: [],
};

export type BriefsAction =
  | { type: "hydrate"; value: BriefsState }
  | { type: "markRead"; id: string }
  | { type: "toggleSaved"; id: string }
  | { type: "selectType"; value: BriefType }
  | { type: "statusFilter"; value: BriefStatusFilter }
  | { type: "typeFilter"; value: BriefTypeFilter }
  | { type: "dismiss"; id: string };

const addUnique = (items: string[], id: string) =>
  items.includes(id) ? items : [...items, id];

export function briefsReducer(
  state: BriefsState,
  action: BriefsAction,
): BriefsState {
  switch (action.type) {
    case "hydrate":
      return action.value;
    case "markRead":
      return { ...state, readIds: addUnique(state.readIds, action.id) };
    case "toggleSaved":
      return {
        ...state,
        savedIds: state.savedIds.includes(action.id)
          ? state.savedIds.filter((id) => id !== action.id)
          : [...state.savedIds, action.id],
      };
    case "selectType":
      return { ...state, selectedType: action.value };
    case "statusFilter":
      return { ...state, statusFilter: action.value };
    case "typeFilter":
      return { ...state, typeFilter: action.value };
    case "dismiss":
      return {
        ...state,
        dismissedNotices: addUnique(state.dismissedNotices, action.id),
      };
  }
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function isBriefsState(value: unknown): value is BriefsState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const state = value as Record<string, unknown>;
  return (
    isStringArray(state.readIds) &&
    isStringArray(state.savedIds) &&
    (state.selectedType === "morning" || state.selectedType === "evening") &&
    (state.statusFilter === "all" ||
      state.statusFilter === "saved" ||
      state.statusFilter === "unread") &&
    (state.typeFilter === "all" ||
      state.typeFilter === "morning" ||
      state.typeFilter === "evening") &&
    isStringArray(state.dismissedNotices)
  );
}
