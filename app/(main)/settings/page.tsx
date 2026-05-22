import { currencies } from "@/lib/constants/currencies";
import { getProfile } from "@/lib/profile";
import { updateProfile } from "@/lib/profile";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsToast } from "@/components/SettingsToast";


export default async function SettingsPage() {
  const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();
  const profile = await getProfile();

  async function saveProfile(formData: FormData) {
    "use server";

    const display_name = String(
      formData.get("display_name") ?? "User"
    ).trim();

    const currency = String(
      formData.get("currency") ?? "EUR"
    );

    const compensation_model = String(
      formData.get("compensation_model") ?? "OWNER"
    );

    let revenue_percentage = 1;

    if (compensation_model === "PERCENTAGE") {
      revenue_percentage =
        Number(formData.get("revenue_percentage") ?? 100) / 100;
    }

    await updateProfile({
      display_name,
      currency,
      compensation_model,
      revenue_percentage,
    });

    revalidatePath("/settings");
    redirect("/settings?success=true");
  }

  return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <SettingsToast />
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuración
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Administra tu perfil y preferencias de la app.
          </p>
        </div>

        <form action={saveProfile} className="space-y-6">

          {/* PERFIL */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Perfil
              </h2>

              <p className="text-sm text-zinc-400">
                Información básica de tu cuenta.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Nombre visible
                </label>

                <input
                  type="text"
                  name="display_name"
                  defaultValue={profile?.display_name ?? "User"}
                  placeholder="Tu nombre"
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-zinc-600"
                />
              </div>

              

              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Idioma
                </label>

                <select className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-zinc-600">
                  <option>Español</option>
                  <option>English</option>
                </select>
              </div>
            </div>
          </section>

          {/* FINANZAS */}
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                Finanzas
              </h2>

              <p className="text-sm text-zinc-400">
                Configuración financiera y reportes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Moneda
                </label>

                <select
                  name="currency"
                  defaultValue={profile?.currency ?? "EUR"}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-zinc-600"
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Modelo de ingresos
                </label>

                <select
                  name="compensation_model"
                  defaultValue={profile?.compensation_model ?? "OWNER"}
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-zinc-600"
                >
                  <option value="OWNER">
                    Dueño del vehículo
                  </option>

                  <option value="PERCENTAGE">
                    Porcentaje de ganancias
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white">
                  Porcentaje de ganancias
                </label>

                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  name="revenue_percentage"
                  defaultValue={
                    profile
                      ? profile.revenue_percentage * 100
                      : 100
                  }
                  placeholder="Ejemplo: 40"
                  className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-zinc-600"
                />

                <p className="mt-2 text-xs text-zinc-500">
                  Solo aplica si trabajas por comisión.
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Guardar cambios
              </button>
            </div>
          </section>

        </form>

        {/* CUENTA Y SEGURIDAD */}
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Cuenta y seguridad
            </h2>

            <p className="text-sm text-zinc-400">
              Seguridad de acceso y sesión.
            </p>
          </div>

          <div className="space-y-4">
          <div>
  <label className="mb-1 block text-sm font-medium text-white">
    Correo electrónico
  </label>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
    <p className="text-sm text-zinc-400">
    {user?.email ?? "Sin correo"}
    </p>
  </div>

  <p className="mt-2 text-xs text-zinc-500">
    Gestionado de forma segura mediante tu cuenta.
  </p>
</div>

<a
  href="/forgot-password"
  className="block w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:border-zinc-700 hover:bg-zinc-950"
>
  Cambiar contraseña
</a>
           
          </div>
        </section>
      </div>
    </div>
  );
}