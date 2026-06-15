import "server-only";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenses, goals, incomes } from "@/lib/db/schema";

type TypeBucket = { total: number; count: number };

function emptyBucket(): TypeBucket {
  return { total: 0, count: 0 };
}

export type IncomeSummary = {
  total: number;
  byType: Record<string, TypeBucket>;
  totalCount: number;
};

export async function getIncomeSummary(
  userId: string,
  fixedIncome: number,
): Promise<IncomeSummary> {
  const grouped = await db
    .select({
      type: incomes.type,
      total: sql<string>`coalesce(sum(${incomes.amount}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(incomes)
    .where(eq(incomes.userId, userId))
    .groupBy(incomes.type);

  const byType: Record<string, TypeBucket> = {
    fixed: emptyBucket(),
    variable: emptyBucket(),
    extra: emptyBucket(),
    temporary: emptyBucket(),
  };

  let total = fixedIncome;
  let totalCount = 0;
  for (const row of grouped) {
    const bucket = { total: Number(row.total), count: Number(row.count) };
    byType[row.type] = bucket;
    total += bucket.total;
    totalCount += bucket.count;
  }

  return { total, byType, totalCount };
}

export type ExpenseSummary = {
  total: number;
  byType: Record<string, TypeBucket>;
  totalCount: number;
};

export async function getExpenseSummary(userId: string): Promise<ExpenseSummary> {
  const grouped = await db
    .select({
      type: expenses.type,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(expenses.type);

  const byType: Record<string, TypeBucket> = {
    fixed: emptyBucket(),
    variable: emptyBucket(),
    installment: emptyBucket(),
  };

  let total = 0;
  let totalCount = 0;
  for (const row of grouped) {
    const bucket = { total: Number(row.total), count: Number(row.count) };
    byType[row.type] = bucket;
    total += bucket.total;
    totalCount += bucket.count;
  }

  return { total, byType, totalCount };
}

export type GoalSummary = {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  totalCurrent: number;
  totalTarget: number;
  /** Soma das reservas mensais das metas ainda não concluídas. */
  totalContribution: number;
};

export async function getGoalSummary(userId: string): Promise<GoalSummary> {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${goals.completed})::int`,
      current: sql<string>`coalesce(sum(${goals.currentAmount}), 0)`,
      target: sql<string>`coalesce(sum(${goals.targetAmount}), 0)`,
      contribution: sql<string>`coalesce(sum(${goals.monthlyContribution}) filter (where not ${goals.completed}), 0)`,
    })
    .from(goals)
    .where(eq(goals.userId, userId));

  const totalCount = Number(row?.count ?? 0);
  const completedCount = Number(row?.completed ?? 0);

  return {
    totalCount,
    activeCount: totalCount - completedCount,
    completedCount,
    totalCurrent: Number(row?.current ?? 0),
    totalTarget: Number(row?.target ?? 0),
    totalContribution: Number(row?.contribution ?? 0),
  };
}
