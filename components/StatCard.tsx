import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  variant?: "default" | "profit" | "expense" | "accent";
  suffix?: string;
  isCount?: boolean;
  featured?: boolean;
  size?: "small" | "default" | "large";
}

const variantStyles = {
  default: "border-surface-border bg-surface-raised/80",
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
  size = "default",
}: StatCardProps) {
  const display = isCount
    ? value.toString()
    : formatCurrency(value);

  const sizeClasses = {
    small: "p-3",
    default: "p-4",
    large: "p-6",
  };

  const labelSizeClasses = {
    small: "text-[10px]",
    default: "text-xs",
    large: "text-sm",
  };

  const valueSizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-4xl md:text-5xl",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-card transition-all",
        variantStyles[variant],
        sizeClasses[size],
        featured && "ring-1 ring-accent/25 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      )}
    >
      <p className={cn(
        "font-semibold uppercase tracking-wider text-zinc-400",
        labelSizeClasses[size]
      )}>
        {label}
      </p>
      <p className={cn(
        "mt-2 font-bold tabular-nums leading-none",
        valueStyles[variant],
        valueSizeClasses[size]
      )}>
        {display}
        {suffix && !isCount && (
          <span className="ml-1 text-sm font-normal text-zinc-500">{suffix}</span>
        )}
      </p>
    </div>
  );
}
