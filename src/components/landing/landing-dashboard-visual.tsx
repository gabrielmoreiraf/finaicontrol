"use client";

import { DashboardView } from "@/components/app/dashboard-view";
import { Badge } from "@/components/ui/badge";
import { landingDashboardDemo } from "@/lib/landing/landing-dashboard-demo";

/** Mesmos componentes do /dashboard, com dados de exemplo para a landing. */
export function LandingDashboardVisual() {
  return (
    <div className="landing-dashboard-preview overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_20px_60px_-24px_rgba(16,185,129,0.28)] dark:border-white/10 dark:shadow-[0_20px_60px_-24px_rgba(0,230,118,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03] sm:px-5">
        <p className="text-xs font-medium text-muted-foreground sm:text-sm">
          Interface real do FinIA Control
        </p>
        <Badge variant="outline" className="border-brand/30 bg-brand/10 text-brand hover:bg-brand/10">
          Dados de exemplo
        </Badge>
      </div>

      <div
        className="landing-dashboard-preview__body pointer-events-none select-none p-4 sm:p-6 lg:p-8"
        aria-hidden
      >
        <DashboardView data={landingDashboardDemo} planId="premium" />
      </div>
    </div>
  );
}
