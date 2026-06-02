"use client";

import { Brain, Check, CreditCard, LineChart } from "lucide-react";
import { OpenPlansButton } from "@/components/app/plans-modal";
import { PlanBadge } from "@/components/app/plan-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanDetails, getPlanLabel, getPlanPriceParts } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";

const planIcons = {
  free: CreditCard,
  plus: LineChart,
  premium: Brain,
} as const;

export function SettingsPlanCard({ planId }: { planId: SubscriptionPlan }) {
  const plan = getPlanDetails(planId);
  const PlanIcon = planIcons[planId];
  const { amount, period } = getPlanPriceParts(planId);

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-4">
        <div className="mb-2 flex size-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10">
          <PlanIcon className="size-5 text-brand" aria-hidden />
        </div>
        <CardTitle>Plano atual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-8">
          <div className="flex flex-col items-center text-center">
            <PlanBadge
              label={getPlanLabel(planId)}
              planId={planId}
              highlighted={plan.highlighted}
              size="lg"
            />
            {planId !== "free" && (
              <div className="mt-4">
                <p className="whitespace-nowrap text-2xl font-bold tracking-tight tabular-nums">
                  {amount}
                </p>
                {period && (
                  <p className="whitespace-nowrap text-xs text-muted-foreground">{period}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{plan.description}</p>

        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <OpenPlansButton
          currentPlanId={planId}
          variant="outline"
          className={cn(
            "w-full rounded-xl border-white/10 sm:w-auto",
            planId !== "free" && "border-brand/30",
          )}
        >
          Ver planos
        </OpenPlansButton>
      </CardContent>
    </Card>
  );
}
