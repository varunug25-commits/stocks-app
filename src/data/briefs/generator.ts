import { catalysts, filings } from "../stocks/content.ts";
import type { StockSymbol } from "../stocks/companies.ts";
import { insights } from "../stocks/insights.ts";
import { prices } from "../stocks/prices.ts";
import { sourceMetadata } from "../stocks/sources.ts";
import { briefEditionTemplates, briefTemplates } from "./templates.ts";
import type {
  BriefEvent,
  BriefHistorySeed,
  BriefSource,
  BriefSourceId,
  BriefStockImpact,
  GeneratedBrief,
} from "./types.ts";

const buildSources = (
  symbols: StockSymbol[],
  sufficientEvidence: boolean,
): BriefSource[] => {
  const sourceIds: BriefSourceId[] = [
    "market",
    ...((sufficientEvidence || symbols.length) ? ["editorial" as const] : []),
    ...(symbols.length ? ["sec" as const] : []),
  ];
  return sourceIds.map((id) => {
    const source = sourceMetadata[id];
    const supports = id === "market"
      ? ["Broader market direction", "Confirmed market and rates context"]
      : id === "editorial"
        ? ["Clearly labeled watchlist interpretation", "Scheduled company catalyst context"]
        : [`${symbols[0]} filing event`, "Company-reported filing context"];
    return {
      ...source,
      id,
      type: source.kind,
      relevance: id === "market"
        ? "Supports this edition’s market direction and rates context."
        : id === "editorial"
          ? "Supports the clearly labeled interpretation, not a confirmed cause."
          : `Supports the filing event and company-reported context for ${symbols[0]}.`,
      supports,
    };
  });
};

const impactFor = (
  symbol: StockSymbol,
  sufficientEvidence: boolean,
): BriefStockImpact => {
  const price = prices[symbol];
  const magnitude = Math.abs(price.changePercent);
  return {
    symbol,
    direction: price.change >= 0 ? "up" : "down",
    changePercent: price.changePercent,
    reason: sufficientEvidence
      ? insights[symbol].summary
      : "The price move is confirmed, but a reliable cause is not.",
    impact: magnitude >= 3 ? "High" : magnitude >= 1 ? "Medium" : "Low",
    nextCatalyst: catalysts[symbol][0]?.title ?? "Next company update",
    sourceIds: sufficientEvidence ? ["market", "editorial"] : ["market"],
  };
};

const eventsFor = (symbols: StockSymbol[]): BriefEvent[] => {
  const stockEvents = symbols.slice(0, 3).map((symbol) => ({
    id: `${symbol}-event`,
    timing: catalysts[symbol][0]?.date ?? "Upcoming",
    title: `${symbol} · ${catalysts[symbol][0]?.title ?? "Company update"}`,
    detail:
      catalysts[symbol][0]?.detail ??
      "The next company update may change the current interpretation.",
    kind: catalysts[symbol][0]?.id.includes("earnings")
      ? "earnings" as const
      : "catalyst" as const,
    symbol,
    sourceIds: ["editorial" as const],
  }));
  const filingEvent = symbols[0]
    ? {
        id: `${symbols[0]}-filing`,
        timing: filings[symbols[0]][0]?.filed ?? "Recent",
        title: `${symbols[0]} filing context`,
        detail: "Review company-reported language before drawing conclusions.",
        kind: "filing" as const,
        symbol: symbols[0],
        sourceIds: ["sec" as const],
      }
    : null;
  return [
    ...stockEvents,
    ...(filingEvent ? [filingEvent] : []),
    {
      id: "economic-yields",
      timing: "10:00 AM ET",
      title: "Rates and activity update",
      detail: "Illustrative macro context that may affect growth valuations.",
      kind: "economic",
      sourceIds: ["market"],
    },
  ];
};

export function generateBrief(
  seed: BriefHistorySeed,
  symbols: StockSymbol[],
  options: { insufficientEvidence?: boolean } = {},
): GeneratedBrief {
  const template = briefEditionTemplates[seed.id] ?? briefTemplates[seed.type];
  const sufficientEvidence = !options.insufficientEvidence;
  const watchlistImpacts = symbols.map((symbol) => impactFor(symbol, sufficientEvidence));
  const emptyContext = symbols.length === 0;
  return {
    ...seed,
    readingMinutes: 4,
    headline: emptyContext
      ? "Your market context is ready when your watchlist is"
      : sufficientEvidence
        ? template.headline
        : "The signal is incomplete, so the reason stays open",
    summary: emptyContext
      ? "Add companies to the shared watchlist to connect this local market summary to the names you care about."
      : sufficientEvidence
        ? template.summary
        : "Available local sources confirm the price move, but they do not establish a reliable cause. This brief will not invent one.",
    developments: emptyContext
      ? template.developments.slice(0, 2)
      : template.developments,
    marketContext: template.marketContext,
    marketDirection: template.marketDirection,
    changeSinceMorning: seed.type === "evening"
      ? "The opening bid held into the close, market breadth improved late, and semiconductor leadership remained the clearest watchlist signal."
      : undefined,
    watchlistImpacts,
    events: eventsFor(symbols),
    monitor: sufficientEvidence
      ? template.monitor
      : [
          "A new company filing or statement",
          "Corroborating market or sector evidence",
          "The next scheduled company update",
        ],
    positiveScenario: template.positiveScenario,
    riskScenario: template.riskScenario,
    evidence: [
      {
        kind: "FACT",
        title: "What the local record confirms",
        body: sufficientEvidence
          ? "Illustrative prices, scheduled events and available company records support the developments shown above."
          : "The local record confirms the price move and available timestamps only.",
        sourceIds: symbols.length ? ["market", "sec"] : ["market"],
      },
      {
        kind: "INTERPRETATION",
        title: "How to read the setup",
        body: sufficientEvidence
          ? "A calmer rates backdrop and resilient growth demand provide a plausible, non-exclusive interpretation."
          : "No interpretation is presented as a cause because corroborating company evidence is missing.",
        sourceIds: sufficientEvidence ? ["market", "editorial"] : [],
      },
      {
        kind: "UNCERTAINTY",
        title: sufficientEvidence ? "What could change the view" : "What evidence is missing",
        body: sufficientEvidence
          ? "Positioning, broad market flows and new guidance could change this explanation quickly."
          : "A company filing, direct statement or corroborated sector source could clarify the move. Until then, causation remains unconfirmed.",
        sourceIds: [],
      },
    ],
    sources: buildSources(symbols, sufficientEvidence),
    sufficientEvidence,
    confidence: sufficientEvidence ? "Medium" : "Low",
  };
}

export function getBriefShareResultMessage(
  action: string,
  sharedAction: string,
  dismissedAction: string,
) {
  if (action === dismissedAction)
    return "Sharing was cancelled. Your brief is unchanged.";
  if (action === sharedAction) return "Demo brief shared.";
  return "Sharing finished without a confirmed result.";
}

export function buildBriefShareText(brief: GeneratedBrief) {
  return [
    "MarketBrief",
    brief.type === "morning" ? "Morning Brief" : "Evening Recap",
    brief.dateLabel,
    brief.headline,
    brief.summary,
    "Demo content for informational purposes only. Not investment advice.",
  ].join("\n\n");
}
