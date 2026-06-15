import { pricingPlans } from "@/lib/landing-data";
import type { SubscriptionPlan } from "@/types/finance";

export function getPlanDetails(planId: SubscriptionPlan) {
  return pricingPlans.find((plan) => plan.id === planId) ?? pricingPlans[0];
}

export function getPlanLabel(planId: SubscriptionPlan): string {
  return getPlanDetails(planId).name;
}

/** Ordem de poder dos planos (do menor para o maior). */
const PLAN_ORDER: SubscriptionPlan[] = ["free", "plus", "premium"];

export function planRank(plan: SubscriptionPlan | null): number {
  return plan ? PLAN_ORDER.indexOf(plan) : -1;
}

/** Retorna o maior entre dois planos (usado para o trial nunca rebaixar). */
export function higherPlan(
  a: SubscriptionPlan | null,
  b: SubscriptionPlan | null,
): SubscriptionPlan | null {
  return planRank(a) >= planRank(b) ? a : b;
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
