import type {
  BulletClaim,
  EvidenceItem,
  IntelligenceRequest,
  IntelligenceSection,
  MarketBriefIntelligenceResponse,
  ModelCandidate,
} from "./contracts.ts";
import { INTELLIGENCE_SCHEMA_VERSION } from "./contracts.ts";
import type { StructuredAIProvider } from "./provider.ts";
import { IntelligenceError } from "./errors.ts";

const kinds = new Set(["confirmed", "interpretation", "uncertainty", "catalyst"]);
const MAX_SECTIONS = 6;
const MAX_BULLETS_PER_SECTION = 5;
const MAX_BULLET_CHARACTERS = 240;
const MAX_RESPONSE_CHARACTERS = 12_000;
const URL_PATTERN = /https?:\/\//i;
const UNSAFE_FINANCIAL_LANGUAGE = /\b(guaranteed returns?|definitely (?:rise|fall)|you should (?:buy|sell)|price target)\b/i;

function text(value: unknown, limit: number, field: string) {
  if (typeof value !== "string") throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", `${field} must be text.`);
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean || clean.length > limit || URL_PATTERN.test(clean) || UNSAFE_FINANCIAL_LANGUAGE.test(clean))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", `${field} failed safety validation.`);
  return clean;
}

function stringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string"))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", `${field} must be a text array.`);
  return [...new Set(value)];
}

function validateBullet(value: unknown, evidenceIds: Set<string>, sectionIndex: number, bulletIndex: number): BulletClaim {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "A claim was malformed.");
  const candidate = value as Record<string, unknown>;
  const kind = candidate.kind;
  if (typeof kind !== "string" || !kinds.has(kind))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "A claim type was malformed.");
  const sourceIds = stringArray(candidate.sourceIds, "Claim sourceIds");
  if (sourceIds.some((id) => !evidenceIds.has(id)))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "A claim cited an unknown source.");
  if (kind === "confirmed" && sourceIds.length === 0)
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "Confirmed claims require a valid source.");
  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.slice(0, 80) : `section-${sectionIndex}-claim-${bulletIndex}`,
    text: text(candidate.text, MAX_BULLET_CHARACTERS, "Claim text"),
    kind: kind as BulletClaim["kind"],
    sourceIds,
  };
}

function validateSection(value: unknown, evidenceIds: Set<string>, index: number): IntelligenceSection {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "A section was malformed.");
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.bullets) || candidate.bullets.length > MAX_BULLETS_PER_SECTION)
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "A section exceeded the claim limit.");
  const bullets = candidate.bullets.map((bullet, bulletIndex) => validateBullet(bullet, evidenceIds, index, bulletIndex));
  if (!bullets.length) throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "Empty sections are not accepted.");
  return {
    id: typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.slice(0, 80) : `section-${index}`,
    title: text(candidate.title, 80, "Section title"),
    bullets,
  };
}

export function validateProviderOutput(options: {
  candidate: ModelCandidate;
  request: IntelligenceRequest;
  evidence: EvidenceItem[];
  provider: StructuredAIProvider;
  generatedAt?: string;
  cached?: boolean;
}): MarketBriefIntelligenceResponse {
  const { candidate, request, evidence, provider } = options;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "The intelligence provider returned malformed output.");
  const evidenceIds = new Set(evidence.map((entry) => entry.id));
  if (!Array.isArray(candidate.sections) || candidate.sections.length === 0 || candidate.sections.length > MAX_SECTIONS)
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "The intelligence response has an invalid section count.");
  const symbols = stringArray(candidate.symbols, "Response symbols");
  if (symbols.some((symbol) => !request.symbols.includes(symbol)))
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "The intelligence response included an unsupported symbol.");
  const sections = candidate.sections.map((section, index) => validateSection(section, evidenceIds, index));
  const sourceIds = [...new Set(sections.flatMap((section) => section.bullets.flatMap((bullet) => bullet.sourceIds)))];
  const response: MarketBriefIntelligenceResponse = {
    ...(candidate.headline === undefined ? {} : { headline: text(candidate.headline, 120, "Headline") }),
    ...(candidate.oneLineSummary === undefined ? {} : { oneLineSummary: text(candidate.oneLineSummary, 240, "Summary") }),
    sections,
    sources: sourceIds.flatMap((sourceId) => {
      const entry = evidence.find((candidate) => candidate.id === sourceId);
      if (!entry) return [];
      const { id, type, symbol, title, publisher, publishedAt, sourceUrl } = entry;
      return [{ id, type, symbol, title, publisher, publishedAt, sourceUrl }];
    }),
    sourceIds,
    symbols,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    meta: {
      task: request.task,
      provider: provider.name,
      providerMode: provider.mode,
      cached: options.cached ?? false,
      evidenceCount: evidence.length,
      schemaVersion: INTELLIGENCE_SCHEMA_VERSION,
    },
  };
  if (JSON.stringify(response).length > MAX_RESPONSE_CHARACTERS)
    throw new IntelligenceError("INVALID_PROVIDER_OUTPUT", "The intelligence response exceeded the output limit.");
  return response;
}
