-- Migration: enforce activation code at signup (server-side, all signup paths)
-- Fixes security finding #1: the beta/activation gate was client-side only, so a
-- direct call to Supabase Auth (/auth/v1/signup) created accounts with NO code,
-- and the consuming validate_activation_code() was never invoked (codes never used).
--
-- This trigger runs on EVERY insert into auth.users, so it blocks both the app's
-- client-side signUp and direct API calls. It reuses the existing consuming
-- function validate_activation_code(text, uuid) to atomically validate + consume.
--
-- DEPENDENCY: run supabase/migration-activation-codes.sql first (defines
--   public.validate_activation_code(text, uuid)).
-- Run this file in the Supabase SQL Editor.
--
-- NOTE on OAuth (Google, etc.): this trigger only gates the email/password
-- provider. OAuth signups carry no activation code and would otherwise be blocked.
-- For a true invite-only beta, gate OAuth separately (provider allowlist) or
-- disable OAuth providers in Authentication → Providers.

-- =========================================
-- TRIGGER FUNCTION
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

  -- Atomically validate + consume (locks the row, increments used_count, etc.).
  -- new.id is already populated by GoTrue at BEFORE INSERT time.
  v_result := public.validate_activation_code(v_code, new.id);

  if coalesce((v_result->>'valid')::boolean, false) is not true then
    raise exception 'activation_code_invalid: %', coalesce(v_result->>'error', 'unknown')
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

comment on function public.enforce_activation_code_on_signup is
  'BEFORE INSERT trigger on auth.users: requires and atomically consumes a valid '
  'activation code (from raw_user_meta_data.activation_code) for email/password '
  'signups. Closes the client-only signup gating bypass.';

-- =========================================
-- TRIGGER
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
