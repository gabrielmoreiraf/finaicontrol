"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { debts } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertPlanFeatureAccess } from "@/lib/plans/guard";

function parseValues(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    balance: (Number(formData.get("balance") ?? 0) || 0).toFixed(2),
    monthlyPayment: (Number(formData.get("monthlyPayment") ?? 0) || 0).toFixed(2),
  };
}

function revalidate() {
  revalidatePath("/dividas");
  revalidatePath("/dashboard");
}

export async function createDebt(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "debts");
  if (accessError) return accessError;

  const values = parseValues(formData);
  if (!values.name) return actionError(TOAST_MESSAGES.debt.validation);

  await db.insert(debts).values({ userId: user.id, ...values });
  revalidate();
  return actionSuccess(TOAST_MESSAGES.debt.created);
}

export async function updateDebt(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "debts");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);
  const values = parseValues(formData);

  await db
    .update(debts)
    .set(values)
    .where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.debt.updated);
}

export async function deleteDebt(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "debts");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.debt.deleted);
}
