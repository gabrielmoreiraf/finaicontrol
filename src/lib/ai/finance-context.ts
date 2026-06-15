import "server-only";

import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { debts, expenses, goals, incomes, loans, profiles } from "@/lib/db/schema";
import { getExpenseSummary, getGoalSummary, getIncomeSummary } from "@/lib/finance/summary";
import { getInstallmentProgress } from "@/lib/finance/installment-progress";
import { EXPENSE_TYPE_LABELS, INCOME_TYPE_LABELS, brl } from "@/lib/finance/format";

/** Quantos registros individuais recentes enviar à IA (limita tokens/custo). */
const RECENT_LIMIT = 10;
/** Teto de linhas usadas no cálculo da projeção (segurança). */
const PROJ_ROW_LIMIT = 500;

const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function monthIndexOf(d: Date): number {
  return d.getFullYear() * 12 + d.getMonth();
}

/** Converte "YYYY-MM-DD" ou "DD/MM/YYYY" em índice de mês (ano*12 + mês). */
function parseMonthIndex(value: string | null | undefined): number | null {
  if (!value) return null;
  const s = String(value).trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return Number(iso[1]) * 12 + (Number(iso[2]) - 1);
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return Number(br[3]) * 12 + (Number(br[2]) - 1);
  return null;
}

function monthLabel(idx: number): string {
  const year = Math.floor(idx / 12);
  const month = ((idx % 12) + 12) % 12;
  return `${MONTHS_PT[month]}/${year}`;
}

/** Formata uma linha "tipo: total (N lançamento(s))". */
function typeLine(label: string, bucket?: { total: number; count: number }): string {
  const total = bucket?.total ?? 0;
  const count = bucket?.count ?? 0;
  return `  - ${label}: ${brl(total)} (${count} lançamento(s))`;
}

type ProjIncome = { amount: string; type: string; endDate: string | null };
type ProjExpense = {
  name: string;
  amount: string;
  type: string;
  installmentCount: number | null;
  paymentStartDate: string | null;
};
type ProjDebt = { balance: string; monthlyPayment: string };

/**
 * Projeção de saldo mês a mês (mesma lógica do dashboard): renda recorrente menos
 * despesas, com parcelas saindo da conta quando terminam e renda temporária
 * expirando. O horizonte vai até a última parcela encerrar (entre 6 e 24 meses).
 */
function buildProjection(
  fixedIncome: number,
  incomeRows: ProjIncome[],
  expenseRows: ProjExpense[],
  debtRows: ProjDebt[],
): string {
  const now = new Date();
  const baseIndex = monthIndexOf(now);

  // Quando termina a última parcela (e qual despesa é).
  // Despesas parceladas com sua data de término (índice de mês).
  const installments = expenseRows
    .filter((e) => e.type === "installment")
    .map((e) => {
      const start = parseMonthIndex(e.paymentStartDate);
      const count = e.installmentCount ?? 0;
      return start !== null && count > 0
        ? { name: e.name, parcela: Number(e.amount), start, count, endIdx: start + count - 1 }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.endIdx - b.endIdx);

  const lastEndIdx = installments.length
    ? Math.max(baseIndex + 5, installments[installments.length - 1].endIdx)
    : baseIndex + 5;

  const horizon = Math.min(12, Math.max(6, lastEndIdx - baseIndex + 1));
  const debtPlans = debtRows.map((d) => {
    const bal = Number(d.balance);
    const pay = Number(d.monthlyPayment);
    return { pay, months: pay > 0 ? Math.ceil(bal / pay) : Number.POSITIVE_INFINITY };
  });

  let cumulative = 0;
  const rows: { idx: number; net: number; cumulative: number; line: string }[] = [];
  for (let i = 0; i < horizon; i++) {
    const idx = baseIndex + i;

    let receitas = fixedIncome;
    for (const r of incomeRows) {
      const a = Number(r.amount);
      if (a <= 0) continue;
      if (r.type === "temporary") {
        const end = parseMonthIndex(r.endDate);
        if (end !== null && idx > end) continue;
      }
      receitas += a;
    }

    let despesas = 0;
    for (const e of expenseRows) {
      const a = Number(e.amount);
      if (a <= 0) continue;
      if (e.type === "installment") {
        const start = parseMonthIndex(e.paymentStartDate);
        const count = e.installmentCount ?? 0;
        if (start !== null && count > 0 && (idx < start || idx > start + count - 1)) continue;
      }
      despesas += a;
    }
    for (const plan of debtPlans) {
      if (i < plan.months) despesas += plan.pay;
    }

    const net = receitas - despesas;
    cumulative += net;
    rows.push({
      idx,
      net,
      cumulative,
      line: `  - ${monthLabel(idx)}: receitas ${brl(receitas)}, despesas ${brl(despesas)}, SOBRA LÍQUIDA do mês ${brl(net)}, saldo ACUMULADO ${brl(cumulative)}`,
    });
  }

  const byIdx = new Map(rows.map((r) => [r.idx, r]));
  const netAt = (idx: number): string => (byIdx.has(idx) ? brl(byIdx.get(idx)!.net) : "além da projeção");
  const cumAt = (idx: number): string => (byIdx.has(idx) ? brl(byIdx.get(idx)!.cumulative) : "além da projeção");

  // Bloco mastigado: cada despesa parcelada, da que termina PRIMEIRO para a última.
  const installmentBlock = installments.length
    ? [
        "DESPESAS PARCELADAS ORDENADAS POR TÉRMINO (da PRIMEIRA a encerrar para a ÚLTIMA).",
        '"Encerrar" = pagar a última parcela. Use esta lista para perguntas sobre qual termina antes/depois.',
        'Atenção a 2 valores: "SOBRA LÍQUIDA do mês" = o que sobra NAQUELE mês (receitas - despesas do mês);',
        '"saldo ACUMULADO" = soma de todas as sobras desde hoje até aquele mês.',
        ...installments.map(
          (it, i) =>
            `  ${i + 1}. ${it.name} — ${it.count}x de ${brl(it.parcela)} · inicia ${monthLabel(it.start)}, encerra em ${monthLabel(it.endIdx)} · SOBRA LÍQUIDA nesse mês ${netAt(it.endIdx)} · saldo ACUMULADO ${cumAt(it.endIdx)}`,
        ),
      ].join("\n")
    : "DESPESAS PARCELADAS: nenhuma.";

  return [
    installmentBlock,
    "",
    "PROJEÇÃO MÊS A MÊS (a partir de hoje):",
    ...rows.map((r) => r.line),
  ].join("\n");
}

/**
 * Monta um RESUMO AGREGADO e COMPLETO das finanças do usuário para a IA.
 * Por privacidade (LGPD), envia totais/contagens/categorias — nunca descrições
 * individuais, nomes de terceiros ou outros dados pessoais.
 */
export async function buildFinanceContext(userId: string): Promise<string> {
  const [profileRow] = await db
    .select({ fixedMonthlyIncome: profiles.fixedMonthlyIncome })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  const fixedIncome = Number(profileRow?.fixedMonthlyIncome ?? 0);

  const results = await Promise.all([
    getIncomeSummary(userId, fixedIncome),
    getExpenseSummary(userId),
    getGoalSummary(userId),
    db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<string>`coalesce(sum(${debts.balance}), 0)`,
        monthly: sql<string>`coalesce(sum(${debts.monthlyPayment}), 0)`,
      })
      .from(debts)
      .where(eq(debts.userId, userId)),
    db
      .select({
        category: expenses.category,
        total: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .groupBy(expenses.category)
      .orderBy(desc(sql`sum(${expenses.amount})`))
      .limit(12),
    db
      .select({
        active: sql<number>`count(*) filter (where ${loans.status} != 'paid')::int`,
        remaining: sql<string>`coalesce(sum(${loans.remainingPrincipal}) filter (where ${loans.status} != 'paid'), 0)`,
        count: sql<number>`count(*)::int`,
      })
      .from(loans)
      .where(eq(loans.userId, userId)),
    // Registros individuais recentes (mais novo primeiro) para consultas item a item.
    db
      .select({
        name: expenses.name,
        amount: expenses.amount,
        type: expenses.type,
        category: expenses.category,
        dayOfMonth: expenses.dayOfMonth,
        expenseDate: expenses.expenseDate,
        installmentCount: expenses.installmentCount,
        paymentStartDate: expenses.paymentStartDate,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.createdAt))
      .limit(RECENT_LIMIT),
    db
      .select({
        label: incomes.label,
        amount: incomes.amount,
        type: incomes.type,
        dayOfMonth: incomes.dayOfMonth,
        endDate: incomes.endDate,
      })
      .from(incomes)
      .where(eq(incomes.userId, userId))
      .orderBy(desc(incomes.createdAt))
      .limit(RECENT_LIMIT),
    db
      .select({ name: debts.name, balance: debts.balance, monthlyPayment: debts.monthlyPayment })
      .from(debts)
      .where(eq(debts.userId, userId))
      .orderBy(desc(debts.createdAt))
      .limit(RECENT_LIMIT),
    db
      .select({
        name: goals.name,
        current: goals.currentAmount,
        target: goals.targetAmount,
        completed: goals.completed,
      })
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.createdAt))
      .limit(RECENT_LIMIT),
    db
      .select({
        borrower: loans.borrowerName,
        principal: loans.principalAmount,
        remaining: loans.remainingPrincipal,
      })
      .from(loans)
      .where(and(eq(loans.userId, userId), ne(loans.status, "paid")))
      .orderBy(desc(loans.createdAt))
      .limit(RECENT_LIMIT),
    // Linhas para a PROJEÇÃO (todas, colunas mínimas).
    db
      .select({ amount: incomes.amount, type: incomes.type, endDate: incomes.endDate })
      .from(incomes)
      .where(eq(incomes.userId, userId))
      .limit(PROJ_ROW_LIMIT),
    db
      .select({
        name: expenses.name,
        amount: expenses.amount,
        type: expenses.type,
        installmentCount: expenses.installmentCount,
        paymentStartDate: expenses.paymentStartDate,
      })
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .limit(PROJ_ROW_LIMIT),
    db
      .select({ balance: debts.balance, monthlyPayment: debts.monthlyPayment })
      .from(debts)
      .where(eq(debts.userId, userId))
      .limit(PROJ_ROW_LIMIT),
  ]);

  const [
    income,
    expense,
    goal,
    debtRows,
    byCategory,
    loanRows,
    recentExpenses,
    recentIncomes,
    debtList,
    goalList,
    loanList,
    projIncomeRows,
    projExpenseRows,
    projDebtRows,
  ] = results;

  const debt = debtRows[0];
  const loan = loanRows[0];
  const balance = income.total - expense.total;

  const categories = byCategory
    .filter((c) => Number(c.total) > 0)
    .map((c) => `  - ${c.category || "Sem categoria"}: ${brl(Number(c.total))}`)
    .join("\n");

  const expenseItems = recentExpenses
    .map((e) => {
      const typeLabel = EXPENSE_TYPE_LABELS[e.type] ?? e.type;
      const cat = e.category ? `, ${e.category}` : "";
      let detail = "";
      if (e.type === "installment") {
        const prog = getInstallmentProgress(e.paymentStartDate, e.installmentCount);
        const start = parseMonthIndex(e.paymentStartDate);
        const count = e.installmentCount ?? 0;
        const end = start !== null && count > 0 ? ` · encerra em ${monthLabel(start + count - 1)}` : "";
        detail = (prog ? ` · ${prog.label}` : count ? ` · ${count}x` : "") + end;
      } else if (e.type === "fixed" && e.dayOfMonth) {
        detail = ` · vence todo dia ${e.dayOfMonth}`;
      } else if (e.type === "variable" && e.expenseDate) {
        detail = ` · em ${e.expenseDate}`;
      }
      return `  - ${e.name} — ${brl(Number(e.amount))} (${typeLabel}${cat})${detail}`;
    })
    .join("\n");
  const incomeItems = recentIncomes
    .map((i) => {
      const typeLabel = INCOME_TYPE_LABELS[i.type] ?? i.type;
      let detail = "";
      if (i.type === "temporary" && i.endDate) detail = ` · até ${i.endDate}`;
      else if (i.dayOfMonth) detail = ` · recebe dia ${i.dayOfMonth}`;
      return `  - ${i.label} — ${brl(Number(i.amount))} (${typeLabel})${detail}`;
    })
    .join("\n");
  const debtItems = debtList
    .map((d) => `  - ${d.name} — saldo ${brl(Number(d.balance))}, parcela ${brl(Number(d.monthlyPayment))}`)
    .join("\n");
  const goalItems = goalList
    .map((g) => {
      const cur = Number(g.current);
      const tgt = Number(g.target);
      const pct = tgt > 0 ? Math.round((cur / tgt) * 100) : 0;
      return `  - ${g.name} — ${brl(cur)} de ${brl(tgt)} (${pct}%${g.completed ? ", concluída" : ""})`;
    })
    .join("\n");
  const loanItems = loanList
    .map((l) => `  - ${l.borrower} — emprestado ${brl(Number(l.principal))}, a receber ${brl(Number(l.remaining))}`)
    .join("\n");

  const lines = [
    "DADOS FINANCEIROS DO USUÁRIO (mensais, agregados, em BRL). Use SOMENTE estes dados:",
    "",
    `RECEITAS — total estimado ${brl(income.total)} (inclui salário/renda fixa de perfil ${brl(fixedIncome)}):`,
    typeLine("Fixa (cadastrada)", income.byType.fixed),
    typeLine("Variável", income.byType.variable),
    typeLine("Extra", income.byType.extra),
    typeLine("Temporária", income.byType.temporary),
    "",
    `DESPESAS — total ${brl(expense.total)}:`,
    typeLine("Fixa", expense.byType.fixed),
    typeLine("Variável", expense.byType.variable),
    typeLine("Parcelada", expense.byType.installment),
    "",
    `SALDO (receitas - despesas): ${brl(balance)}.`,
    "",
    `DÍVIDAS: ${debt?.count ?? 0} registro(s) · saldo devedor ${brl(Number(debt?.total ?? 0))} · parcelas mensais ${brl(Number(debt?.monthly ?? 0))}.`,
    `METAS: ${goal.totalCount} (${goal.completedCount} concluída(s)) · guardado ${brl(goal.totalCurrent)} de ${brl(goal.totalTarget)}.`,
    `EMPRÉSTIMOS A PESSOAS (módulo Emprestei): ${loan?.count ?? 0} registro(s), ${loan?.active ?? 0} em aberto · a receber ${brl(Number(loan?.remaining ?? 0))}.`,
    "",
    categories ? `DESPESAS POR CATEGORIA:\n${categories}` : "DESPESAS POR CATEGORIA: nenhuma ainda.",
    "",
    `DESPESAS RECENTES (até ${RECENT_LIMIT}, da MAIS RECENTE para a mais antiga — a 1ª é a última adicionada):`,
    expenseItems || "  (nenhuma)",
    "",
    `RECEITAS RECENTES (até ${RECENT_LIMIT}, da mais recente para a mais antiga):`,
    incomeItems || "  (nenhuma)",
    "",
    "DÍVIDAS (lista):",
    debtItems || "  (nenhuma)",
    "",
    "METAS (lista):",
    goalItems || "  (nenhuma)",
    "",
    "EMPRÉSTIMOS EM ABERTO (lista):",
    loanItems || "  (nenhum)",
    "",
    buildProjection(fixedIncome, projIncomeRows, projExpenseRows, projDebtRows),
  ];

  return lines.join("\n");
}
