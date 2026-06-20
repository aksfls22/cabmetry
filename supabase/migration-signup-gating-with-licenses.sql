-- Migration: enforce activation code at signup (NON-CONSUMING)
-- This trigger validates activation codes at signup WITHOUT consuming them
-- The actual consumption happens in complete-profile flow
--
-- DEPENDENCY: 
--   1. supabase/migration-activation-codes.sql (defines validate_activation_code_available)
--
-- Run this file in the Supabase SQL Editor to replace the existing trigger.

-- =========================================
-- TRIGGER FUNCTION (UPDATED - NON-CONSUMING)
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

  -- Check availability WITHOUT consuming (non-atomic, read-only check)
  -- The actual consumption happens in complete-profile flow
  v_result := public.validate_activation_code_available(v_code);

  if coalesce((v_result->>'valid')::boolean, false) is not true then
    raise exception 'activation_code_invalid: %', coalesce(v_result->>'error', 'unknown')
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on function public.enforce_activation_code_on_signup is
  'BEFORE INSERT trigger on auth.users: requires a valid activation code '
  '(from raw_user_meta_data.activation_code) for email/password signups. '
  'Does NOT consume the code - consumption happens in complete-profile flow.';

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
