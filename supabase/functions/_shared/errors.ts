import type { DataErrorCode } from "./contracts.ts";

export class ProviderError extends Error {
  readonly code: DataErrorCode;
  readonly status: number;
  constructor(
    code: DataErrorCode,
    message: string,
    status = 502,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "ProviderError";
  }
}

export function errorFromStatus(status: number, provider: string) {
  if (status === 429)
    return new ProviderError("RATE_LIMITED", `${provider} rate limit reached.`, 429);
  if (status === 404)
    return new ProviderError("NOT_FOUND", `${provider} returned no matching resource.`, 404);
  return new ProviderError(
    "UPSTREAM_UNAVAILABLE",
    `${provider} returned HTTP ${status}.`,
    status >= 500 ? 503 : 502,
  );
}

export function toProviderError(error: unknown, provider: string) {
  if (error instanceof ProviderError) return error;
  return new ProviderError(
    "NETWORK_FAILURE",
    `${provider} could not be reached.`,
    503,
  );
}
