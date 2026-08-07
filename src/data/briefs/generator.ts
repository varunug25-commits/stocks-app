import { catalysts, filings } from "../stocks/content.ts";
import type { StockSymbol } from "../stocks/companies.ts";
import { insights } from "../stocks/insights.ts";
import { prices } from "../stocks/prices.ts";
import { sourceMetadata } from "../stocks/sources.ts";
import { briefEditionTemplates, briefTemplates } from "./templates.ts";
import type {
  BriefEvent,
  BriefEvidence,
  BriefHistorySeed,
  BriefSource,
  BriefSourceId,
  BriefStockImpact,
  GeneratedBrief,
} from "./types.ts";

type SourceReference = { sourceIds: BriefSourceId[]; claim: string };

const sourceRelevance: Record<BriefSourceId, string> = {
  market: "Supports only the configured market and macro claims in this edition.",
  editorial: "Supports configured interpretation or catalyst context; it does not independently prove causation.",
  sec: "Supports only configured company filing claims.",
};

const buildSources = (references: SourceReference[]): BriefSource[] => {
  const supportsById = new Map<BriefSourceId, Set<string>>();
  for (const reference of references) {
    for (const id of reference.sourceIds) {
      const supports = supportsById.get(id) ?? new Set<string>();
      supports.add(reference.claim);
      supportsById.set(id, supports);
    }
  }
  return [...supportsById.entries()].flatMap(([id, supports]) => {
    const source = Object.values(sourceMetadata).find((item) => item.id === id);
    if (!source) return [];
    return [{
      ...source,
      id,
      type: source.kind,
      relevance: sourceRelevance[id],
      supports: [...supports],
    }];
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
  const filing = symbols[0] ? filings[symbols[0]][0] : undefined;
  const filingEvent = symbols[0] && filing
    ? {
        id: `${symbols[0]}-filing`,
        timing: filing.filed,
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
  const events = eventsFor(symbols);
  const evidence: BriefEvidence[] = [
    {
      kind: "FACT",
      title: "What the local record confirms",
      body: sufficientEvidence
        ? template.factNarrative
        : "The local record confirms the price move and available timestamps only.",
      sourceIds: sufficientEvidence ? template.factSourceIds : ["market"],
    },
    {
      kind: "INTERPRETATION",
      title: "How to read the setup",
      body: sufficientEvidence
        ? template.interpretationNarrative
        : "No interpretation is presented as a cause because corroborating company evidence is missing.",
      sourceIds: sufficientEvidence ? template.interpretationSourceIds : [],
    },
    {
      kind: "UNCERTAINTY",
      title: sufficientEvidence ? "What could change the view" : "What evidence is missing",
      body: sufficientEvidence
        ? template.uncertaintyNarrative
        : "A company filing, direct statement or corroborated sector source could clarify the move. Until then, causation remains unconfirmed.",
      sourceIds: sufficientEvidence ? template.uncertaintySourceIds : [],
    },
  ];
  const sources = buildSources([
    {
      sourceIds: template.marketSourceIds,
      claim: `Market narrative: ${template.marketDirection}`,
    },
    ...evidence.map((item) => ({
      sourceIds: item.sourceIds,
      claim: `${item.kind}: ${item.title}`,
    })),
    ...watchlistImpacts.map((impact) => ({
      sourceIds: impact.sourceIds,
      claim: `${impact.symbol} watchlist impact`,
    })),
    ...events.map((event) => ({
      sourceIds: event.sourceIds,
      claim: `Event: ${event.title}`,
    })),
  ]);
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
    marketSourceIds: template.marketSourceIds,
    changeSinceMorning: template.changeSinceMorning,
    watchlistImpacts,
    events,
    monitor: sufficientEvidence
      ? template.monitor
      : [
          "A new company filing or statement",
          "Corroborating market or sector evidence",
          "The next scheduled company update",
        ],
    positiveScenario: template.positiveScenario,
    riskScenario: template.riskScenario,
    evidence,
    sources,
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
