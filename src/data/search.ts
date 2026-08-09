import type { StockSearchResult } from "./real/contracts";

export type SearchStock = { symbol: string; name: string; sector?: string; exchange?: string | null; assetType?: string; price?: string; changePercent?: number; logoColor?: string };

export const searchableStocks: SearchStock[] = [
  { symbol: "AAPL", name: "Apple", sector: "Technology", price: "$271.06", changePercent: 1.16, logoColor: "#7D8790" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", price: "$552.14", changePercent: 0.71, logoColor: "#1B8FEB" },
  { symbol: "NVDA", name: "NVIDIA", sector: "Semiconductors", price: "$182.41", changePercent: 3.82, logoColor: "#76B900" },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer", price: "$418.73", changePercent: -2.24, logoColor: "#D83B3E" },
  { symbol: "AMZN", name: "Amazon", sector: "Consumer", price: "$234.11", changePercent: 0.94, logoColor: "#E49A25" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Communication", price: "$205.32", changePercent: 0.38, logoColor: "#4A73C9" },
  { symbol: "META", name: "Meta Platforms", sector: "Communication", price: "$721.20", changePercent: 1.42, logoColor: "#3970C7" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors", price: "$196.08", changePercent: 3.14, logoColor: "#35799C" },
  { symbol: "PLTR", name: "Palantir", sector: "Technology", price: "$188.20", changePercent: 2.61, logoColor: "#5A5FCC" },
  { symbol: "NFLX", name: "Netflix", sector: "Communication", price: "$1,176.44", changePercent: -1.37, logoColor: "#D43535" },
];

export const recentSearches = ["AAPL", "NVDA", "MSFT"];
export const trendingStocks = ["NVDA", "PLTR", "AMD", "TSLA"];

export function searchLocalStocks(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return searchableStocks.filter((stock) => stock.symbol.toLowerCase().includes(normalized) || stock.name.toLowerCase().includes(normalized));
}

export function findStock(symbol: string) {
  return searchableStocks.find((stock) => stock.symbol === symbol);
}

export function searchResultToStock(result: StockSearchResult): SearchStock {
  return {
    symbol: result.symbol,
    name: result.name,
    exchange: result.exchange,
    assetType: result.assetType,
  };
}
