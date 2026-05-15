const PLACEHOLDER_HOST = "your-project.supabase.co";

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
  }

  if (url.includes(PLACEHOLDER_HOST) || anonKey === "your-anon-key") {
    throw new Error(
      "Configura credenciales reales de Supabase en .env.local (no uses los valores de ejemplo)"
    );
  }

  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith("http")) {
      throw new Error("URL inválida");
    }
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL debe ser una URL absoluta (ej. https://xxx.supabase.co)"
    );
  }

  return { url, anonKey };
}
