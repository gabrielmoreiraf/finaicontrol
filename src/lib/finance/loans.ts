export type LoanPaymentMode = "interest_only" | "fixed_installments" | "single";
export type LoanStatus = "active" | "paid" | "overdue" | "cancelled";
export type LoanPaymentType = "interest" | "principal" | "both" | "full";

export const LOAN_PAYMENT_MODE_LABELS: Record<LoanPaymentMode, string> = {
  interest_only: "Só juros mensal",
  fixed_installments: "Parcelas fixas",
  single: "Pagamento único",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  active: "Ativo",
  paid: "Quitado",
  overdue: "Em atraso",
  cancelled: "Cancelado",
};

export const LOAN_PAYMENT_TYPE_LABELS: Record<LoanPaymentType, string> = {
  interest: "Juros",
  principal: "Principal",
  both: "Juros + principal",
  full: "Quitação total",
};

export type LoanRecord = {
  id: string;
  borrowerName: string;
  principalAmount: number;
  remainingPrincipal: number;
  interestRatePercent: number | null;
  paymentMode: LoanPaymentMode;
  installmentAmount: number | null;
  installmentCount: number | null;
  dayOfMonth: number | null;
  startDate: string;
  expectedEndDate: string | null;
  status: LoanStatus;
  notes: string;
};

export type LoanPaymentRecord = {
  id: string;
  loanId: string;
  paidAt: string;
  amount: number;
  paymentType: LoanPaymentType;
  note: string;
};

export type LoanRow = LoanRecord & {
  monthlyDue: number;
  lateInterest: number;
  overdueDays: number;
  totalDueNow: number;
  nextDueLabel: string | null;
  isOverdue: boolean;
  totalReceived: number;
  payments: LoanPaymentRecord[];
};

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const br = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const date = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDateBr(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function hasPaymentInMonth(payments: LoanPaymentRecord[], month: Date): boolean {
  const key = monthKey(month);
  return payments.some((payment) => {
    const paid = parseDate(payment.paidAt);
    return paid ? monthKey(paid) === key : false;
  });
}

function daysOverdue(from: Date, to: Date): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function dueDateInMonth(year: number, month: number, dayOfMonth: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(dayOfMonth, lastDay));
}

function getDueDatesUntil(loan: LoanRecord, until: Date): Date[] {
  const dates: Date[] = [];
  const start = parseDate(loan.startDate);
  if (!start) return dates;

  const end = new Date(until.getFullYear(), until.getMonth(), until.getDate());

  if (loan.paymentMode === "single") {
    const due = loan.expectedEndDate ? parseDate(loan.expectedEndDate) : null;
    if (due && due <= end) dates.push(due);
    return dates;
  }

  if (!loan.dayOfMonth) return dates;

  let year = start.getFullYear();
  let month = start.getMonth();

  for (let i = 0; i < 120; i++) {
    const due = dueDateInMonth(year, month, loan.dayOfMonth);
    if (due >= start && due <= end) {
      dates.push(due);
    }
    if (due > end) break;
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return dates;
}

export function getFirstUnpaidDueDate(
  loan: LoanRecord,
  payments: LoanPaymentRecord[],
  now = new Date(),
): Date | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dues = getDueDatesUntil(loan, today);

  for (const due of dues) {
    if (due <= today && !hasPaymentInMonth(payments, due)) {
      return due;
    }
  }

  return null;
}

export function calculateLateInterest(
  loan: LoanRecord,
  payments: LoanPaymentRecord[],
  now = new Date(),
): number {
  if (!loan.interestRatePercent || loan.interestRatePercent <= 0) return 0;
  if (loan.remainingPrincipal <= 0) return 0;
  if (loan.status === "paid" || loan.status === "cancelled") return 0;

  const firstUnpaid = getFirstUnpaidDueDate(loan, payments, now);
  if (!firstUnpaid) return 0;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = daysOverdue(firstUnpaid, today);
  if (days <= 0) return 0;

  const monthly = calculateMonthlyInterest(loan.remainingPrincipal, loan.interestRatePercent);
  return Math.round(monthly * (days / 30) * 100) / 100;
}

export function calculateTotalDueNow(
  loan: LoanRecord,
  payments: LoanPaymentRecord[],
  monthlyDue: number,
  lateInterest: number,
): number {
  if (loan.remainingPrincipal <= 0) return 0;

  if (loan.paymentMode === "single") {
    const periodInterest = calculateSinglePeriodInterest(loan);
    return Math.round((loan.remainingPrincipal + periodInterest + lateInterest) * 100) / 100;
  }

  return Math.round((monthlyDue + lateInterest) * 100) / 100;
}

export function calculateMonthlyInterest(
  remainingPrincipal: number,
  interestRatePercent: number | null,
): number {
  if (!interestRatePercent || interestRatePercent <= 0) return 0;
  return Math.round(remainingPrincipal * (interestRatePercent / 100) * 100) / 100;
}

/** Meses decorridos entre duas datas, com fração proporcional aos dias. */
function elapsedMonths(start: Date, end: Date): number {
  if (end <= start) return 0;
  let whole =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  let anchor = new Date(start.getFullYear(), start.getMonth() + whole, start.getDate());
  if (anchor > end) {
    whole -= 1;
    anchor = new Date(start.getFullYear(), start.getMonth() + whole, start.getDate());
  }
  const nextAnchor = new Date(start.getFullYear(), start.getMonth() + whole + 1, start.getDate());
  const frac = (end.getTime() - anchor.getTime()) / (nextAnchor.getTime() - anchor.getTime());
  return Math.max(0, whole + frac);
}

function formatMonthsLabel(months: number): string {
  const rounded = Math.round(months * 10) / 10;
  const num = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
  return `${num} ${Math.abs(rounded - 1) < 0.05 ? "mês" : "meses"}`;
}

/**
 * Juros do "Pagamento único": taxa mensal sobre o principal × meses até a quitação.
 * O empréstimo é pago de uma vez na data prevista, somando principal + juros do período.
 */
export function calculateSinglePeriodInterest(
  loan: Pick<
    LoanRecord,
    "paymentMode" | "principalAmount" | "interestRatePercent" | "startDate" | "expectedEndDate"
  >,
): number {
  if (loan.paymentMode !== "single") return 0;
  const monthly = calculateMonthlyInterest(loan.principalAmount, loan.interestRatePercent);
  if (monthly <= 0) return 0;
  const start = parseDate(loan.startDate);
  const end = loan.expectedEndDate ? parseDate(loan.expectedEndDate) : null;
  if (!start || !end || end < start) return 0;
  return Math.round(monthly * elapsedMonths(start, end) * 100) / 100;
}

export function calculateMonthlyDue(loan: LoanRecord): number {
  if (loan.status === "paid" || loan.status === "cancelled") return 0;
  if (loan.remainingPrincipal <= 0) return 0;

  switch (loan.paymentMode) {
    case "interest_only":
      return calculateMonthlyInterest(loan.remainingPrincipal, loan.interestRatePercent);
    case "fixed_installments":
      return loan.installmentAmount ?? 0;
    case "single":
      return Math.round((loan.remainingPrincipal + calculateSinglePeriodInterest(loan)) * 100) / 100;
    default:
      return 0;
  }
}

export function getNextDueDate(
  loan: LoanRecord,
  payments: LoanPaymentRecord[] = [],
  now = new Date(),
): Date | null {
  if (loan.status === "paid" || loan.status === "cancelled") return null;
  if (loan.remainingPrincipal <= 0) return null;

  if (loan.paymentMode === "single") {
    return loan.expectedEndDate ? parseDate(loan.expectedEndDate) : null;
  }

  if (!loan.dayOfMonth) return null;

  const start = parseDate(loan.startDate);
  if (!start) return null;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const horizon = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

  let year = start.getFullYear();
  let month = start.getMonth();

  for (let i = 0; i < 120; i++) {
    const due = dueDateInMonth(year, month, loan.dayOfMonth);
    if (due >= start && due <= horizon && !hasPaymentInMonth(payments, due)) {
      return due;
    }
    if (due > horizon) break;
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return null;
}

export function isLoanOverdue(
  loan: LoanRecord,
  payments: LoanPaymentRecord[],
  now = new Date(),
): boolean {
  if (loan.status === "paid" || loan.status === "cancelled") return false;
  if (loan.remainingPrincipal <= 0) return false;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (loan.paymentMode === "single") {
    if (!loan.expectedEndDate) return false;
    const due = parseDate(loan.expectedEndDate);
    if (!due) return false;
    return today > due;
  }

  if (!loan.dayOfMonth) return false;

  const dueThisMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    Math.min(loan.dayOfMonth, new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()),
  );

  if (today <= dueThisMonth) return false;
  return !hasPaymentInMonth(payments, today);
}

export function resolveLoanStatus(
  loan: LoanRecord,
  payments: LoanPaymentRecord[],
  now = new Date(),
): LoanStatus {
  if (loan.status === "cancelled") return "cancelled";
  if (loan.remainingPrincipal <= 0) return "paid";
  if (isLoanOverdue(loan, payments, now)) return "overdue";
  return "active";
}

/** Juros acumulados em parcelas fixas (taxa mensal sobre saldo devedor, amortização igual do principal). */
export function calculateFixedInstallmentTotalInterest(
  principalAmount: number,
  interestRatePercent: number | null,
  installmentCount: number,
): number {
  if (
    principalAmount <= 0 ||
    installmentCount <= 0 ||
    !interestRatePercent ||
    interestRatePercent <= 0
  ) {
    return 0;
  }

  let remaining = principalAmount;
  let totalInterest = 0;
  const principalPerInstallment = principalAmount / installmentCount;

  for (let i = 0; i < installmentCount; i++) {
    totalInterest += calculateMonthlyInterest(remaining, interestRatePercent);
    remaining = Math.max(0, remaining - principalPerInstallment);
  }

  return Math.round(totalInterest * 100) / 100;
}

export function calculateFixedInstallmentTotalDue(
  principalAmount: number,
  interestRatePercent: number | null,
  installmentCount: number,
): number {
  const interest = calculateFixedInstallmentTotalInterest(
    principalAmount,
    interestRatePercent,
    installmentCount,
  );
  return Math.round((principalAmount + interest) * 100) / 100;
}

/** Menor parcela (centavos arredondados para cima) que cobre principal + juros do período. */
export function calculateMinimumInstallmentAmount(
  principalAmount: number,
  installmentCount: number,
  interestRatePercent: number | null = null,
): number {
  if (principalAmount <= 0 || installmentCount <= 0) return 0;
  const totalDue = calculateFixedInstallmentTotalDue(
    principalAmount,
    interestRatePercent,
    installmentCount,
  );
  return Math.ceil((totalDue * 100) / installmentCount) / 100;
}

export function isFixedInstallmentAmountSufficient(
  principalAmount: number,
  installmentAmount: number,
  installmentCount: number,
  interestRatePercent: number | null = null,
): boolean {
  if (principalAmount <= 0 || installmentAmount <= 0 || installmentCount <= 0) return false;
  const min = calculateMinimumInstallmentAmount(
    principalAmount,
    installmentCount,
    interestRatePercent,
  );
  return installmentAmount + 0.001 >= min;
}

export function validateFixedInstallmentAmount(
  principalAmount: number,
  installmentAmount: number,
  installmentCount: number,
  interestRatePercent: number | null = null,
): string | null {
  if (installmentCount <= 0 || installmentAmount <= 0 || principalAmount <= 0) return null;

  const min = calculateMinimumInstallmentAmount(
    principalAmount,
    installmentCount,
    interestRatePercent,
  );
  if (installmentAmount + 0.001 >= min) return null;

  const brl = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const totalInterest = calculateFixedInstallmentTotalInterest(
    principalAmount,
    interestRatePercent,
    installmentCount,
  );

  if (totalInterest > 0) {
    return `O valor da parcela deve ser no mínimo ${brl(min)} para cobrir ${brl(principalAmount)} emprestados + ${brl(totalInterest)} de juros estimados.`;
  }

  return `O valor da parcela deve ser no mínimo ${brl(min)} para cobrir os ${brl(principalAmount)} emprestados em ${installmentCount} parcela(s).`;
}

export type FixedInstallmentSummary = {
  installmentCount: number;
  installmentAmount: number;
  totalToPay: number;
  principalAmount: number;
  profit: number;
  minimumInstallment: number;
  isBelowMinimum: boolean;
};

export type LoanPaymentSummary = {
  totalToPay: number | null;
  principalAmount: number;
  profit: number;
  subtitle: string;
  details: string[];
  isWarning?: boolean;
  incompleteMessage?: string;
};

function countMonthsInclusive(start: Date, end: Date): number {
  if (end < start) return 0;

  let count = 0;
  let year = start.getFullYear();
  let month = start.getMonth();
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();

  while (year < endYear || (year === endYear && month <= endMonth)) {
    count++;
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return count;
}

function formatDateBrFromIso(value: string): string | null {
  const date = parseDate(value);
  return date ? formatDateBr(date) : null;
}

export function buildLoanPaymentSummary(
  paymentMode: LoanPaymentMode,
  principalAmount: number,
  interestRatePercent: number | null,
  options: {
    installmentAmount?: number | null;
    installmentCount?: number | null;
    startDate?: string | null;
    expectedEndDate?: string | null;
  } = {},
): LoanPaymentSummary | null {
  if (principalAmount <= 0) return null;

  const brl = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  switch (paymentMode) {
    case "fixed_installments": {
      const installmentAmount = options.installmentAmount ?? 0;
      const installmentCount = options.installmentCount ?? 0;

      if (installmentAmount <= 0 && installmentCount <= 0) {
        return {
          totalToPay: null,
          principalAmount,
          profit: 0,
          subtitle: "",
          details: [],
          incompleteMessage: "Informe o valor e o número de parcelas para ver o total a pagar.",
        };
      }

      if (installmentAmount <= 0) {
        return {
          totalToPay: null,
          principalAmount,
          profit: 0,
          subtitle: "",
          details: [],
          incompleteMessage: "Informe o valor da parcela para ver o total a pagar.",
        };
      }

      if (installmentCount <= 0) {
        return {
          totalToPay: null,
          principalAmount,
          profit: 0,
          subtitle: "",
          details: [],
          incompleteMessage: "Informe o número de parcelas para ver o total a pagar.",
        };
      }

      const fixed = buildFixedInstallmentSummary(
        principalAmount,
        installmentAmount,
        installmentCount,
        interestRatePercent,
      );
      if (!fixed) return null;

      const details = [`Pegou emprestado ${brl(principalAmount)}`];
      if (fixed.profit > 0.01) details.push(`Juros/lucro ${brl(fixed.profit)}`);
      if (fixed.profit < -0.01) {
        details.push(`Faltam ${brl(Math.abs(fixed.profit))} para cobrir o emprestado`);
      }

      return {
        totalToPay: fixed.totalToPay,
        principalAmount,
        profit: fixed.profit,
        subtitle: `${fixed.installmentCount} parcela${fixed.installmentCount === 1 ? "" : "s"} de ${brl(fixed.installmentAmount)}`,
        details,
        isWarning: fixed.isBelowMinimum,
      };
    }
    case "single": {
      const monthly = calculateMonthlyInterest(principalAmount, interestRatePercent);
      const start = options.startDate ? parseDate(options.startDate) : null;
      const end = options.expectedEndDate ? parseDate(options.expectedEndDate) : null;
      const endLabel = end ? formatDateBr(end) : null;

      if (monthly > 0 && start && end && end >= start) {
        const months = elapsedMonths(start, end);
        const totalInterest = Math.round(monthly * months * 100) / 100;
        const totalToPay = Math.round((principalAmount + totalInterest) * 100) / 100;

        return {
          totalToPay,
          principalAmount,
          profit: totalInterest,
          subtitle: `Pagamento único em ${endLabel} · ${formatMonthsLabel(months)} de juros`,
          details: [
            `Pegou emprestado ${brl(principalAmount)}`,
            `Juros no período: ${brl(totalInterest)}`,
          ],
        };
      }

      if (monthly > 0) {
        return {
          totalToPay: principalAmount,
          principalAmount,
          profit: 0,
          subtitle: "Pagamento único",
          details: [
            `Pegou emprestado ${brl(principalAmount)}`,
            "Informe a data prevista de quitação para calcular o total com juros",
          ],
        };
      }

      const details = [`Pegou emprestado ${brl(principalAmount)}`];
      if (endLabel) details.push(`Quitação em ${endLabel}`);
      return {
        totalToPay: principalAmount,
        principalAmount,
        profit: 0,
        subtitle: endLabel ? `Pagamento único em ${endLabel}` : "Pagamento único",
        details,
      };
    }
    case "interest_only": {
      const monthly = calculateMonthlyInterest(principalAmount, interestRatePercent);
      const start = options.startDate ? parseDate(options.startDate) : null;
      const end = options.expectedEndDate ? parseDate(options.expectedEndDate) : null;

      if (start && end && end >= start && monthly > 0) {
        const months = countMonthsInclusive(start, end);
        const totalInterest = Math.round(monthly * months * 100) / 100;
        const totalToPay = Math.round((principalAmount + totalInterest) * 100) / 100;
        const endLabel = formatDateBr(end);

        return {
          totalToPay,
          principalAmount,
          profit: totalInterest,
          subtitle: `${months} ${months === 1 ? "mês" : "meses"} de juros de ${brl(monthly)} + quitação em ${endLabel}`,
          details: [
            `Pegou emprestado ${brl(principalAmount)}`,
            `Juros no período: ${brl(totalInterest)}`,
          ],
        };
      }

      if (monthly > 0) {
        return {
          totalToPay: principalAmount,
          principalAmount,
          profit: 0,
          subtitle: `Juros mensal de ${brl(monthly)}`,
          details: [
            `Pegou emprestado ${brl(principalAmount)}`,
            `Informe a previsão de quitação para calcular o total com juros`,
            `${brl(monthly)}/mês enquanto o empréstimo estiver em aberto`,
          ],
        };
      }

      return {
        totalToPay: principalAmount,
        principalAmount,
        profit: 0,
        subtitle: "Devolução do valor emprestado",
        details: [`Pegou emprestado ${brl(principalAmount)}`],
      };
    }
    default:
      return null;
  }
}

export function buildFixedInstallmentSummary(
  principalAmount: number,
  installmentAmount: number,
  installmentCount: number,
  interestRatePercent: number | null = null,
): FixedInstallmentSummary | null {
  if (installmentAmount <= 0 || installmentCount <= 0) return null;

  const totalToPay = Math.round(installmentCount * installmentAmount * 100) / 100;
  const minimumInstallment = calculateMinimumInstallmentAmount(
    principalAmount,
    installmentCount,
    interestRatePercent,
  );

  return {
    installmentCount,
    installmentAmount,
    totalToPay,
    principalAmount,
    profit: Math.round((totalToPay - principalAmount) * 100) / 100,
    minimumInstallment,
    isBelowMinimum: installmentAmount + 0.001 < minimumInstallment,
  };
}

export function buildLoanPreview(
  paymentMode: LoanPaymentMode,
  principalAmount: number,
  interestRatePercent: number | null,
  installmentAmount: number | null,
  installmentCount: number | null = null,
): string {
  const brl = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  switch (paymentMode) {
    case "interest_only": {
      const interest = calculateMonthlyInterest(principalAmount, interestRatePercent);
      if (interest > 0) {
        return `Juros mensal: R$ ${brl(interest)} · Principal: R$ ${brl(principalAmount)}`;
      }
      return `Principal: R$ ${brl(principalAmount)} (sem juros cadastrados)`;
    }
    case "fixed_installments": {
      const installment = installmentAmount ?? 0;
      if (installment <= 0) return "Informe o valor da parcela";

      if (!installmentCount || installmentCount <= 0) {
        return `Parcela de R$ ${brl(installment)}. Informe o número de parcelas para ver o total`;
      }

      const count = installmentCount;
      const totalToPay = Math.round(count * installment * 100) / 100;
      const minInstallment = calculateMinimumInstallmentAmount(
        principalAmount,
        count,
        interestRatePercent,
      );
      const profit = Math.round((totalToPay - principalAmount) * 100) / 100;

      let line = `${count} parcela(s) de R$ ${brl(installment)} · Total a pagar: R$ ${brl(totalToPay)}`;

      if (principalAmount > 0) {
        line += ` · Emprestado: R$ ${brl(principalAmount)}`;
        if (profit > 0.01) {
          line += ` · Juros/lucro: R$ ${brl(profit)}`;
        } else if (profit < -0.01) {
          line += ` · Faltam R$ ${brl(Math.abs(profit))} para cobrir o emprestado`;
        }
      }

      if (principalAmount > 0 && installment + 0.001 < minInstallment) {
        line += ` · Parcela mínima: R$ ${brl(minInstallment)}`;
      }

      return line;
    }
    case "single": {
      const base = `Quitação total de R$ ${principalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      if (interestRatePercent && interestRatePercent > 0) {
        return `${base} · Juros de atraso: ${interestRatePercent}% ao mês (proporcional aos dias)`;
      }
      return base;
    }
    default:
      return "";
  }
}

export function buildLoanRow(
  loan: LoanRecord,
  payments: LoanPaymentRecord[],
  now = new Date(),
): LoanRow {
  const totalReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const resolvedStatus = resolveLoanStatus(loan, payments, now);
  const loanWithStatus = { ...loan, status: resolvedStatus };
  const monthlyDue = calculateMonthlyDue(loanWithStatus);
  const nextDue = getNextDueDate(loanWithStatus, payments, now);
  const firstUnpaid = getFirstUnpaidDueDate(loanWithStatus, payments, now);
  const overdueDays = firstUnpaid
    ? daysOverdue(firstUnpaid, new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    : 0;
  const lateInterest =
    resolvedStatus === "overdue" || overdueDays > 0
      ? calculateLateInterest(loanWithStatus, payments, now)
      : 0;
  const totalDueNow = calculateTotalDueNow(loanWithStatus, payments, monthlyDue, lateInterest);

  return {
    ...loanWithStatus,
    monthlyDue,
    lateInterest,
    overdueDays,
    totalDueNow,
    nextDueLabel: nextDue ? formatDateBr(nextDue) : null,
    isOverdue: resolvedStatus === "overdue",
    totalReceived,
    payments: [...payments].sort((a, b) => b.paidAt.localeCompare(a.paidAt)),
  };
}

export function buildLoanSummary(items: LoanRow[]) {
  const active = items.filter((item) => item.status !== "paid" && item.status !== "cancelled");
  const overdue = items.filter((item) => item.isOverdue);
  const totalOutstanding = active.reduce((sum, item) => sum + item.remainingPrincipal, 0);
  const dueThisMonth = active.reduce((sum, item) => sum + item.totalDueNow, 0);
  const totalReceived = items.reduce((sum, item) => sum + item.totalReceived, 0);

  return {
    totalOutstanding,
    dueThisMonth,
    overdueCount: overdue.length,
    activeCount: active.length,
    totalReceived,
  };
}

export function suggestPaymentAmount(
  loan: LoanRecord & { lateInterest?: number; totalDueNow?: number },
  paymentType: LoanPaymentType,
): number {
  const lateInterest = loan.lateInterest ?? 0;

  switch (paymentType) {
    case "interest":
      return calculateMonthlyDue(loan) + lateInterest;
    case "principal":
      return loan.remainingPrincipal;
    case "full":
      return (loan.totalDueNow ?? loan.remainingPrincipal + lateInterest);
    case "both":
      return calculateMonthlyDue(loan) + lateInterest;
    default:
      return 0;
  }
}
