import type { StockSymbol } from "./companies";
export type PriceSnapshot = {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  status: "Market open" | "Market closed";
  updated: string;
  delayed: string;
  volume: string;
};
export const prices: Record<StockSymbol, PriceSnapshot> = {
  AAPL: {
    price: 271.06,
    previousClose: 267.95,
    change: 3.11,
    changePercent: 1.16,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "48.2M",
  },
  MSFT: {
    price: 552.14,
    previousClose: 548.25,
    change: 3.89,
    changePercent: 0.71,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "21.4M",
  },
  NVDA: {
    price: 182.41,
    previousClose: 175.7,
    change: 6.71,
    changePercent: 3.82,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "128.4M",
  },
  TSLA: {
    price: 418.73,
    previousClose: 428.32,
    change: -9.59,
    changePercent: -2.24,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "98.7M",
  },
  AMZN: {
    price: 234.11,
    previousClose: 231.93,
    change: 2.18,
    changePercent: 0.94,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "37.8M",
  },
  GOOGL: {
    price: 205.32,
    previousClose: 204.54,
    change: 0.78,
    changePercent: 0.38,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "26.1M",
  },
  META: {
    price: 721.2,
    previousClose: 711.1,
    change: 10.1,
    changePercent: 1.42,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "15.7M",
  },
  AMD: {
    price: 196.08,
    previousClose: 190.11,
    change: 5.97,
    changePercent: 3.14,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "72.1M",
  },
  PLTR: {
    price: 188.2,
    previousClose: 183.41,
    change: 4.79,
    changePercent: 2.61,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "54.8M",
  },
  NFLX: {
    price: 1176.44,
    previousClose: 1192.78,
    change: -16.34,
    changePercent: -1.37,
    status: "Market open",
    updated: "Updated 2 min ago",
    delayed: "Local demo · illustrative",
    volume: "8.2M",
  },
};
export const formatPrice = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
