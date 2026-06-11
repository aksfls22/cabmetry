-- Migration: Update activation_codes validation function
-- Purpose: Add server-side validation function for existing activation_codes table
-- IMPORTANT: This is an ADDITIVE migration - does NOT recreate table or modify data
-- Run in Supabase SQL Editor

-- =========================================
-- VALIDATION FUNCTION (Server-side only)
-- =========================================

-- This function works with existing production schema:
-- - status values: 'unused', 'used'
-- - existing TAXIBETA record preserved
-- - no table structure changes

create or replace function public.validate_activation_code(
  p_code text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_record record;
begin
  -- Find the code and lock it for update
  select * into v_code_record
  from public.activation_codes
  where code = p_code
  for update; -- Lock the row to prevent race conditions
  
  -- Code not found
  if not found then
    return jsonb_build_object(
      'valid', false,
      'error', 'invalid_code'
    );
  end if;
  
  -- Check if code is already fully used (status = 'used')
  if v_code_record.status = 'used' then
    return jsonb_build_object(
      'valid', false,
      'error', 'max_uses_reached'
    );
  end if;
  
  -- Check expiration (if expires_at column exists and is set)
  if v_code_record.expires_at is not null 
     and v_code_record.expires_at < now() then
    return jsonb_build_object(
      'valid', false,
      'error', 'expired'
    );
  end if;
  
  -- Check usage limit (used_count vs max_uses)
  if v_code_record.used_count >= v_code_record.max_uses then
    -- Mark as fully used
    update public.activation_codes
    set 
      status = 'used',
      updated_at = now()
    where id = v_code_record.id;
    
    return jsonb_build_object(
      'valid', false,
      'error', 'max_uses_reached'
    );
  end if;
  
  -- Code is valid - increment usage counter
  update public.activation_codes
  set 
    used_count = used_count + 1,
    -- Mark as 'used' if this was the last available use
    status = case 
      when used_count + 1 >= max_uses then 'used'
      else status
    end,
    -- Track single-use code user
    used_by = case 
      when max_uses = 1 then p_user_id 
      else used_by 
    end,
    used_at = case 
      when max_uses = 1 then now() 
      else used_at 
    end,
    updated_at = now()
  where id = v_code_record.id;
  
  return jsonb_build_object(
    'valid', true,
    'license_type', v_code_record.license_type
  );
end;
$$;

-- =========================================
-- FUNCTION PERMISSIONS (Security Hardening)
-- =========================================

-- Revoke all default permissions
revoke all on function public.validate_activation_code(text, uuid)
from public;

-- Grant execute only to authenticated users
grant execute on function public.validate_activation_code(text, uuid)
to authenticated;

-- =========================================
-- COMMENTS
-- =========================================

comment on function public.validate_activation_code is 
  'Server-side validation function for activation codes. Works with status values: unused, used. Returns {valid: boolean, error?: string, license_type?: string}';

-- =========================================
-- NON-CONSUMING VALIDATION FUNCTION
-- =========================================

-- Read-only availability check for signup/onboarding preflight.
-- IMPORTANT:
-- - Does NOT lock activation_codes rows
-- - Does NOT increment used_count
-- - Does NOT update status
-- - Does NOT set used_by or used_at
-- - Keeps validate_activation_code(text, uuid) as the only consuming path

create or replace function public.validate_activation_code_available(
  p_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_record record;
begin
  select * into v_code_record
  from public.activation_codes
  where code = p_code;

  if not found then
    return jsonb_build_object(
      'valid', false,
      'error', 'invalid_code'
    );
  end if;

  if v_code_record.status = 'used' then
    return jsonb_build_object(
      'valid', false,
      'error', 'max_uses_reached'
    );
  end if;

  if v_code_record.expires_at is not null
     and v_code_record.expires_at < now() then
    return jsonb_build_object(
      'valid', false,
      'error', 'expired'
    );
  end if;

  if v_code_record.used_count >= v_code_record.max_uses then
    return jsonb_build_object(
      'valid', false,
      'error', 'max_uses_reached'
    );
  end if;

  return jsonb_build_object(
    'valid', true,
    'license_type', v_code_record.license_type
  );
end;
$$;

-- Revoke all default permissions
revoke all on function public.validate_activation_code_available(text)
from public;

-- Grant execute to pre-auth signup checks and authenticated server flows.
grant execute on function public.validate_activation_code_available(text)
to anon, authenticated;

comment on function public.validate_activation_code_available is
  'Read-only activation code availability check. Does not consume codes or mutate used_count/status/ownership fields.';
