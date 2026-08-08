import type { CompanyIdentity, NormalizedResponse } from "../contracts.ts";
import { companyForSymbol } from "../registry.ts";
import type { CompanyProvider } from "./types.ts";

export class RegistryCompanyProvider implements CompanyProvider {
  async getCompany(symbol: string): Promise<NormalizedResponse<CompanyIdentity>> {
    const fetchedAt = new Date().toISOString();
    return {
      data: companyForSymbol(symbol),
      meta: { source: "MarketBrief company registry", provider: "marketbrief-registry", fetchedAt, asOf: fetchedAt, isStale: false },
    };
  }
}
