import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DespesasView } from "@/components/app/modules/despesas-view";
import { PlanUsageBanner } from "@/components/app/plan-usage-banner";
import { ResourceManager, type ResourceItem } from "@/components/app/resource-manager";
import { createExpense, deleteExpense, updateExpense } from "@/lib/actions/expenses";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { debts, expenseCategories, expenses } from "@/lib/db/schema";
import { buildDespesaCategories, buildDespesaUpcoming } from "@/lib/finance/despesas";
import { ensureDefaultExpenseCategories } from "@/lib/finance/expense-categories";
import { uniqueCategoryNames } from "@/lib/finance/category-names";

export default async function DespesasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await ensureDefaultExpenseCategories(user.id);

  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, user.id))
    .orderBy(desc(expenses.createdAt));

  const [debtRows, categoryRows] = await Promise.all([
    db.select().from(debts).where(eq(debts.userId, user.id)),
    db
      .select({ name: expenseCategories.name })
      .from(expenseCategories)
      .where(eq(expenseCategories.userId, user.id)),
  ]);
  const debtPayments = debtRows.reduce((sum, d) => sum + Number(d.monthlyPayment), 0);

  const categoryNames = uniqueCategoryNames(categoryRows.map((c) => c.name));

  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    category: r.category,
    type: r.type,
    dayOfMonth: r.dayOfMonth,
    expenseDate: r.expenseDate,
    installmentCount: r.installmentCount,
    paymentStartDate: r.paymentStartDate,
  }));

  const resourceItems: ResourceItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    category: r.category,
    type: r.type,
    dayOfMonth: r.dayOfMonth,
    expenseDate: r.expenseDate,
    installmentCount: r.installmentCount,
    paymentStartDate: r.paymentStartDate,
  }));

  const expenseFields = [
    { name: "name", label: "Descrição", type: "text" as const, required: true, placeholder: "Ex: Aluguel" },
    { name: "amount", label: "Valor", type: "currency" as const, required: true },
    { name: "category", label: "Categoria", type: "category" as const, categoryNames },
    {
      name: "type",
      label: "Tipo",
      type: "select" as const,
      options: [
        { value: "fixed", label: "Fixa" },
        { value: "variable", label: "Variável" },
        { value: "installment", label: "Parcelada" },
      ],
    },
    {
      name: "dayOfMonth",
      label: "Dia do vencimento",
      type: "number" as const,
      min: 1,
      placeholder: "1-31",
      showWhen: { field: "type", values: ["fixed"] },
    },
    {
      name: "expenseDate",
      label: "Data do gasto",
      type: "date" as const,
      required: true,
      showWhen: { field: "type", values: ["variable"] },
    },
    {
      name: "installmentCount",
      label: "Parcelas",
      type: "number" as const,
      min: 2,
      required: true,
      placeholder: "Ex: 12",
      showWhen: { field: "type", values: ["installment"] },
    },
    {
      name: "paymentStartDate",
      label: "Início do pagamento",
      type: "date" as const,
      required: true,
      showWhen: { field: "type", values: ["installment"] },
    },
  ];

  return (
    <div className="space-y-10">
      <PlanUsageBanner userId={user.id} planId={user.plan!} />
      <DespesasView
        items={items}
        upcoming={buildDespesaUpcoming(items)}
        categories={buildDespesaCategories(items)}
        debtPayments={debtPayments}
      />
      <div id="cadastro-despesas">
        <ResourceManager
          embedded
          createLabel="Adicionar despesa"
          title="Gerenciar despesas"
          description="Adicione, edite ou remova despesas cadastradas."
          icon="despesas"
          emptyLabel="Nenhuma despesa cadastrada ainda."
          items={resourceItems}
          createAction={createExpense}
          updateAction={updateExpense}
          deleteAction={deleteExpense}
          fields={expenseFields}
        />
      </div>
    </div>
  );
}
