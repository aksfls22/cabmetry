"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { es } from "@/lib/i18n/es";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Activity, 
  CarTaxiFront, 
  WalletCards 
} from "lucide-react";

const links = [
  {
    href: "/",
    label: es.nav.dashboard,
    icon: LayoutDashboard,
  },
  {
    href: "/activity",
    label: es.nav.activity,
    icon: Activity,
  },
  {
    href: "/rides/history",
    label: es.nav.rides,
    icon: CarTaxiFront,
  },
  {
    href: "/expenses/history",
    label: es.nav.expenses,
    icon: WalletCards,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-surface-raised/95 backdrop-blur-lg safe-bottom"
      aria-label={es.nav.mainAria}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "touch-target flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-colors",
                active ? "text-accent" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
