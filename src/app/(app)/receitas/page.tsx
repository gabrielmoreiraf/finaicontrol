import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReceitasView } from "@/components/app/modules/receitas-view";
import { PlanUsageBanner } from "@/components/app/plan-usage-banner";
import { ResourceManager, type ResourceItem } from "@/components/app/resource-manager";
import { createIncome, deleteIncome, updateIncome } from "@/lib/actions/incomes";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { incomes, profiles } from "@/lib/db/schema";

export default async function ReceitasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profileRow] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);

  const rows = await db
    .select()
    .from(incomes)
    .where(eq(incomes.userId, user.id))
    .orderBy(desc(incomes.createdAt));

  const items = rows.map((r) => ({
    id: r.id,
    label: r.label,
    amount: Number(r.amount),
    type: r.type,
    dayOfMonth: r.dayOfMonth,
  }));

  const resourceItems: ResourceItem[] = rows.map((r) => ({
    id: r.id,
    label: r.label,
    amount: Number(r.amount),
    type: r.type,
    dayOfMonth: r.dayOfMonth,
    endDate: r.endDate,
  }));

  return (
    <div className="space-y-10">
      <PlanUsageBanner userId={user.id} planId={user.plan!} />
      <ReceitasView items={items} fixedIncome={Number(profileRow?.fixedMonthlyIncome ?? 0)} />
      <div id="cadastro-receitas">
        <ResourceManager
          embedded
          createLabel="Adicionar receita"
          title="Gerenciar receitas"
          description="Adicione, edite ou remova receitas cadastradas."
          icon="receitas"
          emptyLabel="Nenhuma receita cadastrada ainda."
          items={resourceItems}
          createAction={createIncome}
          updateAction={updateIncome}
          deleteAction={deleteIncome}
          fields={[
            { name: "label", label: "Descrição", type: "text", required: true, placeholder: "Ex: Salário" },
            { name: "amount", label: "Valor", type: "number", step: "0.01", min: 0, required: true, currency: true },
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
            { name: "dayOfMonth", label: "Dia do mês", type: "number", min: 1, placeholder: "1-31" },
            {
              name: "endDate",
              label: "Término (temporária)",
              type: "date",
              required: true,
              showWhen: { field: "type", values: ["temporary"] },
            },
          ]}
        />
      </div>
    </div>
  );
}
