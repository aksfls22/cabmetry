export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-24 rounded-lg bg-surface-border/60" />
        <div className="h-4 w-40 rounded-lg bg-surface-border/40" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-surface-border bg-surface-raised"
          />
        ))}
      </div>
      <div className="h-14 rounded-2xl bg-accent/20" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border border-surface-border bg-surface-raised"
          />
        ))}
      </div>
    </div>
  );
}
