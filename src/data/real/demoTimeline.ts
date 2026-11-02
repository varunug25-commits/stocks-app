import type { ChartRange } from "../stocks/charts.ts";

// Fixed illustrative session, not a claim that historical data was fetched today.
const DEMO_END = Date.UTC(2026, 7, 7, 20);
const DAY = 86_400_000;
const spans: Record<ChartRange, number> = {
  "1D": 6.5 * 3_600_000,
  "1W": 7 * DAY,
  "1M": 30 * DAY,
  "3M": 90 * DAY,
  "1Y": 365 * DAY,
};

export function demoBarTimestamp(range: ChartRange, index: number, count: number) {
  const progress = count <= 1 ? 1 : Math.max(0, Math.min(1, index / (count - 1)));
  return new Date(DEMO_END - spans[range] * (1 - progress)).toISOString();
}
