import Image from "next/image";
import { ExternalLink, Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Licencia expirada - Cabmetry",
};

export default async function LicenseExpiredPage() {
  const supabase = await createClient();
  
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get most recent license expiration date
  let expiresAt: string | null = null;
  if (user) {
    const { data: license } = await supabase
      .from("user_licenses")
      .select("expires_at")
      .eq("user_id", user.id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    expiresAt = license?.expires_at || null;
  }

  // Format expiration date
  let formattedDate = "";
  if (expiresAt) {
    const date = new Date(expiresAt);
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    formattedDate = `${day} de ${month} de ${year}`;
  }

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <Image
          src="/cabmetry-logo-horizontal.png"
          alt="Cabmetry"
          width={280}
          height={80}
          priority
          className="h-auto w-56"
        />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tu licencia ha expirado
          </h1>
          {formattedDate && (
            <p className="mt-2 text-sm text-zinc-300">
              Tu licencia expiró el {formattedDate}.
            </p>
          )}
          <p className="mt-1 text-sm text-zinc-400">
            Tu acceso está temporalmente suspendido
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-surface-border bg-surface-raised p-6 shadow-card">
        <div className="space-y-6">
          {/* Message */}
          <div className="space-y-3 text-center">
            <p className="text-sm text-zinc-300">
              Tu acceso a Cabmetry ha finalizado.
            </p>
            <p className="text-sm text-zinc-300">
              Tu información y tu historial permanecen seguros.
            </p>
            <p className="text-sm text-zinc-300">
              Para continuar utilizando la plataforma, renueva tu licencia desde nuestro sitio web.
            </p>
          </div>

          {/* Primary Action - Renew License */}
          <a
            href="https://cabmetry.store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-surface transition-colors hover:bg-accent-muted active:scale-[0.98] touch-target"
          >
            <span>Renovar licencia</span>
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Secondary Action - Contact Support */}
          <a
            href="mailto:cabmetry.es@gmail.com"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800/50 active:bg-zinc-800 touch-target"
          >
            <Mail className="h-4 w-4" />
            <span>Contactar soporte</span>
          </a>

          {/* Tertiary Action - Sign Out */}
          <form action={handleSignOut} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-border bg-surface px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-300 active:bg-zinc-800 touch-target"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
