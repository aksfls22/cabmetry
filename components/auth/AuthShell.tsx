import Image from "next/image";

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-8">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <Image
  src="/cabmetry-logo-horizontal.png"
  alt="Cabmetry"
  width={280}
  height={80}
  priority
  className="h-auto w-56"
/>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
        </div>
      </div>
      <div className="rounded-3xl border border-surface-border bg-surface-raised p-6 shadow-card">
        {children}
      </div>
    </div>
  );
}
