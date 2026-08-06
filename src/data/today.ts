export type MarketIndex = {
  id: string;
  name: string;
  symbol: string;
  value: string;
  changePercent: number;
  session: string;
  trend: number[];
};

export type Stock = {
  symbol: string;
  name: string;
  price: string;
  changePercent: number;
  logoColor: string;
  trend: number[];
};

export type Story = {
  id: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  published: string;
  readTime: string;
  palette: readonly [string, string, ...string[]];
  artwork: "orbital" | "grid" | "waves";
};

export type MarketEvent = {
  id: string;
  day: string;
  date: string;
  time: string;
  title: string;
  detail: string;
  symbol?: string;
  tone: "earnings" | "macro";
};

export const marketIndices: MarketIndex[] = [
  {
    id: "spx",
    name: "S&P 500",
    symbol: "SPX",
    value: "6,389.77",
    changePercent: 0.62,
    session: "OPEN",
    trend: [22, 24, 23, 28, 31, 29, 35, 34, 40, 43, 41, 47],
  },
  {
    id: "ixic",
    name: "Nasdaq",
    symbol: "IXIC",
    value: "21,108.32",
    changePercent: 0.88,
    session: "OPEN",
    trend: [18, 20, 19, 26, 24, 30, 35, 33, 39, 44, 42, 50],
  },
  {
    id: "dji",
    name: "Dow Jones",
    symbol: "DJI",
    value: "44,117.82",
    changePercent: -0.14,
    session: "OPEN",
    trend: [44, 42, 45, 41, 39, 40, 36, 38, 34, 32, 35, 31],
  },
];

export const watchlist: Stock[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: "$182.41",
    changePercent: 3.82,
    logoColor: "#76B900",
    trend: [18, 22, 21, 27, 25, 32, 37, 35, 43, 49],
  },
  {
    symbol: "AAPL",
    name: "Apple",
    price: "$271.06",
    changePercent: 1.16,
    logoColor: "#7D8790",
    trend: [22, 24, 23, 27, 26, 29, 31, 30, 34, 36],
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: "$418.73",
    changePercent: -2.24,
    logoColor: "#D83B3E",
    trend: [45, 42, 44, 39, 41, 36, 34, 37, 31, 28],
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: "$552.14",
    changePercent: 0.71,
    logoColor: "#1B8FEB",
    trend: [24, 25, 23, 27, 29, 28, 32, 34, 33, 37],
  },
];

export const leadStory: Story = {
  id: "rates-growth",
  category: "MARKET PULSE",
  title: "Rates ease as growth stocks find their footing",
  summary: "Treasury yields are drifting lower, giving technology and consumer names room to lead the morning session.",
  source: "MarketBrief Editorial",
  published: "18 min ago",
  readTime: "4 min read",
  palette: ["#173B36", "#0A1114", "#22594F"],
  artwork: "orbital",
};

export const stories: Story[] = [
  {
    id: "chips-capex",
    category: "SEMICONDUCTORS",
    title: "Chip spending stays resilient into the next cycle",
    summary: "Capital plans point to steady demand across AI infrastructure.",
    source: "MarketBrief Editorial",
    published: "42 min ago",
    readTime: "3 min read",
    palette: ["#20294B", "#0C1018", "#4D5C9E"],
    artwork: "grid",
  },
  {
    id: "oil-dollar",
    category: "MACRO",
    title: "Oil steadies while the dollar gives back early gains",
    summary: "Cross-asset moves remain measured ahead of this week’s data.",
    source: "MarketBrief Editorial",
    published: "1 hr ago",
    readTime: "5 min read",
    palette: ["#3D2D1A", "#100E0B", "#906A2D"],
    artwork: "waves",
  },
];

export const briefingPoints = [
  "Market breadth is improving, with more stocks participating in today’s advance.",
  "Large-cap technology is leading, but gains remain orderly rather than euphoric.",
  "Watch the 10-year yield this afternoon; a reversal could pressure growth names.",
];

export const events: MarketEvent[] = [
  {
    id: "nvda-earnings",
    day: "WED",
    date: "05",
    time: "After close",
    title: "NVIDIA earnings",
    detail: "Consensus EPS · $1.01",
    symbol: "NVDA",
    tone: "earnings",
  },
  {
    id: "jobs-report",
    day: "FRI",
    date: "07",
    time: "8:30 AM ET",
    title: "US employment report",
    detail: "High-impact macro event",
    tone: "macro",
  },
];
