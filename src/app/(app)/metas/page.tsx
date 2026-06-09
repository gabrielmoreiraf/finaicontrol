import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MetasView } from "@/components/app/modules/metas-view";
import { PlanLockedScreen } from "@/components/app/plan-locked-screen";
import { ResourceTable, type ResourceTableRow } from "@/components/app/resource-table";
import type { ResourceField } from "@/components/app/resource-fields";
import { createGoal, deleteGoal, toggleGoalCompletion, updateGoal } from "@/lib/actions/goals";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";
import { brl } from "@/lib/finance/format";
import { hasPlanAccess } from "@/lib/plans/features";
import { getGoalSummary } from "@/lib/finance/summary";

const PAGE_SIZE = 20;

const FIELDS: ResourceField[] = [
  { name: "name", label: "Nome", type: "text", required: true, placeholder: "Ex: Reserva de emergência" },
  { name: "targetAmount", label: "Valor alvo", type: "currency", required: true },
  { name: "currentAmount", label: "Valor atual", type: "currency" },
];

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function MetasPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPlanAccess(user.plan!, "goals")) {
    return <PlanLockedScreen feature="goals" planId={user.plan!} />;
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const summary = await getGoalSummary(user.id);
  const total = summary.totalCount;
  const offset = (page - 1) * PAGE_SIZE;

  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, user.id))
    .orderBy(desc(goals.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const tableRows: ResourceTableRow[] = rows.map((r) => {
    const current = Number(r.currentAmount);
    const target = Number(r.targetAmount);
    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const reached = target > 0 && current >= target;
    return {
      id: r.id,
      item: {
        id: r.id,
        name: r.name,
        targetAmount: target,
        currentAmount: current,
      },
      cells: {
        name: r.name,
        progress: `${percent}%`,
        status: r.completed ? "Concluída" : "Em andamento",
        current: brl(current),
        target: brl(target),
      },
      secondary: r.completed
        ? { label: "Reabrir meta", value: "reopen", tone: "default" }
        : reached
          ? { label: "Concluir meta", value: "complete", tone: "brand" }
          : undefined,
    };
  });

  return (
    <div className="space-y-10">
      <MetasView summary={summary} />
      <ResourceTable
        title="Gerenciar metas"
        description="Adicione, edite ou remova metas. Clique em uma linha para editar."
        entityLabel="meta"
        createLabel="Adicionar meta"
        emptyLabel="Use o botão acima para cadastrar sua primeira meta."
        columns={[
          { key: "name", label: "Nome" },
          { key: "progress", label: "Progresso", badge: true },
          { key: "status", label: "Status" },
          { key: "current", label: "Atual", align: "right" },
          { key: "target", label: "Meta", align: "right" },
        ]}
        rows={tableRows}
        fields={FIELDS}
        createAction={createGoal}
        updateAction={updateGoal}
        deleteAction={deleteGoal}
        secondaryAction={toggleGoalCompletion}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
      />
    </div>
  );
}
