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
import { readDayOfMonth } from "@/lib/finance/validate";

const INCOME_TYPES = ["fixed", "variable", "extra", "temporary"];

function buildValues(formData: FormData, dayOfMonth: number | null) {
  const typeRaw = String(formData.get("type") ?? "fixed");
  const type = INCOME_TYPES.includes(typeRaw) ? typeRaw : "fixed";
  const endRaw = String(formData.get("endDate") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  return {
    label: String(formData.get("label") ?? "").trim().slice(0, 120),
    amount: (Number.isFinite(amount) && amount > 0 ? amount : 0).toFixed(2),
    type,
    dayOfMonth,
    endDate: type === "temporary" ? endRaw || null : null,
  };
}

function validateValues(values: ReturnType<typeof buildValues>): string | null {
  if (!values.label) return TOAST_MESSAGES.income.validation;
  if (Number(values.amount) <= 0) return "Informe um valor maior que zero.";
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

  const dayResult = readDayOfMonth(formData.get("dayOfMonth"));
  if (dayResult.error) return actionError(dayResult.error);

  const values = buildValues(formData, dayResult.day);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  try {
    await db.insert(incomes).values({ userId: user.id, ...values });
  } catch (error) {
    console.error("[createIncome]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
  revalidate();
  return actionSuccess(TOAST_MESSAGES.income.created);
}

export async function updateIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  const dayResult = readDayOfMonth(formData.get("dayOfMonth"));
  if (dayResult.error) return actionError(dayResult.error);

  const values = buildValues(formData, dayResult.day);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  try {
    await db
      .update(incomes)
      .set(values)
      .where(and(eq(incomes.id, id), eq(incomes.userId, user.id)));
  } catch (error) {
    console.error("[updateIncome]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
  revalidate();
  return actionSuccess(TOAST_MESSAGES.income.updated);
}

export async function deleteIncome(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  try {
    await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, user.id)));
  } catch (error) {
    console.error("[deleteIncome]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }
  revalidate();
  return actionSuccess(TOAST_MESSAGES.income.deleted);
}
