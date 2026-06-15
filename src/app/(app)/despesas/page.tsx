import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DataPage } from "@/components/app/data-page";
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
import { getInstallmentProgress } from "@/lib/finance/installment-progress";
import { getExpenseSummary } from "@/lib/finance/summary";
import { parsePage, parsePageSize } from "@/lib/pagination";

const EXPENSE_TYPES = ["fixed", "variable", "installment"];

type PageProps = {
  searchParams: Promise<{ page?: string; tipo?: string; por?: string; q?: string }>;
};

export default async function DespesasPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureDefaultExpenseCategories(user.id);

  const params = await searchParams;
  const tipo = params.tipo && EXPENSE_TYPES.includes(params.tipo) ? params.tipo : "all";
  const q = (params.q ?? "").trim().slice(0, 80);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.por);

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

  const conditions = [eq(expenses.userId, user.id)];
  if (tipo !== "all") conditions.push(eq(expenses.type, tipo));
  if (q) conditions.push(ilike(expenses.name, `%${q}%`));
  const where = and(...conditions);

  // Total respeita o filtro de tipo E a busca (para a paginação bater).
  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(expenses)
    .where(where);
  const total = Number(countRow?.total ?? 0);

  // F2.1: clampa a página ao range válido (ex.: após exclusões na última página).
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) {
    const qs = new URLSearchParams();
    if (tipo !== "all") qs.set("tipo", tipo);
    if (q) qs.set("q", q);
    if (params.por) qs.set("por", params.por);
    if (totalPages > 1) qs.set("page", String(totalPages));
    redirect(`/despesas${qs.toString() ? `?${qs}` : ""}`);
  }

  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(expenses)
    .where(where)
    .orderBy(desc(expenses.createdAt))
    .limit(pageSize)
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

  const tableRows: ResourceTableRow[] = rows.map((r) => {
    const progress =
      r.type === "installment"
        ? getInstallmentProgress(r.paymentStartDate, r.installmentCount)
        : null;
    const typeLabel = EXPENSE_TYPE_LABELS[r.type] ?? r.type;
    return {
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
        // Em parceladas mostra a parcela atual no rótulo do tipo (ex.: "Parcelada · 2/5").
        type: progress ? `${typeLabel} · ${progress.current}/${progress.total}` : typeLabel,
        category: r.category || "—",
        day: r.dayOfMonth ?? "—",
        amount: brl(Number(r.amount)),
      },
      details: progress ? [{ label: "Parcelas", value: progress.label }] : undefined,
    };
  });

  const filterTabs = [
    { id: "all", label: "Todas", count: summary.totalCount },
    { id: "fixed", label: "Fixas", count: summary.byType.fixed.count },
    { id: "variable", label: "Variáveis", count: summary.byType.variable.count },
    { id: "installment", label: "Parceladas", count: summary.byType.installment.count },
  ];

  return (
    <DataPage>
      <div className="shrink-0 space-y-4">
        <PlanUsageBanner userId={user.id} planId={user.plan!} />
        <DespesasView summary={summary} debtPayments={debtPayments} />
      </div>
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
        pageSize={pageSize}
        total={total}
        filterTabs={filterTabs}
        activeFilter={tipo}
        searchPlaceholder="Buscar despesa..."
        fillHeight
      />
    </DataPage>
  );
}
