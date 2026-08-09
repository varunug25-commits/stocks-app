import type { CompanyIdentity, NormalizedResponse, StockSearchResult } from "../contracts.ts";
import { companyForSymbol, companyRegistry } from "../registry.ts";
import type { CompanyProvider } from "./types.ts";

export class RegistryCompanyProvider implements CompanyProvider {
  async getCompany(symbol: string): Promise<NormalizedResponse<CompanyIdentity>> {
    const fetchedAt = new Date().toISOString();
    return {
      data: companyForSymbol(symbol),
      meta: { source: "MarketBrief company registry", provider: "marketbrief-registry", fetchedAt, asOf: fetchedAt, isStale: false },
    };
  }
  async search(query: string): Promise<NormalizedResponse<StockSearchResult[]>> {
    const fetchedAt = new Date().toISOString();
    const normalized = query.trim().toLowerCase();
    const data = companyRegistry.filter((company) => company.symbol.toLowerCase().includes(normalized) || company.name.toLowerCase().includes(normalized)).map((company) => ({
      symbol: company.symbol,
      name: company.name,
      exchange: company.exchange,
      assetType: "Common Stock",
    }));
    return { data, meta: { source: "MarketBrief demo directory", provider: "marketbrief-registry", fetchedAt, asOf: fetchedAt, isStale: false } };
  }
}
