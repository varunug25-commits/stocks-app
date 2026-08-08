import { companyBySymbol, prices } from "@/data/stocks";
import type { StockSymbol } from "@/data/stocks";
import type { BulletClaim, IntelligenceRequest, IntelligenceSection, IntelligenceSource, MarketBriefIntelligenceResponse } from "./contracts";

const source = (symbol: StockSymbol): IntelligenceSource => ({
  id: `demo-quote-${symbol}`,
  type: "quote",
  symbol,
  title: `${symbol} illustrative quote`,
  publisher: "MarketBrief demo data",
  publishedAt: "Illustrative",
});
const move = (symbol: keyof typeof prices): BulletClaim => {
  const snapshot = prices[symbol];
  return {
    id: `demo-move-${symbol}`,
    text: `${symbol} is ${snapshot.changePercent >= 0 ? "+" : ""}${snapshot.changePercent.toFixed(2)}% in the illustrative 1D view.`,
    kind: "confirmed",
    sourceIds: [`demo-quote-${symbol}`],
  };
};
const section = (id: string, title: string, bullets: BulletClaim[]): IntelligenceSection => ({ id, title, bullets });

export function demoIntelligence(request: IntelligenceRequest): MarketBriefIntelligenceResponse {
  const primary = request.symbols[0]!;
  const quoteClaims = request.symbols.slice(0, 5).map(move);
  const sources = request.symbols.map(source);
  const uncertainty: BulletClaim = {
    id: "demo-uncertainty",
    text: "This is deterministic illustrative intelligence; it does not claim a real company-specific cause.",
    kind: "uncertainty",
    sourceIds: [],
  };
  const catalyst: BulletClaim = {
    id: "demo-catalyst",
    text: `Monitor verified news, filings and events for ${companyBySymbol[primary].name} before drawing a causal conclusion.`,
    kind: "catalyst",
    sourceIds: [],
  };
  const sections = request.task === "brief"
    ? [section("developments", "Things worth knowing", quoteClaims), section("watch", "Uncertainty and watch items", [uncertainty])]
    : request.task === "filing_summary"
      ? [section("limits", "Evidence limits", [{ ...uncertainty, text: "No real filing body is analyzed in demo mode." }])]
      : request.task === "news_summary"
        ? [section("quick-read", "Quick read", [{ ...uncertainty, text: "No real publisher story is summarized in demo mode." }])]
        : [section("confirmed", "Confirmed", [move(primary)]), section("uncertainty", "Uncertainty", [uncertainty]), section("next", "What matters next", [catalyst])];
  const sourceIds = sections.flatMap((entry) => entry.bullets.flatMap((bullet) => bullet.sourceIds));
  return {
    headline: request.task === "brief"
      ? `${request.edition === "evening" ? "Evening recap" : "Morning brief"}: illustrative watchlist view`
      : `${primary}: illustrative evidence view`,
    oneLineSummary: "A deterministic preview of the grounded bullet and citation experience.",
    sections,
    sources: sources.filter((entry) => sourceIds.includes(entry.id)),
    sourceIds: [...new Set(sourceIds)],
    symbols: request.symbols,
    generatedAt: new Date().toISOString(),
    meta: { task: request.task, provider: "marketbrief-demo", providerMode: "mock", cached: false, evidenceCount: sourceIds.length, schemaVersion: "m7-v1" },
  };
}
