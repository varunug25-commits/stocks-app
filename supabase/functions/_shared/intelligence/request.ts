import type { IntelligenceRequest, IntelligenceTask } from "./contracts.ts";
import { IntelligenceError } from "./errors.ts";

const tasks = new Set<IntelligenceTask>(["why_moved", "brief", "ask", "news_summary", "filing_summary"]);
const MAX_BODY_BYTES = 8_192;
const MAX_SYMBOLS = 15;
const MAX_QUESTION_CHARACTERS = 280;
const contextModes = new Set(["watchlist", "stock", "thesis", "current_brief", "since_last_check", "catalysts"]);

export function parseIntelligenceRequest(value: unknown): IntelligenceRequest {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new IntelligenceError("INVALID_REQUEST", "A JSON request body is required.", 400);
  const input = value as Record<string, unknown>;
  if (typeof input.task !== "string" || !tasks.has(input.task as IntelligenceTask))
    throw new IntelligenceError("INVALID_REQUEST", "Unsupported intelligence task.", 400);
  if (!Array.isArray(input.symbols) || input.symbols.length === 0 || input.symbols.length > MAX_SYMBOLS ||
      !input.symbols.every((symbol) => typeof symbol === "string"))
    throw new IntelligenceError("INVALID_REQUEST", "Provide between one and fifteen symbols.", 400);
  const normalizedSymbols = [...new Set(input.symbols.map((symbol) => (symbol as string).trim().toUpperCase()))];
  if (normalizedSymbols.some((symbol) => !/^[A-Z][A-Z0-9.-]{0,7}$/.test(symbol)))
    throw new IntelligenceError("UNSUPPORTED_SYMBOL", "One or more symbols have an invalid format.", 400);
  if (input.task === "brief" && input.edition !== "morning" && input.edition !== "evening")
    throw new IntelligenceError("INVALID_REQUEST", "A morning or evening edition is required.", 400);
  const question = typeof input.question === "string" ? input.question.replace(/\s+/g, " ").trim() : undefined;
  if (input.task === "ask" && (!question || question.length > MAX_QUESTION_CHARACTERS))
    throw new IntelligenceError("INVALID_REQUEST", "Ask a concise question of 280 characters or fewer.", 400);
  if (input.question !== undefined && typeof input.question !== "string")
    throw new IntelligenceError("INVALID_REQUEST", "Question must be text.", 400);
  const timeWindow = input.timeWindow === undefined ? "1D" : input.timeWindow;
  if (!new Set(["1D", "1W", "1M"]).has(timeWindow as string))
    throw new IntelligenceError("INVALID_REQUEST", "Unsupported time window.", 400);
  if (input.contextMode !== undefined && (typeof input.contextMode !== "string" || !contextModes.has(input.contextMode)))
    throw new IntelligenceError("INVALID_REQUEST", "Unsupported intelligence context.", 400);
  let userThesis: IntelligenceRequest["userThesis"];
  if (input.userThesis !== undefined) {
    if (!input.userThesis || typeof input.userThesis !== "object" || Array.isArray(input.userThesis))
      throw new IntelligenceError("INVALID_REQUEST", "User thesis must be structured text.", 400);
    const thesis = input.userThesis as Record<string, unknown>;
    const symbol = typeof thesis.symbol === "string" ? thesis.symbol.trim().toUpperCase() : "";
    const text = typeof thesis.text === "string" ? thesis.text.replace(/\s+/g, " ").trim() : "";
    if (!normalizedSymbols.includes(symbol) || !text || text.length > 500)
      throw new IntelligenceError("INVALID_REQUEST", "User thesis must match a requested symbol and be 500 characters or fewer.", 400);
    userThesis = { symbol, text };
  }
  return {
    task: input.task as IntelligenceTask,
    symbols: normalizedSymbols,
    ...(input.edition === "morning" || input.edition === "evening" ? { edition: input.edition } : {}),
    ...(question ? { question } : {}),
    ...(typeof input.focusId === "string" && input.focusId.trim() ? { focusId: input.focusId.trim().slice(0, 160) } : {}),
    timeWindow: timeWindow as IntelligenceRequest["timeWindow"],
    ...(typeof input.contextMode === "string" ? { contextMode: input.contextMode as IntelligenceRequest["contextMode"] } : {}),
    ...(userThesis ? { userThesis } : {}),
  };
}

export async function readIntelligenceRequest(req: Request) {
  if (req.method !== "POST") throw new IntelligenceError("INVALID_REQUEST", "POST is required.", 405);
  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json"))
    throw new IntelligenceError("INVALID_REQUEST", "Content-Type must be application/json.", 415);
  const length = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > MAX_BODY_BYTES)
    throw new IntelligenceError("INVALID_REQUEST", "Request body is too large.", 413);
  const body = await req.text();
  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES)
    throw new IntelligenceError("INVALID_REQUEST", "Request body is too large.", 413);
  try {
    return parseIntelligenceRequest(JSON.parse(body) as unknown);
  } catch (error) {
    if (error instanceof IntelligenceError) throw error;
    throw new IntelligenceError("INVALID_REQUEST", "Request body must be valid JSON.", 400);
  }
}
