import AsyncStorage from "@react-native-async-storage/async-storage";
import { publicDataConfig } from "@/data/real";
import type { IntelligenceTask } from "@/data/intelligence";
import { sanitizeTelemetryEvent, type TelemetryEventName, type TelemetryProperties } from "./contracts";

const INSTALLATION_KEY = "marketbrief.installation-id.v1";
let installationPromise: Promise<string> | null = null;
export function getInstallationId() {
  installationPromise ??= AsyncStorage.getItem(INSTALLATION_KEY).then(async (stored) => {
    if (stored && /^[0-9a-f-]{36}$/i.test(stored)) return stored;
    const next = createUuid();
    await AsyncStorage.setItem(INSTALLATION_KEY, next);
    return next;
  });
  return installationPromise;
}
export async function sendTelemetryEvent(eventName: TelemetryEventName, properties: TelemetryProperties = {}, fetcher: typeof fetch = fetch) {
  const event = sanitizeTelemetryEvent(eventName, properties);
  if (!event || !publicDataConfig.supabaseUrl || !publicDataConfig.publishableKey) return false;
  return send({ kind: "event", installationId: await getInstallationId(), ...event, occurredAt: new Date().toISOString() }, fetcher);
}
export async function sendIntelligenceFeedback(input: { responseHash: string; task: IntelligenceTask; symbols: string[]; helpful: boolean; reason: string | null }, fetcher: typeof fetch = fetch) {
  if (!publicDataConfig.supabaseUrl || !publicDataConfig.publishableKey) return false;
  return send({ kind: "feedback", installationId: await getInstallationId(), ...input, occurredAt: new Date().toISOString() }, fetcher);
}
async function send(body: Record<string, unknown>, fetcher: typeof fetch) {
  try {
    const response = await fetcher(`${publicDataConfig.supabaseUrl!.replace(/\/$/, "")}/functions/v1/product-events`, { method: "POST", headers: { "Content-Type": "application/json", apikey: publicDataConfig.publishableKey!, Authorization: `Bearer ${publicDataConfig.publishableKey!}` }, body: JSON.stringify(body) });
    return response.ok;
  } catch { return false; }
}
function createUuid() {
  const available = globalThis.crypto?.randomUUID?.();
  if (available) return available;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => { const value = Math.floor(Math.random() * 16); return (character === "x" ? value : (value & 0x3) | 0x8).toString(16); });
}
