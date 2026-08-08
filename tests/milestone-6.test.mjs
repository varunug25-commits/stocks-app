import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("provider secrets are server-only and the client uses public project identifiers", async () => {
  const clientFiles = await readdir(new URL("../src/", import.meta.url), { recursive: true });
  const client = (await Promise.all(clientFiles.filter((path) => /\.tsx?$/.test(path)).map((path) => read(`src/${path}`)))).join("\n");
  const [edge, envExample] = await Promise.all([read("supabase/functions/market-data/index.ts"), read(".env.example")]);
  for (const secret of ["TWELVE_DATA_API_KEY", "FINNHUB_API_KEY", "SEC_USER_AGENT"]) {
    assert.doesNotMatch(client, new RegExp(secret));
    assert.match(edge, new RegExp(secret));
    assert.match(envExample, new RegExp(`^${secret}=$`, "m"));
  }
  assert.match(client, /EXPO_PUBLIC_SUPABASE_URL/);
  assert.doesNotMatch(envExample, /=[^\n]+/);
});

test("Supabase schema protects cache and registry tables from mobile roles", async () => {
  const migration = await read("supabase/migrations/20260807103213_real_data_foundation.sql");
  for (const table of ["company_registry", "market_data_cache", "provider_request_windows"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(migration, new RegExp(`revoke all on public\\.${table} from anon, authenticated`));
  }
  assert.match(migration, /grant select, insert, update, delete on public\.market_data_cache to service_role/);
  const budgeting = await read("supabase/migrations/20260807114746_provider_request_budgeting.sql");
  assert.match(budgeting, /pg_advisory_xact_lock/);
  assert.match(budgeting, /security invoker/);
  assert.match(budgeting, /revoke all on function public\.consume_provider_request_budget[\s\S]*from public, anon, authenticated/);
  assert.match(budgeting, /grant execute on function public\.consume_provider_request_budget[\s\S]*to service_role/);
});

test("approved screens consume the shared market-data provider", async () => {
  const files = [
    "src/app/(tabs)/index.tsx", "src/app/(tabs)/markets.tsx", "src/app/(tabs)/watchlist.tsx",
    "src/app/search.tsx", "src/app/stock/[symbol].tsx",
  ];
  for (const file of files) assert.match(await read(file), /useMarketData/);
  const stock = await read("src/app/stock/[symbol].tsx");
  assert.match(stock, /filingResources/);
  assert.match(stock, /barKey/);
  assert.match(stock, /Illustrative non-AI explanation/);
});

test("market resources use the same symbol and range keys read by screens", async () => {
  const provider = await read("src/features/market-data/MarketDataProvider.tsx");
  assert.match(provider, /run\(\s*"quote",\s*symbol,/);
  assert.match(provider, /run\(\s*"bars",\s*barKey\(symbol, range\),/);
  assert.match(provider, /\[stateKey\]: envelopeToResource\(loaded\)/);
  assert.doesNotMatch(provider, /\[requestKey\]: envelopeToResource\(loaded\)/);
});

test("provider news and SEC filings retain external-source UI treatment", async () => {
  const [stock, storyRow, filingRow] = await Promise.all([
    read("src/app/stock/[symbol].tsx"),
    read("src/components/stock/StoryRow.tsx"),
    read("src/components/stock/FilingRow.tsx"),
  ]);
  assert.match(stock, /<StoryRow item=\{item\}/);
  assert.match(stock, /<FilingRow item=\{item\}/);
  assert.match(storyRow, /story\.publisher/);
  assert.match(storyRow, /Linking\.openURL\(story\.sourceUrl/);
  assert.doesNotMatch(storyRow, /MarketBrief Editorial/);
  assert.match(filingRow, /filing\.source/);
  assert.match(filingRow, /Linking\.openURL\(filing\.canonicalUrl/);
});

test("provider credentials stay out of request URLs and logs", async () => {
  const [twelveData, finnhub] = await Promise.all([
    read("supabase/functions/_shared/providers/twelveData.ts"),
    read("supabase/functions/_shared/providers/finnhub.ts"),
  ]);
  assert.doesNotMatch(twelveData, /params\.set\("apikey"/);
  assert.match(twelveData, /Authorization: `apikey \$\{apiKey\}`/);
  assert.doesNotMatch(finnhub, /params\.set\("token"/);
  assert.match(finnhub, /"X-Finnhub-Token": apiKey/);
  assert.doesNotMatch(`${twelveData}\n${finnhub}`, /console\.(?:log|warn|error)/);
});

test("Stock Detail range changes and retries load only relevant resources", async () => {
  const [stock, provider] = await Promise.all([
    read("src/app/stock/[symbol].tsx"),
    read("src/features/market-data/MarketDataProvider.tsx"),
  ]);
  assert.match(stock, /loadStock\(validSymbol\)/);
  assert.match(stock, /loadBars\(validSymbol, range\)/);
  assert.doesNotMatch(stock, /loadStock\(validSymbol, range\)/);
  for (const retry of ["loadQuote(symbol)", "loadBars(symbol, range)", "loadEvents(symbol)", "loadFilings(symbol)", "loadNews(symbol)"])
    assert.match(stock, new RegExp(retry.replace(/[()]/g, "\\$&")));
  const stockLoader = provider.match(/const loadStock[\s\S]*?\n  }, \[/)?.[0] ?? "";
  assert.doesNotMatch(stockLoader, /loadBars/);
  assert.match(stock, /latestFilingsForPresentation\(filingData\)/);
  assert.match(stock, /latestNewsForPresentation\(newsData\)/);
});

test("real chart hydration clamps an initially empty selection", async () => {
  const chart = await read("src/components/stock/PriceChart.tsx");
  assert.match(chart, /Math\.max\(0, Math\.min\(selected, points\.length - 1\)\)/);
});

test("cancelled and deferred product capabilities remain absent", async () => {
  const sourceFiles = await readdir(new URL("../src/", import.meta.url), { recursive: true });
  const client = (await Promise.all(sourceFiles.filter((path) => /\.tsx?$/.test(path)).map((path) => read(`src/${path}`)))).join("\n");
  assert.doesNotMatch(client, /OpenAI|Anthropic|Gemini|pushToken|brokerage|executeTrade|advancedExpansion/);
});
