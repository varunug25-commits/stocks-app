import type { StockSymbol } from "./companies";
export type Driver = {
  id: string;
  title: string;
  detail: string;
  tone: "positive" | "negative" | "neutral";
  fact: boolean;
};
export type MovementInsight = {
  summary: string;
  confidence: "High" | "Medium" | "Low";
  confirmedFacts: string[];
  interpretation: string;
  uncertainty: string;
  positive: Driver[];
  negative: Driver[];
  monitor: string[];
  sufficientEvidence: boolean;
};
const base: MovementInsight = {
  summary:
    "The move reflects stronger semiconductor demand signals and a calmer rates backdrop.",
  confidence: "Medium",
  confirmedFacts: [
    "Peer commentary pointed to resilient accelerator demand.",
    "The 10-year Treasury yield eased during the session.",
  ],
  interpretation:
    "Investors appear to be rewarding companies with visible AI infrastructure demand while financing conditions remain supportive.",
  uncertainty:
    "No single filing or company announcement fully explains today’s move. Positioning and broad sector flows may also be contributing.",
  positive: [
    {
      id: "demand",
      title: "Demand signal strengthened",
      detail:
        "Recent industry commentary supports continued data-center spending.",
      tone: "positive",
      fact: true,
    },
    {
      id: "rates",
      title: "Rates provided support",
      detail:
        "Lower long-term yields helped growth valuations during the session.",
      tone: "positive",
      fact: true,
    },
  ],
  negative: [
    {
      id: "valuation",
      title: "Valuation remains demanding",
      detail:
        "A high expectations bar can amplify reversals when evidence weakens.",
      tone: "negative",
      fact: false,
    },
  ],
  monitor: ["Supplier commentary", "Treasury yields", "Next earnings guidance"],
  sufficientEvidence: true,
};
export const insights = Object.fromEntries(
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
    {
      ...base,
      summary:
        symbol === "TSLA"
          ? "Shares weakened as delivery expectations and price competition returned to focus."
          : base.summary,
      sufficientEvidence: symbol !== "NFLX",
      confidence: symbol === "NFLX" ? "Low" : "Medium",
    },
  ]),
) as Record<StockSymbol, MovementInsight>;
