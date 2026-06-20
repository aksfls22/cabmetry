-- Migration: enforce activation code at signup + create user_licenses
-- Extends the signup gating trigger to create user_licenses records
-- This connects the signup flow with the new user_licenses system
--
-- DEPENDENCY: 
--   1. supabase/migration-activation-codes.sql (defines validate_activation_code)
--   2. supabase/migration-user-licenses.sql (defines user_licenses table)
--
-- Run this file in the Supabase SQL Editor to replace the existing trigger.

-- =========================================
-- TRIGGER FUNCTION (UPDATED)
-- =========================================

create or replace function public.enforce_activation_code_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider text;
  v_code text;
  v_result jsonb;
  v_duration_days integer;
  v_expires_at timestamptz;
  v_retention_until timestamptz;
  v_existing_license record;
begin
  -- Only gate the email/password provider. OAuth/other providers carry no code.
  v_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');
  if v_provider <> 'email' then
    return new;
  end if;

  -- The activation code arrives via supabase.auth.signUp({ options: { data: {...} } }),
  -- which GoTrue stores in raw_user_meta_data.
  v_code := upper(trim(coalesce(new.raw_user_meta_data->>'activation_code', '')));

  if v_code = '' then
    raise exception 'activation_code_required'
      using errcode = 'check_violation';
  end if;

  -- Atomically validate + consume (locks the row, increments used_count, etc.).
  -- new.id is already populated by GoTrue at BEFORE INSERT time.
  v_result := public.validate_activation_code(v_code, new.id);

  if coalesce((v_result->>'valid')::boolean, false) is not true then
    raise exception 'activation_code_invalid: %', coalesce(v_result->>'error', 'unknown')
      using errcode = 'check_violation';
  end if;

  -- =========================================
  -- NEW: Create user_licenses record
  -- =========================================
  
  -- Get duration_days from activation_codes table
  select duration_days into v_duration_days
  from public.activation_codes
  where code = v_code;
  
  -- Default to 30 days if not found (should not happen, but safety first)
  v_duration_days := coalesce(v_duration_days, 30);
  
  -- Calculate expiration and retention dates
  v_expires_at := now() + (v_duration_days || ' days')::interval;
  v_retention_until := v_expires_at + interval '365 days';
  
  -- Check if user already has an active license
  select * into v_existing_license
  from public.user_licenses
  where user_id = new.id
    and license_status = 'active'
  limit 1;
  
  if v_existing_license.id is not null then
    -- User already has an active license - extend it
    update public.user_licenses
set 
  expires_at = greatest(v_existing_license.expires_at, now())
               + (v_duration_days || ' days')::interval,
      retention_until =
  (
    greatest(v_existing_license.expires_at, now())
    + (v_duration_days || ' days')::interval
  ) + interval '365 days',
      activation_code = v_code  -- Update to the new code used
    where id = v_existing_license.id;
  else
    -- Create new license record
    insert into public.user_licenses (
      user_id,
      activation_code,
      license_status,
      activated_at,
      expires_at,
      retention_until
    ) values (
      new.id,
      v_code,
      'active',
      now(),
      v_expires_at,
      v_retention_until
    );
  end if;

  return new;
end;
$$;

comment on function public.enforce_activation_code_on_signup is
  'BEFORE INSERT trigger on auth.users: requires and atomically consumes a valid '
  'activation code (from raw_user_meta_data.activation_code) for email/password '
  'signups. Creates or extends user_licenses record with duration from activation_codes.';

-- =========================================
-- TRIGGER (Re-create to use updated function)
-- =========================================

drop trigger if exists enforce_activation_code on auth.users;

create trigger enforce_activation_code
  before insert on auth.users
  for each row
  execute function public.enforce_activation_code_on_signup();

-- =========================================
-- ROLLBACK (if ever needed)
-- =========================================
-- drop trigger if exists enforce_activation_code on auth.users;
-- drop function if exists public.enforce_activation_code_on_signup();
