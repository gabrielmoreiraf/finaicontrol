import "server-only";

import { cache } from "react";
import { brl } from "@/lib/finance/format";
import {
  getCachedExpenses,
  getCachedIncomes,
} from "@/lib/finance/cached-queries";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "success";
  href?: string;
  timeLabel: string;
};

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

function buildNotifications(
  fixedIncome: number,
  incomeRows: Awaited<ReturnType<typeof getCachedIncomes>>,
  expenseRows: Awaited<ReturnType<typeof getCachedExpenses>>,
): AppNotification[] {
  const monthlyIncome =
    fixedIncome + incomeRows.reduce((sum, row) => sum + Number(row.amount), 0);
  const monthlyExpenses = expenseRows.reduce(
    (sum, row) => sum + Number(row.amount),
    0,
  );
  const balance = monthlyIncome - monthlyExpenses;

  const notifications: AppNotification[] = [];
  const now = new Date();

  for (const income of incomeRows) {
    if (income.type !== "temporary" || !income.endDate) continue;
    const end = new Date(income.endDate);
    if (Number.isNaN(end.getTime())) continue;
    const monthsLeft =
      (end.getFullYear() - now.getFullYear()) * 12 +
      (end.getMonth() - now.getMonth());
    if (monthsLeft <= 2 && monthsLeft >= 0) {
      notifications.push({
        id: `income-${income.id}`,
        title: "Renda temporária acabando",
        message: `${income.label} termina em ${end.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}.`,
        type: "warning",
        href: "/receitas",
        timeLabel: `${monthsLeft} mês(es)`,
      });
    }
  }

  if (balance < 0) {
    notifications.push({
      id: "balance-negative",
      title: "Saldo projetado negativo",
      message: "Suas despesas previstas superam as receitas. Revise gastos ou dívidas.",
      type: "warning",
      href: "/dashboard",
      timeLabel: "Recente",
    });
  }

  for (const expense of expenseRows) {
    const amount = Number(expense.amount);
    if (amount <= 0 || !expense.dayOfMonth) continue;
    const date = nextOccurrence(expense.dayOfMonth, now);
    const days = daysUntil(date, now);
    if (days > 3) continue;
    notifications.push({
      id: `bill-${expense.id}`,
      title: "Conta vence em breve",
      message: `${expense.name}: ${brl(amount)} (${formatShortDate(date)})`,
      type: "warning",
      href: "/despesas",
      timeLabel: `${days} dia(s)`,
    });
  }

  if (
    balance >= 0 &&
    monthlyIncome > 0 &&
    notifications.every((n) => n.type !== "warning")
  ) {
    notifications.unshift({
      id: "health-ok",
      title: "Finanças em ordem",
      message: `Saldo projetado positivo (${brl(balance)}).`,
      type: "success",
      href: "/dashboard",
      timeLabel: "Hoje",
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      id: "empty",
      title: "Sem notificações",
      message: "Cadastre receitas e despesas para receber alertas personalizados.",
      type: "info",
      timeLabel: "",
    });
  }

  return notifications.slice(0, 12);
}

/** Notificações do shell: reutiliza cache de receitas/despesas do request. */
export const getUserNotifications = cache(async function getUserNotifications(
  userId: string,
  fixedMonthlyIncome: number,
): Promise<AppNotification[]> {
  const [incomeRows, expenseRows] = await Promise.all([
    getCachedIncomes(userId),
    getCachedExpenses(userId),
  ]);

  return buildNotifications(fixedMonthlyIncome, incomeRows, expenseRows);
});
