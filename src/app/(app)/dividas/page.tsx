import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DividasView } from "@/components/app/modules/dividas-view";
import { PlanGate } from "@/components/app/plan-gate";
import { ResourceManager, type ResourceItem } from "@/components/app/resource-manager";
import { createDebt, deleteDebt, updateDebt } from "@/lib/actions/debts";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { debts } from "@/lib/db/schema";
import { debtPriority } from "@/lib/finance/dividas";

export default async function DividasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select()
    .from(debts)
    .where(eq(debts.userId, user.id))
    .orderBy(desc(debts.createdAt));

  const items = rows.map((r) => {
    const balance = Number(r.balance);
    const monthlyPayment = Number(r.monthlyPayment);
    return {
      id: r.id,
      name: r.name,
      balance,
      monthlyPayment,
      priority: debtPriority(balance, monthlyPayment),
    };
  });

  const resourceItems: ResourceItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    balance: Number(r.balance),
    monthlyPayment: Number(r.monthlyPayment),
  }));

  return (
    <PlanGate feature="debts" planId={user.plan!} fullPage>
      <div className="space-y-10">
        <DividasView items={items} />
        <div id="cadastro-dividas">
          <ResourceManager
          embedded
          createLabel="Adicionar dívida"
          title="Gerenciar dívidas"
          description="Adicione, edite ou remova dívidas cadastradas."
          icon="dividas"
          emptyLabel="Nenhuma dívida cadastrada ainda."
          items={resourceItems}
          createAction={createDebt}
          updateAction={updateDebt}
          deleteAction={deleteDebt}
          fields={[
            { name: "name", label: "Nome", type: "text", required: true, placeholder: "Ex: Cartão Nubank" },
            { name: "balance", label: "Saldo devedor", type: "number", step: "0.01", min: 0, required: true, currency: true },
            { name: "monthlyPayment", label: "Parcela mensal", type: "number", step: "0.01", min: 0, required: true, currency: true },
          ]}
        />
      </div>
    </div>
    </PlanGate>
  );
}
