/**
 * Centralized activation code validation layer
 * 
 * Security principles:
 * - Server-side only validation
 * - No direct table access from client
 * - Uses database function for atomic validation + consumption
 * - Backwards compatible with BETA_CODE env var
 */

import { createClient } from "@/lib/supabase/server";

interface ValidationResult {
  valid: boolean;
  error?: "invalid_code" | "expired" | "max_uses_reached" | "database_error";
  licenseType?: string;
}

/**
 * The BETA_CODE env fallback is fail-closed by default: it only activates when
 * ACTIVATION_CODE_ALLOW_ENV_FALLBACK is explicitly set to "true". This keeps a
 * database outage from silently opening the gate to anyone who knows BETA_CODE.
 */
function envFallbackEnabled(): boolean {
  return process.env.ACTIVATION_CODE_ALLOW_ENV_FALLBACK === "true";
}

/**
 * Checks whether an activation code is currently available without consuming it.
 *
 * This function intentionally does not require a user ID and does not mutate
 * activation_codes. activateActivationCode() is the only consuming path in this
 * module.
 *
 * @param code - The activation code to check
 * @returns ValidationResult with valid status and optional error
 */
export async function validateActivationCodeAvailable(
  code: string
): Promise<ValidationResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc(
      "validate_activation_code_available",
      {
        p_code: code.trim().toUpperCase(),
      }
    );

    if (error) {
      console.error("Activation code availability check error:", error);
      return {
        valid: false,
        error: "database_error",
      };
    }

    const result = data as {
      valid: boolean;
      error?: string;
      license_type?: string;
    };

    if (!result.valid) {
      return {
        valid: false,
        error: result.error as ValidationResult["error"],
      };
    }

    return {
      valid: true,
      licenseType: result.license_type,
    };
  } catch (err) {
    console.error(
      "Unexpected error checking activation code availability:",
      err
    );
    return {
      valid: false,
      error: "database_error",
    };
  }
}

/**
 * Checks activation code availability with backwards compatibility.
 *
 * Falls back to BETA_CODE only when the database availability check fails with
 * a database_error. Invalid, expired, or exhausted database codes remain
 * invalid and are not bypassed.
 *
 * @param code - The activation code to check
 * @returns ValidationResult
 */
export async function validateActivationCodeAvailableWithFallback(
  code: string
): Promise<ValidationResult> {
  const dbResult = await validateActivationCodeAvailable(code);

  if (dbResult.valid) {
    return dbResult;
  }

  if (dbResult.error === "database_error" && envFallbackEnabled()) {
    const envBetaCode = process.env.BETA_CODE;

    if (envBetaCode && code.trim() === envBetaCode) {
      console.warn(
        "Using BETA_CODE availability fallback - database validation failed. " +
          "Ensure migration-activation-codes.sql has been run."
      );
      return {
        valid: true,
        licenseType: "beta",
      };
    }
  }

  return dbResult;
}

/**
 * Atomically consumes an activation code and creates/extends the calling user's
 * license, via the `activate_activation_code` SECURITY DEFINER function.
 *
 * This is the single point of activation-code consumption. Consumption and
 * license creation happen in one database transaction, so a code can never be
 * burned without the matching license being created. The license write runs
 * inside the SECURITY DEFINER function, so it succeeds despite the SELECT-only
 * RLS policy on user_licenses. The user id is taken from auth.uid() inside the
 * function and is never trusted from the client.
 *
 * @param code - The activation code to consume
 * @returns ValidationResult with valid status and optional error
 */
export async function activateActivationCode(
  code: string
): Promise<ValidationResult> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc("activate_activation_code", {
      p_code: code.trim().toUpperCase(),
    });

    if (error) {
      console.error("Activation code activation error:", error);
      return {
        valid: false,
        error: "database_error",
      };
    }

    const result = data as {
      valid: boolean;
      error?: string;
      license_type?: string;
    };

    if (!result.valid) {
      return {
        valid: false,
        error: result.error as ValidationResult["error"],
      };
    }

    return {
      valid: true,
      licenseType: result.license_type,
    };
  } catch (err) {
    console.error("Unexpected error activating activation code:", err);
    return {
      valid: false,
      error: "database_error",
    };
  }
}

/**
 * Activates an activation code with backwards compatibility.
 *
 * Falls back to BETA_CODE only when the database activation fails with a
 * database_error and the env fallback is explicitly enabled. Invalid, expired,
 * or exhausted codes remain invalid and are not bypassed. The fallback path
 * does not create a license record (it only exists to keep the gate open during
 * a database outage for a known beta code).
 *
 * @param code - The activation code to consume
 * @returns ValidationResult
 */
export async function activateActivationCodeWithFallback(
  code: string
): Promise<ValidationResult> {
  const dbResult = await activateActivationCode(code);

  if (dbResult.valid) {
    return dbResult;
  }

  if (dbResult.error === "database_error" && envFallbackEnabled()) {
    const envBetaCode = process.env.BETA_CODE;

    if (envBetaCode && code.trim() === envBetaCode) {
      console.warn(
        "Using BETA_CODE activation fallback - database activation failed. " +
          "Ensure activation-code migrations have been run."
      );
      return {
        valid: true,
        licenseType: "beta",
      };
    }
  }

  return dbResult;
}

/**
 * Get user-friendly error message for validation errors
 */
export function getActivationErrorMessage(error?: ValidationResult["error"]): string {
  switch (error) {
    case "invalid_code":
      return "Código de activación inválido";
    case "expired":
      return "Este código ha expirado";
    case "max_uses_reached":
      return "Este código ya ha sido utilizado el máximo de veces";
    case "database_error":
      return "Error al validar el código. Inténtalo de nuevo";
    default:
      return "Error desconocido";
  }
}
