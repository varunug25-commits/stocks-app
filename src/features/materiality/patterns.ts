import type { CompanyIdentity, MarketEventData, MarketQuote } from "@/data/real";
import type { MaterialChange } from "./types";

export type WatchlistBreadth = { higher: number; lower: number; unchanged: number; unavailable: number };
export type WatchlistPattern = { id: string; title: string; detail: string; symbols: string[]; tone: "neutral" | "attention" };

export function calculateWatchlistBreadth(symbols: string[], quotes: Record<string, MarketQuote | null>): WatchlistBreadth {
  return symbols.reduce<WatchlistBreadth>((result, symbol) => {
    const move = quotes[symbol]?.changePercent;
    if (move === null || move === undefined) result.unavailable += 1;
    else if (move > 0.001) result.higher += 1;
    else if (move < -0.001) result.lower += 1;
    else result.unchanged += 1;
    return result;
  }, { higher: 0, lower: 0, unchanged: 0, unavailable: 0 });
}

export function deriveWatchlistPatterns(input: {
  symbols: string[];
  quotes: Record<string, MarketQuote | null>;
  companies: Record<string, CompanyIdentity | null>;
  changes: MaterialChange[];
  events: MarketEventData[];
  now: number;
}): WatchlistPattern[] {
  const patterns: WatchlistPattern[] = [];
  const moves = input.symbols.flatMap((symbol) => {
    const move = input.quotes[symbol]?.changePercent;
    return move === null || move === undefined ? [] : [{ symbol, move }];
  });
  const totalMagnitude = moves.reduce((sum, item) => sum + Math.abs(item.move), 0);
  const top = [...moves].sort((left, right) => Math.abs(right.move) - Math.abs(left.move)).slice(0, 2);
  const concentration = totalMagnitude > 0 ? top.reduce((sum, item) => sum + Math.abs(item.move), 0) / totalMagnitude : 0;
  if (moves.length >= 4 && concentration >= 0.65) patterns.push({ id: "concentration", title: "Movement is concentrated", detail: `${top.map((item) => item.symbol).join(" and ")} account for most absolute movement within your watchlist.`, symbols: top.map((item) => item.symbol), tone: "attention" });

  const sectors = new Map<string, { symbol: string; move: number }[]>();
  for (const item of moves) {
    const sector = input.companies[item.symbol]?.sector;
    if (sector) sectors.set(sector, [...(sectors.get(sector) ?? []), item]);
  }
  for (const [sector, members] of sectors) {
    const lower = members.filter((item) => item.move < 0);
    const higher = members.filter((item) => item.move > 0);
    const aligned = lower.length >= 2 ? lower : higher.length >= 2 ? higher : [];
    if (aligned.length >= 2) patterns.push({ id: `sector:${sector}`, title: `${sector} holdings moved ${lower.length >= 2 ? "lower" : "higher"}`, detail: `${aligned.length} related holdings moved in the same direction within your watchlist. This does not establish a sector-wide cause.`, symbols: aligned.map((item) => item.symbol), tone: "neutral" });
  }

  const shared = input.changes.filter((change) => change.affectedSymbols.length > 1);
  if (shared.length) patterns.push({ id: "shared-evidence", title: "A shared development affected multiple holdings", detail: `${[...new Set(shared.flatMap((change) => change.affectedSymbols))].join(", ")} share directly related evidence.`, symbols: [...new Set(shared.flatMap((change) => change.affectedSymbols))], tone: "attention" });

  const horizon = input.now + 7 * 86_400_000;
  const upcoming = input.events.filter((event) => event.scheduledAt && Date.parse(event.scheduledAt) >= input.now && Date.parse(event.scheduledAt) <= horizon);
  if (upcoming.length >= 2) patterns.push({ id: "event-cluster", title: `${upcoming.length} known events in the next seven days`, detail: "Several watched companies have provider-backed dates approaching.", symbols: [...new Set(upcoming.flatMap((event) => event.symbol ? [event.symbol] : []))], tone: "attention" });

  const quiet = input.symbols.length - new Set(input.changes.flatMap((change) => change.affectedSymbols)).size;
  if (quiet > 0) patterns.push({ id: "quiet", title: `${quiet} of ${input.symbols.length} holdings had no material development`, detail: "No new evidence passed the current attention threshold for those holdings.", symbols: [], tone: "neutral" });
  return patterns.slice(0, 5);
}
