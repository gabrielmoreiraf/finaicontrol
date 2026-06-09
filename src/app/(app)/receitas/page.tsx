import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReceitasView } from "@/components/app/modules/receitas-view";
import { PlanUsageBanner } from "@/components/app/plan-usage-banner";
import { ResourceTable, type ResourceTableRow } from "@/components/app/resource-table";
import type { ResourceField } from "@/components/app/resource-fields";
import { createIncome, deleteIncome, updateIncome } from "@/lib/actions/incomes";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { incomes, profiles } from "@/lib/db/schema";
import { INCOME_TYPE_LABELS, brl } from "@/lib/finance/format";
import { getIncomeSummary } from "@/lib/finance/summary";

const PAGE_SIZE = 20;
const INCOME_TYPES = ["fixed", "variable", "extra", "temporary"];

const FIELDS: ResourceField[] = [
  { name: "label", label: "Descrição", type: "text", required: true, placeholder: "Ex: Salário" },
  { name: "amount", label: "Valor", type: "currency", required: true },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    options: [
      { value: "fixed", label: "Fixa" },
      { value: "variable", label: "Variável" },
      { value: "extra", label: "Extra" },
      { value: "temporary", label: "Temporária" },
    ],
  },
  { name: "dayOfMonth", label: "Dia do mês", type: "number", min: 1, max: 31, placeholder: "1-31" },
  {
    name: "endDate",
    label: "Término (temporária)",
    type: "date",
    required: true,
    showWhen: { field: "type", values: ["temporary"] },
  },
];

type PageProps = {
  searchParams: Promise<{ page?: string; tipo?: string }>;
};

export default async function ReceitasPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const tipo = params.tipo && INCOME_TYPES.includes(params.tipo) ? params.tipo : "all";
  const page = Math.max(1, Number(params.page) || 1);

  const [profileRow] = await db
    .select({ fixedMonthlyIncome: profiles.fixedMonthlyIncome })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const fixedIncome = Number(profileRow?.fixedMonthlyIncome ?? 0);
  const summary = await getIncomeSummary(user.id, fixedIncome);

  const where =
    tipo === "all"
      ? eq(incomes.userId, user.id)
      : and(eq(incomes.userId, user.id), eq(incomes.type, tipo));

  const total = tipo === "all" ? summary.totalCount : (summary.byType[tipo]?.count ?? 0);
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await db
    .select()
    .from(incomes)
    .where(where)
    .orderBy(desc(incomes.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const tableRows: ResourceTableRow[] = rows.map((r) => ({
    id: r.id,
    item: {
      id: r.id,
      label: r.label,
      amount: Number(r.amount),
      type: r.type,
      dayOfMonth: r.dayOfMonth,
      endDate: r.endDate,
    },
    cells: {
      label: r.label,
      type: INCOME_TYPE_LABELS[r.type] ?? r.type,
      day: r.dayOfMonth ?? "—",
      amount: brl(Number(r.amount)),
    },
  }));

  const filterTabs = [
    { id: "all", label: "Todas", count: summary.totalCount },
    { id: "fixed", label: "Fixas", count: summary.byType.fixed.count },
    { id: "variable", label: "Variáveis", count: summary.byType.variable.count },
    { id: "extra", label: "Extras", count: summary.byType.extra.count },
    { id: "temporary", label: "Temporárias", count: summary.byType.temporary.count },
  ];

  return (
    <div className="space-y-10">
      <PlanUsageBanner userId={user.id} planId={user.plan!} />
      <ReceitasView summary={summary} fixedIncome={fixedIncome} />
      <ResourceTable
        title="Gerenciar receitas"
        description="Adicione, edite ou remova receitas. Clique em uma linha para editar."
        entityLabel="receita"
        createLabel="Adicionar receita"
        emptyLabel="Use o botão acima para cadastrar sua primeira receita."
        columns={[
          { key: "label", label: "Descrição" },
          { key: "type", label: "Tipo", badge: true },
          { key: "day", label: "Dia" },
          { key: "amount", label: "Valor", align: "right" },
        ]}
        rows={tableRows}
        fields={FIELDS}
        createAction={createIncome}
        updateAction={updateIncome}
        deleteAction={deleteIncome}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        filterTabs={filterTabs}
        activeFilter={tipo}
      />
    </div>
  );
}
