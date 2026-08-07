import type { DataMetadata } from "./contracts.ts";

export function formatFreshness(meta: DataMetadata, now = Date.now()) {
  if (meta.isStale) return "Stale cached data";
  const timestamp = meta.asOf ?? meta.fetchedAt;
  const ageMs = now - Date.parse(timestamp);
  if (!Number.isFinite(ageMs) || ageMs < 0) return `As of ${timestamp}`;
  const minutes = Math.floor(ageMs / 60_000);
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  return `As of ${new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" })}`;
}
