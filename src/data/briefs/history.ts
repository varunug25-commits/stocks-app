import type { BriefHistorySeed, BriefType } from "./types.ts";

export const briefHistory: BriefHistorySeed[] = [
  {
    id: "morning-2026-08-07",
    type: "morning",
    dateKey: "2026-08-07",
    dateLabel: "Friday, August 7, 2026",
    timestamp: "6:30 AM local",
  },
  {
    id: "evening-2026-08-07",
    type: "evening",
    dateKey: "2026-08-07",
    dateLabel: "Friday, August 7, 2026",
    timestamp: "5:30 PM local",
  },
  {
    id: "evening-2026-08-06",
    type: "evening",
    dateKey: "2026-08-06",
    dateLabel: "Thursday, August 6, 2026",
    timestamp: "5:30 PM local",
  },
  {
    id: "morning-2026-08-06",
    type: "morning",
    dateKey: "2026-08-06",
    dateLabel: "Thursday, August 6, 2026",
    timestamp: "6:30 AM local",
  },
  {
    id: "evening-2026-08-05",
    type: "evening",
    dateKey: "2026-08-05",
    dateLabel: "Wednesday, August 5, 2026",
    timestamp: "5:30 PM local",
  },
  {
    id: "morning-2026-08-05",
    type: "morning",
    dateKey: "2026-08-05",
    dateLabel: "Wednesday, August 5, 2026",
    timestamp: "6:30 AM local",
  },
];

export const latestBriefSeed = (type: BriefType) =>
  briefHistory.find((brief) => brief.type === type)!;

export const findBriefSeed = (id: string) =>
  briefHistory.find((brief) => brief.id === id);
