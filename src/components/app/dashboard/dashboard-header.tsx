import type { DashboardGreeting } from "@/lib/dashboard/types";

export function DashboardHeader({
  greeting,
  userName,
  subtitle,
}: {
  greeting: DashboardGreeting;
  userName: string;
  subtitle: string;
}) {
  return (
    <section className="space-y-1.5 sm:space-y-2">
      <h1 className="text-balance text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        {greeting}, {userName} 👋
      </h1>
      <p className="text-pretty text-sm text-muted-foreground sm:text-base lg:text-lg">{subtitle}</p>
    </section>
  );
}
