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
