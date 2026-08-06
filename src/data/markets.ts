export type MarketDirection = "up" | "down";
export type MarketStatus = { state: "open" | "closed" | "pre-market"; label: string; detail: string; updated: string };
export type MarketIndex = { id: string; name: string; symbol: string; value: string; changePercent: number; summary: string; session: string; trend: number[] };
export type Sector = { id: string; name: string; changePercent: number; leaders: string };
export type MarketMover = { symbol: string; name: string; price: string; changePercent: number; volume: string; logoColor: string; trend: number[] };
export type EarningsEvent = { id: string; symbol: string; company: string; day: string; timing: string; estimate: string };
export type EconomicEvent = { id: string; title: string; day: string; time: string; impact: "High" | "Medium"; context: string };

export const marketStatus: MarketStatus = { state: "open", label: "Market open", detail: "Regular session · closes in 3h 18m", updated: "Updated 2 min ago" };

export const marketIndices: MarketIndex[] = [
  { id: "spx", name: "S&P 500", symbol: "SPX", value: "6,389.77", changePercent: 0.62, summary: "Broad US equities are advancing with improving breadth.", session: "OPEN", trend: [22, 24, 23, 28, 31, 29, 35, 34, 40, 43, 41, 47] },
  { id: "ixic", name: "Nasdaq", symbol: "IXIC", value: "21,108.32", changePercent: 0.88, summary: "Large-cap technology is leading the session higher.", session: "OPEN", trend: [18, 20, 19, 26, 24, 30, 35, 33, 39, 44, 42, 50] },
  { id: "dji", name: "Dow", symbol: "DJI", value: "44,117.82", changePercent: -0.14, summary: "Industrials are mixed as defensive names lag.", session: "OPEN", trend: [44, 42, 45, 41, 39, 40, 36, 38, 34, 32, 35, 31] },
  { id: "rut", name: "Russell 2000", symbol: "RUT", value: "2,286.46", changePercent: 0.41, summary: "Small caps are participating in the broader advance.", session: "OPEN", trend: [20, 22, 21, 23, 25, 24, 29, 28, 31, 34, 33, 37] },
];

export const sectors: Sector[] = [
  { id: "tech", name: "Technology", changePercent: 1.28, leaders: "NVDA · AMD · MSFT" },
  { id: "consumer", name: "Consumer", changePercent: 0.73, leaders: "AMZN · NFLX · TSLA" },
  { id: "health", name: "Healthcare", changePercent: 0.18, leaders: "LLY · UNH · ISRG" },
  { id: "financials", name: "Financials", changePercent: -0.22, leaders: "JPM · GS · BAC" },
  { id: "energy", name: "Energy", changePercent: -0.64, leaders: "XOM · CVX · COP" },
];

const sharedMovers: MarketMover[] = [
  { symbol: "NVDA", name: "NVIDIA", price: "$182.41", changePercent: 3.82, volume: "128.4M", logoColor: "#76B900", trend: [18, 22, 21, 27, 25, 32, 37, 35, 43, 49] },
  { symbol: "AMD", name: "Advanced Micro Devices", price: "$196.08", changePercent: 3.14, volume: "72.1M", logoColor: "#3B7652", trend: [18, 20, 24, 23, 28, 31, 35, 39] },
  { symbol: "PLTR", name: "Palantir", price: "$188.20", changePercent: 2.61, volume: "54.8M", logoColor: "#5A5FCC", trend: [20, 22, 21, 26, 28, 31, 34, 38] },
  { symbol: "TSLA", name: "Tesla", price: "$418.73", changePercent: -2.24, volume: "98.7M", logoColor: "#D83B3E", trend: [45, 42, 44, 39, 41, 36, 34, 31] },
  { symbol: "NFLX", name: "Netflix", price: "$1,176.44", changePercent: -1.37, volume: "8.2M", logoColor: "#D43535", trend: [44, 43, 40, 41, 37, 35, 33, 30] },
];

export const topGainers = sharedMovers.slice(0, 3);
export const topLosers = sharedMovers.slice(3);
export const mostActive = [sharedMovers[0]!, sharedMovers[3]!, sharedMovers[1]!];

export const earningsEvents: EarningsEvent[] = [
  { id: "nvda", symbol: "NVDA", company: "NVIDIA", day: "Wed, Aug 12", timing: "After close", estimate: "EPS est. $1.01" },
  { id: "wmt", symbol: "WMT", company: "Walmart", day: "Thu, Aug 13", timing: "Before open", estimate: "EPS est. $0.74" },
];

export const economicEvents: EconomicEvent[] = [
  { id: "cpi", title: "US consumer prices", day: "Wed, Aug 12", time: "8:30 AM ET", impact: "High", context: "Inflation trend and rate expectations" },
  { id: "claims", title: "Initial jobless claims", day: "Thu, Aug 13", time: "8:30 AM ET", impact: "Medium", context: "Weekly labor-market pulse" },
];

export const marketMood = { label: "Constructive, not euphoric", score: 68, explanation: "Breadth is improving and volatility is contained, while rates remain the main risk to growth leadership." } as const;
