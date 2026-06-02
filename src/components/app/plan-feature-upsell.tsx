"use client";

import { Crown, Lock } from "lucide-react";
import { OpenPlansButton } from "@/components/app/plans-modal";
import { PremiumCard } from "@/components/app/premium/premium-card";
import {
  FEATURE_LABELS,
  getRequiredPlan,
  getRequiredPlanLabel,
  type PlanFeature,
} from "@/lib/plans/features";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

const PLAN_ACCENT: Record<SubscriptionPlan, string> = {
  free: "border-zinc-200 bg-zinc-50 dark:border-zinc-500/20 dark:bg-zinc-500/10",
  plus: "border-sky-200 bg-sky-50 dark:border-sky-500/25 dark:bg-sky-500/10",
  premium: "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10",
};

const PLAN_SUBTITLE: Record<SubscriptionPlan, string> = {
  free: "text-muted-foreground",
  plus: "text-sky-800/75 dark:text-muted-foreground",
  premium: "text-amber-900/75 dark:text-muted-foreground",
};

export function PlanFeatureUpsell({
  features,
  className,
  planId = "free",
}: {
  features: PlanFeature[];
  className?: string;
  planId?: SubscriptionPlan;
}) {
  if (features.length === 0) return null;

  const unique = [...new Set(features)];

  return (
    <PremiumCard className={cn("overflow-hidden", className)}>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
              <h2 className="text-base font-semibold sm:text-lg">Recursos disponíveis nos planos pagos</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Faça upgrade para desbloquear ferramentas avançadas do FinIA.
            </p>
          </div>
          <OpenPlansButton currentPlanId={planId} size="sm" className="btn-brand shrink-0 rounded-xl">
            <Crown className="size-4" aria-hidden />
            Ver planos
          </OpenPlansButton>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {unique.map((feature) => {
            const plan = getRequiredPlan(feature);
            return (
              <li
                key={feature}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  PLAN_ACCENT[plan],
                )}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5 dark:bg-black/20">
                  <Lock className="size-3.5 text-amber-700 dark:text-amber-400" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {FEATURE_LABELS[feature]}
                  </p>
                  <p className={cn("text-xs", PLAN_SUBTITLE[plan])}>
                    Plano {getRequiredPlanLabel(feature)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </PremiumCard>
  );
}
