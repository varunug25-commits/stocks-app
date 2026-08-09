create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null,
  event_name text not null check (event_name in (
    'app_opened', 'onboarding_completed', 'stock_searched', 'stock_added',
    'stock_removed', 'today_material_change_seen', 'why_moved_opened',
    'evidence_opened', 'source_opened', 'brief_opened', 'ask_submitted',
    'thesis_saved', 'group_created', 'feedback_submitted', 'ai_failed',
    'market_data_failed'
  )),
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object' and pg_column_size(properties) <= 2048),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create table if not exists public.intelligence_feedback (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null,
  response_hash text not null check (length(response_hash) between 4 and 128),
  task text not null check (task in ('why_moved', 'brief', 'ask', 'news_summary', 'filing_summary')),
  symbols text[] not null default '{}'::text[] check (cardinality(symbols) <= 15),
  helpful boolean not null,
  reason text check (reason is null or reason in ('wrong', 'not_relevant', 'too_obvious', 'too_much_text', 'missing_context')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now()
);

create table if not exists public.product_event_windows (
  identity_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (identity_hash, window_started_at)
);

alter table public.product_events enable row level security;
alter table public.product_events force row level security;
alter table public.intelligence_feedback enable row level security;
alter table public.intelligence_feedback force row level security;
alter table public.product_event_windows enable row level security;
alter table public.product_event_windows force row level security;

revoke all on public.product_events, public.intelligence_feedback, public.product_event_windows from public, anon, authenticated;
grant select, insert, delete on public.product_events, public.intelligence_feedback to service_role;
grant select, insert, update, delete on public.product_event_windows to service_role;

create or replace function public.consume_product_event_budget(p_identity_hash text)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz := date_trunc('minute', v_now);
  v_count integer := 0;
begin
  if p_identity_hash is null or length(p_identity_hash) < 4 or length(p_identity_hash) > 128 then
    raise exception 'Invalid product-event identity';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('marketbrief-product-event-budget:' || p_identity_hash, 0));
  select request_count into v_count from public.product_event_windows where identity_hash = p_identity_hash and window_started_at = v_window_start;
  v_count := coalesce(v_count, 0);
  if v_count >= 60 then return false; end if;
  insert into public.product_event_windows (identity_hash, window_started_at, request_count, updated_at)
  values (p_identity_hash, v_window_start, 1, v_now)
  on conflict (identity_hash, window_started_at) do update
  set request_count = public.product_event_windows.request_count + 1, updated_at = excluded.updated_at;
  delete from public.product_event_windows where window_started_at < v_now - interval '2 days';
  return true;
end;
$$;

revoke all on function public.consume_product_event_budget(text) from public, anon, authenticated;
grant execute on function public.consume_product_event_budget(text) to service_role;

create index if not exists product_events_received_at_idx on public.product_events (received_at desc);
create index if not exists product_events_name_received_idx on public.product_events (event_name, received_at desc);
create index if not exists intelligence_feedback_received_at_idx on public.intelligence_feedback (received_at desc);

comment on table public.product_events is 'Allowlisted anonymous product events. Raw questions, article bodies, thesis text, credentials, and invasive device identifiers are prohibited.';
comment on table public.intelligence_feedback is 'Minimal structured feedback keyed by a non-reversible response hash.';
