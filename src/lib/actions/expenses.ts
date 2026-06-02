"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenses } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertCanCreateEntry } from "@/lib/plans/guard";
import { ensureExpenseCategory } from "@/lib/finance/expense-categories";

import { parseBrlInput } from "@/lib/finance/currency-input";

function parseAmount(raw: FormDataEntryValue | null): number {
  if (raw === null || raw === "") return 0;
  const asString = String(raw);
  if (asString.includes(",") || asString.includes("R$")) {
    return parseBrlInput(asString);
  }
  return Number(asString) || 0;
}

function parseValues(formData: FormData) {
  const type = String(formData.get("type") ?? "fixed");
  const dayRaw = formData.get("dayOfMonth");
  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const installmentCountRaw = formData.get("installmentCount");
  const paymentStartDate = String(formData.get("paymentStartDate") ?? "").trim();
  const amount = parseAmount(formData.get("amount"));

  let dayOfMonth: number | null = null;
  if (type === "fixed" && dayRaw) {
    dayOfMonth = Number(dayRaw) || null;
  }
  if (type === "installment" && paymentStartDate) {
    const start = new Date(`${paymentStartDate}T12:00:00`);
    if (!Number.isNaN(start.getTime())) {
      dayOfMonth = start.getDate();
    }
  }

  return {
    name: String(formData.get("name") ?? "").trim(),
    amount: amount.toFixed(2),
    category: String(formData.get("category") ?? "").trim(),
    type,
    dayOfMonth,
    expenseDate: type === "variable" ? expenseDate || null : null,
    installmentCount:
      type === "installment" && installmentCountRaw
        ? Number(installmentCountRaw) || null
        : null,
    paymentStartDate: type === "installment" ? paymentStartDate || null : null,
  };
}

function validateValues(values: ReturnType<typeof parseValues>): string | null {
  if (!values.name) return TOAST_MESSAGES.expense.validation;
  if (Number(values.amount) <= 0) return "Informe um valor maior que zero.";

  if (values.type === "variable" && !values.expenseDate) {
    return "Informe a data do gasto.";
  }

  if (values.type === "installment") {
    if (!values.installmentCount || values.installmentCount < 2) {
      return "Informe em quantas parcelas (mínimo 2).";
    }
    if (!values.paymentStartDate) {
      return "Informe quando iniciou o pagamento.";
    }
  }

  return null;
}

function revalidate() {
  revalidatePath("/despesas");
  revalidatePath("/dashboard");
}

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const limitError = await assertCanCreateEntry(user.id, user.plan);
  if (limitError) return limitError;

  const values = parseValues(formData);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  if (values.category) await ensureExpenseCategory(user.id, values.category);

  await db.insert(expenses).values({ userId: user.id, ...values });
  revalidate();
  return actionSuccess(TOAST_MESSAGES.expense.created);
}

export async function updateExpense(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  const values = parseValues(formData);
  const validationError = validateValues(values);
  if (validationError) return actionError(validationError);

  if (values.category) await ensureExpenseCategory(user.id, values.category);

  await db
    .update(expenses)
    .set(values)
    .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.expense.updated);
}

export async function deleteExpense(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.expense.deleted);
}
