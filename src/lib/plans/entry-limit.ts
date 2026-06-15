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

export const MONTHLY_LIMIT_MESSAGE = `Limite de ${FREE_MONTHLY_ENTRY_LIMIT} lançamentos mensais do plano Gratuito atingido. Faça upgrade para continuar.`;

export async function getMonthlyEntryLimitMessage(
  userId: string,
  plan: SubscriptionPlan,
): Promise<string | null> {
  if (plan !== "free") return null;

  const count = await getMonthlyEntryCount(userId);
  if (count >= FREE_MONTHLY_ENTRY_LIMIT) {
    return MONTHLY_LIMIT_MESSAGE;
  }

  return null;
}

/**
 * M2: insere um lançamento (receita/despesa) respeitando o limite mensal do
 * plano Free de forma ATÔMICA — a contagem e a inserção acontecem numa única
 * instrução SQL (`INSERT ... SELECT ... WHERE`), fechando a janela de corrida
 * (TOCTOU) onde requisições simultâneas furavam o limite.
 *
 * `columns` deve usar nomes de coluna do banco (snake_case), sem `user_id`.
 * Retorna `true` se inseriu, `false` se o limite bloqueou.
 */
export async function insertEntryWithMonthlyLimit(
  table: "incomes" | "expenses",
  userId: string,
  plan: SubscriptionPlan,
  columns: Record<string, string | number | null>,
): Promise<boolean> {
  const keys = Object.keys(columns);
  const colList = sql.join(
    keys.map((k) => sql.identifier(k)),
    sql`, `,
  );
  const valList = sql.join(
    keys.map((k) => sql`${columns[k]}`),
    sql`, `,
  );
  const tableId = sql.identifier(table);

  // Planos pagos não têm limite mensal.
  if (plan !== "free") {
    const result = await db.execute(sql`
      insert into ${tableId} (user_id, ${colList})
      select ${userId}, ${valList}
      returning id
    `);
    return resultHasRows(result);
  }

  // Free: numa ÚNICA instrução (CTE atômica) decide com base na contagem do mês +
  // créditos. Permite se (abaixo do limite grátis) OU (há crédito). Quando usa um
  // crédito (acima do limite grátis), decrementa `entry_credits`. Sem TOCTOU.
  const since = startOfMonth();
  const result = await db.execute(sql`
    with usage as (
      select
        (select count(*) from incomes  where user_id = ${userId} and created_at >= ${since})
      + (select count(*) from expenses where user_id = ${userId} and created_at >= ${since}) as used,
        (select entry_credits from users where id = ${userId}) as credits
    ),
    dec as (
      update users set entry_credits = entry_credits - 1
      where id = ${userId}
        and (select used from usage) >= ${FREE_MONTHLY_ENTRY_LIMIT}
        and (select credits from usage) > 0
      returning 1
    ),
    ins as (
      insert into ${tableId} (user_id, ${colList})
      select ${userId}, ${valList}
      where (select used from usage) < ${FREE_MONTHLY_ENTRY_LIMIT}
         or (select credits from usage) > 0
      returning id
    )
    select count(*)::int as inserted from ins
  `);

  const rows = resultRows(result);
  return Number((rows[0] as { inserted?: number } | undefined)?.inserted ?? 0) > 0;
}

function resultRows(result: unknown): unknown[] {
  const rows = (result as { rows?: unknown[] }).rows;
  return Array.isArray(rows) ? rows : Array.isArray(result) ? result : [];
}

function resultHasRows(result: unknown): boolean {
  return resultRows(result).length > 0;
}
