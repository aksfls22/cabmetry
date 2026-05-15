"use client";

import { useEffect, useState } from "react";
import { es } from "@/lib/i18n/es";
import {
  applyTheme,
  persistTheme,
  resolveTheme,
  type Theme,
} from "@/lib/theme";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const resolved = resolveTheme();
    setTheme(resolved);
    applyTheme(resolved);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!mounted}
      className="touch-target flex h-10 w-10 items-center justify-center rounded-xl border border-surface-border bg-surface-raised text-zinc-400 transition-colors hover:text-accent disabled:opacity-70"
      aria-label={
        mounted ? (dark ? es.theme.light : es.theme.dark) : es.theme.toggle
      }
    >
      {!mounted ? (
        <span className="h-5 w-5" aria-hidden />
      ) : dark ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
