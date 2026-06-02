import "server-only";

import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenses, incomes } from "@/lib/db/schema";
import { FREE_MONTHLY_ENTRY_LIMIT } from "@/lib/plans/features";
import type { SubscriptionPlan } from "@/types/finance";

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getMonthlyEntryCount(userId: string): Promise<number> {
  const since = startOfMonth();

  const [incomeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(incomes)
    .where(and(eq(incomes.userId, userId), gte(incomes.createdAt, since)));

  const [expenseCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(expenses)
    .where(and(eq(expenses.userId, userId), gte(expenses.createdAt, since)));

  return (incomeCount?.count ?? 0) + (expenseCount?.count ?? 0);
}

export async function getMonthlyEntryLimitMessage(
  userId: string,
  plan: SubscriptionPlan,
): Promise<string | null> {
  if (plan !== "free") return null;

  const count = await getMonthlyEntryCount(userId);
  if (count >= FREE_MONTHLY_ENTRY_LIMIT) {
    return `Limite de ${FREE_MONTHLY_ENTRY_LIMIT} lançamentos mensais do plano Gratuito atingido. Faça upgrade para continuar.`;
  }

  return null;
}
