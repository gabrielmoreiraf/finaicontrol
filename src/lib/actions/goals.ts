"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertPlanFeatureAccess } from "@/lib/plans/guard";

function parseValues(formData: FormData) {
  const target = Number(formData.get("targetAmount") ?? 0);
  const current = Number(formData.get("currentAmount") ?? 0);
  return {
    name: String(formData.get("name") ?? "").trim().slice(0, 120),
    targetAmount: (Number.isFinite(target) && target > 0 ? target : 0).toFixed(2),
    currentAmount: (Number.isFinite(current) && current > 0 ? current : 0).toFixed(2),
  };
}

function validateValues(values: ReturnType<typeof parseValues>): string | null {
  if (!values.name) return TOAST_MESSAGES.goal.validation;
  const target = Number(values.targetAmount);
  const current = Number(values.currentAmount);
  if (target <= 0) return "Informe um valor alvo maior que zero.";
  if (target < current) {
    return "O valor alvo não pode ser menor que o valor atual.";
  }
  return null;
}

/** Garante que não exista outra meta do usuário com o mesmo nome (case-insensitive). */
async function nameIsTaken(userId: string, name: string, excludeId?: string): Promise<boolean> {
  const conditions = [
    eq(goals.userId, userId),
    sql`lower(${goals.name}) = ${name.toLowerCase()}`,
  ];
  if (excludeId) conditions.push(ne(goals.id, excludeId));
  const rows = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
}

function revalidate() {
  revalidatePath("/metas");
  revalidatePath("/dashboard");
}

export async function createGoal(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "goals");
  if (accessError) return accessError;

  const values = parseValues(formData);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  try {
    if (await nameIsTaken(user.id, values.name)) {
      return actionError("Você já tem uma meta com esse nome.");
    }
    await db.insert(goals).values({ userId: user.id, ...values });
  } catch (error) {
    console.error("[createGoal]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
  revalidate();
  return actionSuccess(TOAST_MESSAGES.goal.created);
}

export async function updateGoal(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "goals");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  const values = parseValues(formData);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  try {
    if (await nameIsTaken(user.id, values.name, id)) {
      return actionError("Você já tem uma meta com esse nome.");
    }
    await db
      .update(goals)
      .set(values)
      .where(and(eq(goals.id, id), eq(goals.userId, user.id)));
  } catch (error) {
    console.error("[updateGoal]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
  revalidate();
  return actionSuccess(TOAST_MESSAGES.goal.updated);
}

export async function deleteGoal(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "goals");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  try {
    await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
  } catch (error) {
    console.error("[deleteGoal]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
  revalidate();
  return actionSuccess(TOAST_MESSAGES.goal.deleted);
}

/** Conclui ou reabre uma meta. value = "complete" | "reopen". */
export async function toggleGoalCompletion(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "goals");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  const value = String(formData.get("value") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  try {
    const [goal] = await db
      .select({
        current: goals.currentAmount,
        target: goals.targetAmount,
      })
      .from(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, user.id)))
      .limit(1);

    if (!goal) return actionError("Meta não encontrada.");

    if (value === "complete") {
      if (Number(goal.current) < Number(goal.target)) {
        return actionError("Só é possível concluir metas que atingiram 100%.");
      }
      await db
        .update(goals)
        .set({ completed: true })
        .where(and(eq(goals.id, id), eq(goals.userId, user.id)));
      revalidate();
      return actionSuccess(TOAST_MESSAGES.goal.completed);
    }

    await db
      .update(goals)
      .set({ completed: false })
      .where(and(eq(goals.id, id), eq(goals.userId, user.id)));
    revalidate();
    return actionSuccess(TOAST_MESSAGES.goal.reopened);
  } catch (error) {
    console.error("[toggleGoalCompletion]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
}
