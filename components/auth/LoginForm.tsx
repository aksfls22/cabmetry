"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { es } from "@/lib/i18n/es";
import { translateAuthError } from "@/lib/i18n/translate-auth-error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === "auth_callback" ? es.auth.sessionFailed : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    setError(null);
    setLoading(true);
  
    const supabase = createClient();
  
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
  
    setLoading(false);
  
    if (signInError) {
      setError(translateAuthError(signInError.message));
      return;
    }
  
    router.push(redirect);
    router.refresh();
  }
  
  async function handleGoogleLogin() {
    setError(null);
  
    const supabase = createClient();
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  
    if (error) {
      setError(translateAuthError(error.message));
      return;
    }
  
    if (data.url) {
      window.location.href = data.url;
    }
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        autoComplete="current-password"
        placeholder={es.auth.passwordPlaceholder}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex justify-end">
  <Link
    href="/forgot-password"
    className="text-sm text-zinc-500 transition-colors hover:text-accent"
  >
    ¿Olvidaste tu contraseña?
  </Link>
</div>

      {error && (
        <p
          className="rounded-xl bg-expense/10 px-4 py-3 text-sm text-expense"
          role="alert"
        >
          {error}
        </p>
      )}
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t border-zinc-800" />
  </div>

  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-3 text-zinc-500">
      O continuar con
    </span>
  </div>
</div>

<Button
  type="button"
  variant="secondary"
  onClick={handleGoogleLogin}
  className="w-full"
>
  Continuar con Google
</Button>

      <Button type="submit" disabled={loading}>
        {loading ? es.auth.signingIn : es.auth.signIn}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        {es.auth.noAccount}{" "}
        <Link href="/signup" className="font-medium text-accent hover:underline">
          {es.auth.registerLink}
        </Link>
      </p>
    </form>
  );
}
