import "server-only";

import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenses, incomes, profiles } from "@/lib/db/schema";

/** Reutilizado no mesmo request (layout + dashboard + notificações). */
export const getCachedProfile = cache(async (userId: string) => {
  const [row] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return row ?? null;
});

export const getCachedIncomes = cache(async (userId: string) =>
  db.select().from(incomes).where(eq(incomes.userId, userId)),
);

export const getCachedExpenses = cache(async (userId: string) =>
  db.select().from(expenses).where(eq(expenses.userId, userId)),
);
