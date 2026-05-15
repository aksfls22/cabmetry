-- Migration: add auth + user_id for existing Cabmetry databases
-- Run AFTER enabling Email auth in Supabase Dashboard → Authentication → Providers

-- 1. Add user_id columns (nullable first for existing rows)
alter table public.rides
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

alter table public.expenses
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

-- 2. Drop legacy permissive policies
drop policy if exists "Allow anon read rides" on public.rides;
drop policy if exists "Allow anon insert rides" on public.rides;
drop policy if exists "Allow anon delete rides" on public.rides;
drop policy if exists "Allow anon read expenses" on public.expenses;
drop policy if exists "Allow anon insert expenses" on public.expenses;
drop policy if exists "Allow anon delete expenses" on public.expenses;

-- 3. User-scoped policies
drop policy if exists "Users read own rides" on public.rides;
drop policy if exists "Users insert own rides" on public.rides;
drop policy if exists "Users delete own rides" on public.rides;
drop policy if exists "Users read own expenses" on public.expenses;
drop policy if exists "Users insert own expenses" on public.expenses;
drop policy if exists "Users delete own expenses" on public.expenses;

create policy "Users read own rides"
  on public.rides for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own rides"
  on public.rides for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own rides"
  on public.rides for delete to authenticated
  using (auth.uid() = user_id);

create policy "Users read own expenses"
  on public.expenses for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own expenses"
  on public.expenses for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users delete own expenses"
  on public.expenses for delete to authenticated
  using (auth.uid() = user_id);

-- 4. Indexes
create index if not exists rides_user_created_at_idx
  on public.rides (user_id, created_at desc);

create index if not exists expenses_user_created_at_idx
  on public.expenses (user_id, created_at desc);

-- 5. Optional: delete anonymous rows without user_id, then enforce NOT NULL
-- delete from public.rides where user_id is null;
-- delete from public.expenses where user_id is null;
-- alter table public.rides alter column user_id set not null;
-- alter table public.expenses alter column user_id set not null;
