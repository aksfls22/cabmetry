import { currencies } from "@/lib/constants/currencies";
import { getProfile } from "@/lib/profile";
import { updateProfile } from "@/lib/profile";
export default async function SettingsPage(){
const profile = await getProfile(); 
async function saveProfile(formData: FormData) {
  "use server";

  const currency = String(formData.get("currency") ?? "EUR");

  const compensation_model = String(
    formData.get("compensation_model") ?? "OWNER"
  );

  let revenue_percentage = 1;

if (compensation_model === "PERCENTAGE") {
  revenue_percentage =
    Number(formData.get("revenue_percentage") ?? 100) / 100;
}

  await updateProfile({
    currency,
    compensation_model,
    revenue_percentage,
  });
}

return (
    <div className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Configuración
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Administra tu perfil y preferencias de la app.
          </p>
        </div>

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
                placeholder="Tu nombre"
                className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition-colors focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white">
                Correo electrónico
              </label>

              <input
                type="email"
                value="usuario@email.com"
                disabled
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500 outline-none"
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

          <form action={saveProfile} className="space-y-4">
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
</form>
        </section>

        {/* CUENTA */}
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

      <input
        type="email"
        value="usuario@email.com"
        disabled
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-500 outline-none"
      />
    </div>

    <button className="w-full rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:border-zinc-700 hover:bg-zinc-950">
      Cambiar contraseña
    </button>

    <button className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20">
      Cerrar sesión
    </button>
  </div>
</section>
      </div>
    </div>
  );
}