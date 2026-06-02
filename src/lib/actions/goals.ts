"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertPlanFeatureAccess } from "@/lib/plans/guard";

function parseValues(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    targetAmount: (Number(formData.get("targetAmount") ?? 0) || 0).toFixed(2),
    currentAmount: (Number(formData.get("currentAmount") ?? 0) || 0).toFixed(2),
  };
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
  if (!values.name) return actionError(TOAST_MESSAGES.goal.validation);

  await db.insert(goals).values({ userId: user.id, ...values });
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

  await db
    .update(goals)
    .set(values)
    .where(and(eq(goals.id, id), eq(goals.userId, user.id)));
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

  await db.delete(goals).where(and(eq(goals.id, id), eq(goals.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.goal.deleted);
}
