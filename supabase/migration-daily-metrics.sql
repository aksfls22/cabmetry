-- Migration: version-control the daily_metrics table + RLS (security finding #5).
-- The app (lib/daily-metrics.ts) already uses public.daily_metrics, but the table
-- was never defined in the repo schema. This migration is idempotent and safe to
-- run on an existing deployment that already has the table (it only adds what is
-- missing and (re)asserts the RLS policies).
-- Run in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  kilometers numeric(10, 2) not null default 0 check (kilometers >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Required by the app's upsert(onConflict: "user_id,date").
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'daily_metrics_user_id_date_key'
  ) then
    alter table public.daily_metrics
      add constraint daily_metrics_user_id_date_key unique (user_id, date);
  end if;
end$$;

create index if not exists daily_metrics_user_date_idx
  on public.daily_metrics (user_id, date desc);

alter table public.daily_metrics enable row level security;

-- Re-assert policies idempotently.
drop policy if exists "Users read own daily_metrics" on public.daily_metrics;
create policy "Users read own daily_metrics"
  on public.daily_metrics for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own daily_metrics" on public.daily_metrics;
create policy "Users insert own daily_metrics"
  on public.daily_metrics for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own daily_metrics" on public.daily_metrics;
create policy "Users update own daily_metrics"
  on public.daily_metrics for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own daily_metrics" on public.daily_metrics;
create policy "Users delete own daily_metrics"
  on public.daily_metrics for delete to authenticated
  using (auth.uid() = user_id);
