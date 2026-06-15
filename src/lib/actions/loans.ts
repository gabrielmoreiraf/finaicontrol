"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { loanPayments, loans } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { actionError, actionSuccess, type ActionResult } from "@/lib/actions/result";
import { TOAST_MESSAGES } from "@/lib/toast/messages";
import { assertLoansEnabled } from "@/lib/plans/guard";
import {
  buildLoanRow,
  calculateMonthlyInterest,
  validateFixedInstallmentAmount,
  type LoanPaymentMode,
  type LoanPaymentRecord,
  type LoanPaymentType,
  type LoanRecord,
  type LoanStatus,
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

  const accessError = assertLoansEnabled(user.loansEnabled);
  if (accessError) return accessError;

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

  const accessError = assertLoansEnabled(user.loansEnabled);
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

  const accessError = assertLoansEnabled(user.loansEnabled);
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

  const accessError = assertLoansEnabled(user.loansEnabled);
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

  const loanRecord: LoanRecord = {
    id: loan.id,
    borrowerName: loan.borrowerName,
    principalAmount: Number(loan.principalAmount),
    remainingPrincipal: Number(loan.remainingPrincipal),
    interestRatePercent: loan.interestRatePercent ? Number(loan.interestRatePercent) : null,
    paymentMode: loan.paymentMode as LoanPaymentMode,
    installmentAmount: loan.installmentAmount ? Number(loan.installmentAmount) : null,
    installmentCount: loan.installmentCount,
    dayOfMonth: loan.dayOfMonth,
    startDate: loan.startDate,
    expectedEndDate: loan.expectedEndDate,
    status: loan.status as LoanStatus,
    notes: loan.notes,
  };

  const payRows = await db
    .select()
    .from(loanPayments)
    .where(and(eq(loanPayments.loanId, loanId), eq(loanPayments.userId, user.id)));
  const payments: LoanPaymentRecord[] = payRows.map((p) => ({
    id: p.id,
    loanId: p.loanId,
    paidAt: p.paidAt,
    amount: Number(p.amount),
    paymentType: p.paymentType as LoanPaymentType,
    note: p.note,
  }));
  const row = buildLoanRow(loanRecord, payments);

  // F3.3: "quitação total" exige cobrir o valor devido (status coerente com o dinheiro).
  if (paymentType === "full" && row.totalDueNow > 0 && amount + 0.001 < row.totalDueNow) {
    return actionError("Para quitação total, informe ao menos o valor devido atual.");
  }

  // F3.2: em "juros + principal", só a parte que excede os juros abate o principal.
  const interestDue =
    calculateMonthlyInterest(loanRecord.remainingPrincipal, loanRecord.interestRatePercent) +
    row.lateInterest;
  const principalPaid = Math.max(0, amount - interestDue);

  // A2: registro + baixa numa única transação, decremento atômico no banco.
  try {
    await db.transaction(async (tx) => {
      await tx.insert(loanPayments).values({
        loanId,
        userId: user.id,
        paidAt,
        amount: amount.toFixed(2),
        paymentType,
        note,
      });

      if (paymentType === "full") {
        await tx
          .update(loans)
          .set({ remainingPrincipal: "0", status: "paid" })
          .where(and(eq(loans.id, loanId), eq(loans.userId, user.id)));
      } else if (paymentType === "principal" || paymentType === "both") {
        // "principal": todo o valor abate o principal. "both": só a parte sem juros.
        const reduction = paymentType === "both" ? principalPaid : amount;
        await tx
          .update(loans)
          .set({
            remainingPrincipal: sql`greatest(0, ${loans.remainingPrincipal} - ${reduction})`,
            status: sql`case when ${loans.remainingPrincipal} - ${reduction} <= 0 then 'paid' else 'active' end`,
          })
          .where(and(eq(loans.id, loanId), eq(loans.userId, user.id)));
      }
      // paymentType "interest" não altera o principal.
    });
  } catch (error) {
    console.error("[registerLoanPayment]", error);
    return actionError(TOAST_MESSAGES.generic.error);
  }

  revalidate();
  return actionSuccess(TOAST_MESSAGES.loan.paymentRegistered);
}
