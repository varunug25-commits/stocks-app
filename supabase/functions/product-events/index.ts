import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { parseProductEventPayload } from "../_shared/productEvents.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "apikey, authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...cors, "Cache-Control": "no-store" } });
type QueryError = { message: string } | null;

export default { fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST" || !req.headers.get("content-type")?.toLowerCase().includes("application/json")) return json({ error: { code: "INVALID_REQUEST", message: "A JSON POST request is required." } }, 400);
  const length = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 4_096) return json({ error: { code: "INVALID_REQUEST", message: "Event payload is too large." } }, 413);
  try {
    const body = await req.text();
    if (new TextEncoder().encode(body).byteLength > 4_096) throw new Error("Event payload is too large.");
    const payload = parseProductEventPayload(JSON.parse(body) as unknown);
    const identityHash = stableHash(`${payload.installationId}:${req.headers.get("x-forwarded-for") ?? "unknown"}`);
    const admin = ctx.supabaseAdmin as unknown as {
      rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: QueryError }>;
      from(table: string): { insert(value: Record<string, unknown>): PromiseLike<{ error: QueryError }> };
    };
    const budget = await admin.rpc("consume_product_event_budget", { p_identity_hash: identityHash });
    if (budget.error || budget.data !== true) return json({ error: { code: "RATE_LIMITED", message: "Product feedback is temporarily rate limited." } }, 429);
    const value = payload.kind === "event"
      ? { installation_id: payload.installationId, event_name: payload.eventName, properties: payload.properties, occurred_at: payload.occurredAt }
      : { installation_id: payload.installationId, response_hash: payload.responseHash, task: payload.task, symbols: payload.symbols, helpful: payload.helpful, reason: payload.reason, occurred_at: payload.occurredAt };
    const { error } = await admin.from(payload.kind === "event" ? "product_events" : "intelligence_feedback").insert(value);
    if (error) return json({ error: { code: "UNAVAILABLE", message: "Product feedback could not be stored." } }, 503);
    return json({ accepted: true }, 202);
  } catch {
    return json({ error: { code: "INVALID_REQUEST", message: "Product feedback was not accepted." } }, 400);
  }
}) };
function stableHash(value: string) { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); } return (hash >>> 0).toString(16); }
