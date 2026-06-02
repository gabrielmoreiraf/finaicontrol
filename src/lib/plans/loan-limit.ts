import type { SubscriptionPlan } from "@/types/finance";
import { getPlanLabel } from "@/lib/plans";

export const FREE_LOAN_BORROWER_LIMIT = 5;

export function getLoanBorrowerLimit(plan: SubscriptionPlan): number | null {
  if (plan === "premium") return null;
  return FREE_LOAN_BORROWER_LIMIT;
}

export function canCreateLoanBorrower(plan: SubscriptionPlan, count: number): boolean {
  const limit = getLoanBorrowerLimit(plan);
  if (limit === null) return true;
  return count < limit;
}

export function getLoanBorrowerLimitMessage(plan: SubscriptionPlan, count: number): string | null {
  if (canCreateLoanBorrower(plan, count)) return null;
  return `Limite de ${FREE_LOAN_BORROWER_LIMIT} pessoas no plano ${getPlanLabel(plan)} atingido. Faça upgrade para o Premium IA para cadastrar sem limite.`;
}

export function getLoanLimitContextMessage(plan: SubscriptionPlan): string | null {
  if (plan === "premium") return null;

  if (plan === "free") {
    return `Bônus do plano Gratuito: até ${FREE_LOAN_BORROWER_LIMIT} pessoas. No Premium IA, cadastro ilimitado.`;
  }

  return `Até ${FREE_LOAN_BORROWER_LIMIT} pessoas no plano ${getPlanLabel(plan)}. No Premium IA, cadastro ilimitado.`;
}

export function getLoanLimitBadgeSublabel(plan: SubscriptionPlan): string | null {
  if (plan === "premium") return null;
  return plan === "free" ? "Bônus · Gratuito" : `Limite · ${getPlanLabel(plan)}`;
}
