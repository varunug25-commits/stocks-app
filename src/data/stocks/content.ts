import type { StockSymbol } from "./companies";
export type Catalyst = {
  id: string;
  date: string;
  title: string;
  detail: string;
  tone: "bull" | "risk" | "event";
};
export type Filing = {
  id: string;
  form: string;
  title: string;
  filed: string;
  sourceId: string;
};
export type StockStory = {
  id: string;
  title: string;
  published: string;
  sourceId: string;
};
export const catalysts: Record<StockSymbol, Catalyst[]> = Object.fromEntries(
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
    [
      {
        id: "earnings",
        date: "Aug 27 · After close",
        title: "Next earnings",
        detail:
          "Guidance and demand visibility will set the next expectations bar.",
        tone: "event",
      },
      {
        id: "bull",
        date: "Bull interpretation",
        title: "Demand stays resilient",
        detail:
          "Sustained growth with stable margins could support the current premium.",
        tone: "bull",
      },
      {
        id: "risk",
        date: "Risk interpretation",
        title: "Expectations leave little room",
        detail:
          "A softer outlook or higher yields could pressure the valuation.",
        tone: "risk",
      },
    ],
  ]),
) as Record<StockSymbol, Catalyst[]>;
export const filings: Record<StockSymbol, Filing[]> = Object.fromEntries(
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
    [
      {
        id: `${symbol}-10q`,
        form: "10-Q",
        title: "Quarterly report",
        filed: "Filed 12 days ago",
        sourceId: "sec",
      },
      {
        id: `${symbol}-8k`,
        form: "8-K",
        title: "Current report",
        filed: "Filed 3 weeks ago",
        sourceId: "sec",
      },
    ],
  ]),
) as Record<StockSymbol, Filing[]>;
export const stockStories: Record<StockSymbol, StockStory[]> =
  Object.fromEntries(
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
      [
        {
          id: `${symbol}-demand`,
          title: "What the latest demand signals mean for the next quarter",
          published: "38 min ago",
          sourceId: "editorial",
        },
        {
          id: `${symbol}-rates`,
          title: "Rates, positioning and today’s growth-stock leadership",
          published: "1 hr ago",
          sourceId: "market",
        },
      ],
    ]),
  ) as Record<StockSymbol, StockStory[]>;
