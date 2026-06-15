import type { SubscriptionPlan } from "@/types/finance";

/**
 * #10: o módulo Emprestei deixou de ser recurso de plano (com limite de 5
 * pessoas) e virou um entitlement liberado pelo admin por usuário. Uma vez
 * liberado, o cadastro é ilimitado — independentemente do plano. As funções
 * abaixo são mantidas por compatibilidade de assinatura, sempre como "ilimitado".
 */

/** Mantido por compatibilidade; o limite por plano não é mais aplicado. */
export const FREE_LOAN_BORROWER_LIMIT = 5;

export function getLoanBorrowerLimit(_plan: SubscriptionPlan): number | null {
  return null;
}

export function canCreateLoanBorrower(_plan: SubscriptionPlan, _count: number): boolean {
  return true;
}

export function getLoanBorrowerLimitMessage(
  _plan: SubscriptionPlan,
  _count: number,
): string | null {
  return null;
}

export function getLoanLimitContextMessage(_plan: SubscriptionPlan): string | null {
  return null;
}

export function getLoanLimitBadgeSublabel(_plan: SubscriptionPlan): string | null {
  return null;
}
