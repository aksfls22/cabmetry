# Cabmetry — Arquitectura

App web **mobile-first** para taxistas: registra carreras (rides) y gastos (expenses),
y calcula el beneficio neto. Multiusuario con autenticación, perfiles, informes y
códigos de activación (licencias / beta).

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | **Next.js 14** (App Router, Server Components + Server Actions) |
| Lenguaje | **TypeScript 5** |
| UI / Estilos | **Tailwind CSS 3** (dark mode por `class`), **lucide-react** (iconos) |
| Backend / DB | **Supabase** — PostgreSQL + Auth + **Row Level Security (RLS)** + funciones `plpgsql` (`security definer`) |
| Auth | Supabase Auth (email + contraseña), sesión vía **middleware** (`@supabase/ssr`) |
| Utilidades | `date-fns` / `date-fns-tz` (fechas/zonas), `clsx`, `sonner` (toasts) |
| i18n | Español (`lib/i18n/es.ts`) |
| Tooling | ESLint (`eslint-config-next`), PostCSS, Autoprefixer, **repomix** (contexto IA) |
| Despliegue | **Vercel** |

## Diagrama de arquitectura

```mermaid
graph TD
    User["📱 Usuario (taxista)<br/>navegador mobile-first"]

    subgraph Vercel["▲ Vercel — Next.js 14 (App Router)"]
        MW["middleware.ts<br/>updateSession() · protege rutas"]

        subgraph Auth["app/(auth) — público"]
            Login["login / signup"]
            Forgot["forgot-password / reset-password"]
        end

        subgraph Main["app/(main) — protegido"]
            Dash["page.tsx · Dashboard"]
            Rides["rides/new · rides/history"]
            Exp["expenses/new · expenses/history"]
            Reports["reports · reports/print"]
            Activity["activity"]
            Settings["settings · complete-profile"]
        end

        subgraph API["app/api — Route Handlers"]
            DM["daily-metrics"]
            VA["validate-activation-code"]
            VB["validate-beta-code"]
        end

        Callback["app/auth/callback<br/>intercambio de sesión"]

        subgraph Lib["lib/ — lógica de dominio"]
            Queries["queries · daily-metrics<br/>reports · financial"]
            Domain["auth · profile · access-codes<br/>calendar-summary · activity-actions"]
            SB["supabase/ (client · server · middleware · env)"]
        end

        subgraph Comp["components/"]
            UI["ui/ (Button, Input, Select…)"]
            Feat["Forms · AppShell · BottomNav<br/>StatCard · reports/ · auth/"]
        end
    end

    subgraph Supabase["🟢 Supabase (PostgreSQL)"]
        AuthDB["auth.users"]
        Tables["public.rides · public.expenses<br/>public.profiles · public.activation_codes"]
        RLS["RLS: cada usuario solo ve sus filas<br/>(auth.uid() = user_id)"]
        Fns["fn validate_activation_code()<br/>fn validate_activation_code_available()"]
    end

    User --> MW
    MW --> Auth
    MW --> Main
    Main --> Lib
    API --> Lib
    Auth --> Callback
    Callback --> SB
    Main --> Comp
    Auth --> Comp
    Lib --> SB
    SB -->|"@supabase/ssr · supabase-js"| Supabase
    Tables --- RLS
    Tables --> AuthDB
    VA --> Fns
    VB --> Fns
```

## Modelo de datos (PostgreSQL)

```mermaid
erDiagram
    "auth.users" ||--o{ rides : "user_id"
    "auth.users" ||--o{ expenses : "user_id"
    "auth.users" ||--|| profiles : "user_id (unique)"
    "auth.users" ||--o{ activation_codes : "used_by"

    rides {
        uuid id PK
        uuid user_id FK
        numeric amount
        text payment_method "cash|card|uber|bolt"
        text notes
        timestamptz created_at
    }
    expenses {
        uuid id PK
        uuid user_id FK
        text category
        numeric amount
        text notes
        timestamptz created_at
    }
    profiles {
        uuid id PK
        uuid user_id FK "unique"
        text display_name
        text language "es"
        text currency "EUR"
        text compensation_model "OWNER"
        numeric revenue_percentage
    }
    activation_codes {
        text code
        text status "unused|used"
        int used_count
        int max_uses
        text license_type
        timestamptz expires_at
    }
```

## Flujos clave

- **Autenticación**: `signup`/`login` (Supabase Auth) → `auth/callback` crea sesión →
  `middleware.ts` refresca y protege `app/(main)`. Cada usuario solo accede a sus datos vía **RLS**.
- **Registro rápido**: `rides/new` y `expenses/new` insertan filas con `user_id`; el
  **Dashboard** agrega ingresos − gastos = beneficio neto del día (`lib/queries`, `lib/daily-metrics`).
- **Informes**: `reports` calcula resúmenes operativos y financieros por rango, con exportación CSV e impresión.
- **Códigos de activación**: en el signup se valida el código con funciones `security definer`
  en Postgres (`validate_activation_code_available` no consume; `validate_activation_code` consume e incrementa uso).
