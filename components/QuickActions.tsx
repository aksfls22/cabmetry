"use client";

import Link from "next/link";
import { es } from "@/lib/i18n/es";

export function QuickActions() {
  return (
    <>
      {/* Floating Action Button */}
      <Link
        href="/rides/new"
        className="
          fixed bottom-24 right-5 z-50
          flex h-16 w-16 items-center justify-center
          rounded-full
          bg-yellow-400
          text-black
          shadow-2xl
          transition-all
          active:scale-95
        "
      >
        <span className="text-4xl leading-none">+</span>
      </Link>

      {/* Secondary Action */}
      <div className="mb-6">
        <Link
          href="/expenses/new"
          className="
            touch-target
            flex w-full items-center justify-center gap-2
            rounded-2xl
            border border-red-500/20
            bg-red-500/10
            px-5 py-4
            text-red-300
            transition-all
            active:scale-[0.98]
          "
        >
          <span className="text-lg leading-none">−</span>
          <span>{es.dashboard.newExpense}</span>
        </Link>
      </div>
    </>
  );
}