import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  variant?: "default" | "profit" | "expense" | "accent";
  suffix?: string;
  isCount?: boolean;
  featured?: boolean;
}

const variantStyles = {
  default: "border-surface-border bg-surface-raised",
  profit: "border-profit/30 bg-profit/10",
  expense: "border-expense/30 bg-expense/10",
  accent: "border-accent/40 bg-accent/10",
};

const valueStyles = {
  default: "text-white",
  profit: "text-profit",
  expense: "text-expense",
  accent: "text-accent",
};

export function StatCard({
  label,
  value,
  variant = "default",
  suffix,
  isCount = false,
  featured = false,
}: StatCardProps) {
  const display = isCount
    ? value.toString()
    : formatCurrency(value);

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-card",
        variantStyles[variant],
        featured && "ring-1 ring-accent/25"
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", valueStyles[variant])}>
        {display}
        {suffix && !isCount && (
          <span className="ml-1 text-sm font-normal text-zinc-500">{suffix}</span>
        )}
      </p>
    </div>
  );
}
