import type { StockSymbol } from "./companies";
export const chartRanges = ["1D", "1W", "1M", "3M", "1Y"] as const;
export type ChartRange = (typeof chartRanges)[number];
export type ChartPoint = { label: string; value: number };
const shapes: Record<ChartRange, number[]> = {
  "1D": [
    0, -0.4, 0.1, 0.7, 0.4, 1.2, 0.9, 1.8, 1.5, 2.4, 2.1, 3.0, 2.7, 3.5, 3.2, 4,
  ],
  "1W": [0, 1, -0.5, 2, 1.4, 3, 2.2, 4.5, 3.8, 5.2, 4.7, 6],
  "1M": [0, -2, 1, 3, 2, 5, 4, 7, 6, 9, 8, 11],
  "3M": [0, 3, 2, 6, 5, 9, 8, 13, 11, 16, 15, 20],
  "1Y": [0, 8, 5, 15, 12, 24, 18, 31, 27, 42, 38, 55],
};
const offsets: Record<StockSymbol, number> = {
  AAPL: 1,
  MSFT: 2,
  NVDA: 4,
  TSLA: -2,
  AMZN: 1.5,
  GOOGL: 0.5,
  META: 2.5,
  AMD: 3,
  PLTR: 2,
  NFLX: -1,
};
export function getChartSeries(
  symbol: StockSymbol,
  range: ChartRange,
  price: number,
): ChartPoint[] {
  const data = shapes[range];
  const end = data[data.length - 1] ?? 0;
  return data.map((value, index) => {
    const offsetTaper = 1 - index / Math.max(data.length - 1, 1);
    return {
      label: `Point ${index + 1}`,
      value: Number(
        (
          price *
          (1 + (value - end + (offsets[symbol] ?? 0) * offsetTaper) / 100)
        ).toFixed(2),
      ),
    };
  });
}
