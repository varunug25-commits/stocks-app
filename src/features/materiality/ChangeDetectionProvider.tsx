import type { PropsWithChildren } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { DataResource, PriceBar } from "@/data/real";
import { barKey, useMarketData } from "@/features/market-data/MarketDataProvider";
import { useWatchlist } from "@/features/watchlist/WatchlistProvider";
import { buildWatchlistSnapshot } from "./snapshot";
import { detectMaterialChanges } from "./engine";
import { calculatePriceContext } from "./unusualMove";
import { localSeenChangeStore, localSnapshotStore } from "./storage";
import type { ChangeDetectionResult, WatchlistSnapshot } from "./types";

type ChangeDetectionValue = {
  result: ChangeDetectionResult | null;
  loading: boolean;
  lastCheckedAt: string | null;
  refresh(): Promise<void>;
  markSeen(ids: string[]): Promise<void>;
};

const Context = createContext<ChangeDetectionValue | null>(null);
const terminal = (resource: DataResource<unknown> | undefined) => resource && resource.status !== "idle" && resource.status !== "loading";
const barsFrom = (resource: DataResource<PriceBar[]> | undefined) => resource?.status === "ready" || resource?.status === "stale" ? resource.data : [];

export function ChangeDetectionProvider({ children }: PropsWithChildren) {
  const { state: watchlist, hydrated } = useWatchlist();
  const { quotes, news, filings, events, bars, loadQuotes, loadBars, loadNews, loadEvents, loadFilings } = useMarketData();
  const [previous, setPrevious] = useState<WatchlistSnapshot | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [storesHydrated, setStoresHydrated] = useState(false);
  const [result, setResult] = useState<ChangeDetectionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [richLoadedKey, setRichLoadedKey] = useState<string | null>(null);
  const comparisonKey = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([localSnapshotStore.load(), localSeenChangeStore.load()])
      .then(([snapshot, seen]) => { if (active) { setPrevious(snapshot); setSeenIds(seen); } })
      .finally(() => { if (active) setStoresHydrated(true); });
    return () => { active = false; };
  }, []);

  const watchlistKey = watchlist.symbols.join("|");
  const refresh = useCallback(async () => {
    if (!hydrated || !storesHydrated) return;
    setLoading(true);
    comparisonKey.current = null;
    setRichLoadedKey(null);
    await loadQuotes(watchlist.symbols);
  }, [hydrated, loadQuotes, storesHydrated, watchlist.symbols]);

  useEffect(() => {
    if (!hydrated || !storesHydrated) return;
    let active = true;
    void Promise.resolve().then(() => active ? refresh() : undefined);
    return () => { active = false; };
  }, [hydrated, refresh, storesHydrated, watchlistKey]);

  const quotePassReady = watchlist.symbols.every((symbol) => terminal(quotes[symbol]));
  const candidates = useMemo(() => [...watchlist.symbols].sort((left, right) => {
    const leftResource = quotes[left];
    const rightResource = quotes[right];
    const leftMove = leftResource?.status === "ready" || leftResource?.status === "stale" ? Math.abs(leftResource.data.changePercent ?? 0) : -1;
    const rightMove = rightResource?.status === "ready" || rightResource?.status === "stale" ? Math.abs(rightResource.data.changePercent ?? 0) : -1;
    return rightMove - leftMove;
  }).slice(0, 5), [quotes, watchlist.symbols]);
  const candidateKey = candidates.join("|");

  useEffect(() => {
    if (!quotePassReady || !candidateKey || richLoadedKey === `${watchlistKey}:${candidateKey}`) return;
    let active = true;
    void Promise.all(candidates.flatMap((symbol) => [
      loadBars(symbol, "1M"),
      loadNews(symbol),
      loadEvents(symbol),
      loadFilings(symbol),
    ])).finally(() => { if (active) setRichLoadedKey(`${watchlistKey}:${candidateKey}`); });
    return () => { active = false; };
  }, [candidateKey, candidates, loadBars, loadEvents, loadFilings, loadNews, quotePassReady, richLoadedKey, watchlistKey]);

  useEffect(() => {
    if (!storesHydrated || !quotePassReady || (candidates.length > 0 && richLoadedKey !== `${watchlistKey}:${candidateKey}`)) return;
    const fingerprint = JSON.stringify([
      watchlistKey,
      ...watchlist.symbols.map((symbol) => {
        const quote = quotes[symbol];
        return quote?.status === "ready" || quote?.status === "stale" ? quote.meta.fetchedAt : quote?.status;
      }),
      ...candidates.flatMap((symbol) => [news[symbol], filings[symbol], events[symbol]].map((resource) => resource?.status === "ready" || resource?.status === "stale" ? resource.meta.fetchedAt : resource?.status)),
    ]);
    if (comparisonKey.current === fingerprint) return;
    comparisonKey.current = fingerprint;
    const capturedAt = new Date().toISOString();
    const priceContexts = Object.fromEntries(candidates.map((symbol) => {
      const quote = quotes[symbol];
      const change = quote?.status === "ready" || quote?.status === "stale" ? quote.data.changePercent : null;
      return [symbol, calculatePriceContext(barsFrom(bars[barKey(symbol, "1M")]), change)];
    }));
    const current = buildWatchlistSnapshot({
      symbols: watchlist.symbols,
      capturedAt,
      quotes,
      news,
      filings,
      events,
      priceContexts,
      previous,
    });
    const next = detectMaterialChanges({ previous, current, seenChangeIds: seenIds });
    setResult(next);
    setPrevious(current);
    setLoading(false);
    void localSnapshotStore.save(current).catch(() => undefined);
  }, [bars, candidateKey, candidates, events, filings, news, previous, quotePassReady, quotes, richLoadedKey, seenIds, storesHydrated, watchlist.symbols, watchlistKey]);

  const markSeen = useCallback(async (ids: string[]) => {
    if (!ids.length) return;
    await localSeenChangeStore.markSeen(ids);
    setSeenIds((current) => new Set([...current, ...ids]));
    setResult((current) => current ? { ...current, materialChanges: current.materialChanges.map((change) => ids.includes(change.id) ? { ...change, seen: true } : change) } : current);
  }, []);

  const value = useMemo(() => ({ result, loading, lastCheckedAt: result?.previousCapturedAt ?? null, refresh, markSeen }), [loading, markSeen, refresh, result]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useChangeDetection() {
  const value = useContext(Context);
  if (!value) throw new Error("useChangeDetection must be used within ChangeDetectionProvider");
  return value;
}
