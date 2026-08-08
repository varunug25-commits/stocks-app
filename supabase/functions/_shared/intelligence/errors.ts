import type { IntelligenceErrorCode } from "./contracts.ts";

export class IntelligenceError extends Error {
  readonly code: IntelligenceErrorCode;
  readonly status: number;

  constructor(code: IntelligenceErrorCode, message: string, status = 503) {
    super(message);
    this.name = "IntelligenceError";
    this.code = code;
    this.status = status;
  }
}
