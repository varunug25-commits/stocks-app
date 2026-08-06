import type { StockSymbol } from "./companies";
export type StockStatistic = { label: string; value: string };
const common: StockStatistic[] = [
  { label: "Market cap", value: "$4.45T" },
  { label: "P/E ratio", value: "42.3" },
  { label: "52-week high", value: "$184.90" },
  { label: "52-week low", value: "$86.62" },
  { label: "Avg. volume", value: "114.8M" },
  { label: "Dividend yield", value: "0.03%" },
];
export const statistics = Object.fromEntries(
  (
    [
      "AAPL",
      "MSFT",
      "NVDA",
      "TSLA",
      "AMZN",
      "GOOGL",
      "META",
      "AMD",
      "PLTR",
      "NFLX",
    ] as StockSymbol[]
  ).map((symbol) => [
    symbol,
    common.map((item, index) =>
      index === 0
        ? { ...item, value: symbol === "NVDA" ? "$4.45T" : "$2.10T" }
        : item,
    ),
  ]),
) as Record<StockSymbol, StockStatistic[]>;
