import type { DataProviderName } from "./contracts.ts";
import { ProviderError } from "./errors.ts";

export type QuotaProvider = Exclude<DataProviderName, "marketbrief-registry">;
export type ProviderLimit = {
  windowSeconds: number;
  maxRequests: number;
  cooldownSeconds: number;
};
export type ProviderBudgetDecision = {
  allowed: boolean;
  remaining: number;
  retryAt: string | null;
};
export interface ProviderBudgetStore {
  consume(provider: QuotaProvider, limit: ProviderLimit): Promise<ProviderBudgetDecision>;
}

export const PROVIDER_REQUEST_LIMITS: Record<QuotaProvider, ProviderLimit> = {
  "twelve-data": { windowSeconds: 60, maxRequests: 8, cooldownSeconds: 60 },
  finnhub: { windowSeconds: 60, maxRequests: 20, cooldownSeconds: 60 },
  "sec-edgar": { windowSeconds: 1, maxRequests: 6, cooldownSeconds: 1 },
};

export class ProviderRequestLimiter {
  private readonly store: ProviderBudgetStore;

  constructor(store: ProviderBudgetStore) {
    this.store = store;
  }

  async assertAllowed(provider: QuotaProvider) {
    const decision = await this.store.consume(provider, PROVIDER_REQUEST_LIMITS[provider]);
    if (!decision.allowed)
      throw new ProviderError("RATE_LIMITED", `${provider} request budget is cooling down.`, 429);
    return decision;
  }
}
