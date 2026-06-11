"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { es } from "@/lib/i18n/es";
import { translateAuthError } from "@/lib/i18n/translate-auth-error";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError(es.auth.passwordTooShort);
      return;
    }

    if (!displayName.trim()) {
      setError("El nombre visible es obligatorio");
      return;
    }

    setLoading(true);

    // Validate activation code server-side BEFORE signup
    try {
      const response = await fetch("/api/validate-activation-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: activationCode.trim() }),
      });

      const data = await response.json();

      if (!data.valid) {
        setLoading(false);
        setError("Código de activación inválido");
        return;
      }
    } catch (err) {
      setLoading(false);
      setError("Error al validar código de activación");
      return;
    }

    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          display_name: displayName.trim(),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setSuccess(es.auth.confirmEmail);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-xs text-center text-zinc-500 -mt-2 mb-4">
        Beta privada para conductores invitados
      </p>

      <Input
        label="Código de activación"
        type="text"
        autoComplete="off"
        placeholder="Introduce tu código de acceso"
        required
        value={activationCode}
        onChange={(e) => setActivationCode(e.target.value)}
      />

      <Input
        label="Nombre visible"
        type="text"
        autoComplete="name"
        placeholder="Tu nombre"
        required
        maxLength={50}
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <Input
        label={es.auth.email}
        type="email"
        autoComplete="email"
        placeholder={es.auth.emailPlaceholder}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label={es.auth.password}
        type="password"
        autoComplete="new-password"
        placeholder={es.auth.passwordHint}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p
          className="rounded-xl bg-expense/10 px-4 py-3 text-sm text-expense"
          role="alert"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          className="rounded-xl border border-profit/30 bg-profit/10 px-4 py-3 text-sm text-profit"
          role="status"
        >
          {success}
        </p>
      )}

      <Button type="submit" disabled={loading || !!success}>
        {loading ? es.auth.signingUp : es.auth.signUp}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        {es.auth.hasAccount}{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          {es.auth.loginLink}
        </Link>
      </p>
    </form>
  );
}
