import { getProfile, updateProfile } from "@/lib/profile";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

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

    if (!display_name) {
      redirect("/complete-profile?error=required");
    }

    // The activation code is enforced and consumed once, at signup, by the
    // enforce_activation_code trigger on auth.users (migration-signup-gating.sql).
    // This step only collects the display name — re-consuming here would double
    // count single-use codes and lock the user out.
    await requireUser();

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
  const errorMessage =
    searchParams.error === "required" ? "El nombre visible es obligatorio" : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Completa tu perfil
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Ingresa tu nombre visible
          </p>
        </div>

        <form action={saveProfile} className="space-y-6">
          <div className="rounded-3xl border border-surface-border bg-surface-raised p-6 space-y-5">
            <Input
              label="Nombre visible"
              name="display_name"
              type="text"
              placeholder="Tu nombre"
              required
              autoFocus
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
