# Cabmetry

App web mobile-first para taxistas: registra carreras, gastos y consulta el beneficio neto del día.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- Listo para **Vercel**

## Funciones

- **Dashboard**: ingresos, carreras, gastos y beneficio neto de hoy
- **Nueva carrera**: importe, método de pago (efectivo, tarjeta, Uber, Bolt), notas
- **Nuevo gasto**: categoría rápida, importe, notas
- **Historial** de carreras y gastos (con eliminación)
- **Modo oscuro** con toggle (por defecto oscuro)
- Botones grandes y atajos de importe para entrada rápida

## Configuración

### 1. Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. En **Authentication → Providers**, activa **Email** (email + contraseña)
3. En **SQL Editor**, ejecuta `supabase/schema.sql` (proyecto nuevo) o `supabase/migration-auth.sql` (si ya tenías datos)
4. En **Authentication → URL Configuration**, añade `http://localhost:3000/auth/callback` como redirect URL
5. Copia **Project URL** y **anon public key** desde Settings → API

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Despliegue en Vercel

1. Sube el repo a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Añade las mismas variables de entorno en **Settings → Environment Variables**
4. Deploy

## Estructura

```
app/
  page.tsx                 # Dashboard
  rides/new/page.tsx       # Añadir carrera
  rides/history/page.tsx   # Historial carreras
  expenses/new/page.tsx    # Añadir gasto
  expenses/history/page.tsx
components/                # UI y formularios
lib/
  supabase/                # Cliente browser + server
  queries.ts               # Consultas del dashboard
supabase/schema.sql        # Tablas y RLS
```

## Autenticación

- Registro e inicio de sesión con email y contraseña (Supabase Auth)
- Rutas del dashboard protegidas por middleware
- Cada usuario solo ve y gestiona sus propios datos (`user_id` + RLS)

## Licencia

MIT
