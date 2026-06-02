"use client";

import { useState, type ReactNode } from "react";
import { BillingToggle } from "@/components/plans/billing-toggle";
import {
  PlanCard,
  type PlanCardDensity,
  type PlanCtaContext,
} from "@/components/plans/plan-card";
import {
  pricingPlans,
  type BillingInterval,
  type PlanId,
  type PricingPlan,
} from "@/lib/landing-data";
import { cn } from "@/lib/utils";

// Ordem padrão em todo lugar: Gratuito · Premium IA (centro/destaque) · Plus
const orderedPlans: PricingPlan[] = [
  pricingPlans[0],
  pricingPlans[2],
  pricingPlans[1],
];

interface PlanCardsProps {
  renderCta: (context: PlanCtaContext) => ReactNode;
  currentPlanId?: PlanId | null;
  density?: PlanCardDensity;
  defaultInterval?: BillingInterval;
  /** Permite envolver cada card (ex.: animação de entrada na landing). */
  cardWrapper?: (card: ReactNode, index: number) => ReactNode;
  className?: string;
}

export function PlanCards({
  renderCta,
  currentPlanId = null,
  density = "comfortable",
  defaultInterval = "annual",
  cardWrapper,
  className,
}: PlanCardsProps) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);
  const compact = density === "compact";

  return (
    <div className={cn(compact ? "space-y-4" : "space-y-6", className)}>
      <div className="flex justify-center">
        <BillingToggle value={interval} onChange={setInterval} />
      </div>

      <div
        className={cn(
          "grid items-stretch gap-4",
          compact ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 lg:grid-cols-3 lg:gap-5",
        )}
      >
        {orderedPlans.map((plan, index) => {
          const card = (
            <PlanCard
              plan={plan}
              interval={interval}
              currentPlanId={currentPlanId}
              density={density}
              renderCta={renderCta}
            />
          );

          return (
            <div
              key={plan.id}
              className={cn("h-full min-w-0", plan.highlighted && "lg:z-10")}
            >
              {cardWrapper ? cardWrapper(card, index) : card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
