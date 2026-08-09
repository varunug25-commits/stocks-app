import type {
  BulletClaim,
  EvidenceItem,
  IntelligenceRequest,
  IntelligenceSection,
  ModelCandidate,
} from "./contracts.ts";

export type StructuredGenerationInput = {
  request: IntelligenceRequest;
  evidence: EvidenceItem[];
  untrustedContext: string;
};

export interface StructuredAIProvider {
  readonly name: string;
  readonly mode: "mock" | "live";
  generateStructuredResponse(input: StructuredGenerationInput): Promise<ModelCandidate>;
}

function claim(
  id: string,
  text: string,
  kind: BulletClaim["kind"],
  sourceIds: string[] = [],
): BulletClaim {
  return { id, text: text.slice(0, 240), kind, sourceIds };
}

function section(id: string, title: string, bullets: BulletClaim[]): IntelligenceSection | null {
  return bullets.length ? { id, title, bullets: bullets.slice(0, 5) } : null;
}

function quoteText(entry: EvidenceItem) {
  return entry.text ?? `${entry.symbol ?? "Company"} quote is available.`;
}

function latest(items: EvidenceItem[], count: number) {
  return [...items].sort((left, right) => Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "")).slice(0, count);
}

function whyCandidate(input: StructuredGenerationInput): ModelCandidate {
  const symbol = input.request.symbols[0] ?? "Company";
  const quote = input.evidence.find((entry) => entry.type === "quote");
  const news = input.evidence.filter((entry) => entry.type === "news").slice(0, 2);
  const filings = latest(input.evidence.filter((entry) => entry.type === "filing"), 1);
  const events = latest(input.evidence.filter((entry) => entry.type === "event"), 2);
  const priceContext = input.evidence.filter((entry) => entry.type === "price_move").slice(0, 1);
  const confirmed = [
    ...(quote ? [claim("confirmed-quote", quoteText(quote), "confirmed", [quote.id])] : []),
    ...news.map((entry, index) => claim(`confirmed-news-${index}`, `${entry.publisher ?? "A source"} reported: ${entry.title ?? entry.text ?? "Company-related news"}.`, "confirmed", [entry.id])),
    ...filings.map((entry, index) => claim(`confirmed-filing-${index}`, entry.text ?? entry.title ?? "A recent SEC filing is available.", "confirmed", [entry.id])),
  ];
  const contributing = news.length
    ? [claim("interpretation-1", "Recent company-relevant coverage may be contributing to the move, but the available record does not prove a single cause.", "interpretation", news.map((entry) => entry.id))]
    : [];
  const uncertainty = [claim(
    "uncertainty-1",
    news.length ? "Available sources do not establish that one specific development caused the price move." : "No clear company-specific catalyst was identified in the available sources.",
    "uncertainty",
  )];
  const catalysts = events.map((entry, index) => claim(`catalyst-${index}`, entry.text ?? entry.title ?? "An upcoming company event is available.", "catalyst", [entry.id]));
  return {
    headline: `${symbol}: what the evidence shows`,
    oneLineSummary: quote ? quoteText(quote) : `Evidence for ${symbol} is limited right now.`,
    symbols: input.request.symbols,
    sections: [
      section("confirmed", "Confirmed", confirmed),
      section("contributing", "Likely contributing factors", contributing),
      section("price-context", "Price context", priceContext.map((entry) => claim("price-context-1", entry.text ?? "Historical price context is available.", "confirmed", [entry.id]))),
      section("uncertainty", "Uncertainty", uncertainty),
      section("next", "What matters next", catalysts),
    ].filter(Boolean),
  };
}

function briefCandidate(input: StructuredGenerationInput): ModelCandidate {
  const quotes = input.evidence.filter((entry) => entry.type === "quote").slice(0, 5);
  const news = input.evidence.filter((entry) => entry.type === "news").slice(0, Math.max(0, 5 - quotes.length));
  const events = input.evidence.filter((entry) => entry.type === "event").slice(0, 5);
  const filings = input.evidence.filter((entry) => entry.type === "filing").slice(0, 2);
  const developments = [
    ...quotes.map((entry, index) => claim(`move-${index}`, quoteText(entry), "confirmed", [entry.id])),
    ...news.map((entry, index) => claim(`news-${index}`, `${entry.symbol ?? "Watchlist"}: ${entry.title ?? entry.text ?? "Relevant coverage is available"}.`, "confirmed", [entry.id])),
    ...filings.map((entry, index) => claim(`filing-${index}`, entry.text ?? entry.title ?? "A filing is available.", "confirmed", [entry.id])),
  ].slice(0, 5);
  const catalysts = events.map((entry, index) => claim(`event-${index}`, entry.text ?? entry.title ?? "An event is scheduled.", "catalyst", [entry.id]));
  const uncertainty = developments.length
    ? [claim("brief-uncertainty", "Price moves and nearby headlines may be related, but this brief does not treat timing alone as proof of causation.", "uncertainty")]
    : [claim("brief-insufficient", "There is not enough current evidence to produce a useful watchlist brief.", "uncertainty")];
  const edition = input.request.edition === "evening" ? "Evening recap" : "Morning brief";
  return {
    headline: `${edition}: ${developments.length} things worth knowing`,
    oneLineSummary: developments.length ? "A concise, source-linked view of the most material watchlist evidence." : "Current evidence is limited.",
    symbols: input.request.symbols,
    sections: [
      section("developments", "Things worth knowing", developments),
      section("catalysts", input.request.edition === "evening" ? "Next catalysts" : "Today's catalysts", catalysts),
      section("uncertainty", "Uncertainty and watch items", uncertainty),
    ].filter(Boolean),
  };
}

function newsCandidate(input: StructuredGenerationInput): ModelCandidate {
  const relevant = input.evidence.filter((entry) => entry.type === "news").slice(0, 3);
  return {
    headline: relevant.length ? "Quick read" : "No material story found",
    oneLineSummary: relevant.length ? "The most relevant recent coverage, compressed without adding unsupported causality." : "No sufficiently relevant company story was found.",
    symbols: input.request.symbols,
    sections: [
      section("quick-read", "Quick read", relevant.map((entry, index) => claim(`news-${index}`, `${entry.publisher ?? "Source"}: ${entry.title ?? entry.text ?? "Relevant development"}.`, "confirmed", [entry.id]))),
      section("uncertainty", "Uncertainty", [claim("news-uncertainty", relevant.length ? "A published report can establish what was reported, not that it caused a market move." : "Low-relevance stories were excluded instead of summarized.", "uncertainty")]),
    ].filter(Boolean),
  };
}

function filingCandidate(input: StructuredGenerationInput): ModelCandidate {
  const filings = latest(input.evidence.filter((entry) => entry.type === "filing"), 3);
  return {
    headline: filings.length ? "Latest filing record" : "Filing evidence unavailable",
    oneLineSummary: filings.length ? "This summary is limited to verified filing metadata, not the full filing body." : "No supported SEC filing was available.",
    symbols: input.request.symbols,
    sections: [
      section("filing-record", "Filing record", filings.map((entry, index) => claim(`filing-${index}`, entry.text ?? entry.title ?? "A filing is available.", "confirmed", [entry.id]))),
      section("limits", "Evidence limits", [claim("filing-limit", "Only verified filing metadata was available; no unsupported financial metrics or management commentary were inferred.", "uncertainty")]),
    ].filter(Boolean),
  };
}

function askCandidate(input: StructuredGenerationInput): ModelCandidate {
  const question = input.request.question?.toLowerCase() ?? "";
  if (/filing|10-k|10-q|8-k/.test(question)) return filingCandidate(input);
  if (/news|story|headline/.test(question)) return newsCandidate(input);
  if (/why|move|changed|today|yesterday/.test(question)) return whyCandidate(input);
  if (/earnings|event|catalyst|report/.test(question)) {
    const events = input.evidence.filter((entry) => entry.type === "event").slice(0, 5);
    return {
      headline: "Upcoming catalysts",
      oneLineSummary: events.length ? "Known events from the available provider record." : "No supported upcoming event was found.",
      symbols: input.request.symbols,
      sections: [
        section("catalysts", "What matters next", events.map((entry, index) => claim(`event-${index}`, entry.text ?? entry.title ?? "An event is scheduled.", "catalyst", [entry.id]))),
        section("uncertainty", "Uncertainty", events.length ? [] : [claim("event-unknown", "Event coverage is incomplete or unavailable for this context.", "uncertainty")]),
      ].filter(Boolean),
    };
  }
  return briefCandidate(input);
}

export class MockStructuredAIProvider implements StructuredAIProvider {
  readonly name = "marketbrief-deterministic";
  readonly mode = "mock" as const;

  async generateStructuredResponse(input: StructuredGenerationInput): Promise<ModelCandidate> {
    switch (input.request.task) {
      case "why_moved": return whyCandidate(input);
      case "brief": return briefCandidate(input);
      case "news_summary": return newsCandidate(input);
      case "filing_summary": return filingCandidate(input);
      case "ask": return askCandidate(input);
    }
  }
}
