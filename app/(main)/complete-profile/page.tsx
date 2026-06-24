import { getProfile, updateProfile } from "@/lib/profile";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  activateActivationCodeWithFallback,
  getActivationErrorMessage
} from "@/lib/access-codes";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const profile = await getProfile();
  const user = await requireUser();

  // EMAIL FLOW:
  // Comes with activation_code + display_name in metadata
  // GOOGLE FLOW:
  // Comes only with provider metadata (full_name / name)

  const activationCode = String(
    user.user_metadata?.activation_code ?? ""
  ).trim();

  const displayName = String(
    user.user_metadata?.display_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      ""
  ).trim();

  // Lock only if value already exists from Email Signup
  const isActivationCodeLocked = !!activationCode;
  const isDisplayNameLocked = !!user.user_metadata?.display_name;

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

    // Ensure authenticated user
    await requireUser();

    // Atomic activation + license creation
    const validationResult =
      await activateActivationCodeWithFallback(betaCode);

    if (!validationResult.valid) {
      const errorParam = validationResult.error || "invalid_beta";
      redirect(`/complete-profile?error=${errorParam}`);
    }

    // Preserve existing profile settings
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

  const errorMessage = searchParams.error
    ? searchParams.error === "required"
      ? "Todos los campos son obligatorios"
      : searchParams.error === "invalid_beta"
      ? "Código de activación inválido"
      : getActivationErrorMessage(
          searchParams.error as
            | "expired"
            | "max_uses_reached"
            | "database_error"
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
              defaultValue={activationCode}
              required
              readOnly={isActivationCodeLocked}
              autoComplete="off"
            />

            <Input
              label="Nombre visible"
              name="display_name"
              type="text"
              defaultValue={displayName}
              required
              readOnly={isDisplayNameLocked}
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