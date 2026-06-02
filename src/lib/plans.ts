import { pricingPlans } from "@/lib/landing-data";
import type { SubscriptionPlan } from "@/types/finance";

export function getPlanDetails(planId: SubscriptionPlan) {
  return pricingPlans.find((plan) => plan.id === planId) ?? pricingPlans[0];
}

export function getPlanLabel(planId: SubscriptionPlan): string {
  return getPlanDetails(planId).name;
}

export function formatPlanPrice(planId: SubscriptionPlan): string {
  const plan = getPlanDetails(planId);
  return plan.period ? `${plan.price}${plan.period}` : plan.price;
}

/** Por enquanto só o plano gratuito pode ser ativado no cadastro. */
export function isPlanCheckoutAvailable(planId: SubscriptionPlan): boolean {
  return planId === "free";
}

export function getPlanPriceParts(planId: SubscriptionPlan): {
  amount: string;
  period?: string;
} {
  const plan = getPlanDetails(planId);

  if (plan.id === "free") {
    return { amount: "Grátis" };
  }

  return {
    amount: plan.price,
    period: plan.period,
  };
}
