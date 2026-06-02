"use client";

import { Crown, Lock, LockOpen } from "lucide-react";
import { OpenPlansButton } from "@/components/app/plans-modal";
import {
  FEATURE_LABELS,
  getRequiredPlanLabel,
  hasPlanAccess,
  type PlanFeature,
} from "@/lib/plans/features";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

type PlanGateProps = {
  feature: PlanFeature;
  planId: SubscriptionPlan;
  children: React.ReactNode;
  className?: string;
  /** Página inteira com overlay grande */
  fullPage?: boolean;
  /** Card compacto sem blur do conteúdo (ideal para widgets) */
  compact?: boolean;
};

export function PlanGate({
  feature,
  planId,
  children,
  className,
  fullPage = false,
  compact = false,
}: PlanGateProps) {
  if (hasPlanAccess(planId, feature)) {
    return <>{children}</>;
  }

  const requiredPlan = getRequiredPlanLabel(feature);
  const featureLabel = FEATURE_LABELS[feature];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 sm:px-5 dark:border-white/10 dark:bg-card/80",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10">
            <Lock className="size-4 text-amber-700 dark:text-amber-400" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{featureLabel}</p>
            <p className="truncate text-xs text-muted-foreground">Plano {requiredPlan}</p>
          </div>
        </div>
        <OpenPlansButton currentPlanId={planId} size="sm" variant="outline" className="shrink-0 rounded-xl">
          Upgrade
        </OpenPlansButton>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        fullPage ? "min-h-[min(70vh,40rem)]" : "min-h-[12rem]",
        className,
      )}
    >
      {!fullPage && (
        <div className="pointer-events-none h-[12rem] select-none overflow-hidden blur-[5px] saturate-50" aria-hidden>
          {children}
        </div>
      )}

      {fullPage && (
        <div className="pointer-events-none min-h-[min(70vh,40rem)] select-none blur-[6px] saturate-50" aria-hidden>
          {children}
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center bg-background/50 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4 text-center shadow-xl backdrop-blur-xl sm:max-w-sm sm:p-5 dark:border-white/10 dark:bg-card/95">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 sm:size-11 dark:border-amber-500/25 dark:bg-amber-500/10">
            <Lock className="size-5 text-amber-700 dark:text-amber-400" aria-hidden />
          </div>
          <h3 className="mt-3 text-base font-bold tracking-tight sm:text-lg">
            Plano {requiredPlan}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            <span className="font-medium text-foreground">{featureLabel}</span> não está incluído no
            seu plano atual.
          </p>
          <OpenPlansButton currentPlanId={planId} size="sm" className="btn-brand mt-4 w-full rounded-xl">
            <Crown className="size-4" aria-hidden />
            Fazer upgrade
          </OpenPlansButton>
        </div>
      </div>
    </div>
  );
}

export function PlanLockIcon({ className }: { className?: string }) {
  return <Lock className={cn("size-3 shrink-0 text-amber-600 dark:text-amber-400/90", className)} aria-hidden />;
}

export function PlanLimitedIcon({
  className,
  title = "Bônus limitado no plano atual",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <span title={title} className="inline-flex shrink-0">
      <LockOpen
        className={cn("size-3 shrink-0 text-emerald-600 dark:text-emerald-400/90", className)}
        aria-hidden
      />
    </span>
  );
}
