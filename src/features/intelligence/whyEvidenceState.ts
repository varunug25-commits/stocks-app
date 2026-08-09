import type { MarketBriefIntelligenceResponse } from "@/data/intelligence";

export type WhyEvidenceState = "CONFIRMED CATALYST" | "LIKELY COMPANY-SPECIFIC" | "LIKELY BROADER / PEER MOVE" | "MIXED EVIDENCE" | "NO CLEAR CATALYST";
export type WhyEvidenceAssessment = { state: WhyEvidenceState; strength: "Strong" | "Moderate" | "Limited"; explanation: string };

export function deriveWhyEvidenceState(response: MarketBriefIntelligenceResponse): WhyEvidenceAssessment {
  const direct = response.sources.filter((source) => source.type === "news" || source.type === "filing");
  const publishers = new Set(direct.map((source) => source.publisher ?? source.id));
  const interpretations = response.sections.flatMap((section) => section.bullets).filter((bullet) => bullet.kind === "interpretation" && bullet.sourceIds.length > 0);
  if (response.symbols.length > 1 && direct.length) return { state: "LIKELY BROADER / PEER MOVE", strength: "Moderate", explanation: "Related evidence spans more than one company in the selected context; it does not prove a shared cause." };
  if (publishers.size >= 2 && interpretations.length) return { state: "LIKELY COMPANY-SPECIFIC", strength: "Moderate", explanation: "Multiple directly related sources support a company-specific interpretation, without proving complete causality." };
  if (direct.length && interpretations.length) return { state: "MIXED EVIDENCE", strength: "Limited", explanation: "Company-specific evidence exists, but the available record does not establish one complete cause." };
  return { state: "NO CLEAR CATALYST", strength: "Limited", explanation: "No directly supported catalyst explains the full move in the available evidence." };
}
