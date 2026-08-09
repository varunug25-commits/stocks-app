import { searchableStocks } from "../../data/search.ts";
import type { StockSymbol } from "../../data/stocks/index.ts";
import { watchlist } from "../../data/today.ts";

export function selectTodayWatchlist(symbols: StockSymbol[]) {
  return symbols
    .map((symbol) => {
      const existing = watchlist.find((stock) => stock.symbol === symbol);
      if (existing) return existing;
      const stock = searchableStocks.find((item) => item.symbol === symbol);
      if (!stock) return null;
      return {
        ...stock,
        trend:
          (stock.changePercent ?? 0) >= 0
            ? [20, 22, 21, 25, 28, 27, 32, 36]
            : [39, 37, 38, 34, 32, 33, 29, 27],
      };
    })
    .filter((stock): stock is (typeof watchlist)[number] => Boolean(stock));
}
