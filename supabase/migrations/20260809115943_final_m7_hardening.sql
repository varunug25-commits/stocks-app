alter type public.marketbrief_resource_type add value if not exists 'search';

create table if not exists public.intelligence_request_windows (
  scope text not null check (scope in ('identity', 'global')),
  identity_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (scope, identity_hash, window_started_at)
);

alter table public.intelligence_request_windows enable row level security;
revoke all on public.intelligence_request_windows from public, anon, authenticated;
grant select, insert, update, delete on public.intelligence_request_windows to service_role;

create or replace function public.consume_intelligence_request_budget(
  p_identity_hash text,
  p_window_seconds integer,
  p_identity_max integer,
  p_global_max integer
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_start timestamptz;
  v_retry_at timestamptz;
  v_identity_count integer := 0;
  v_global_count integer := 0;
begin
  if p_identity_hash is null or length(p_identity_hash) < 4 or length(p_identity_hash) > 128 then
    raise exception 'Invalid intelligence identity';
  end if;
  if p_window_seconds < 1 or p_identity_max < 1 or p_global_max < 1 then
    raise exception 'Intelligence budget values must be positive';
  end if;

  v_window_start := to_timestamp(floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds);
  v_retry_at := v_window_start + make_interval(secs => p_window_seconds);
  perform pg_advisory_xact_lock(hashtextextended('marketbrief-intelligence-budget', 0));

  select request_count into v_identity_count
  from public.intelligence_request_windows
  where scope = 'identity' and identity_hash = p_identity_hash and window_started_at = v_window_start;
  select request_count into v_global_count
  from public.intelligence_request_windows
  where scope = 'global' and identity_hash = 'all' and window_started_at = v_window_start;

  v_identity_count := coalesce(v_identity_count, 0);
  v_global_count := coalesce(v_global_count, 0);
  if v_identity_count >= p_identity_max or v_global_count >= p_global_max then
    return jsonb_build_object('allowed', false, 'remaining', 0, 'retryAt', v_retry_at);
  end if;

  insert into public.intelligence_request_windows (scope, identity_hash, window_started_at, request_count, updated_at)
  values ('identity', p_identity_hash, v_window_start, 1, v_now)
  on conflict (scope, identity_hash, window_started_at) do update
  set request_count = public.intelligence_request_windows.request_count + 1, updated_at = excluded.updated_at;

  insert into public.intelligence_request_windows (scope, identity_hash, window_started_at, request_count, updated_at)
  values ('global', 'all', v_window_start, 1, v_now)
  on conflict (scope, identity_hash, window_started_at) do update
  set request_count = public.intelligence_request_windows.request_count + 1, updated_at = excluded.updated_at;

  delete from public.intelligence_request_windows where window_started_at < v_now - interval '2 days';
  return jsonb_build_object(
    'allowed', true,
    'remaining', least(p_identity_max - v_identity_count - 1, p_global_max - v_global_count - 1),
    'retryAt', null
  );
end;
$$;

revoke all on function public.consume_intelligence_request_budget(text, integer, integer, integer)
from public, anon, authenticated;
grant execute on function public.consume_intelligence_request_budget(text, integer, integer, integer)
to service_role;

comment on table public.intelligence_request_windows is
  'Durable temporary-identity and global generation budgets. Cached intelligence reads do not consume this budget; authenticated per-user quotas should replace temporary identities after auth exists.';
