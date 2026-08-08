create or replace function public.consume_provider_request_budget(
  p_provider text,
  p_window_seconds integer,
  p_max_requests integer,
  p_cooldown_seconds integer
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_current public.provider_request_windows%rowtype;
  v_retry_at timestamptz;
begin
  if p_provider not in ('twelve-data', 'finnhub', 'sec-edgar') then
    raise exception 'Unsupported provider budget';
  end if;
  if p_window_seconds < 1 or p_max_requests < 1 or p_cooldown_seconds < 1 then
    raise exception 'Provider budget values must be positive';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('marketbrief-provider:' || p_provider, 0));

  select *
  into v_current
  from public.provider_request_windows
  where provider = p_provider
  order by window_started_at desc
  limit 1
  for update;

  if found and v_current.blocked_until is not null and v_current.blocked_until > v_now then
    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retryAt', v_current.blocked_until
    );
  end if;

  if not found or v_current.window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    insert into public.provider_request_windows (provider, window_started_at, request_count)
    values (p_provider, v_now, 1);

    delete from public.provider_request_windows
    where provider = p_provider
      and window_started_at < v_now - interval '1 day';

    return jsonb_build_object(
      'allowed', true,
      'remaining', greatest(p_max_requests - 1, 0),
      'retryAt', null
    );
  end if;

  if v_current.request_count >= p_max_requests then
    v_retry_at := greatest(
      v_current.window_started_at + make_interval(secs => p_window_seconds),
      v_now + make_interval(secs => p_cooldown_seconds)
    );
    update public.provider_request_windows
    set blocked_until = v_retry_at,
        last_error_code = 'RATE_LIMITED',
        updated_at = v_now
    where provider = v_current.provider
      and window_started_at = v_current.window_started_at;

    return jsonb_build_object(
      'allowed', false,
      'remaining', 0,
      'retryAt', v_retry_at
    );
  end if;

  update public.provider_request_windows
  set request_count = request_count + 1,
      blocked_until = null,
      last_error_code = null,
      updated_at = v_now
  where provider = v_current.provider
    and window_started_at = v_current.window_started_at;

  return jsonb_build_object(
    'allowed', true,
    'remaining', greatest(p_max_requests - v_current.request_count - 1, 0),
    'retryAt', null
  );
end;
$$;

revoke all on function public.consume_provider_request_budget(text, integer, integer, integer)
from public, anon, authenticated;

grant execute on function public.consume_provider_request_budget(text, integer, integer, integer)
to service_role;
