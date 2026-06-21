-- Migration: atomic activation-code consumption + license creation
-- Purpose: Consolidate code consumption and user_licenses creation into a single
--          SECURITY DEFINER function so writes to user_licenses bypass RLS safely.
--
-- WHY:
--   user_licenses has RLS enabled with a SELECT-only policy. Writing to it from
--   the user-scoped (anon key) client is rejected by RLS. Performing the write
--   inside a SECURITY DEFINER function keeps RLS closed for direct writes while
--   allowing the controlled, server-validated activation path to succeed.
--
--   It also makes consumption + license creation ATOMIC: previously the code was
--   consumed first and the license insert could then fail (RLS), leaving the user
--   with a burned code and no license.
--
-- DEPENDENCIES:
--   1. supabase/migration-activation-codes.sql (activation_codes + duration_days)
--   2. supabase/migration-user-licenses.sql    (user_licenses table)
--
-- Run this file in the Supabase SQL Editor.

create or replace function public.activate_activation_code(
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code_record record;
  v_duration_days integer;
  v_expires_at timestamptz;
  v_retention_until timestamptz;
  v_existing_license record;
begin
  -- The user id is derived from the JWT, never trusted from the caller, so a
  -- user can only ever activate a license for themselves.
  if v_user_id is null then
    return jsonb_build_object('valid', false, 'error', 'database_error');
  end if;

  -- Lock the code row to prevent race conditions during consumption.
  select * into v_code_record
  from public.activation_codes
  where code = p_code
  for update;

  if not found then
    return jsonb_build_object('valid', false, 'error', 'invalid_code');
  end if;

  if v_code_record.status = 'used' then
    return jsonb_build_object('valid', false, 'error', 'max_uses_reached');
  end if;

  if v_code_record.expires_at is not null
     and v_code_record.expires_at < now() then
    return jsonb_build_object('valid', false, 'error', 'expired');
  end if;

  if v_code_record.used_count >= v_code_record.max_uses then
    update public.activation_codes
    set status = 'used', updated_at = now()
    where id = v_code_record.id;

    return jsonb_build_object('valid', false, 'error', 'max_uses_reached');
  end if;

  -- Consume the code (same semantics as validate_activation_code).
  update public.activation_codes
  set
    used_count = used_count + 1,
    status = case when used_count + 1 >= max_uses then 'used' else status end,
    used_by = case when max_uses = 1 then v_user_id else used_by end,
    used_at = case when max_uses = 1 then now() else used_at end,
    updated_at = now()
  where id = v_code_record.id;

  -- Compute license lifecycle dates from the code duration.
  v_duration_days := coalesce(v_code_record.duration_days, 30);
  v_expires_at := now() + (v_duration_days || ' days')::interval;
  v_retention_until := v_expires_at + interval '365 days';

  -- Create or extend the user's active license.
  select * into v_existing_license
  from public.user_licenses
  where user_id = v_user_id
  order by expires_at desc
  limit 1;

  if v_existing_license.id is not null then
    update public.user_licenses
    set
      license_status = 'active',
      activated_at = now(),
      expires_at =
        greatest(v_existing_license.expires_at, now())
        + (v_duration_days || ' days')::interval,
      retention_until =
        (
          greatest(v_existing_license.expires_at, now())
          + (v_duration_days || ' days')::interval
        ) + interval '365 days',
      activation_code = v_code_record.code
    where id = v_existing_license.id;
  else
    insert into public.user_licenses (
      user_id,
      activation_code,
      license_status,
      activated_at,
      expires_at,
      retention_until
    ) values (
      v_user_id,
      v_code_record.code,
      'active',
      now(),
      v_expires_at,
      v_retention_until
    );
  end if;

  return jsonb_build_object(
    'valid', true,
    'license_type', v_code_record.license_type
  );
end;
$$;

-- =========================================
-- FUNCTION PERMISSIONS (Security Hardening)
-- =========================================

revoke all on function public.activate_activation_code(text)
from public;

grant execute on function public.activate_activation_code(text)
to authenticated;

comment on function public.activate_activation_code is
  'Atomically consumes an activation code and creates/extends the calling '
  'user''s license (user id taken from auth.uid()). SECURITY DEFINER so the '
  'user_licenses write bypasses RLS. Returns {valid, error?, license_type?}.';
