-- Cabmetry schema (fresh install)
-- Run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric(10, 2) not null check (amount >= 0),
  payment_method text not null check (
    payment_method in ('cash', 'card', 'uber', 'bolt')
  ),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists rides_user_created_at_idx
  on public.rides (user_id, created_at desc);

create index if not exists expenses_user_created_at_idx
  on public.expenses (user_id, created_at desc);

alter table public.rides enable row level security;
alter table public.expenses enable row level security;

-- Rides: authenticated users only, own rows
create policy "Users read own rides"
  on public.rides for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own rides"
  on public.rides for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own rides"
  on public.rides for delete to authenticated
  using (auth.uid() = user_id);

-- Expenses: authenticated users only, own rows
create policy "Users read own expenses"
  on public.expenses for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own expenses"
  on public.expenses for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own expenses"
  on public.expenses for delete to authenticated
  using (auth.uid() = user_id);
-- =========================================
-- PROFILES
-- =========================================

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique references auth.users(id) on delete cascade,

  display_name text,

  language text not null default 'es',

  currency text not null default 'EUR',

  compensation_model text not null default 'OWNER',

  revenue_percentage numeric(5,2) not null default 1.00,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- =========================================
-- RLS
-- =========================================

alter table profiles enable row level security;

-- SELECT

create policy "Users can view own profile"
on profiles
for select
using (
  auth.uid() = user_id
);

-- INSERT

create policy "Users can insert own profile"
on profiles
for insert
with check (
  auth.uid() = user_id
);

-- UPDATE

create policy "Users can update own profile"
on profiles
for update
using (
  auth.uid() = user_id
);

-- DELETE

create policy "Users can delete own profile"
on profiles
for delete
using (
  auth.uid() = user_id
);

-- =========================================
-- DAILY METRICS (km per day)
-- =========================================

create table if not exists public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  kilometers numeric(10, 2) not null default 0 check (kilometers >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create index if not exists daily_metrics_user_date_idx
  on public.daily_metrics (user_id, date desc);

alter table public.daily_metrics enable row level security;

create policy "Users read own daily_metrics"
  on public.daily_metrics for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own daily_metrics"
  on public.daily_metrics for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own daily_metrics"
  on public.daily_metrics for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users delete own daily_metrics"
  on public.daily_metrics for delete to authenticated
  using (auth.uid() = user_id);