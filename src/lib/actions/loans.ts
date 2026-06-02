"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { loanPayments, loans } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertCanCreateLoanBorrower, assertPlanFeatureAccess } from "@/lib/plans/guard";
import {
  validateFixedInstallmentAmount,
  type LoanPaymentMode,
  type LoanPaymentType,
} from "@/lib/finance/loans";

const PAYMENT_MODES: LoanPaymentMode[] = ["interest_only", "fixed_installments", "single"];
const PAYMENT_TYPES: LoanPaymentType[] = ["interest", "principal", "both", "full"];

function revalidate() {
  revalidatePath("/emprestei");
  revalidatePath("/dashboard");
}

function parseLoanValues(formData: FormData) {
  const paymentMode = String(formData.get("paymentMode") ?? "interest_only") as LoanPaymentMode;
  const principal = Number(formData.get("principalAmount") ?? 0) || 0;
  const interestRaw = formData.get("interestRatePercent");
  const interestRate =
    interestRaw != null && String(interestRaw).trim() !== ""
      ? Number(interestRaw)
      : null;
  const installmentRaw = formData.get("installmentAmount");
  const installmentAmount =
    installmentRaw != null && String(installmentRaw).trim() !== ""
      ? Number(installmentRaw)
      : null;
  const countRaw = formData.get("installmentCount");
  const installmentCount =
    countRaw != null && String(countRaw).trim() !== "" ? Number(countRaw) : null;

  const dayRaw = formData.get("dayOfMonth");
  const dayParsed =
    dayRaw != null && String(dayRaw).trim() !== "" ? Number(dayRaw) : null;
  const dayOfMonth =
    dayParsed != null && !Number.isNaN(dayParsed)
      ? Math.min(31, Math.max(1, Math.trunc(dayParsed)))
      : null;
  const expectedEndDate = String(formData.get("expectedEndDate") ?? "").trim() || null;

  return {
    borrowerName: String(formData.get("borrowerName") ?? "").trim(),
    principalAmount: principal.toFixed(2),
    remainingPrincipal: principal.toFixed(2),
    interestRatePercent:
      interestRate != null && !Number.isNaN(interestRate) ? interestRate.toFixed(4) : null,
    paymentMode: PAYMENT_MODES.includes(paymentMode) ? paymentMode : "interest_only",
    installmentAmount:
      installmentAmount != null && !Number.isNaN(installmentAmount)
        ? installmentAmount.toFixed(2)
        : null,
    installmentCount:
      installmentCount != null && !Number.isNaN(installmentCount) ? installmentCount : null,
    dayOfMonth: dayOfMonth != null && !Number.isNaN(dayOfMonth) ? dayOfMonth : null,
    startDate: String(formData.get("startDate") ?? "").trim(),
    expectedEndDate,
    notes: String(formData.get("notes") ?? "").trim(),
    status: "active" as const,
  };
}

function validateLoan(values: ReturnType<typeof parseLoanValues>): string | null {
  if (!values.borrowerName) return TOAST_MESSAGES.loan.validation;
  if (Number(values.principalAmount) <= 0) return TOAST_MESSAGES.loan.validationAmount;
  if (!values.startDate) return TOAST_MESSAGES.loan.validationDate;

  if (values.paymentMode === "fixed_installments" && !values.installmentAmount) {
    return TOAST_MESSAGES.loan.validationInstallment;
  }

  if (
    values.paymentMode === "fixed_installments" &&
    (!values.installmentCount || values.installmentCount < 1)
  ) {
    return TOAST_MESSAGES.loan.validationInstallmentCount;
  }

  if (values.paymentMode === "fixed_installments") {
    const installmentError = validateFixedInstallmentAmount(
      Number(values.principalAmount),
      Number(values.installmentAmount),
      values.installmentCount ?? 0,
      values.interestRatePercent ? Number(values.interestRatePercent) : null,
    );
    if (installmentError) return installmentError;
  }

  if (values.paymentMode === "single" && !values.expectedEndDate) {
    return TOAST_MESSAGES.loan.validationDueDate;
  }

  if (
    (values.paymentMode === "interest_only" || values.paymentMode === "fixed_installments") &&
    !values.dayOfMonth
  ) {
    return TOAST_MESSAGES.loan.validationDay;
  }

  if (
    values.dayOfMonth != null &&
    (values.dayOfMonth < 1 || values.dayOfMonth > 31)
  ) {
    return TOAST_MESSAGES.loan.validationDayRange;
  }

  return null;
}

export async function createLoan(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "loans");
  if (accessError) return accessError;

  const limitError = await assertCanCreateLoanBorrower(user.id, user.plan);
  if (limitError) return limitError;

  const values = parseLoanValues(formData);
  const validationError = validateLoan(values);
  if (validationError) return actionError(validationError);

  await db.insert(loans).values({ userId: user.id, ...values });
  revalidate();
  return actionSuccess(TOAST_MESSAGES.loan.created);
}

export async function updateLoan(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "loans");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  const [existing] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.id, id), eq(loans.userId, user.id)))
    .limit(1);

  if (!existing) return actionError(TOAST_MESSAGES.generic.error);

  const values = parseLoanValues(formData);
  const validationError = validateLoan(values);
  if (validationError) return actionError(validationError);

  const newPrincipal = Number(values.principalAmount);
  const oldRemaining = Number(existing.remainingPrincipal);
  const oldPrincipal = Number(existing.principalAmount);
  const paidPrincipal = Math.max(0, oldPrincipal - oldRemaining);
  const newRemaining = Math.max(0, newPrincipal - paidPrincipal);

  await db
    .update(loans)
    .set({
      ...values,
      remainingPrincipal: newRemaining.toFixed(2),
      status: newRemaining <= 0 ? "paid" : "active",
    })
    .where(and(eq(loans.id, id), eq(loans.userId, user.id)));

  revalidate();
  return actionSuccess(TOAST_MESSAGES.loan.updated);
}

export async function deleteLoan(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "loans");
  if (accessError) return accessError;

  const id = String(formData.get("id") ?? "");
  if (!id) return actionError(TOAST_MESSAGES.generic.error);

  await db.delete(loans).where(and(eq(loans.id, id), eq(loans.userId, user.id)));
  revalidate();
  return actionSuccess(TOAST_MESSAGES.loan.deleted);
}

export async function registerLoanPayment(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.plan) redirect("/escolher-plano");

  const accessError = await assertPlanFeatureAccess(user.plan, "loans");
  if (accessError) return accessError;

  const loanId = String(formData.get("loanId") ?? "");
  const paidAt = String(formData.get("paidAt") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0) || 0;
  const paymentType = String(formData.get("paymentType") ?? "interest") as LoanPaymentType;
  const note = String(formData.get("note") ?? "").trim();

  if (!loanId || !paidAt) return actionError(TOAST_MESSAGES.loan.paymentValidation);
  if (amount <= 0) return actionError(TOAST_MESSAGES.loan.paymentAmount);
  if (!PAYMENT_TYPES.includes(paymentType)) return actionError(TOAST_MESSAGES.generic.error);

  const [loan] = await db
    .select()
    .from(loans)
    .where(and(eq(loans.id, loanId), eq(loans.userId, user.id)))
    .limit(1);

  if (!loan) return actionError(TOAST_MESSAGES.generic.error);

  let remaining = Number(loan.remainingPrincipal);

  if (paymentType === "interest") {
    // juros não reduzem principal
  } else if (paymentType === "principal" || paymentType === "both") {
    remaining = Math.max(0, remaining - amount);
  } else if (paymentType === "full") {
    remaining = 0;
  }

  await db.insert(loanPayments).values({
    loanId,
    userId: user.id,
    paidAt,
    amount: amount.toFixed(2),
    paymentType,
    note,
  });

  await db
    .update(loans)
    .set({
      remainingPrincipal: remaining.toFixed(2),
      status: remaining <= 0 ? "paid" : "active",
    })
    .where(and(eq(loans.id, loanId), eq(loans.userId, user.id)));

  revalidate();
  return actionSuccess(TOAST_MESSAGES.loan.paymentRegistered);
}
