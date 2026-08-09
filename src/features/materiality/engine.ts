import type { ChangeKind, MaterialChange, SnapshotEvidenceRef, SymbolSnapshot, WatchlistSnapshot } from "./types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const stableId = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

function evidenceKey(item: SnapshotEvidenceRef) {
  return item.sourceUrl?.trim().toLowerCase() || item.id;
}

function newest(items: SnapshotEvidenceRef[]) {
  return [...items].sort((left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt))[0];
}

function newEvidence(current: SnapshotEvidenceRef[], previous: SnapshotEvidenceRef[]) {
  const known = new Set(previous.flatMap((item) => [item.id, evidenceKey(item)]));
  return current.filter((item) => !known.has(item.id) && !known.has(evidenceKey(item)));
}

export function scoreMateriality(input: {
  symbol: string;
  kind: ChangeKind;
  snapshot: SymbolSnapshot;
  freshNews: SnapshotEvidenceRef[];
  freshFilings: SnapshotEvidenceRef[];
  freshEvents: SnapshotEvidenceRef[];
  seen: boolean;
  now: number;
}) {
  let score = 0;
  const reasons: string[] = [];
  const move = input.snapshot.changePercent ?? null;
  const ratio = input.snapshot.priceContext?.unusualMoveRatio ?? null;
  if (move !== null) {
    const magnitude = Math.abs(move);
    score += Math.min(28, magnitude * 5);
    if (ratio !== null && ratio >= 2) {
      score += 30;
      reasons.push(`Move is ${ratio.toFixed(1)}× its recent typical daily move`);
    } else if (ratio !== null && ratio >= 1.35) {
      score += 17;
      reasons.push(`Move is elevated versus its recent typical daily move`);
    } else if (magnitude >= 3) reasons.push(`Daily move is ${magnitude.toFixed(1)}%`);
  }
  if (input.freshNews.length) {
    score += 26 + Math.min(8, (input.freshNews.length - 1) * 4);
    reasons.push(input.freshNews.length > 1 ? `${input.freshNews.length} fresh directly related reports` : "Fresh directly related company news");
  }
  if (input.freshFilings.length) {
    score += 24;
    reasons.push("New SEC filing since the previous check");
  }
  if (input.freshEvents.length) {
    score += 18;
    reasons.push("New or changed company event");
  }
  const newestItem = newest([...input.freshNews, ...input.freshFilings, ...input.freshEvents]);
  const age = newestItem ? input.now - Date.parse(newestItem.occurredAt) : 0;
  if (Number.isFinite(age) && age > 7 * DAY) score -= 24;
  else if (Number.isFinite(age) && age > 2 * DAY) score -= 8;
  if (!input.seen) {
    score += 10;
    reasons.push("Evidence has not been seen");
  } else score -= 18;
  return { score: Math.max(0, Math.round(score)), reasons };
}

function combineCrossSymbolNews(changes: MaterialChange[]) {
  const byEvidence = new Map<string, MaterialChange[]>();
  for (const change of changes) {
    if (change.kind !== "news" && change.kind !== "combined") continue;
    for (const id of change.evidenceIds.filter((value) => value.startsWith("news:"))) {
      byEvidence.set(id, [...(byEvidence.get(id) ?? []), change]);
    }
  }
  const consumed = new Set<string>();
  const combined: MaterialChange[] = [];
  for (const group of byEvidence.values()) {
    const unique = [...new Map(group.map((change) => [change.symbol, change])).values()];
    if (unique.length < 2) continue;
    unique.forEach((change) => consumed.add(change.id));
    const symbols = unique.map((change) => change.symbol).sort();
    const evidenceIds = [...new Set(unique.flatMap((change) => change.evidenceIds))];
    combined.push({
      ...unique.sort((left, right) => right.materialityScore - left.materialityScore)[0]!,
      id: `shared:${stableId(evidenceIds.sort().join("|"))}`,
      symbol: symbols[0]!,
      affectedSymbols: symbols,
      kind: "combined",
      materialityScore: Math.min(100, Math.max(...unique.map((change) => change.materialityScore)) + 8),
      reasons: [`One development affects ${symbols.length} watched companies`, ...new Set(unique.flatMap((change) => change.reasons))].slice(0, 4),
      evidenceIds,
      title: unique[0]!.title,
    });
  }
  return [...changes.filter((change) => !consumed.has(change.id)), ...combined];
}

export function detectMaterialChanges(input: {
  previous: WatchlistSnapshot | null;
  current: WatchlistSnapshot;
  seenChangeIds?: ReadonlySet<string>;
  threshold?: number;
  now?: number;
}): import("./types").ChangeDetectionResult {
  const comparedAt = input.current.capturedAt;
  if (!input.previous) return { baselineReady: true, comparedAt, previousCapturedAt: null, materialChanges: [], quietSymbols: Object.keys(input.current.symbols) };
  const now = input.now ?? Date.parse(comparedAt);
  const threshold = input.threshold ?? 35;
  const changes: MaterialChange[] = [];
  const quiet = new Set(Object.keys(input.current.symbols));
  for (const [symbol, current] of Object.entries(input.current.symbols)) {
    const previous = input.previous.symbols[symbol];
    if (!previous) continue;
    const freshNews = newEvidence(current.news, previous.news);
    const freshFilings = newEvidence(current.filings, previous.filings);
    const freshEvents = newEvidence(current.events, previous.events);
    const ratio = current.priceContext?.unusualMoveRatio ?? null;
    const meaningfulMove = Math.abs(current.changePercent ?? 0) >= 3 || (ratio !== null && ratio >= 1.35);
    const kinds: ChangeKind[] = [meaningfulMove ? "price_move" : null, freshNews.length ? "news" : null, freshFilings.length ? "filing" : null, freshEvents.length ? "event" : null].filter((value): value is ChangeKind => value !== null);
    if (!kinds.length) continue;
    const kind: ChangeKind = kinds.length > 1 ? "combined" : kinds[0]!;
    const evidenceIds = [
      ...(meaningfulMove ? [`price:${symbol}:${input.current.capturedAt}`] : []),
      ...freshNews.map((item) => `news:${evidenceKey(item)}`),
      ...freshFilings.map((item) => `filing:${item.id}`),
      ...freshEvents.map((item) => `event:${item.id}`),
    ];
    const id = `${symbol}:${stableId(evidenceIds.sort().join("|"))}`;
    const seen = input.seenChangeIds?.has(id) ?? false;
    const scored = scoreMateriality({ symbol, kind, snapshot: current, freshNews, freshFilings, freshEvents, seen, now });
    if (scored.score < threshold) continue;
    const leading = newest([...freshNews, ...freshFilings, ...freshEvents]);
    changes.push({
      id,
      symbol,
      affectedSymbols: [symbol],
      kind,
      occurredAt: leading?.occurredAt ?? input.current.capturedAt,
      firstSeenAt: input.current.capturedAt,
      materialityScore: scored.score,
      reasons: scored.reasons.slice(0, 4),
      evidenceIds,
      seen,
      title: leading?.title ?? (meaningfulMove ? `${symbol} moved outside its recent range` : `${symbol} has a new development`),
      movePercent: current.changePercent ?? null,
      moveLabel: current.priceContext?.label ?? null,
    });
    quiet.delete(symbol);
  }
  const materialChanges = combineCrossSymbolNews(changes).sort((left, right) => right.materialityScore - left.materialityScore || Date.parse(right.occurredAt) - Date.parse(left.occurredAt));
  return { baselineReady: false, comparedAt, previousCapturedAt: input.previous.capturedAt, materialChanges, quietSymbols: [...quiet] };
}
