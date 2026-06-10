import { getProfile, updateProfile } from "@/lib/profile";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { 
  validateActivationCodeWithFallback, 
  getActivationErrorMessage 
} from "@/lib/access-codes";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const profile = await getProfile();

  // If profile already has display_name, redirect to dashboard
  if (profile?.display_name) {
    redirect("/");
  }

  async function saveProfile(formData: FormData) {
    "use server";

    const display_name = String(formData.get("display_name") ?? "").trim();
    const betaCode = String(formData.get("beta_code") ?? "").trim();

    if (!display_name || !betaCode) {
      redirect("/complete-profile?error=required");
    }

    // Get current user for validation
    const user = await requireUser();

    // Validate activation code using centralized validation layer
    // This supports both database codes and BETA_CODE env var fallback
    const validationResult = await validateActivationCodeWithFallback(
      betaCode,
      user.id
    );

    if (!validationResult.valid) {
      // Map validation errors to URL params
      const errorParam = validationResult.error || "invalid_beta";
      redirect(`/complete-profile?error=${errorParam}`);
    }

    // Use existing profile data or defaults
    const profile = await getProfile();

    await updateProfile({
      display_name,
      currency: profile?.currency ?? "EUR",
      compensation_model: profile?.compensation_model ?? "OWNER",
      revenue_percentage: profile?.revenue_percentage ?? 1,
    });

    revalidatePath("/");
    redirect("/");
  }

  // Map error codes to user-friendly messages
  const errorMessage = searchParams.error
    ? searchParams.error === "required"
      ? "Todos los campos son obligatorios"
      : searchParams.error === "invalid_beta"
      ? "Código de activación inválido"
      : getActivationErrorMessage(
          searchParams.error as "expired" | "max_uses_reached" | "database_error"
        )
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Completa tu perfil
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Ingresa tu nombre y código de acceso
          </p>
        </div>

        <form action={saveProfile} className="space-y-6">
          <div className="rounded-3xl border border-surface-border bg-surface-raised p-6 space-y-5">
            <Input
              label="Código de activación"
              name="beta_code"
              type="text"
              placeholder="Introduce tu código de acceso"
              required
              autoFocus
              autoComplete="off"
            />
            <Input
              label="Nombre visible"
              name="display_name"
              type="text"
              placeholder="Tu nombre"
              required
              maxLength={50}
            />
          </div>

          {errorMessage && (
            <p
              className="rounded-xl bg-expense/10 px-4 py-3 text-sm text-expense"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <Button type="submit" variant="primary" fullWidth>
            Continuar
          </Button>
        </form>
      </div>
    </div>
  );
}
