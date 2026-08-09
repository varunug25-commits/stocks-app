import type {
  CompanyNewsArticle,
  DataMetadata,
  FilingData,
  MarketEventData,
  MarketQuote,
} from "../../data/real/contracts.ts";

export type StockTimelineKind = "price" | "news" | "filing" | "event";
export type StockTimelineItem = {
  id: string;
  kind: StockTimelineKind;
  occurredAt: string;
  precision: "instant" | "date";
  title: string;
  detail: string;
  source: string;
  sourceUrl: string | null;
  direction?: "positive" | "negative" | "flat";
};

export function buildStockTimeline(input: {
  symbol: string;
  quote: MarketQuote | null;
  quoteMeta?: DataMetadata;
  news: CompanyNewsArticle[];
  filings: FilingData[];
  events: MarketEventData[];
  now?: number;
}): StockTimelineItem[] {
  const now = input.now ?? Date.now();
  const items: StockTimelineItem[] = [];
  const quoteTime = input.quote?.providerTimestamp;
  if (input.quote && quoteTime && isValidDate(quoteTime)) {
    const percent = input.quote.changePercent;
    const direction = percent === null || Math.abs(percent) < 0.001 ? "flat" : percent > 0 ? "positive" : "negative";
    items.push({
      id: `price:${input.symbol}:${quoteTime}`,
      kind: "price",
      occurredAt: quoteTime,
      precision: "instant",
      title: percent === null
        ? `Latest provider price: ${formatPrice(input.quote.price)}`
        : `${percent > 0 ? "+" : ""}${percent.toFixed(2)}% in the current 1-day period`,
      detail: `Latest provider price ${formatPrice(input.quote.price)}. This timestamp is a quote update, not an inferred intraday threshold crossing.`,
      source: input.quoteMeta?.source ?? "Quote provider",
      sourceUrl: null,
      direction,
    });
  }
  for (const article of input.news) {
    if (!isValidDate(article.publishedAt)) continue;
    items.push({
      id: `news:${article.id}`,
      kind: "news",
      occurredAt: article.publishedAt,
      precision: "instant",
      title: article.headline,
      detail: article.summary?.trim() || "Publisher metadata only; open the original source for the full report.",
      source: article.publisher,
      sourceUrl: article.sourceUrl || null,
    });
  }
  for (const filing of input.filings) {
    if (!isDateOnly(filing.filingDate)) continue;
    items.push({
      id: `filing:${filing.accessionNumber}`,
      kind: "filing",
      occurredAt: filing.filingDate,
      precision: "date",
      title: `${filing.formType} filed`,
      detail: `Official filing metadata for ${filing.company}. MarketBrief has not analyzed the filing body.`,
      source: filing.source,
      sourceUrl: filing.canonicalUrl,
    });
  }
  for (const event of input.events) {
    if (!event.scheduledAt || !isValidDate(event.scheduledAt) || Date.parse(event.scheduledAt) > now) continue;
    items.push({
      id: `event:${event.id}`,
      kind: "event",
      occurredAt: event.scheduledAt,
      precision: event.scheduledAt.length <= 10 ? "date" : "instant",
      title: event.title,
      detail: event.timing === "unknown" ? "Exact timing was not supplied." : event.timing.replaceAll("-", " "),
      source: event.source,
      sourceUrl: event.sourceUrl,
    });
  }
  return items.sort((left, right) => timestamp(right) - timestamp(left)).slice(0, 25);
}

export function groupStockTimeline(items: StockTimelineItem[], now = Date.now()) {
  const today = localDateKey(new Date(now));
  const yesterday = localDateKey(new Date(now - 86_400_000));
  const groups = new Map<string, StockTimelineItem[]>();
  for (const item of items) {
    const key = item.precision === "date" ? item.occurredAt.slice(0, 10) : localDateKey(new Date(item.occurredAt));
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups].map(([key, entries]) => ({
    key,
    label: key === today ? "TODAY" : key === yesterday ? "YESTERDAY" : new Date(`${key}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: key.slice(0, 4) === today.slice(0, 4) ? undefined : "numeric" }).toUpperCase(),
    entries,
  }));
}

function timestamp(item: StockTimelineItem) {
  return Date.parse(item.precision === "date" ? `${item.occurredAt}T12:00:00Z` : item.occurredAt);
}
function isValidDate(value: string) { return Number.isFinite(Date.parse(value)); }
function isDateOnly(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValidDate(`${value}T12:00:00Z`); }
function localDateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
function formatPrice(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value); }
