import type { CompanyIdentity } from "./contracts.ts";
import { ProviderError } from "./errors.ts";

export const companyRegistry: CompanyIdentity[] = [
  { id: "10000000-0000-4000-8000-000000000001", symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", currency: "USD", cik: "0000320193", sector: "Technology", industry: "Consumer Electronics", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000002", symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", currency: "USD", cik: "0000789019", sector: "Technology", industry: "Software - Infrastructure", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000003", symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", currency: "USD", cik: "0001045810", sector: "Technology", industry: "Semiconductors", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000004", symbol: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", currency: "USD", cik: "0001318605", sector: "Consumer Cyclical", industry: "Auto Manufacturers", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000005", symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", currency: "USD", cik: "0001018724", sector: "Consumer Cyclical", industry: "Internet Retail", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000006", symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", currency: "USD", cik: "0001652044", sector: "Communication Services", industry: "Internet Content & Information", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000007", symbol: "META", name: "Meta Platforms, Inc.", exchange: "NASDAQ", currency: "USD", cik: "0001326801", sector: "Communication Services", industry: "Internet Content & Information", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000008", symbol: "AMD", name: "Advanced Micro Devices, Inc.", exchange: "NASDAQ", currency: "USD", cik: "0000002488", sector: "Technology", industry: "Semiconductors", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000009", symbol: "PLTR", name: "Palantir Technologies Inc.", exchange: "NASDAQ", currency: "USD", cik: "0001321655", sector: "Technology", industry: "Software - Infrastructure", logoUrl: null, logoSource: null },
  { id: "10000000-0000-4000-8000-000000000010", symbol: "NFLX", name: "Netflix, Inc.", exchange: "NASDAQ", currency: "USD", cik: "0001065280", sector: "Communication Services", industry: "Entertainment", logoUrl: null, logoSource: null },
];

export function companyForSymbol(symbol: string) {
  const company = companyRegistry.find((item) => item.symbol === symbol.toUpperCase());
  if (!company)
    throw new ProviderError("UNSUPPORTED_SYMBOL", "Symbol is not supported by MarketBrief.", 404);
  return company;
}
