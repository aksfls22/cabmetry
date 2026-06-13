# Cabmetry Domain Map

## Authentication

### Entry Points

* app/(auth)/login/page.tsx
* app/(auth)/signup/page.tsx
* app/(auth)/forgot-password/page.tsx
* app/(auth)/reset-password/page.tsx

### Core Logic

* lib/auth.ts
* lib/supabase/*

### Risk Level

HIGH

### Notes

Authentication source of truth: Supabase Auth

---

## Activation

### Entry Points

* app/api/validate-activation-code/route.ts

### Core Logic

* lib/access-codes.ts

### Risk Level

HIGH

### Notes

Activation architecture is transitional.
Favor consolidation around activation_codes.

---

## Dashboard

### Entry Points

* app/(main)/page.tsx

### Core Logic

* lib/financial.ts
* lib/queries.ts

### Risk Level

CRITICAL

### Notes

Financial summaries displayed to users.

---

## Activity

### Entry Points

* app/(main)/activity/page.tsx

### Core Logic

* lib/calendar-summary.ts
* lib/activity-actions.ts

### Components

* components/OperationalCalendar.tsx

### Risk Level

HIGH

### Notes

Contains settlement workflow and daily metrics.

---

## Reports

### Entry Points

* app/(main)/reports/page.tsx
* app/(main)/reports/print/page.tsx

### Core Logic

* lib/reports.ts
* lib/export-csv.ts

### Components

* components/reports/*

### Risk Level

CRITICAL

### Notes

Reporting and operational summaries.

---

## Rides

### Entry Points

* app/(main)/rides/new/page.tsx
* app/(main)/rides/history/page.tsx

### Core Logic

* lib/queries.ts

### Risk Level

CRITICAL

### Notes

Financial source domain.

---

## Expenses

### Entry Points

* app/(main)/expenses/new/page.tsx
* app/(main)/expenses/history/page.tsx

### Core Logic

* lib/queries.ts

### Risk Level

HIGH

### Notes

Operational expense tracking.

---

## Settings

### Entry Points

* app/(main)/settings/page.tsx

### Core Logic

* lib/profile.ts

### Risk Level

MEDIUM

---

## Database

### Schema

* supabase/schema.sql

### Migrations

* supabase/migration-auth.sql
* supabase/migration-activation-codes.sql

### Risk Level

CRITICAL

### Notes

Use additive migrations only.

---

## Financial Domains

### Critical Files

* lib/financial.ts
* lib/reports.ts
* lib/calendar-summary.ts

### Protection Rules

* No destructive migrations
* Preserve historical consistency
* Preserve settlement correctness
* Preserve reporting correctness

---

## Security Domains

### Critical Files

* lib/auth.ts
* lib/supabase/*
* middleware.ts

### Protection Rules

* RLS mandatory
* auth.uid() = user_id
* Prevent tenant isolation failures
