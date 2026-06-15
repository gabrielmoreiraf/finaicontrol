import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DataPage } from "@/components/app/data-page";
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
import { parsePage, parsePageSize } from "@/lib/pagination";

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
  searchParams: Promise<{ page?: string; tipo?: string; por?: string; q?: string }>;
};

export default async function ReceitasPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const tipo = params.tipo && INCOME_TYPES.includes(params.tipo) ? params.tipo : "all";
  const q = (params.q ?? "").trim().slice(0, 80);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.por);

  const [profileRow] = await db
    .select({ fixedMonthlyIncome: profiles.fixedMonthlyIncome })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const fixedIncome = Number(profileRow?.fixedMonthlyIncome ?? 0);
  const summary = await getIncomeSummary(user.id, fixedIncome);

  const conditions = [eq(incomes.userId, user.id)];
  if (tipo !== "all") conditions.push(eq(incomes.type, tipo));
  if (q) conditions.push(ilike(incomes.label, `%${q}%`));
  const where = and(...conditions);

  const [countRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(incomes)
    .where(where);
  const total = Number(countRow?.total ?? 0);

  // F2.1: nunca deixa o usuário numa página fora do range (ex.: após excluir itens).
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) {
    const qs = new URLSearchParams();
    if (tipo !== "all") qs.set("tipo", tipo);
    if (q) qs.set("q", q);
    if (params.por) qs.set("por", params.por);
    if (totalPages > 1) qs.set("page", String(totalPages));
    redirect(`/receitas${qs.toString() ? `?${qs}` : ""}`);
  }

  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(incomes)
    .where(where)
    .orderBy(desc(incomes.createdAt))
    .limit(pageSize)
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
    <DataPage>
      <div className="shrink-0 space-y-4">
        <PlanUsageBanner userId={user.id} planId={user.plan!} />
        <ReceitasView summary={summary} fixedIncome={fixedIncome} />
      </div>
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
        pageSize={pageSize}
        total={total}
        filterTabs={filterTabs}
        activeFilter={tipo}
        searchPlaceholder="Buscar receita..."
        fillHeight
      />
    </DataPage>
  );
}
