import type { BriefHistorySeed, BriefType } from "./types.ts";

export const briefHistory: BriefHistorySeed[] = [
  {
    id: "morning-2026-08-07",
    type: "morning",
    dateKey: "2026-08-07",
    dateLabel: "Friday, August 7, 2026",
    timestamp: "6:30 AM local",
    headline: "A steadier setup, with growth back in focus",
  },
  {
    id: "evening-2026-08-07",
    type: "evening",
    dateKey: "2026-08-07",
    dateLabel: "Friday, August 7, 2026",
    timestamp: "5:30 PM local",
    headline: "Growth led the close, but expectations still matter",
  },
  {
    id: "evening-2026-08-06",
    type: "evening",
    dateKey: "2026-08-06",
    dateLabel: "Thursday, August 6, 2026",
    timestamp: "5:30 PM local",
    headline: "Late breadth improved as defensives steadied",
  },
  {
    id: "morning-2026-08-06",
    type: "morning",
    dateKey: "2026-08-06",
    dateLabel: "Thursday, August 6, 2026",
    timestamp: "6:30 AM local",
    headline: "Chip leadership meets a firmer rates backdrop",
  },
  {
    id: "evening-2026-08-05",
    type: "evening",
    dateKey: "2026-08-05",
    dateLabel: "Wednesday, August 5, 2026",
    timestamp: "5:30 PM local",
    headline: "A mixed close leaves guidance in control",
  },
  {
    id: "morning-2026-08-05",
    type: "morning",
    dateKey: "2026-08-05",
    dateLabel: "Wednesday, August 5, 2026",
    timestamp: "6:30 AM local",
    headline: "Earnings signals take priority before the open",
  },
];

export const latestBriefSeed = (type: BriefType) =>
  briefHistory.find((brief) => brief.type === type)!;

export const findBriefSeed = (id: string) =>
  briefHistory.find((brief) => brief.id === id);
