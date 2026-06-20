-- Migration: User Licenses System
-- Description: Implements license management without breaking existing architecture
-- Rules: Additive only, no destructive changes, maintains Supabase Auth as source of truth

-- ============================================================================
-- 1. Create user_licenses table
-- ============================================================================

create table if not exists public.user_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activation_code text not null references public.activation_codes(code),
  license_status text not null check (license_status in ('active', 'expired', 'cancelled', 'archived')),
  activated_at timestamptz default now(),
  expires_at timestamptz not null,
  deactivated_at timestamptz,
  retention_until timestamptz not null,
  created_at timestamptz default now()
);

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================

create index if not exists idx_user_licenses_user_id
  on public.user_licenses(user_id);

create index if not exists idx_user_licenses_license_status
  on public.user_licenses(license_status);

create index if not exists idx_user_licenses_expires_at
  on public.user_licenses(expires_at);

-- ============================================================================
-- 3. Enable Row Level Security (RLS)
-- ============================================================================

alter table public.user_licenses enable row level security;

-- ============================================================================
-- 4. Create RLS policy: Users can view own licenses
-- ============================================================================

create policy "Users can view own licenses"
on public.user_licenses
for select
using (auth.uid() = user_id);
 

-- ============================================================================
-- 5. Modify activation_codes table (additive only)
-- ============================================================================

-- Add duration_days column to activation_codes
alter table public.activation_codes
  add column if not exists duration_days integer not null default 30;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

comment on table public.user_licenses is
  'Stores user license information. Links users to activation codes and tracks license lifecycle.';

comment on column public.user_licenses.user_id is
  'References auth.users - maintains Supabase Auth as source of truth';

comment on column public.user_licenses.activation_code is
  'References activation_codes - maintains activation_codes as inventory';

comment on column public.user_licenses.license_status is
  'Current status: active, expired, cancelled, or archived';

comment on column public.user_licenses.activated_at is
  'Timestamp when license was activated';

comment on column public.user_licenses.expires_at is
  'Timestamp when license expires';

comment on column public.user_licenses.deactivated_at is
  'Timestamp when license was deactivated (nullable)';

comment on column public.user_licenses.retention_until is
  'Timestamp until which license data must be retained';

comment on column public.activation_codes.duration_days is
  'Number of days the license is valid for after activation';
