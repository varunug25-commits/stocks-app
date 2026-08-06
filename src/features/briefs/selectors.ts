import type { BriefHistorySeed, BriefStatus } from "../../data/briefs/types.ts";
import type { BriefsState } from "./model.ts";

export function selectBriefStatus(id: string, state: BriefsState): BriefStatus {
  if (state.savedIds.includes(id)) return "Saved";
  if (state.readIds.includes(id)) return "Read";
  return "New";
}

export function selectFilteredBriefs(
  history: BriefHistorySeed[],
  state: BriefsState,
) {
  return history.filter((brief) => {
    if (state.typeFilter !== "all" && brief.type !== state.typeFilter)
      return false;
    if (state.statusFilter === "saved")
      return state.savedIds.includes(brief.id);
    if (state.statusFilter === "unread")
      return !state.readIds.includes(brief.id);
    return true;
  });
}
