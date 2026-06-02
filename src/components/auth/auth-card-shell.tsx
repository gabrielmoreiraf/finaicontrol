"use client";

export function AuthCardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-card-solid relative w-full overflow-hidden rounded-2xl p-5 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="text-sm text-white/60">{subtitle}</p>
      </div>

      <div className="mt-5">{children}</div>
    </div>
  );
}
