import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenses, goals, incomes } from "@/lib/db/schema";
import {
  buildDespesaUpcoming,
  type DespesaCategory,
  type DespesaUpcoming,
} from "@/lib/finance/despesas";

const CATEGORY_COLORS = ["#00e676", "#f97316", "#8b5cf6", "#38bdf8", "#a3a3a3"];
const UPCOMING_LIMIT = 6;
const CATEGORY_LIMIT = 6;
const UPCOMING_SCAN_LIMIT = 100;

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
  categories: DespesaCategory[];
  upcoming: DespesaUpcoming[];
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

  const categoryRows = await db
    .select({
      name: sql<string>`coalesce(nullif(trim(${expenses.category}), ''), 'Sem categoria')`,
      total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(sql`coalesce(nullif(trim(${expenses.category}), ''), 'Sem categoria')`)
    .orderBy(sql`sum(${expenses.amount}) desc`)
    .limit(CATEGORY_LIMIT);

  const grand = total || 1;
  const categories: DespesaCategory[] = categoryRows.map((row, index) => {
    const amount = Number(row.total);
    return {
      name: row.name,
      amount,
      percent: Math.round((amount / grand) * 100),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? "#a3a3a3",
    };
  });

  // Próximos vencimentos: apenas despesas fixas com dia do mês (conjunto pequeno).
  const fixedRows = await db
    .select({
      id: expenses.id,
      name: expenses.name,
      amount: expenses.amount,
      category: expenses.category,
      type: expenses.type,
      dayOfMonth: expenses.dayOfMonth,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        eq(expenses.type, "fixed"),
        sql`${expenses.dayOfMonth} is not null`,
      ),
    )
    .limit(UPCOMING_SCAN_LIMIT);

  const upcoming = buildDespesaUpcoming(
    fixedRows.map((r) => ({
      id: r.id,
      name: r.name,
      amount: Number(r.amount),
      category: r.category,
      type: r.type,
      dayOfMonth: r.dayOfMonth,
    })),
  ).slice(0, UPCOMING_LIMIT);

  return { total, byType, totalCount, categories, upcoming };
}

export type GoalSummary = {
  totalCount: number;
  activeCount: number;
  completedCount: number;
  totalCurrent: number;
  totalTarget: number;
};

export async function getGoalSummary(userId: string): Promise<GoalSummary> {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${goals.completed})::int`,
      current: sql<string>`coalesce(sum(${goals.currentAmount}), 0)`,
      target: sql<string>`coalesce(sum(${goals.targetAmount}), 0)`,
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
  };
}
