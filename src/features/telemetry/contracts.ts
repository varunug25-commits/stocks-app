export const telemetryEventNames = ["app_opened", "onboarding_completed", "stock_searched", "stock_added", "stock_removed", "today_material_change_seen", "why_moved_opened", "evidence_opened", "source_opened", "brief_opened", "ask_submitted", "thesis_saved", "group_created", "feedback_submitted", "ai_failed", "market_data_failed"] as const;
export type TelemetryEventName = typeof telemetryEventNames[number];
export type TelemetryProperties = Partial<Record<"symbol" | "symbolsCount" | "changeKind" | "task" | "reason" | "screen" | "mode" | "outcome" | "resource", string | number | boolean>>;
const allowedEvents = new Set<string>(telemetryEventNames);
const allowedKeys = new Set(["symbol", "symbolsCount", "changeKind", "task", "reason", "screen", "mode", "outcome", "resource"]);
export function sanitizeTelemetryEvent(name: string, properties: Record<string, unknown>) {
  if (!allowedEvents.has(name)) return null;
  const safe: TelemetryProperties = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!allowedKeys.has(key) || !(typeof value === "string" || typeof value === "number" || typeof value === "boolean") || (typeof value === "string" && value.length > 64) || (typeof value === "number" && !Number.isFinite(value))) continue;
    safe[key as keyof TelemetryProperties] = value;
  }
  return { eventName: name as TelemetryEventName, properties: safe };
}
export function responseFeedbackHash(input: { generatedAt: string; sourceIds: string[]; task: string }) { return stableHash(JSON.stringify({ generatedAt: input.generatedAt, sourceIds: [...input.sourceIds].sort(), task: input.task })); }
function stableHash(value: string) { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16); }
