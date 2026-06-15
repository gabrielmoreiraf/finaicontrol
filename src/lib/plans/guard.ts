import "server-only";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getMonthlyEntryLimitMessage } from "@/lib/plans/entry-limit";
import { canCreateLoanBorrower } from "@/lib/plans/loan-limit";
import {
  FEATURE_MIN_PLAN,
  hasPlanAccess,
  type PlanFeature,
} from "@/lib/plans/features";
import { actionError, type ActionResult } from "@/lib/actions/result";
import { getPlanLabel } from "@/lib/plans";
import { db } from "@/lib/db/client";
import { loans } from "@/lib/db/schema";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import type { SubscriptionPlan } from "@/types/finance";

export async function requirePlanFeature(feature: PlanFeature): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
}> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  if (!hasPlanAccess(user.plan, feature)) {
    redirect("/configuracoes");
  }

  return { user };
}

export async function assertPlanFeatureAccess(
  plan: SubscriptionPlan,
  feature: PlanFeature,
): Promise<ActionResult | null> {
  if (hasPlanAccess(plan, feature)) return null;

  const required = getPlanLabel(FEATURE_MIN_PLAN[feature]);
  return actionError(`Este recurso requer o plano ${required} ou superior.`);
}

/**
 * Emprestei é um entitlement por usuário liberado pelo admin (#10), não um
 * recurso de plano. Sem ele, o módulo é totalmente bloqueado.
 */
export function assertLoansEnabled(loansEnabled: boolean): ActionResult | null {
  if (loansEnabled) return null;
  return actionError("O módulo Emprestei não está disponível na sua conta.");
}

export async function assertCanCreateEntry(
  userId: string,
  plan: SubscriptionPlan,
): Promise<ActionResult | null> {
  const limitMessage = await getMonthlyEntryLimitMessage(userId, plan);
  if (limitMessage) return actionError(limitMessage);
  return null;
}

export async function getLoanBorrowerCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(loans)
    .where(eq(loans.userId, userId));

  return result?.count ?? 0;
}

export async function assertCanCreateLoanBorrower(
  userId: string,
  plan: SubscriptionPlan,
): Promise<ActionResult | null> {
  const count = await getLoanBorrowerCount(userId);
  if (canCreateLoanBorrower(plan, count)) return null;

  return actionError(TOAST_MESSAGES.loan.limitReached);
}
