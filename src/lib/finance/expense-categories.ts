import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenseCategories } from "@/lib/db/schema";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Moradia",
  "Alimentação",
  "Saúde",
  "Transporte",
  "Educação",
  "Lazer",
  "Assinaturas",
  "Compras",
  "Outros",
] as const;

export const ensureDefaultExpenseCategories = cache(async function ensureDefaultExpenseCategories(
  userId: string,
) {
  const existing = await db
    .select({ name: expenseCategories.name })
    .from(expenseCategories)
    .where(eq(expenseCategories.userId, userId));

  const existingNames = new Set(existing.map((row) => row.name.toLowerCase()));
  const missing = DEFAULT_EXPENSE_CATEGORIES.filter(
    (name) => !existingNames.has(name.toLowerCase()),
  );

  if (missing.length === 0) return;

  await db.insert(expenseCategories).values(missing.map((name) => ({ userId, name })));
});

export async function ensureExpenseCategory(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const existing = await db
    .select({ id: expenseCategories.id, name: expenseCategories.name })
    .from(expenseCategories)
    .where(eq(expenseCategories.userId, userId));

  const normalized = trimmed.toLowerCase();
  if (existing.some((row) => row.name.toLowerCase() === normalized)) return;

  await db.insert(expenseCategories).values({ userId, name: trimmed });
}
