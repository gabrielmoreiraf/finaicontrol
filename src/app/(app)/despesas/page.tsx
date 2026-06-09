import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DespesasView } from "@/components/app/modules/despesas-view";
import { PlanUsageBanner } from "@/components/app/plan-usage-banner";
import { ResourceTable, type ResourceTableRow } from "@/components/app/resource-table";
import type { ResourceField } from "@/components/app/resource-fields";
import { createExpense, deleteExpense, updateExpense } from "@/lib/actions/expenses";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { debts, expenseCategories, expenses } from "@/lib/db/schema";
import { ensureDefaultExpenseCategories } from "@/lib/finance/expense-categories";
import { uniqueCategoryNames } from "@/lib/finance/category-names";
import { EXPENSE_TYPE_LABELS, brl } from "@/lib/finance/format";
import { getExpenseSummary } from "@/lib/finance/summary";

const PAGE_SIZE = 20;
const EXPENSE_TYPES = ["fixed", "variable", "installment"];

type PageProps = {
  searchParams: Promise<{ page?: string; tipo?: string }>;
};

export default async function DespesasPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureDefaultExpenseCategories(user.id);

  const params = await searchParams;
  const tipo = params.tipo && EXPENSE_TYPES.includes(params.tipo) ? params.tipo : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const [summary, debtRows, categoryRows] = await Promise.all([
    getExpenseSummary(user.id),
    db.select({ monthlyPayment: debts.monthlyPayment }).from(debts).where(eq(debts.userId, user.id)),
    db
      .select({ name: expenseCategories.name })
      .from(expenseCategories)
      .where(eq(expenseCategories.userId, user.id)),
  ]);

  const debtPayments = debtRows.reduce((sum, d) => sum + Number(d.monthlyPayment), 0);
  const categoryNames = uniqueCategoryNames(categoryRows.map((c) => c.name));

  const where =
    tipo === "all"
      ? eq(expenses.userId, user.id)
      : and(eq(expenses.userId, user.id), eq(expenses.type, tipo));

  const total = tipo === "all" ? summary.totalCount : (summary.byType[tipo]?.count ?? 0);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await db
    .select()
    .from(expenses)
    .where(where)
    .orderBy(desc(expenses.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const fields: ResourceField[] = [
    { name: "name", label: "Descrição", type: "text", required: true, placeholder: "Ex: Aluguel" },
    { name: "amount", label: "Valor", type: "currency", required: true },
    { name: "category", label: "Categoria", type: "category", categoryNames },
    {
      name: "type",
      label: "Tipo",
      type: "select",
      options: [
        { value: "fixed", label: "Fixa" },
        { value: "variable", label: "Variável" },
        { value: "installment", label: "Parcelada" },
      ],
    },
    {
      name: "dayOfMonth",
      label: "Dia do vencimento",
      type: "number",
      min: 1,
      max: 31,
      placeholder: "1-31",
      showWhen: { field: "type", values: ["fixed"] },
    },
    {
      name: "expenseDate",
      label: "Data do gasto",
      type: "date",
      required: true,
      showWhen: { field: "type", values: ["variable"] },
    },
    {
      name: "installmentCount",
      label: "Parcelas",
      type: "number",
      min: 2,
      required: true,
      placeholder: "Ex: 12",
      showWhen: { field: "type", values: ["installment"] },
    },
    {
      name: "paymentStartDate",
      label: "Início do pagamento",
      type: "date",
      required: true,
      showWhen: { field: "type", values: ["installment"] },
    },
  ];

  const tableRows: ResourceTableRow[] = rows.map((r) => ({
    id: r.id,
    item: {
      id: r.id,
      name: r.name,
      amount: Number(r.amount),
      category: r.category,
      type: r.type,
      dayOfMonth: r.dayOfMonth,
      expenseDate: r.expenseDate,
      installmentCount: r.installmentCount,
      paymentStartDate: r.paymentStartDate,
    },
    cells: {
      name: r.name,
      type: EXPENSE_TYPE_LABELS[r.type] ?? r.type,
      category: r.category || "—",
      day: r.dayOfMonth ?? "—",
      amount: brl(Number(r.amount)),
    },
  }));

  const filterTabs = [
    { id: "all", label: "Todas", count: summary.totalCount },
    { id: "fixed", label: "Fixas", count: summary.byType.fixed.count },
    { id: "variable", label: "Variáveis", count: summary.byType.variable.count },
    { id: "installment", label: "Parceladas", count: summary.byType.installment.count },
  ];

  return (
    <div className="space-y-10">
      <PlanUsageBanner userId={user.id} planId={user.plan!} />
      <DespesasView summary={summary} debtPayments={debtPayments} />
      <ResourceTable
        title="Gerenciar despesas"
        description="Adicione, edite ou remova despesas. Clique em uma linha para editar."
        entityLabel="despesa"
        createLabel="Adicionar despesa"
        emptyLabel="Use o botão acima para cadastrar sua primeira despesa."
        columns={[
          { key: "name", label: "Descrição" },
          { key: "type", label: "Tipo", badge: true },
          { key: "category", label: "Categoria" },
          { key: "day", label: "Vencimento" },
          { key: "amount", label: "Valor", align: "right" },
        ]}
        rows={tableRows}
        fields={fields}
        createAction={createExpense}
        updateAction={updateExpense}
        deleteAction={deleteExpense}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        filterTabs={filterTabs}
        activeFilter={tipo}
      />
    </div>
  );
}
