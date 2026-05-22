"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { es } from "@/lib/i18n/es";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (!error) {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "touch-target rounded-xl border border-surface-border px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-expense/40 hover:text-expense disabled:opacity-50",
        className
      )}
      aria-label={es.auth.signOutAria}
    >
      {loading ? "…" : es.auth.signOut}
    </button>
  );
}
