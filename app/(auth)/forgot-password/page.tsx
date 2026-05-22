"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setLoading(false);

    if (error) {
      toast.error("No pudimos enviar el correo de recuperación.");
      return;
    }

    toast.success("Te enviamos un enlace para recuperar tu contraseña.");
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña."
    >
      <form onSubmit={handleResetPassword} className="space-y-5">
        <Input
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Enviando..." : "Enviar enlace"}
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