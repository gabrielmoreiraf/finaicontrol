import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { DataPage } from "@/components/app/data-page";
import { MetasView } from "@/components/app/modules/metas-view";
import { GoalSuggestions, type GoalSuggestion } from "@/components/app/modules/goal-suggestions";
import { PlanLockedScreen } from "@/components/app/plan-locked-screen";
import { ResourceTable, type ResourceTableRow } from "@/components/app/resource-table";
import type { ResourceField } from "@/components/app/resource-fields";
import { createGoal, deleteGoal, toggleGoalCompletion, updateGoal } from "@/lib/actions/goals";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { goals, profiles } from "@/lib/db/schema";
import { brl } from "@/lib/finance/format";
import { hasPlanAccess } from "@/lib/plans/features";
import { getExpenseSummary, getGoalSummary, getIncomeSummary } from "@/lib/finance/summary";
import { parsePage, parsePageSize } from "@/lib/pagination";

/** Arredonda para um valor "redondo" (múltiplo de 50) para metas sugeridas. */
function roundNice(value: number): number {
  return Math.max(0, Math.round(value / 50) * 50);
}

const FIELDS: ResourceField[] = [
  { name: "name", label: "Nome", type: "text", required: true, placeholder: "Ex: Reserva de emergência" },
  { name: "targetAmount", label: "Valor alvo", type: "currency", required: true },
  { name: "currentAmount", label: "Já guardado", type: "currency" },
  { name: "monthlyContribution", label: "Guardar por mês", type: "currency" },
];

type PageProps = {
  searchParams: Promise<{ page?: string; por?: string; q?: string }>;
};

export default async function MetasPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasPlanAccess(user.plan!, "goals")) {
    return <PlanLockedScreen feature="goals" planId={user.plan!} />;
  }

  const params = await searchParams;
  const q = (params.q ?? "").trim().slice(0, 80);
  const page = parsePage(params.page);
  const pageSize = parsePageSize(params.por);

  const [profileRow] = await db
    .select({ fixedMonthlyIncome: profiles.fixedMonthlyIncome })
    .from(profiles)
    .where(eq(profiles.userId, user.id))
    .limit(1);
  const fixedIncome = Number(profileRow?.fixedMonthlyIncome ?? 0);

  const [summary, incomeSummary, expenseSummary, allGoalNames] = await Promise.all([
    getGoalSummary(user.id),
    getIncomeSummary(user.id, fixedIncome),
    getExpenseSummary(user.id),
    db.select({ name: goals.name }).from(goals).where(eq(goals.userId, user.id)),
  ]);

  const goalsWhere = q
    ? and(eq(goals.userId, user.id), ilike(goals.name, `%${q}%`))
    : eq(goals.userId, user.id);
  const total = q
    ? Number(
        (await db.select({ total: sql<number>`count(*)::int` }).from(goals).where(goalsWhere))[0]
          ?.total ?? 0,
      )
    : summary.totalCount;

  // Sobra líquida do mês — base para o "prazo estimado" das metas.
  const monthlyExpenses = expenseSummary.total;
  const monthlyNet = incomeSummary.total - monthlyExpenses;

  // Sugestões de metas (reserva de emergência), evitando duplicar nomes existentes.
  const existing = new Set(allGoalNames.map((g) => g.name.trim().toLowerCase()));
  const suggestions: GoalSuggestion[] = [];
  if (monthlyExpenses > 0) {
    const s6 = roundNice(monthlyExpenses * 6);
    const s3 = roundNice(monthlyExpenses * 3);
    if (s6 > 0 && !existing.has("reserva de emergência")) {
      suggestions.push({
        name: "Reserva de emergência",
        target: s6,
        contribution: roundNice(s6 / 12),
        hint: "6 meses das suas despesas · ~12 meses guardando",
      });
    }
    if (s3 > 0 && !existing.has("reserva inicial")) {
      suggestions.push({
        name: "Reserva inicial",
        target: s3,
        contribution: roundNice(s3 / 6),
        hint: "3 meses das suas despesas · ~6 meses guardando",
      });
    }
  }

  // F2.1: clampa a página ao range válido (ex.: após exclusões na última página).
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (params.por) qs.set("por", params.por);
    if (totalPages > 1) qs.set("page", String(totalPages));
    redirect(`/metas${qs.toString() ? `?${qs}` : ""}`);
  }

  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(goals)
    .where(goalsWhere)
    .orderBy(desc(goals.createdAt))
    .limit(pageSize)
    .offset(offset);

  const tableRows: ResourceTableRow[] = rows.map((r) => {
    const current = Number(r.currentAmount);
    const target = Number(r.targetAmount);
    const contribution = Number(r.monthlyContribution);
    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const reached = target > 0 && current >= target;
    const remaining = Math.max(0, target - current);

    // Prazo estimado: usa a RESERVA MENSAL desta meta (quanto falta ÷ reserva).
    const etaMonths = contribution > 0 && remaining > 0 ? Math.ceil(remaining / contribution) : null;
    // "No seu ritmo": frase em linguagem simples.
    const ritmo = reached
      ? "Concluída ✓"
      : contribution > 0 && etaMonths
        ? `${brl(contribution)}/mês · faltam ~${etaMonths} ${etaMonths === 1 ? "mês" : "meses"}`
        : "defina quanto guardar por mês";

    return {
      id: r.id,
      item: {
        id: r.id,
        name: r.name,
        targetAmount: target,
        currentAmount: current,
        monthlyContribution: contribution,
      },
      cells: {
        name: r.name,
        progress: `${percent}%`,
        resumo: `${brl(current)} de ${brl(target)}`,
        ritmo,
      },
      secondary: r.completed
        ? { label: "Reabrir meta", value: "reopen", tone: "default" }
        : reached
          ? { label: "Concluir meta", value: "complete", tone: "brand" }
          : undefined,
    };
  });

  return (
    <DataPage>
      <div className="shrink-0 space-y-4">
        <MetasView summary={summary} monthlyNet={monthlyNet} />
        {suggestions.length > 0 && <GoalSuggestions suggestions={suggestions} />}
      </div>
      <ResourceTable
        title="Gerenciar metas"
        description="Defina quanto guardar por mês em cada meta — mostramos em quanto tempo você chega lá."
        entityLabel="meta"
        createLabel="Adicionar meta"
        emptyLabel="Use o botão acima para cadastrar sua primeira meta."
        columns={[
          { key: "name", label: "Meta" },
          { key: "progress", label: "Progresso", badge: true },
          { key: "resumo", label: "Guardado" },
          { key: "ritmo", label: "No seu ritmo" },
        ]}
        rows={tableRows}
        fields={FIELDS}
        createAction={createGoal}
        updateAction={updateGoal}
        deleteAction={deleteGoal}
        secondaryAction={toggleGoalCompletion}
        searchPlaceholder="Buscar meta..."
        page={page}
        pageSize={pageSize}
        total={total}
        fillHeight
      />
    </DataPage>
  );
}
