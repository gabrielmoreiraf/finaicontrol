import "server-only";
import { cache } from "react";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { debts, goals, loanPayments, loans } from "@/lib/db/schema";
import {
  getCachedExpenses,
  getCachedIncomes,
  getCachedProfile,
} from "@/lib/finance/cached-queries";
import type {
  DashboardHealthData,
  DashboardProjectionPoint,
  DashboardSmartAlert,
  DashboardSummaryItem,
  DashboardTemporaryIncome,
  DashboardUpcomingBill,
  DashboardUpcomingIncome,
} from "@/lib/dashboard/types";
import { brl, INCOME_TYPE_LABELS } from "@/lib/finance/format";
import {
  buildLoanRow,
  getNextDueDate,
  type LoanPaymentMode,
  type LoanPaymentType,
  type LoanRecord,
  type LoanStatus,
} from "@/lib/finance/loans";

export interface DashboardStat {
  label: string;
  value: string;
  change: string;
}

export interface DashboardAlert {
  type: "warning" | "info";
  title: string;
  message: string;
}

export interface DashboardData {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  stats: DashboardStat[];
  categoryBreakdown: { name: string; value: number }[];
  alerts: DashboardAlert[];
  projectionMonths: { month: string; saldo: number }[];
  summary: DashboardSummaryItem[];
  health: DashboardHealthData;
  upcomingIncome: DashboardUpcomingIncome[];
  upcomingBills: DashboardUpcomingBill[];
  temporaryIncomes: DashboardTemporaryIncome[];
  projection: DashboardProjectionPoint[];
  smartAlerts: DashboardSmartAlert[];
  goalCount: number;
}

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function nextOccurrence(dayOfMonth: number, from = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.min(dayOfMonth, lastDay);
  let target = new Date(year, month, day);
  if (target < from) {
    const nextMonth = month + 1;
    const nextLast = new Date(year, nextMonth + 1, 0).getDate();
    target = new Date(year, nextMonth, Math.min(dayOfMonth, nextLast));
  }
  return target;
}

function daysUntil(date: Date, from = new Date()): number {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function billPriority(days: number): DashboardUpcomingBill["priority"] {
  if (days <= 3) return "high";
  if (days <= 7) return "medium";
  return "low";
}

function buildSummary(
  monthlyIncome: number,
  monthlyExpenses: number,
  balance: number,
  goalCount: number,
  incomeCount: number,
  expenseCount: number,
): DashboardSummaryItem[] {
  return [
    {
      id: "income",
      label: "Receitas do mês",
      value: brl(monthlyIncome),
      change: monthlyIncome > 0 ? `${incomeCount} fonte(s) cadastrada(s)` : "Nenhuma receita cadastrada",
      trend: monthlyIncome > 0 ? "up" : "neutral",
      icon: "income",
    },
    {
      id: "expense",
      label: "Despesas do mês",
      value: brl(monthlyExpenses),
      change: monthlyExpenses > 0 ? `${expenseCount} despesa(s) prevista(s)` : "Nenhuma despesa cadastrada",
      trend: monthlyExpenses > 0 ? "down" : "neutral",
      icon: "expense",
    },
    {
      id: "balance",
      label: "Saldo projetado",
      value: brl(balance),
      change: balance > 0 ? "positivo" : balance < 0 ? "atenção: negativo" : "sem movimentação",
      trend: balance > 0 ? "up" : balance < 0 ? "down" : "neutral",
      icon: "balance",
    },
    {
      id: "goals",
      label: "Metas ativas",
      value: goalCount > 0 ? `${goalCount} ativa${goalCount > 1 ? "s" : ""}` : "0 ativas",
      change: goalCount > 0 ? "em andamento" : "Cadastre suas metas",
      trend: "neutral",
      icon: "goals",
    },
  ];
}

function buildHealth(balance: number, savingsRate: number, hasData: boolean): DashboardHealthData {
  if (!hasData) {
    return {
      score: 0,
      maxScore: 100,
      status: EMPTY_DISPLAY,
      description: "Cadastre receitas e despesas para calcular sua saúde financeira.",
    };
  }

  const score = Math.min(100, Math.max(0, 40 + savingsRate));
  return {
    score,
    maxScore: 100,
    status: balance >= 0 ? (score >= 70 ? "Boa" : "Regular") : "Atenção",
    description:
      balance >= 0
        ? `Poupança projetada: ${savingsRate}%.`
        : "Despesas acima das receitas. Ajuste o orçamento.",
  };
}

function buildUpcomingLoanIncome(
  loanRows: {
    id: string;
    borrowerName: string;
    principalAmount: string;
    remainingPrincipal: string;
    interestRatePercent: string | null;
    paymentMode: string;
    installmentAmount: string | null;
    installmentCount: number | null;
    dayOfMonth: number | null;
    startDate: string;
    expectedEndDate: string | null;
    status: string;
    notes: string;
  }[],
  paymentRows: {
    loanId: string;
    paidAt: string;
    amount: string;
    paymentType: string;
    note: string;
    id: string;
  }[],
): DashboardUpcomingIncome[] {
  const now = new Date();
  const paymentsByLoan = new Map<string, typeof paymentRows>();
  for (const payment of paymentRows) {
    const list = paymentsByLoan.get(payment.loanId) ?? [];
    list.push(payment);
    paymentsByLoan.set(payment.loanId, list);
  }

  const items: { sort: number; item: DashboardUpcomingIncome }[] = [];

  for (const row of loanRows) {
    const loan: LoanRecord = {
      id: row.id,
      borrowerName: row.borrowerName,
      principalAmount: Number(row.principalAmount),
      remainingPrincipal: Number(row.remainingPrincipal),
      interestRatePercent: row.interestRatePercent ? Number(row.interestRatePercent) : null,
      paymentMode: row.paymentMode as LoanPaymentMode,
      installmentAmount: row.installmentAmount ? Number(row.installmentAmount) : null,
      installmentCount: row.installmentCount,
      dayOfMonth: row.dayOfMonth,
      startDate: row.startDate,
      expectedEndDate: row.expectedEndDate,
      status: row.status as LoanStatus,
      notes: row.notes,
    };

    const payments = (paymentsByLoan.get(row.id) ?? []).map((payment) => ({
      id: payment.id,
      loanId: payment.loanId,
      paidAt: payment.paidAt,
      amount: Number(payment.amount),
      paymentType: payment.paymentType as LoanPaymentType,
      note: payment.note,
    }));

    const built = buildLoanRow(loan, payments, now);
    if (built.status === "paid" || built.monthlyDue <= 0) continue;

    const nextDue = getNextDueDate(built, payments, now);

    items.push({
      sort: nextDue?.getTime() ?? Number.MAX_SAFE_INTEGER,
      item: {
        id: `loan-${row.id}`,
        label: `Empréstimo: ${row.borrowerName}`,
        date: nextDue ? formatShortDate(nextDue) : EMPTY_DISPLAY,
        amount: brl(built.totalDueNow),
        category: built.isOverdue
          ? built.lateInterest > 0
            ? "Em atraso + juros"
            : "Em atraso"
          : "Emprestei",
      },
    });
  }

  return items.sort((a, b) => a.sort - b.sort).map((entry) => entry.item);
}

function buildUpcomingIncome(
  fixedIncome: number,
  incomeRows: { id: string; label: string; amount: string; type: string; dayOfMonth: number | null }[],
  loanIncome: DashboardUpcomingIncome[] = [],
): DashboardUpcomingIncome[] {
  const now = new Date();
  const items: { sort: number; item: DashboardUpcomingIncome }[] = [];

  if (fixedIncome > 0) {
    const date = nextOccurrence(1, now);
    items.push({
      sort: date.getTime(),
      item: {
        id: "profile-fixed",
        label: "Renda fixa (perfil)",
        date: formatShortDate(date),
        amount: brl(fixedIncome),
        category: "Fixa",
      },
    });
  }

  for (const row of incomeRows) {
    const amount = Number(row.amount);
    if (amount <= 0) continue;
    const date = row.dayOfMonth ? nextOccurrence(row.dayOfMonth, now) : null;
    items.push({
      sort: date?.getTime() ?? Number.MAX_SAFE_INTEGER,
      item: {
        id: row.id,
        label: row.label,
        date: date ? formatShortDate(date) : EMPTY_DISPLAY,
        amount: brl(amount),
        category: INCOME_TYPE_LABELS[row.type] ?? row.type,
      },
    });
  }

  const incomeItems = items.sort((a, b) => a.sort - b.sort).map((entry) => entry.item);
  return [...incomeItems, ...loanIncome].sort((a, b) => {
    const parse = (value: string) => {
      const [day, month] = value.split("/").map(Number);
      if (!day || !month) return Number.MAX_SAFE_INTEGER;
      const year = new Date().getFullYear();
      return new Date(year, month - 1, day).getTime();
    };
    return parse(a.date) - parse(b.date);
  });
}

function buildUpcomingBills(
  expenseRows: { id: string; name: string; amount: string; dayOfMonth: number | null }[],
): DashboardUpcomingBill[] {
  const now = new Date();
  const items: { sort: number; item: DashboardUpcomingBill }[] = [];

  for (const row of expenseRows) {
    const amount = Number(row.amount);
    if (amount <= 0 || !row.dayOfMonth) continue;
    const date = nextOccurrence(row.dayOfMonth, now);
    const days = daysUntil(date, now);
    items.push({
      sort: date.getTime(),
      item: {
        id: row.id,
        label: row.name,
        date: formatShortDate(date),
        amount: brl(amount),
        daysUntil: days,
        priority: billPriority(days),
      },
    });
  }

  return items.sort((a, b) => a.sort - b.sort).map((entry) => entry.item);
}

function buildTemporaryIncomes(
  incomeRows: { id: string; label: string; amount: string; type: string; endDate: string | null; createdAt: Date }[],
): DashboardTemporaryIncome[] {
  const now = new Date();

  return incomeRows
    .filter((row) => row.type === "temporary" && row.endDate)
    .map((row) => {
      const end = new Date(row.endDate!);
      const monthsLeft = Math.max(
        0,
        (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()),
      );
      const start = row.createdAt;
      const totalMs = end.getTime() - start.getTime();
      const elapsedMs = now.getTime() - start.getTime();
      const progress =
        totalMs > 0 ? Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100))) : 0;

      return {
        id: row.id,
        label: row.label,
        amount: `${brl(Number(row.amount))}/mês`,
        endsAt: end.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        monthsLeft,
        progress,
      };
    })
    .sort((a, b) => a.monthsLeft - b.monthsLeft);
}

function monthIndexOf(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

function parseMonthIndex(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.getFullYear() * 12 + d.getMonth();
}

/**
 * Projeção mês a mês (6 meses) que respeita o que TERMINA ao longo do tempo:
 * - rendas temporárias deixam de contar após a data de término;
 * - despesas parceladas contam só dentro da janela de parcelas;
 * - dívidas deixam de contar após serem quitadas (saldo / parcela mensal).
 * O `saldo` é o acumulado projetado (soma dos saldos mensais líquidos).
 */
function buildProjection(
  fixedIncome: number,
  incomeRows: { amount: string; type: string; endDate: string | null }[],
  expenseRows: {
    amount: string;
    type: string;
    installmentCount: number | null;
    paymentStartDate: string | null;
  }[],
  debtRows: { balance: string; monthlyPayment: string }[],
): DashboardProjectionPoint[] {
  const now = new Date();
  const baseIndex = monthIndexOf(now);

  const debtPlans = debtRows.map((d) => {
    const balance = Number(d.balance);
    const pay = Number(d.monthlyPayment);
    return { pay, months: pay > 0 ? Math.ceil(balance / pay) : Number.POSITIVE_INFINITY };
  });

  let cumulative = 0;
  return Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const idx = baseIndex + i;

    let receitas = fixedIncome;
    for (const row of incomeRows) {
      const amount = Number(row.amount);
      if (amount <= 0) continue;
      if (row.type === "temporary") {
        const endIdx = parseMonthIndex(row.endDate);
        if (endIdx !== null && idx > endIdx) continue;
      }
      receitas += amount;
    }

    let despesas = 0;
    for (const row of expenseRows) {
      const amount = Number(row.amount);
      if (amount <= 0) continue;
      if (row.type === "installment") {
        const startIdx = parseMonthIndex(row.paymentStartDate);
        const count = row.installmentCount ?? 0;
        if (startIdx !== null && count > 0 && (idx < startIdx || idx > startIdx + count - 1)) {
          continue;
        }
      }
      despesas += amount;
    }
    for (const plan of debtPlans) {
      if (i < plan.months) despesas += plan.pay;
    }

    cumulative += receitas - despesas;
    return {
      month: MONTH_LABELS[monthDate.getMonth()] ?? EMPTY_DISPLAY,
      receitas,
      despesas,
      saldo: cumulative,
    };
  });
}

function buildSmartAlerts(alerts: DashboardAlert[]): DashboardSmartAlert[] {
  if (alerts.length === 0) {
    return [
      {
        id: "empty",
        message: "Cadastre receitas, despesas, dívidas e metas para receber alertas personalizados.",
        tone: "insight",
      },
    ];
  }

  return alerts.map((alert, index) => ({
    id: String(index),
    message: alert.message,
    tone: alert.type === "warning" ? ("warning" as const) : ("insight" as const),
  }));
}

function buildAlerts(
  incomeRows: { type: string; label: string; endDate: string | null }[],
  balance: number,
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const now = new Date();

  for (const income of incomeRows) {
    if (income.type !== "temporary" || !income.endDate) continue;
    const end = new Date(income.endDate);
    if (Number.isNaN(end.getTime())) continue;
    const monthsLeft =
      (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth());
    if (monthsLeft <= 2 && monthsLeft >= 0) {
      alerts.push({
        type: "warning",
        title: `Renda "${income.label}" termina em breve`,
        message: `Previsão de encerramento em ${end.toLocaleDateString("pt-BR")}. Revise seu orçamento.`,
      });
    }
  }

  if (balance < 0) {
    alerts.push({
      type: "warning",
      title: "Saldo projetado negativo",
      message: "Suas despesas previstas superam as receitas. Revise gastos ou dívidas.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "info",
      title: "Tudo sob controle por aqui",
      message: "Continue cadastrando seus dados para enriquecer alertas e projeções.",
    });
  }

  return alerts;
}

export const getDashboardData = cache(async function getDashboardData(
  userId: string,
): Promise<DashboardData> {
  const [profileRow, incomeRows, expenseRows, debtRows, goalRows, loanRows, loanPaymentRows] =
    await Promise.all([
      getCachedProfile(userId),
      getCachedIncomes(userId),
      getCachedExpenses(userId),
      db.select().from(debts).where(eq(debts.userId, userId)),
      db.select({ id: goals.id }).from(goals).where(eq(goals.userId, userId)),
      db.select().from(loans).where(eq(loans.userId, userId)),
      db.select().from(loanPayments).where(eq(loanPayments.userId, userId)),
    ]);

  const fixedIncome = Number(profileRow?.fixedMonthlyIncome ?? 0);
  const otherIncome = incomeRows.reduce((sum, i) => sum + Number(i.amount), 0);
  const monthlyIncome = fixedIncome + otherIncome;

  const expenseTotal = expenseRows.reduce((sum, e) => sum + Number(e.amount), 0);
  const debtPayments = debtRows.reduce((sum, d) => sum + Number(d.monthlyPayment), 0);
  const monthlyExpenses = expenseTotal + debtPayments;

  const balance = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((balance / monthlyIncome) * 100) : 0;
  const hasData = monthlyIncome > 0 || monthlyExpenses > 0;
  const goalCount = goalRows.length;

  const categoryTotals = new Map<string, number>();
  for (const e of expenseRows) {
    const key = e.category?.trim() || "Sem categoria";
    categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + Number(e.amount));
  }
  const categoryBreakdown = Array.from(categoryTotals.entries())
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const stats: DashboardStat[] = [
    {
      label: "Receitas do mês",
      value: brl(monthlyIncome),
      change: otherIncome > 0 ? "fixa + extras" : fixedIncome > 0 ? "só renda fixa" : "sem receitas",
    },
    {
      label: "Despesas previstas",
      value: brl(monthlyExpenses),
      change: `${expenseRows.length} despesa(s) + ${debtRows.length} dívida(s)`,
    },
    {
      label: "Saldo projetado",
      value: brl(balance),
      change: balance >= 0 ? "positivo" : "atenção",
    },
    {
      label: "Metas ativas",
      value: String(goalCount),
      change: goalCount > 0 ? "em andamento" : "nenhuma meta",
    },
  ];

  const alerts = buildAlerts(incomeRows, balance);
  const loanIncome = buildUpcomingLoanIncome(loanRows, loanPaymentRows);
  const upcomingIncome = buildUpcomingIncome(fixedIncome, incomeRows, loanIncome);
  const upcomingBills = buildUpcomingBills(expenseRows);
  const temporaryIncomes = buildTemporaryIncomes(incomeRows);
  const projection = buildProjection(fixedIncome, incomeRows, expenseRows, debtRows);

  const projectionMonths = projection.map((point) => ({
    month: point.month,
    saldo: point.saldo,
  }));

  return {
    balance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    stats,
    categoryBreakdown,
    alerts,
    projectionMonths,
    summary: buildSummary(
      monthlyIncome,
      monthlyExpenses,
      balance,
      goalCount,
      incomeRows.length + (fixedIncome > 0 ? 1 : 0),
      expenseRows.length + debtRows.length,
    ),
    health: buildHealth(balance, savingsRate, hasData),
    upcomingIncome,
    upcomingBills,
    temporaryIncomes,
    projection,
    smartAlerts: buildSmartAlerts(alerts),
    goalCount,
  };
});
