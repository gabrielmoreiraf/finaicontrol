import type { SubscriptionPlan } from "@/types/finance";
import { getPlanLabel } from "@/lib/plans";

export const FREE_MONTHLY_ENTRY_LIMIT = 5;

export type PlanFeature =
  | "dashboard_basic"
  | "incomes"
  | "expenses"
  | "goals"
  | "debts"
  | "loans"
  | "investments"
  | "reports"
  | "projections"
  | "upcoming_overview"
  | "ai_assistant"
  | "smart_alerts";

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  free: 0,
  plus: 1,
  premium: 2,
};

export const FEATURE_MIN_PLAN: Record<PlanFeature, SubscriptionPlan> = {
  dashboard_basic: "free",
  incomes: "free",
  expenses: "free",
  goals: "plus",
  debts: "plus",
  loans: "free",
  investments: "plus",
  reports: "plus",
  projections: "plus",
  upcoming_overview: "plus",
  ai_assistant: "premium",
  smart_alerts: "premium",
};

export const FEATURE_LABELS: Record<PlanFeature, string> = {
  dashboard_basic: "Dashboard básico",
  incomes: "Receitas",
  expenses: "Despesas",
  goals: "Metas",
  debts: "Dívidas",
  loans: "Emprestei",
  investments: "Investimentos",
  reports: "Relatórios",
  projections: "Projeções mensais",
  upcoming_overview: "Contas e recebimentos",
  ai_assistant: "Assistente IA",
  smart_alerts: "Alertas inteligentes",
};

export const ROUTE_FEATURE: Record<string, PlanFeature> = {
  "/dashboard": "dashboard_basic",
  "/receitas": "incomes",
  "/despesas": "expenses",
  "/metas": "goals",
  "/dividas": "debts",
  "/emprestei": "loans",
  "/investimentos": "investments",
  "/relatorios": "reports",
  "/ia": "ai_assistant",
};

export function hasPlanAccess(plan: SubscriptionPlan, feature: PlanFeature): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[FEATURE_MIN_PLAN[feature]];
}

/** Recurso acessível no plano base, mas com limite até o plano completo. */
export const FEATURE_UNLIMITED_PLAN: Partial<Record<PlanFeature, SubscriptionPlan>> = {
  loans: "premium",
};

export function isLimitedPlanFeature(plan: SubscriptionPlan, feature: PlanFeature): boolean {
  const unlimitedPlan = FEATURE_UNLIMITED_PLAN[feature];
  if (!unlimitedPlan) return false;
  if (!hasPlanAccess(plan, feature)) return false;
  return PLAN_RANK[plan] < PLAN_RANK[unlimitedPlan];
}

export function getLimitedPlanFeatureHint(feature: PlanFeature): string | null {
  if (feature === "loans") {
    return "Bônus do plano Gratuito · até 5 pessoas · Premium IA = ilimitado";
  }
  return null;
}

export function getRequiredPlan(feature: PlanFeature): SubscriptionPlan {
  return FEATURE_MIN_PLAN[feature];
}

export function getRequiredPlanLabel(feature: PlanFeature): string {
  return getPlanLabel(FEATURE_MIN_PLAN[feature]);
}

export function getFeatureForRoute(pathname: string): PlanFeature | null {
  const match = Object.entries(ROUTE_FEATURE).find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`),
  );
  return match?.[1] ?? null;
}

export function canAccessRoute(plan: SubscriptionPlan, pathname: string): boolean {
  const feature = getFeatureForRoute(pathname);
  if (!feature) return true;
  return hasPlanAccess(plan, feature);
}
