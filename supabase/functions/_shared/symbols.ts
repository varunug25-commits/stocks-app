import { ProviderError } from "./errors.ts";

const symbolPattern = /^[A-Z][A-Z0-9.-]{0,7}$/;
const supportedEquityTypes = new Set(["COMMON STOCK", "COMMON_STOCK", "EQUITY"]);

export function normalizeSymbol(value: string) {
  return value.trim().toUpperCase();
}

export function requireSymbolSyntax(value: unknown) {
  if (typeof value !== "string")
    throw new ProviderError("INVALID_REQUEST", "A valid stock symbol is required.", 400);
  const symbol = normalizeSymbol(value);
  if (!symbolPattern.test(symbol))
    throw new ProviderError("INVALID_REQUEST", "The stock symbol format is not supported.", 400);
  return symbol;
}

export function isSupportedUsEquity(input: {
  symbol: string;
  type?: string | null;
  country?: string | null;
  exchange?: string | null;
}) {
  if (!symbolPattern.test(normalizeSymbol(input.symbol))) return false;
  if (input.type && !supportedEquityTypes.has(input.type.trim().toUpperCase())) return false;
  if (input.country && input.country.trim().toUpperCase() !== "US") return false;
  if (input.exchange && !/(NASDAQ|NEW YORK|NYSE|AMEX)/i.test(input.exchange)) return false;
  return true;
}
