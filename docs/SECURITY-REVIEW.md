# Cabmetry — Revisión de ciberseguridad y GUI

**Fecha:** 2026-06-19
**Alcance:** revisión estática del código + pruebas dinámicas autorizadas contra el Supabase real
(`encmcsxnrmisjtcmtttq.supabase.co`) y la app en local. Contexto: colaborador del repo, app propia.
**Método:** análisis de auth/RLS/rutas API/funciones SQL + sondeos REST/RPC con la anon key +
pruebas de cabeceras, redirecciones y endpoints en la app levantada.

> Las claves usadas (anon key) son públicas por diseño; el límite real de seguridad es **RLS**,
> que está activo. No se usó la `service_role` key.

---

## Resumen de hallazgos

| # | Severidad | Hallazgo |
|---|-----------|----------|
| 1 | **Alta** | El gating de beta/activación es solo orquestación en cliente → **bypass total del registro** |
| 2 | Media | Enumeración de códigos de activación sin autenticar, sin rate-limit, con fuga de `license_type` |
| 3 | Media | `BETA_CODE` débil/adivinable (`TAXIBETA`) con ruta de *fallback* que lo acepta |
| 4 | Media | Faltan cabeceras de seguridad HTTP (CSP, X-Frame-Options, HSTS, etc.) |
| 5 | Baja-Media | Esquema incompleto: `daily_metrics` no está versionada en `supabase/*.sql` |
| 6 | Baja | `/api/daily-metrics` devuelve 500 en vez de 401 sin sesión |

---

## Detalle

### 1. [Alta] Bypass total del gating de registro
El control de "beta privada" se aplica **solo** en `components/auth/SignupForm.tsx`: llama a
`/api/validate-activation-code` (validación **no consumidora**) y, si pasa, ejecuta
`supabase.auth.signUp(...)` **directamente desde el navegador** contra Supabase Auth.

- El alta real (`/auth/v1/signup`) está abierta a `anon`; un atacante la invoca **sin código**.
  - **Probado:** se creó `emvelasq+qalighthouse@gmail.com` sin ningún código de activación.
- La función **consumidora** `validateActivationCode()` (que incrementa `used_count` y aplica
  `max_uses`) **nunca se llama en el flujo de registro** → los códigos no se consumen ni se
  vinculan a usuarios; `max_uses` no se aplica al registrarse.

**Impacto:** la "beta privada" no ofrece control de acceso real; creación ilimitada de cuentas.

**Mitigación:**
- Cerrar el registro público en Supabase y gatearlo server-side con un **Auth Hook
  "before user created"** / Edge Function que exija y **consuma atómicamente** el código; o
- Deshabilitar el signup email/password público y aprovisionar vía Admin API tras consumir el código.

### 2. [Media] Enumeración de códigos sin autenticar
`validate_activation_code_available` está concedida a `anon` y `/api/validate-activation-code`
es público.

- **Probado (anónimo):** `{"p_code":"TAXIBETA"}` → `{"valid": true, "license_type": "founder"}`.
- Sin rate-limiting → permite fuerza bruta de códigos y descubrir el *tier* de licencia.

**Mitigación:** exigir auth o CAPTCHA/rate-limit; que el *preflight* no consumidor devuelva solo
booleano (sin `license_type`).

### 3. [Media] `BETA_CODE` débil + fallback permisivo
`validateActivationCode*WithFallback` acepta `process.env.BETA_CODE` cuando la función de BD
devuelve `database_error`. Si la función falla/está mal configurada, el gate se abre a cualquiera
que conozca/adivine el código. Además `TAXIBETA` tiene baja entropía y es también un código real
(`founder`) en la BD.

**Mitigación:** *fail-closed* ante `database_error` (no abrir el fallback en producción); rotar a
un código de alta entropía; no registrarlo en logs.

### 4. [Media] Faltan cabeceras de seguridad
`next.config.mjs` no define `headers()`. **Probado:** ninguna respuesta incluye CSP,
`X-Frame-Options`/`frame-ancestors` (→ clickjacking), `Strict-Transport-Security`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy` ni `Permissions-Policy`.

**Mitigación:** añadir `headers()` en `next.config.mjs`:
```js
async headers() {
  return [{
    source: "/:path*",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
      { key: "Content-Security-Policy", value: "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data:; style-src 'self' 'unsafe-inline'" },
    ],
  }];
}
```
(Ajustar la CSP a los orígenes reales; validar que no rompa Supabase/Vercel.)

### 5. [Baja-Media] `daily_metrics` fuera de control de versiones
`lib/daily-metrics.ts` usa `public.daily_metrics`, pero la tabla **no aparece** en
`supabase/schema.sql` ni en las migraciones. **Probado:** anónimamente la tabla devuelve `[]`
→ en producción tiene RLS o sin grants a `anon` (bien), pero un despliegue limpio desde el repo
no la crearía y no hay definición de RLS versionada.

**Mitigación:** añadir la tabla `daily_metrics` + sus políticas RLS (`auth.uid() = user_id`) a
`schema.sql`.

### 6. [Baja] Código de estado incorrecto sin sesión
**Probado:** `POST /api/daily-metrics` sin sesión → **HTTP 500** (por `requireUser()` que lanza).
No se produce escritura no autenticada (correcto), pero debería responder **401**.

**Mitigación:** capturar el error de auth y devolver 401.

---

## Controles correctos (positivos)

- **RLS activa y acotada** en `rides`, `expenses`, `profiles` (`auth.uid() = user_id`).
  Probado: anónimamente todas las tablas (incl. `daily_metrics`, `activation_codes`) devuelven `[]`.
- **Escrituras seguras:** `user_id` se deriva de la sesión server-side (`requireUser()`),
  no del cliente → sin IDOR en inserciones.
- **`validate_activation_code` (consumidora):** `SECURITY DEFINER` con `FOR UPDATE`
  (anti-race) y `search_path` fijado.
- **Sin XSS almacenado:** `notes`/`category` se renderizan con auto-escape de React. El único
  `dangerouslySetInnerHTML` (`ThemeScript`) usa un string **estático** sin input de usuario.
- **Middleware** protege todas las rutas: `/`, `/activity`, `/reports`, `/rides/*`, `/expenses/*`,
  `/settings` → **307** a `/login`. Probado dinámicamente.

---

## No testeado activamente (limitaciones)

- **Aislamiento cross-user autenticado (IDOR)** sobre `rides`/`expenses` con dos sesiones reales:
  las políticas RLS son correctas en estático, pero no se ejecutó la prueba con dos usuarios
  autenticados (requería sesiones confirmadas por email).
- **Suite GUI/e2e autenticada (Playwright):** recomendada. Para automatizarla conviene desactivar
  temporalmente *Confirm email* en Supabase y usar usuarios de QA dedicados.

## Próximos pasos sugeridos
1. Cerrar el bypass de registro (#1) — prioridad.
2. Añadir cabeceras de seguridad (#4) y versionar `daily_metrics` (#5).
3. Endurecer enumeración/fallback de códigos (#2, #3).
4. Construir suite Playwright que verifique aislamiento RLS entre dos usuarios y flujos de UI.
