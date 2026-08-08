create table if not exists public.intelligence_cache (
  cache_key text primary key,
  task text not null check (task in ('why_moved', 'brief', 'ask', 'news_summary', 'filing_summary')),
  evidence_hash text not null,
  payload jsonb not null,
  generated_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists intelligence_cache_expires_at_idx
  on public.intelligence_cache (expires_at);

alter table public.intelligence_cache enable row level security;
revoke all on public.intelligence_cache from public, anon, authenticated;
grant select, insert, update, delete on public.intelligence_cache to service_role;

comment on table public.intelligence_cache is
  'Server-only validated MarketBrief intelligence responses keyed by task, request fingerprint, evidence hash, and schema version.';
