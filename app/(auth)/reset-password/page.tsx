"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdatePassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error("No pudimos actualizar tu contraseña.");
      return;
    }

    toast.success("Contraseña actualizada correctamente.");

    router.replace("/login");
    router.refresh();
  }

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Introduce tu nueva contraseña."
    >
      <form onSubmit={handleUpdatePassword} className="space-y-5">
        <Input
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Actualizar contraseña"}
        </Button>

        <p className="text-center text-sm text-zinc-500">
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}