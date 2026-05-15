import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginFormFallback } from "@/components/auth/LoginFormFallback";
import { es } from "@/lib/i18n/es";

export const metadata = {
  title: es.meta.loginTitle,
};

export default function LoginPage() {
  return (
    <AuthShell title={es.auth.loginTitle} subtitle={es.auth.loginSubtitle}>
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
