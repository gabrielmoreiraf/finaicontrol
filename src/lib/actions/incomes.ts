"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { incomes } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertCanCreateEntry } from "@/lib/plans/guard";

function parseValues(formData: FormData) {
  const type = String(formData.get("type") ?? "fixed");
  const dayRaw = formData.get("dayOfMonth");
  const endRaw = String(formData.get("endDate") ?? "").trim();
  return {
    label: String(formData.get("label") ?? "").trim(),
    amount: (Number(formData.get("amount") ?? 0) || 0).toFixed(2),
    type,
    dayOfMonth: dayRaw ? Number(dayRaw) || null : null,
    endDate: type === "temporary" ? endRaw || null : null,
  };
}

function validateValues(values: ReturnType<typeof parseValues>): string | null {
  if (!values.label) return TOAST_MESSAGES.income.validation;
  if (values.type === "temporary" && !values.endDate) {
    return "Informe a data de término para receita temporária.";
  }
  return null;
}

function revalidate() {
  revalidatePath("/receitas");
  revalidatePath("/dashboard");
}

export async function createIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const limitError = await assertCanCreateEntry(user.id, user.plan);
  if (limitError) return limitError;

  const values = parseValues(formData);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  await db.insert(incomes).values({ userId: user.id, ...values });
  revalidate();
  return actionSuccess(TOAST_MESSAGES.income.created);
}

export async function updateIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);
  const values = parseValues(formData);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  await db
    .update(incomes)
    .set(values)
    .where(and(eq(incomes.id, id), eq(incomes.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.income.updated);
}

export async function deleteIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.income.deleted);
}
