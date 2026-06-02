import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { MetasView } from "@/components/app/modules/metas-view";
import { PlanGate } from "@/components/app/plan-gate";
import { ResourceManager, type ResourceItem } from "@/components/app/resource-manager";
import { createGoal, deleteGoal, updateGoal } from "@/lib/actions/goals";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";

export default async function MetasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, user.id))
    .orderBy(desc(goals.createdAt));

  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    current: Number(r.currentAmount),
    target: Number(r.targetAmount),
  }));

  const resourceItems: ResourceItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    currentAmount: Number(r.currentAmount),
    targetAmount: Number(r.targetAmount),
  }));

  return (
    <PlanGate feature="goals" planId={user.plan!} fullPage>
      <div className="space-y-10">
        <MetasView items={items} />
        <div id="cadastro-metas">
          <ResourceManager
          embedded
          createLabel="Adicionar meta"
          title="Gerenciar metas"
          description="Adicione, edite ou remova metas financeiras."
          icon="metas"
          emptyLabel="Nenhuma meta cadastrada ainda."
          items={resourceItems}
          createAction={createGoal}
          updateAction={updateGoal}
          deleteAction={deleteGoal}
          fields={[
            { name: "name", label: "Nome", type: "text", required: true, placeholder: "Ex: Reserva de emergência" },
            { name: "targetAmount", label: "Valor alvo", type: "number", step: "0.01", min: 0, required: true, currency: true },
            { name: "currentAmount", label: "Valor atual", type: "number", step: "0.01", min: 0, currency: true },
          ]}
        />
      </div>
    </div>
    </PlanGate>
  );
}
