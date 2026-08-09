export const productEventNames = ["app_opened", "onboarding_completed", "stock_searched", "stock_added", "stock_removed", "today_material_change_seen", "why_moved_opened", "evidence_opened", "source_opened", "brief_opened", "ask_submitted", "thesis_saved", "group_created", "feedback_submitted", "ai_failed", "market_data_failed"] as const;
export type ProductEventName = typeof productEventNames[number];
const eventSet = new Set<string>(productEventNames);
const propertyKeys = new Set(["symbol", "symbolsCount", "changeKind", "task", "reason", "screen", "mode", "outcome", "resource"]);
const feedbackReasons = new Set(["wrong", "not_relevant", "too_obvious", "too_much_text", "missing_context"]);
const tasks = new Set(["why_moved", "brief", "ask", "news_summary", "filing_summary"]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ProductEventPayload = { kind: "event"; installationId: string; eventName: ProductEventName; properties: Record<string, string | number | boolean>; occurredAt: string };
export type FeedbackPayload = { kind: "feedback"; installationId: string; responseHash: string; task: string; symbols: string[]; helpful: boolean; reason: string | null; occurredAt: string };

export function parseProductEventPayload(value: unknown, now = Date.now()): ProductEventPayload | FeedbackPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("A structured event is required.");
  const input = value as Record<string, unknown>;
  const installationId = typeof input.installationId === "string" ? input.installationId : "";
  const occurredAt = typeof input.occurredAt === "string" ? input.occurredAt : "";
  const eventTime = Date.parse(occurredAt);
  if (!uuid.test(installationId) || !Number.isFinite(eventTime) || Math.abs(eventTime - now) > 7 * 86_400_000) throw new Error("Event identity or time is invalid.");
  if (input.kind === "event") {
    if (typeof input.eventName !== "string" || !eventSet.has(input.eventName)) throw new Error("Event name is not allowed.");
    if (!input.properties || typeof input.properties !== "object" || Array.isArray(input.properties)) throw new Error("Event properties must be an object.");
    const properties: Record<string, string | number | boolean> = {};
    for (const [key, property] of Object.entries(input.properties)) {
      if (!propertyKeys.has(key) || !(typeof property === "string" || typeof property === "number" || typeof property === "boolean") || (typeof property === "string" && property.length > 64) || (typeof property === "number" && !Number.isFinite(property))) throw new Error("Event properties are not allowed.");
      properties[key] = property;
    }
    return { kind: "event", installationId, eventName: input.eventName as ProductEventName, properties, occurredAt };
  }
  if (input.kind === "feedback") {
    const responseHash = typeof input.responseHash === "string" ? input.responseHash : "";
    const task = typeof input.task === "string" ? input.task : "";
    const symbols = Array.isArray(input.symbols) ? [...new Set(input.symbols.filter((symbol): symbol is string => typeof symbol === "string" && /^[A-Z][A-Z0-9.-]{0,7}$/.test(symbol)))].slice(0, 15) : [];
    const reason = input.reason === null ? null : typeof input.reason === "string" && feedbackReasons.has(input.reason) ? input.reason : undefined;
    if (responseHash.length < 4 || responseHash.length > 128 || !tasks.has(task) || typeof input.helpful !== "boolean" || reason === undefined) throw new Error("Feedback fields are invalid.");
    return { kind: "feedback", installationId, responseHash, task, symbols, helpful: input.helpful, reason, occurredAt };
  }
  throw new Error("Event kind is not allowed.");
}
