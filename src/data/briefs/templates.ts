import type { BriefType } from "./types.ts";

export type BriefTemplate = {
    label: string;
    headline: string;
    summary: string;
    marketContext: string;
    marketDirection: string;
    developments: string[];
    monitor: string[];
    positiveScenario: string;
    riskScenario: string;
  };

export const briefTemplates: Record<BriefType, BriefTemplate> = {
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

export const briefEditionTemplates: Record<string, BriefTemplate> = {
  "morning-2026-08-07": briefTemplates.morning,
  "evening-2026-08-07": briefTemplates.evening,
  "morning-2026-08-06": {
    ...briefTemplates.morning,
    headline: "Chip leadership meets a firmer rates backdrop",
    summary: "Semiconductor demand remained constructive before the open, while a modest rebound in yields raised the bar for growth shares.",
    marketContext: "Futures were mixed as technology demand signals competed with firmer long-term yields and quieter consumer leadership.",
    marketDirection: "Futures mixed · semiconductors firm · yields higher",
    developments: [
      "Chip demand commentary supported the technology complex.",
      "Long-term yields recovered part of the prior session’s decline.",
      "Market breadth remained the key confirmation to watch after the open.",
    ],
    monitor: ["Semiconductor breadth", "The 10-year Treasury yield", "Consumer-sector participation"],
    positiveScenario: "Broader chip participation could offset the valuation pressure from firmer yields.",
    riskScenario: "A sharper rates move could narrow leadership and pressure high-expectation names.",
  },
  "evening-2026-08-06": {
    ...briefTemplates.evening,
    headline: "Late breadth improved as defensives steadied",
    summary: "Major indices recovered from an uneven open as defensives stabilized and participation broadened into the closing hour.",
    marketContext: "Technology finished positive, but the more useful close signal was improved participation across healthcare and consumer staples.",
    marketDirection: "S&P 500 higher · breadth improved late · yields stable",
    developments: [
      "A narrow morning advance broadened during the final two hours.",
      "Defensive sectors reduced their early losses.",
      "Post-close guidance became the next test for the improved tone.",
    ],
    monitor: ["Post-close guidance", "Overnight index futures", "Continuation in defensive breadth"],
    positiveScenario: "Broader participation could make the next session less dependent on mega-cap leadership.",
    riskScenario: "Weak guidance could show that the late breadth improvement was temporary.",
  },
  "morning-2026-08-05": {
    ...briefTemplates.morning,
    headline: "Earnings signals take priority before the open",
    summary: "Index futures were subdued as investors waited for company guidance to clarify whether resilient demand could support elevated expectations.",
    marketContext: "Overnight trading was calm, with muted index moves and selective strength in companies approaching scheduled updates.",
    marketDirection: "Futures near flat · earnings in focus · dollar steady",
    developments: [
      "Pre-market index moves stayed contained.",
      "Scheduled earnings carried more information than broad macro moves.",
      "Guidance quality, not headline beats, was the primary watch item.",
    ],
    monitor: ["Guidance versus consensus", "Opening market breadth", "Dollar and yield reaction"],
    positiveScenario: "Constructive guidance could turn the quiet setup into broader risk appetite.",
    riskScenario: "Cautious outlooks could expose how much optimism is already reflected in prices.",
  },
  "evening-2026-08-05": {
    ...briefTemplates.evening,
    headline: "A mixed close leaves guidance in control",
    summary: "The major indices ended mixed after early strength faded, leaving company guidance and overnight rates as the clearest inputs for tomorrow.",
    marketContext: "Semiconductors held relative strength, while consumer and industrial shares softened enough to keep the broader close inconclusive.",
    marketDirection: "Nasdaq positive · S&P 500 near flat · cyclicals softer",
    developments: [
      "Early index gains faded before the close.",
      "Semiconductors retained relative leadership.",
      "Mixed breadth reduced confidence in the headline index move.",
    ],
    monitor: ["After-hours earnings", "Overnight Treasury yields", "Cyclical-sector follow-through"],
    positiveScenario: "Supportive guidance could restore breadth and validate semiconductor leadership.",
    riskScenario: "A weak outlook or renewed yield increase could extend the late-session fade.",
  },
};
