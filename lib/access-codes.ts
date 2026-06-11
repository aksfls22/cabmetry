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
 * Checks whether an activation code is currently available without consuming it.
 *
 * This function intentionally does not require a user ID and does not mutate
 * activation_codes. The existing validateActivationCode() function remains the
 * only consuming validation path in this module.
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

  if (dbResult.error === "database_error") {
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
 * Validates an activation code against the database
 * 
 * This function:
 * 1. Checks if code exists and is active
 * 2. Verifies expiration date
 * 3. Checks usage limits
 * 4. Atomically increments usage counter
 * 
 * @param code - The activation code to validate
 * @param userId - The user ID attempting to use the code
 * @returns ValidationResult with valid status and optional error
 */
export async function validateActivationCode(
  code: string,
  userId: string
): Promise<ValidationResult> {
  try {
    const supabase = createClient();
    
    // Call the database function for atomic validation + consumption
    const { data, error } = await supabase.rpc("validate_activation_code", {
      p_code: code.trim().toUpperCase(),
      p_user_id: userId,
    });

    if (error) {
      console.error("Activation code validation error:", error);
      return {
        valid: false,
        error: "database_error",
      };
    }

    // Parse the result from the database function
    const result = data as { valid: boolean; error?: string; license_type?: string };
    
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
    console.error("Unexpected error validating activation code:", err);
    return {
      valid: false,
      error: "database_error",
    };
  }
}

/**
 * Validates activation code with backwards compatibility
 * 
 * Falls back to BETA_CODE environment variable if database validation fails
 * This ensures existing deployments continue working during migration
 * 
 * @param code - The activation code to validate
 * @param userId - The user ID attempting to use the code
 * @returns ValidationResult
 */
export async function validateActivationCodeWithFallback(
  code: string,
  userId: string
): Promise<ValidationResult> {
  // Try database validation first
  const dbResult = await validateActivationCode(code, userId);
  
  // If database validation succeeds, use it
  if (dbResult.valid) {
    return dbResult;
  }
  
  // If database error (not invalid code), try env var fallback
  if (dbResult.error === "database_error") {
    const envBetaCode = process.env.BETA_CODE;
    
    if (envBetaCode && code.trim() === envBetaCode) {
      console.warn(
        "Using BETA_CODE fallback - database validation failed. " +
        "Ensure migration-activation-codes.sql has been run."
      );
      return {
        valid: true,
        licenseType: "beta",
      };
    }
  }
  
  // Return the database result (invalid code, expired, or max uses)
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
