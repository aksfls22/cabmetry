import { getProfile, updateProfile } from "@/lib/profile";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage() {
  const profile = await getProfile();

  // If profile already has display_name, redirect to dashboard
  if (profile?.display_name) {
    redirect("/");
  }

  async function saveDisplayName(formData: FormData) {
    "use server";

    const display_name = String(formData.get("display_name") ?? "").trim();

    if (!display_name) {
      // If empty, redirect back with error (simple approach)
      redirect("/complete-profile?error=required");
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Completa tu perfil
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Por favor, ingresa tu nombre para continuar
          </p>
        </div>

        <form action={saveDisplayName} className="space-y-6">
          <div className="rounded-3xl border border-surface-border bg-surface-raised p-6">
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

          <Button type="submit" variant="primary" fullWidth>
            Continuar
          </Button>
        </form>
      </div>
    </div>
  );
}
