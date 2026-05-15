import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { es } from "@/lib/i18n/es";

export const metadata = {
  title: es.meta.signupTitle,
};

export default function SignupPage() {
  return (
    <AuthShell title={es.auth.signupTitle} subtitle={es.auth.signupSubtitle}>
      <SignupForm />
    </AuthShell>
  );
}
