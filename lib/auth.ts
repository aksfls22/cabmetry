import { es } from "@/lib/i18n/es";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/** Thrown by requireUser() when there is no authenticated session. */
export class UnauthorizedError extends Error {
  constructor(message = es.auth.notAuthenticated) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}
