import type { SubscriptionPlan } from "@/types/finance";

type PostAuthUser = {
  plan: SubscriptionPlan | null;
  onboardingComplete: boolean;
};

export function getPostAuthPath(user: PostAuthUser): string {
  if (!user.plan) return "/escolher-plano";
  if (!user.onboardingComplete) return "/onboarding";
  return "/dashboard";
}

export const AVAILABLE_PLAN_IDS = ["free"] as const satisfies readonly SubscriptionPlan[];

export function isPlanAvailable(planId: string): planId is SubscriptionPlan {
  return (AVAILABLE_PLAN_IDS as readonly string[]).includes(planId);
}
