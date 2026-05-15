/** Traduce mensajes habituales de Supabase Auth al español. */
export function translateAuthError(message: string): string {
  const normalized = message.trim();
  const map: Record<string, string> = {
    "Invalid login credentials": "Correo o contraseña incorrectos",
    "Email not confirmed": "Confirma tu correo antes de iniciar sesión",
    "User already registered": "Ya existe una cuenta con este correo",
    "Password should be at least 6 characters":
      "La contraseña debe tener al menos 6 caracteres",
    "Signup requires a valid password":
      "Introduce una contraseña válida",
    "Unable to validate email address: invalid format":
      "El formato del correo no es válido",
    "For security purposes, you can only request this after 60 seconds.":
      "Por seguridad, espera un minuto antes de volver a intentarlo",
  };

  if (map[normalized]) return map[normalized];

  if (/invalid login credentials/i.test(normalized)) {
    return "Correo o contraseña incorrectos";
  }
  if (/email not confirmed/i.test(normalized)) {
    return "Confirma tu correo antes de iniciar sesión";
  }
  if (/already registered/i.test(normalized)) {
    return "Ya existe una cuenta con este correo";
  }
  if (/password/i.test(normalized) && /6/i.test(normalized)) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  return normalized;
}

/** Traduce errores de base de datos / RLS al español. */
export function translateDbError(message: string): string {
  const normalized = message.trim();
  if (/row-level security/i.test(normalized)) {
    return "No tienes permiso para esta acción. Inicia sesión de nuevo.";
  }
  if (/JWT expired/i.test(normalized)) {
    return "Tu sesión ha caducado. Vuelve a iniciar sesión.";
  }
  if (/violates not-null constraint.*user_id/i.test(normalized)) {
    return "Error de cuenta. Ejecuta la migración de autenticación en Supabase.";
  }
  return normalized;
}
