import type { BriefType } from "./types.ts";

export const briefTemplates: Record<
  BriefType,
  {
    label: string;
    headline: string;
    summary: string;
    marketContext: string;
    marketDirection: string;
    developments: string[];
    monitor: string[];
    positiveScenario: string;
    riskScenario: string;
  }
> = {
  morning: {
    label: "Morning Brief",
    headline: "A steadier setup, with growth back in focus",
    summary:
      "Overnight markets were constructive as yields eased and technology demand signals stayed resilient. Your brief prioritizes the companies you follow and today’s scheduled catalysts.",
    marketContext:
      "Global equity futures point higher after a calmer rates session. Semiconductor and cloud names are leading, while consumer momentum remains mixed.",
    marketDirection: "Futures modestly higher · growth sectors leading",
    developments: [
      "Rates eased enough to support growth valuations.",
      "Semiconductor demand commentary remained constructive.",
      "Today’s earnings calendar could reset expectations quickly.",
    ],
    monitor: [
      "Treasury yields through the opening hour",
      "Breadth beyond the largest technology names",
      "Guidance language from companies reporting today",
    ],
    positiveScenario:
      "Stable yields and broad participation could extend the constructive opening tone.",
    riskScenario:
      "A renewed rates move or cautious guidance could reverse early growth leadership.",
  },
  evening: {
    label: "Evening Recap",
    headline: "Growth led the close, but expectations still matter",
    summary:
      "Major indices finished higher as technology strength outweighed softer pockets of consumer demand. The recap separates confirmed session facts from the signals to carry into tomorrow.",
    marketContext:
      "The Nasdaq led the major indices while the Dow was comparatively muted. Participation improved late in the session, although leadership remained concentrated.",
    marketDirection: "Nasdaq higher · S&P 500 positive · Dow near flat",
    developments: [
      "Growth shares held most of their intraday advance.",
      "Watchlist winners were concentrated in semiconductors.",
      "Tomorrow’s catalysts now matter more than today’s closing momentum.",
    ],
    monitor: [
      "Post-close earnings and guidance",
      "Overnight rates and currency moves",
      "Whether today’s market breadth carries into tomorrow",
    ],
    positiveScenario:
      "Constructive guidance could validate today’s strength and broaden participation tomorrow.",
    riskScenario:
      "Weak post-close commentary could expose how much optimism is already reflected in prices.",
  },
};
