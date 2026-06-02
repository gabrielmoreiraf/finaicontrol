"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { getPostAuthPath, isPlanAvailable } from "@/lib/auth/post-auth-redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { TOAST_URL_KEYS } from "@/lib/toast/messages";
import type { SubscriptionPlan } from "@/types/finance";

export type PlanSelectionState = { error?: string };

export async function selectPlanAction(
  _prev: PlanSelectionState,
  formData: FormData,
): Promise<PlanSelectionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const planId = String(formData.get("planId") ?? "");

  if (!isPlanAvailable(planId)) {
    return { error: "Este plano ainda não está disponível. Escolha o plano Gratuito por enquanto." };
  }

  await db
    .update(users)
    .set({ plan: planId as SubscriptionPlan })
    .where(eq(users.id, user.id));

  const destination = getPostAuthPath({
    plan: planId as SubscriptionPlan,
    onboardingComplete: user.onboardingComplete,
  });

  redirect(`${destination}?toast=${TOAST_URL_KEYS.planSelected}`);
}
