create type public.marketbrief_resource_type as enum (
  'quote',
  'bars',
  'company',
  'news',
  'filings',
  'events'
);

create table public.company_registry (
  id uuid primary key,
  symbol text not null unique check (symbol = upper(symbol)),
  company_name text not null,
  exchange text not null,
  currency text not null check (char_length(currency) = 3),
  cik text unique check (cik is null or cik ~ '^[0-9]{10}$'),
  sector text,
  industry text,
  logo_url text,
  logo_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.company_registry is
  'Stable MarketBrief company identities. Symbols are mutable lookup attributes, never primary keys.';

create table public.market_data_cache (
  cache_key text primary key,
  resource_type public.marketbrief_resource_type not null,
  provider text not null,
  source text not null,
  payload jsonb not null,
  fetched_at timestamptz not null,
  as_of timestamptz,
  expires_at timestamptz not null,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at >= fetched_at)
);

create index market_data_cache_expiry_idx
  on public.market_data_cache (resource_type, expires_at);

create table public.provider_request_windows (
  provider text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  blocked_until timestamptz,
  last_error_code text,
  updated_at timestamptz not null default now(),
  primary key (provider, window_started_at)
);

alter table public.company_registry enable row level security;
alter table public.market_data_cache enable row level security;
alter table public.provider_request_windows enable row level security;

revoke all on public.company_registry from anon, authenticated;
revoke all on public.market_data_cache from anon, authenticated;
revoke all on public.provider_request_windows from anon, authenticated;

grant select, insert, update, delete on public.company_registry to service_role;
grant select, insert, update, delete on public.market_data_cache to service_role;
grant select, insert, update, delete on public.provider_request_windows to service_role;

insert into public.company_registry
  (id, symbol, company_name, exchange, currency, cik, sector, industry)
values
  ('10000000-0000-4000-8000-000000000001', 'AAPL', 'Apple Inc.', 'NASDAQ', 'USD', '0000320193', 'Technology', 'Consumer Electronics'),
  ('10000000-0000-4000-8000-000000000002', 'MSFT', 'Microsoft Corporation', 'NASDAQ', 'USD', '0000789019', 'Technology', 'Software - Infrastructure'),
  ('10000000-0000-4000-8000-000000000003', 'NVDA', 'NVIDIA Corporation', 'NASDAQ', 'USD', '0001045810', 'Technology', 'Semiconductors'),
  ('10000000-0000-4000-8000-000000000004', 'TSLA', 'Tesla, Inc.', 'NASDAQ', 'USD', '0001318605', 'Consumer Cyclical', 'Auto Manufacturers'),
  ('10000000-0000-4000-8000-000000000005', 'AMZN', 'Amazon.com, Inc.', 'NASDAQ', 'USD', '0001018724', 'Consumer Cyclical', 'Internet Retail'),
  ('10000000-0000-4000-8000-000000000006', 'GOOGL', 'Alphabet Inc.', 'NASDAQ', 'USD', '0001652044', 'Communication Services', 'Internet Content & Information'),
  ('10000000-0000-4000-8000-000000000007', 'META', 'Meta Platforms, Inc.', 'NASDAQ', 'USD', '0001326801', 'Communication Services', 'Internet Content & Information'),
  ('10000000-0000-4000-8000-000000000008', 'AMD', 'Advanced Micro Devices, Inc.', 'NASDAQ', 'USD', '0000002488', 'Technology', 'Semiconductors'),
  ('10000000-0000-4000-8000-000000000009', 'PLTR', 'Palantir Technologies Inc.', 'NASDAQ', 'USD', '0001321655', 'Technology', 'Software - Infrastructure'),
  ('10000000-0000-4000-8000-000000000010', 'NFLX', 'Netflix, Inc.', 'NASDAQ', 'USD', '0001065280', 'Communication Services', 'Entertainment');
